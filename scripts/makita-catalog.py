"""Makita machines: daily Makita export (codes, MOC, stock) joined with product data from makita.sk.

    python scripts/makita-catalog.py            (uses the cache, downloads only what is missing)

Inputs (git-ignored):
  docs/cenniky/MakitaTovary.xlsx   Makita's daily export: KOD, EAN, NAZOV, MOC_S_DPH, SKLADOM, SKUPINA2 (M/A/P)
  originals/makita/                cache: category index, product pages, converted photos
Output:
  supabase/seed-data/makita.json   one entry per live machine (SKUPINA2 = M, not "Nevyrába sa")
  originals/makita/img/*.webp      photos, uploaded to the product-images bucket by scripts/import-makita.ts

Machines are matched to makita.sk by code (the product URL carries the model). A machine without a page is
kept with the data from the export only. Photos and texts belong to Makita: get their consent before go-live.
"""

import concurrent.futures as cf
import html
import io
import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

from openpyxl import load_workbook
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "docs" / "cenniky" / "MakitaTovary.xlsx"
CACHE = ROOT / "originals" / "makita"
PAGES = CACHE / "html"
IMAGES = CACHE / "img"
OUT = ROOT / "supabase" / "seed-data" / "makita.json"

BASE = "https://www.makita.sk"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36"
MAX_IMAGES = 3
IMAGE_PX = 1000


def fetch(path: str) -> bytes:
    err: Exception | None = None
    for _ in range(3):
        try:
            req = urllib.request.Request(BASE + urllib.parse.quote(path, safe="/?=&%#,"), headers={"User-Agent": UA})
            data = urllib.request.urlopen(req, timeout=40).read()
            time.sleep(0.25)  # four workers, so about 16 requests a second at most; makita.sk is a small site
            return data
        except Exception as e:  # noqa: BLE001 - retried, then reported
            err = e
            time.sleep(3)
    raise RuntimeError(f"{path}: {err}")


def fold(text: str) -> str:
    plain = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", plain.lower()).strip("-")


# ───────────────────────────── makita.sk index ─────────────────────────────

def product_index() -> dict[str, str]:
    """model (lower case, no dashes) -> product page path"""
    file = CACHE / "products.json"
    if file.exists():
        paths = json.loads(file.read_text(encoding="utf-8"))
    else:
        home = fetch("/produkty").decode("utf-8", "replace")
        roots = sorted(set(re.findall(r'href="(/produkty/\d+_[^"#?]*)"', home)))
        paths, seen, todo = {}, set(), list(roots)
        while todo:
            with cf.ThreadPoolExecutor(4) as pool:
                pages = list(pool.map(lambda c: fetch(c).decode("utf-8", "replace"), todo))
            seen.update(todo)
            batch, todo = todo, []
            for cat, page in zip(batch, pages):
                for link in set(re.findall(r'href="(/produkty/\d+_[^"#]*)"', page)):
                    path = link.split("?")[0]
                    if re.search(r"/\d+_[^/]+$", path) and path.count("/") >= 3:
                        paths[path] = cat
                    elif link not in seen and link not in todo and link.startswith(tuple(roots)):
                        todo.append(link)
        file.write_text(json.dumps(paths, indent=0), encoding="utf-8")
    index: dict[str, str] = {}
    for path in paths:
        m = re.match(r"\d+_([a-z0-9]+)", path.rsplit("/", 1)[1])
        if m:
            index.setdefault(m.group(1), path)
    return index


def page_for(path: str) -> str:
    file = PAGES / (path.rsplit("/", 1)[1] + ".html")
    if not file.exists() or file.stat().st_size < 20_000:
        file.write_bytes(fetch(path))
    return file.read_text(encoding="utf-8", errors="replace")


# ───────────────────────────── page parsing ─────────────────────────────

def text_of(fragment: str) -> str:
    fragment = re.sub(r"<sup>\s*-1\s*</sup>", "⁻¹", fragment)
    fragment = re.sub(r"<sup>\s*2\s*</sup>", "²", fragment)
    fragment = re.sub(r"<sup>\s*3\s*</sup>", "³", fragment)
    plain = html.unescape(re.sub(r"<[^>]+>", "", fragment)).replace("\xa0", " ")
    return re.sub(r"\s+", " ", plain).strip()


def tab(page: str, tab_id: str) -> str:
    m = re.search(rf'id="{tab_id}" role="tabpanel">(.*?)</div>', page, re.S)
    return m.group(1) if m else ""


def rows_of(fragment: str) -> list[tuple[str, str]]:
    out = []
    for row in re.findall(r"<tr>(.*?)</tr>", fragment, re.S):
        cells = [text_of(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", row, re.S)]
        if len(cells) >= 2 and cells[0] and cells[1]:
            out.append((cells[0], cells[1]))
    return out


def parse(page: str) -> dict:
    h1 = re.search(r"<h1>(.*?)<strong>", page, re.S)
    features_block = re.search(r'<ul class="list-icon[^"]*">(.*?)</ul>', page, re.S)
    downloads = tab(page, "nastiahnutie")
    manual = re.search(r'href="(/userfiles/manualy/[^"]+)"', downloads)
    partlist = re.search(r'href="(/userfiles/partlist/[^"]+)"', downloads)
    return {
        "type": text_of(h1.group(1)) if h1 else "",
        "images": re.findall(r'gallery-item[^>]*><a href="([^"]+)"', page)[:MAX_IMAGES],
        "pictograms": re.findall(r'picto-\d+" href="[^"]*"[^>]*title="([^"]*)"', page),
        "features": [t for t in (text_of(li) for li in re.findall(r"<li>(.*?)</li>", features_block.group(1), re.S)) if t]
        if features_block
        else [],
        "specs": rows_of(tab(page, "parametre")),
        "included": rows_of(tab(page, "dodprisl")),
        "manual": manual.group(1) if manual else None,
        "partlist": partlist.group(1) if partlist else None,
    }


# ───────────────────────────── shop mapping ─────────────────────────────

# First match wins; tested against the folded product type ("akumulatorova-okruzna-pila").
CATEGORY_RULES: list[tuple[tuple[str, ...], str]] = [
    (("sada-akumulatoroveho", "specialna-sada", "sada-naradia"), "sady-naradia"),
    (("laser", "dialkomer"), "meracia-technika"),
    (("radio", "reproduktor", "lampa", "ventilator", "svietidl"), "radia-a-svietidla"),
    (("teplovzdusn", "horucovzdus"), "teplovzdusne-pistole"),
    (("duchadlo", "fukar"), "duchadla"),
    (("vysavac", "zametaci"), "vysavace"),
    (("kosack",), "kosacky"),
    (("krovinorez", "vyzinac", "orezavac-travnika"), "krovinorezy-a-vyzinace"),
    (("plotostrih", "zivy-plot", "zive-plot", "noznice-na-travu", "noznice-na-vetvy", "prerezavacie-noznice"), "plotostrihy"),
    (("chvostova",), "chvostove-pily"),
    (("retazova-pila", "vyvetvov", "prerezavacia-pila"), "retazove-pily"),
    (("tlakovy-cistic", "vysokotlak"), "vysokotlakove-cistice"),
    (("furik", "postrekovac", "rosic", "vertikutator", "drvic", "podny-vrtak", "zemny-vrtak", "snezna", "cerpadlo", "kefovy-cistic"), "ostatna-zahradna-technika"),
    (("klincovack", "sponkovack", "pinkovack"), "klincovacky"),
    (("chladnick",), "specialne-naradie"),
    (("kompresor",), "kompresory"),
    (("zhutnovac-betonu", "vibrator"), "betonarska-technika"),
    (("bruska-na-beton",), "brusky-na-beton"),
    (("uhlova-bruska",), "uhlove-brusky"),
    (("lestick", "lestiaca"), "lesticky"),
    (("bruska", "pilnik"), "ostatne-brusky"),
    (("drazkovacia-freza-do-muriva",), "drazkovacie-frezy"),
    (("uhlova-rezacka", "diamantova-rezacka", "rozbrusovac", "kotucova-pila-diamant", "rezacka-na-obklad"), "rozbrusovacky"),
    (("noznice-na-plech", "prestrih", "pila-na-kov", "rezac", "dierovac", "dierkovac", "hlinikovych", "pasova-pila", "kotucova-pila"), "rezanie-kovu"),
    (("freza", "frezka"), "frezy"),
    (("hoblik", "pretahovacie"), "hobliky"),
    (("okruzna-pila", "ponorna-pila"), "okruzne-pily"),
    (("pokosova", "stolova-pila", "kapovacia"), "pokosove-pily"),
    (("priamociara",), "priamociare-pily"),
    (("multi-tool", "dlabacka", "pila"), "ostatne-pily"),
    (("buracie", "sekacie-kladivo"), "buracie-kladiva"),
    (("kladivo",), "vrtacie-kladiva"),
    (("miesack", "miesadl"), "miesadla"),
    (("razov", "impulzny", "utahov"), "razove-utahovaky"),
    (("priklep",), "priklepove-skrutkovace"),
    (("vrtaci-skrutkovac", "skrutkovac-vrtacka"), "vrtacie-skrutkovace"),
    (("skrutkovac",), "skrutkovace"),
    (("vrtack",), "vrtacky"),
]
FALLBACK_CATEGORY = "specialne-naradie"

# Abbreviations in the export names, expanded before the category rules see them.
EXPORT_ABBREVIATIONS = {"excen-": "excentricka-", "vrt-": "vrtacie-", "skrutk-": "skrutkovac-", "uhl-": "uhlova-"}

UPPER_WORDS = ["SDS-PLUS", "SDS-MAX", "SDS", "XGT", "LXT", "CXT", "LED", "AC/DC", "X-LOCK", "MAKPAC", "MT", "USB", "DAB", "HEPA"]


def category_for(type_slug: str) -> str:
    for needles, category in CATEGORY_RULES:
        if any(n in type_slug for n in needles):
            return category
    return FALLBACK_CATEGORY


def sentence_case(text: str) -> str:
    out = text.strip().lower()
    out = out[:1].upper() + out[1:]
    for word in UPPER_WORDS:
        out = re.sub(rf"(?<![\w]){re.escape(word.lower())}(?![\w])", word, out, flags=re.I)
    out = re.sub(r"(\d)\s*v\b", r"\1 V", out)
    # model codes inside a name ("ga9020r + 9558hnr") keep their capitals
    return re.sub(r"\b(?:[a-z]{1,4}\d{3,}[a-z0-9]*|\d{4}[a-z]+)\b", lambda m: m.group(0).upper(), out)


def platform_for(export_name: str, pictograms: list[str]) -> str:
    text = f" {export_name.upper()} {' '.join(pictograms).upper()} "
    if "XGT" in text or "40 V" in text or "40V" in text:
        return "XGT_40V"
    if "CXT" in text or "12 V MAX" in text or "12V MAX" in text or "10,8" in text:
        return "CXT_12V"
    if "LXT" in text or re.search(r"\b18 ?V\b", text):
        return "LXT_18V"
    return "none"


def weight_kg(specs: list[tuple[str, str]]) -> float | None:
    for label, value in specs:
        if fold(label).startswith("hmotnost") and "kg" in value:
            numbers = [float(n.replace(".", "").replace(",", ".")) for n in re.findall(r"\d+(?:[.,]\d+)?", value.split("kg")[0])]
            numbers = [n for n in numbers if 0 < n < 2000]
            if numbers:
                return max(numbers)  # ranges are "without - with the heaviest battery"
    return None


def spec_rows(specs: list[tuple[str, str]]) -> list[dict]:
    out, used = [], set()
    for label, value in specs:
        key = "voltage" if fold(label).startswith("menovite-napatie") else fold(label).replace("-", "_")[:60]
        if not key or key in used:
            continue
        used.add(key)
        out.append({"key": key, "label": label, "value": value, "unit": None, "is_filterable": False})
    return out


def save_image(source: str, target: Path) -> bool:
    if target.exists():
        return True
    try:
        img = Image.open(io.BytesIO(fetch(source)))
    except Exception as e:  # noqa: BLE001 - a missing photo must not stop the run
        print("photo failed:", source, e)
        return False
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        white = Image.new("RGB", img.size, "white")
        white.paste(img, mask=img.split()[-1])
        img = white
    else:
        img = img.convert("RGB")
    img.thumbnail((IMAGE_PX, IMAGE_PX), Image.LANCZOS)
    img.save(target, "WEBP", quality=82, method=6)
    return True


def build(row: tuple, index: dict[str, str]) -> dict:
    code, _alt, ean, export_name, moc, stock = (row[0], row[1], row[2], row[3], row[4], row[5])
    code = str(code).strip()
    export_name = str(export_name).strip()
    path = index.get(code.lower().replace("-", ""))
    data = parse(page_for(path)) if path else None

    if data and data["type"]:
        type_name, type_slug = data["type"], fold(data["type"])
    else:
        # no makita.sk page: the export name ("AKU EXCEN.BRÚSKA 125 mm 40 V MAX XGT") is all we have
        type_name = re.sub(rf"\s*\b{re.escape(code)}\b", "", export_name, flags=re.I).strip() or export_name
        type_slug = fold(type_name) + "-"
        for short, full in EXPORT_ABBREVIATIONS.items():
            type_slug = type_slug.replace(short, full)

    slug = "makita-" + fold(code)
    specs = data["specs"] if data else []
    features = data["features"] if data else []
    included = data["included"] if data else []
    platform = platform_for(export_name, data["pictograms"] if data else [])

    images = []
    for i, source in enumerate(data["images"] if data else []):
        name = f"{fold(code)}-{i + 1}.webp"
        if save_image(source, IMAGES / name):
            images.append(f"makita/{name}")

    description = "\n".join(f"- {f}" for f in features)
    if included:
        items = ", ".join(f"{name} ({c})" if re.search(r"\d", c) else name for c, name in included)
        description += ("\n\n" if description else "") + f"**Dodávané príslušenstvo:** {items}."
    short = ". ".join(f.rstrip(". ") for f in features[:2])
    documents = []
    if data and data["manual"]:
        documents.append({"type": "manual", "title": "Návod na použitie (PDF, makita.sk)", "path": BASE + urllib.parse.quote(data["manual"], safe="/")})
    if data and data["partlist"]:
        documents.append({"type": "other", "title": "Rozkres náhradných dielov (PDF, makita.sk)", "path": BASE + urllib.parse.quote(data["partlist"], safe="/")})

    return {
        "slug": slug,
        "sku": code,
        "ean": str(ean).strip() if ean else None,
        "name": f"Makita {code} {sentence_case(type_name)}",
        "category_slug": category_for(type_slug),
        "short_description": (short + ".") if short else f"{sentence_case(export_name)}.",
        "description": description or None,
        "price_gross_eur": float(moc),
        "in_stock": stock == "Áno",
        "weight_kg": weight_kg(specs),
        "battery_platform": platform,
        "is_kit": platform != "none" and any("akumul" in fold(name) or re.match(r"BL\d", c) for c, name in included),
        "extended_warranty": bool(data and any("3 ročná záruka" in p for p in data["pictograms"])),
        "specs": spec_rows(specs),
        "images": images,
        "documents": documents,
        "source_url": BASE + path if path else None,
    }


def main() -> None:
    PAGES.mkdir(parents=True, exist_ok=True)
    IMAGES.mkdir(parents=True, exist_ok=True)
    sheet = load_workbook(XLSX, read_only=True, data_only=True)["MakitaTovary"]
    rows = [r for r in sheet.iter_rows(min_row=2, values_only=True) if r[0] and r[8] == "M" and r[5] != "Nevyrába sa"]
    updated = next((r[1] for r in sheet.iter_rows(min_row=2, max_row=2, values_only=True)), None)
    index = product_index()
    with cf.ThreadPoolExecutor(4) as pool:
        products = list(pool.map(lambda r: build(r, index), rows))
    products.sort(key=lambda p: p["sku"])
    OUT.write_text(
        json.dumps({"export_updated": str(updated), "products": products}, ensure_ascii=False, indent=1) + "\n",
        encoding="utf-8",
    )
    unmatched = [p["sku"] for p in products if not p["source_url"]]
    print(f"{len(products)} machines, {len(products) - len(unmatched)} matched on makita.sk")
    print("without a makita.sk page:", ", ".join(unmatched) or "none")
    print("without a photo:", sum(not p["images"] for p in products), "| without a weight:", sum(p["weight_kg"] is None for p in products))


if __name__ == "__main__":
    main()
