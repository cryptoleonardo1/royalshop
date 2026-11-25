"""Nivel System measuring instruments: 3gonshop.sk (shop of the Slovak importer 3gon Slovakia) -> one JSON for
scripts/import-nivel.ts.

    python scripts/nivel-catalog.py            (downloads pages and photos; pages are cached in originals/nivel/html)
    python scripts/nivel-catalog.py --cached   (no page downloads: rebuilds nivel.json from the cache)

We are an authorised Nivel System dealer and sell at 3gonshop's prices (founder, 2026-11-25). 3gon has no feed
yet, so this reads the five category listings and every Nivel System product page in them.
Output (git-ignored until 3gon confirms we may use its texts and photos):
  supabase/seed-data/nivel.json     products at or above MIN_GROSS_EUR, with 3gonshop's net and gross prices
  originals/nivel/img/*.webp        photos, uploaded to the product-images bucket by scripts/import-nivel.ts
Purchase prices are NOT here: the import derives them from the git-ignored docs/cenniky/data/nivel-naklady.json.
"""

import concurrent.futures as cf
import html
import io
import json
import re
import sys
import unicodedata
import urllib.request
from collections import Counter
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "originals" / "nivel"
PAGES = CACHE / "html"
IMAGES = CACHE / "img"
OUT = ROOT / "supabase" / "seed-data" / "nivel.json"

SITE = "https://www.3gonshop.sk"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36"
BRAND = "NIVEL SYSTEM"
BRAND_SLUG, BRAND_NAME = "nivel-system", "Nivel System"
MIN_GROSS_EUR = 50  # founder 2026-11-25, same floor as AG náradie
MAX_IMAGES = 6
IMAGE_PX = 1000

# Section that holds the Nivel range. It existed as a subcategory of "Ostatné náradie" (Makita and AG lasers);
# it becomes a top-level section with the subcategories below (catalog.json says the same).
SECTION = {
    "slug": "meracia-technika",
    "name": "Meracia technika",
    "parent_slug": None,
    "description": "Rotačné a krížové lasery, nivelačné prístroje a teodolity, diaľkomery a digitálne vodováhy.",
    "sort_order": 6,
}
# 3gonshop listing -> our subcategory (slug, name, sort order)
CATEGORIES = [
    ("/rotacne-lasery/", "rotacne-lasery", "Rotačné lasery", 1),
    ("/krizove-lasery/", "krizove-lasery", "Krížové lasery", 2),
    ("/opticke-nivelacne-pristroje/", "nivelacne-pristroje", "Nivelačné prístroje a teodolity", 3),
    ("/meranie-vzdialenosti/", "dialkomery", "Diaľkomery a meracie kolieska", 4),
    ("/digitalne-vodovahy/", "digitalne-vodovahy", "Digitálne vodováhy", 5),
]
# Package weight when the page states none (it never does so far): rough upper estimates, only so that
# shipping falls into the right band (every Nivel item is a parcel under 40 kg). Replace with 3gon's data.
WEIGHT_GUESS = {"rotacne-lasery": 8, "krizove-lasery": 4, "nivelacne-pristroje": 6, "dialkomery": 1, "digitalne-vodovahy": 1.5}

SAFETY_BASE = "Pred použitím si prečítajte návod na použitie a bezpečnostné pokyny výrobcu."
SAFETY_LASER = (
    "Laserový prístroj: nepozerajte sa priamo do laserového lúča ani doň optickými prístrojmi a nemierte lúčom na oči "
    "iných osôb ani na reflexné plochy vo výške očí. Prístroj neotvárajte a neupravujte."
)
SAFETY_OPTIC = "Ďalekohľadom prístroja nikdy nemierte do slnka ani do iného silného zdroja svetla, hrozí poškodenie zraku."
SAFETY_BATTERY = "Akumulátor nabíjajte len dodanou nabíjačkou a chráňte ho pred teplom, vlhkosťou a mechanickým poškodením."


def fold(text: str) -> str:
    plain = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", plain.lower()).strip("-")


def download(url: str, timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=timeout).read()


def page(path: str, cached: bool) -> str | None:
    file = PAGES / f"{fold(path) or 'index'}.html"
    if cached:
        return file.read_text(encoding="utf-8") if file.exists() else None
    try:
        text = download(SITE + path).decode("utf-8")
    except Exception as e:  # noqa: BLE001 - a missing page is reported and skipped
        print(f"  {path}: {e}")
        return file.read_text(encoding="utf-8") if file.exists() else None
    file.write_text(text, encoding="utf-8")
    return text


# ───────────────────────────── text ─────────────────────────────

def text_of(fragment: str) -> str:
    out = re.sub(r"<[^>]+>", "", fragment)
    out = html.unescape(html.unescape(out)).replace("\xa0", " ")
    out = re.sub(r"[\U0001F000-\U0001FFFF☀-➿️]", "", out)  # emoji ("Farba lasera: 🔴 Červená")
    return re.sub(r"\s+", " ", out).strip()


def euros(text: str) -> float:
    return float(re.sub(r"[^\d,]", "", text).replace(",", "."))


def block(doc: str, start: str, end: str) -> str:
    i = doc.find(start)
    if i < 0:
        return ""
    j = doc.find(end, i)
    return doc[i : j if j > 0 else None]


SKIP_SECTIONS = re.compile(r"stiahnite si|aplik[aá]ci", re.I)
NO_TEXT = re.compile(r"popis produktu nie je dostupn", re.I)
KEY_VALUE = re.compile(r"^([^:]{2,40}):\s*(\S.*)$")


def spec_row(label: str, value: str) -> dict:
    return {"key": fold(label).replace("-", "_")[:60], "label": label, "value": value, "unit": None, "is_filterable": False}


def description(doc: str) -> tuple[str, list[dict]]:
    """The product text as light markdown (headings as bold paragraphs, paragraphs, "- " bullet lists) and the
    specification rows found in it (two-column tables, paragraphs of "Label: value" lines).
    Sections that only carry app-store buttons are dropped; images and links lose their markup."""
    body = block(doc, '<div class="basic-description">', '<div id="ratingTab"')
    blocks: list[str] = []
    rows: list[dict] = []
    skipping = False
    for m in re.finditer(r"<(h[1-6]|p|ul|ol|table)\b[^>]*>(.*?)</\1>", body, re.S | re.I):
        tag, inner = m.group(1).lower(), m.group(2)
        if tag.startswith("h"):
            title = text_of(inner)
            skipping = bool(SKIP_SECTIONS.search(title))
            if title and not skipping:
                blocks.append(f"**{title}**")
            continue
        if skipping:
            continue
        if tag == "table":
            for tr in re.findall(r"<tr\b[^>]*>(.*?)</tr>", inner, re.S | re.I):
                cells = [text_of(c) for c in re.findall(r"<t[dh]\b[^>]*>(.*?)</t[dh]>", tr, re.S | re.I)]
                if len(cells) == 2 and all(cells) and fold(cells[0]) not in ("parameter", "parametre") and fold(cells[1]) != "hodnota":
                    rows.append(spec_row(*cells))
        elif tag in ("ul", "ol"):
            items = [text_of(li) for li in re.findall(r"<li\b[^>]*>(.*?)</li>", inner, re.S | re.I)]
            items = [i for i in items if i]
            if items:
                blocks.append("\n".join(f"- {i}" for i in items))
        else:
            lines = [text_of(part) for part in re.split(r"<br\s*/?>", inner, flags=re.I)]
            pairs = [KEY_VALUE.match(ln) for ln in lines if ln]
            if len(pairs) > 2 and all(pairs):
                rows += [spec_row(p.group(1).strip(), p.group(2).strip()) for p in pairs]
                continue
            text = text_of(inner)
            if re.search(r"\w", text) and not NO_TEXT.search(text):
                blocks.append(text)
    # a heading left without a body (its section was only an image or a table)
    kept = [b for i, b in enumerate(blocks) if not (b.startswith("**") and (i + 1 == len(blocks) or blocks[i + 1].startswith("**")))]
    seen: set[str] = set()
    unique = [r for r in rows if not (r["key"] in seen or seen.add(r["key"]))]
    return "\n\n".join(kept), unique


def short_description(doc: str, fallback: str) -> str:
    items = [text_of(li) for li in re.findall(r"<li\b[^>]*>(.*?)</li>", block(doc, 'class="p-short-description"', "</div>"), re.S)]
    first = next((i for i in items if i), "") or next((ln for ln in fallback.split("\n\n") if not ln.startswith("**")), "")
    first = first.removeprefix("- ")
    return first if len(first) <= 180 else first[:177].rsplit(" ", 1)[0] + "…"


BEAM = [("fialov", "fialová"), ("zelen", "zelená"), ("modr", "modrá"), ("červen", "červená")]
BEAM_SUFFIX = {"R": "červená", "G": "zelená", "B": "modrá", "V": "fialová"}


def specs(name: str, code: str, category: str, text: str, rows: list[dict]) -> list[dict]:
    """Beam colour (filterable), then the page's own rows; accuracy and IP rating are taken from the prose only
    when the page has no row for them. The model code is products.sku, which the product page shows itself."""
    out: list[dict] = []
    if category in ("rotacne-lasery", "krizove-lasery"):
        low = name.lower()
        beam = next((v for k, v in BEAM if k in low), None)
        m = re.match(r"^(?:CLx?|NL)\d*([RGBV])\b", code.split()[0], re.I)
        beam = beam or (BEAM_SUFFIX.get(m.group(1).upper()) if m else None)
        if beam:
            out.append({**spec_row("Farba lúča", beam), "key": "farba_luca", "is_filterable": True})
    out += [r for r in rows if r["key"] not in {o["key"] for o in out} and not r["key"].startswith("farba_las")]
    labels = " ".join(fold(r["label"]) for r in out)
    accuracy = re.search(r"±\s?\d+(?:[,.]\d+)?\s?mm\s?/\s?\d+\s?m\b", text)
    if accuracy and "presnost" not in labels:
        out.append({**spec_row("Presnosť", re.sub(r"\s+", " ", accuracy.group(0))), "key": "presnost"})
    ip = re.search(r"\bIP\s?(\d{2})\b", text)
    if ip and "ip" not in labels.split("-") and "krytie" not in labels and "odolnost" not in labels:
        out.append({**spec_row("Krytie", f"IP{ip.group(1)}"), "key": "ip"})
    return out


def model_code(code: str, name: str) -> str:
    """3gonshop's "Kód" is the model for most products and a bare internal number for some: then the model
    comes from the name (CL5G, NL720R, EL-32, N24x, DT-2L)."""
    if re.search(r"[A-Za-z]", code):
        return code
    m = re.search(r"\b([A-Z]{1,3}[a-z]?-?\d+[A-Za-z]*)\b", name)
    return m.group(1) if m else re.sub(r"(?i)\s*nivel system\s*", " ", name).strip()


# Names that do not say what the product is
NAME_OVERRIDE = {"hdm-little-friend": "Laserový diaľkomer Nivel System HDM Little Friend"}


def weight(text: str) -> float | None:
    m = re.search(r"hmotnos[tť][^0-9\n]{0,30}(\d+(?:[,.]\d+)?)\s?(kg|g)\b", text, re.I)
    if not m:
        return None
    value = float(m.group(1).replace(",", "."))
    return round(value / 1000 if m.group(2).lower() == "g" else value, 2)


def safety(name: str, code: str, category: str, text: str) -> str:
    low = f"{name} {text}".lower()
    parts = []
    if category in ("rotacne-lasery", "krizove-lasery") or "laser" in low or "lúč" in name.lower() or code.upper().startswith("HDM"):
        parts.append(SAFETY_LASER)
    if category == "nivelacne-pristroje":
        parts.append(SAFETY_OPTIC)
    if "li-ion" in low or "akumulátor" in low:
        parts.append(SAFETY_BATTERY)
    return " ".join([SAFETY_BASE, *parts])


# ───────────────────────────── photos ─────────────────────────────

def save_image(source: str, target: Path) -> bool:
    if target.exists():
        return True
    try:
        img = Image.open(io.BytesIO(download(source, timeout=40)))
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
    except Exception as e:  # noqa: BLE001 - a missing photo only drops that photo
        print(f"  photo {source}: {e}")
        return False


def photos(slug: str, urls: list[str]) -> list[str]:
    out = []
    for source in urls:
        name = f"{slug}-{len(out) + 1}.webp"
        if save_image(source, IMAGES / name):
            out.append(f"nivel/{name}")
    return out


# ───────────────────────────── main ─────────────────────────────

def listing(path: str, cached: bool) -> list[str]:
    links, n = [], 1
    while True:
        doc = page(path if n == 1 else f"{path}strana-{n}/", cached)
        if not doc:
            break
        found = re.findall(r'<a href="(/[^"]+/)" class="name"', doc)
        links += [link for link in found if link not in links]
        n += 1
        if f"{path}strana-{n}/" not in doc:
            break
    return links


def product(path: str, category: str, cached: bool) -> dict | None:
    doc = page(path, cached)
    if not doc:
        return None
    brand = re.search(r'class="brand-wrapper-manufacturer-name"><a [^>]*>([^<]+)</a>', doc)
    if not brand or brand.group(1).strip().upper() != BRAND:
        return None
    name = text_of(re.search(r"<h1[^>]*>(.*?)</h1>", doc, re.S).group(1))
    code = text_of(re.search(r'<tr class="p-code">.*?<td>(.*?)</td>', doc, re.S).group(1))
    gross = euros(re.search(r'class="price-final-holder">(.*?)</span>', doc, re.S).group(1))
    net_m = re.search(r'class="price-additional">(.*?)bez DPH', doc, re.S)
    net = euros(net_m.group(1)) if net_m else round(gross / 1.23, 2)
    availability = text_of(re.search(r'data-testid="labelAvailability">(.*?)</span>', doc, re.S).group(1))
    gallery = block(doc, 'class="p-thumbnails-inner"', "</div>\n\n            </div>") or block(doc, 'class="p-image"', "</div>")
    images: list[str] = []
    for href in re.findall(r'href="(https://cdn\.myshoptet\.com/[^"]+/shop/big/[^"]+)"', gallery):
        url = html.unescape(href)
        if url.split("?")[0] not in (u.split("?")[0] for u in images):
            images.append(url)
    text, rows = description(doc)
    code = model_code(code, name)
    # 3gonshop's own address; its "-2" suffixes stay (stripping them breaks "dt-2" vs "dt-5")
    slug = path.strip("/")
    name = re.sub(r"(?i)\s*nivel system\s*", " ", name).strip()
    # brand before the model code, the way the rest of the shop names products
    at = name.lower().find(code.lower().split()[0])
    name = NAME_OVERRIDE.get(slug) or (f"{name[:at]}Nivel System {name[at:]}" if at >= 0 else f"Nivel System {name}")
    stated = weight("\n".join([text, *(f"{r['label']}: {r['value']}" for r in rows)]))
    return {
        "slug": slug,
        "source_url": SITE + path,
        "sku": code,
        "name": re.sub(r"\s+", " ", name),
        "category_slug": category,
        "price_gross_eur": gross,
        "price_net_eur": net,
        "availability": availability,
        "in_stock": True if availability.lower().startswith("skladom") else None,
        "weight_kg": stated or WEIGHT_GUESS[category],
        "weight_estimated": stated is None,
        "short_description": short_description(doc, text),
        "description": text or None,
        "specs": specs(name, code, category, text, rows),
        "safety_info": safety(name, code, category, text),
        "sources": images[:MAX_IMAGES],
    }


def main() -> None:
    cached = "--cached" in sys.argv
    PAGES.mkdir(parents=True, exist_ok=True)
    IMAGES.mkdir(parents=True, exist_ok=True)

    jobs = []
    for path, slug, _, _ in CATEGORIES:
        links = listing(path, cached)
        print(f"{path}: {len(links)} products listed")
        jobs += [(link, slug) for link in links]

    with cf.ThreadPoolExecutor(4) as pool:
        found = [p for p in pool.map(lambda j: product(j[0], j[1], cached), jobs) if p]
    picked = [p for p in found if round(p["price_gross_eur"] * 100) >= MIN_GROSS_EUR * 100]
    slugs = Counter(p["slug"] for p in picked)
    if any(n > 1 for n in slugs.values()):
        raise SystemExit(f"duplicate slugs: {[s for s, n in slugs.items() if n > 1]}")

    with cf.ThreadPoolExecutor(4) as pool:
        for p, images in zip(picked, pool.map(lambda p: photos(p["slug"], p["sources"]), picked)):
            p["images"] = images
            del p["sources"]
    products = [p for p in picked if p["images"]]

    categories = [SECTION] + [{"slug": s, "name": n, "parent_slug": SECTION["slug"], "sort_order": o} for _, s, n, o in CATEGORIES]
    OUT.write_text(
        json.dumps(
            {
                "source": f"{SITE} (3gon Slovakia, s.r.o.)",
                "brand": {"slug": BRAND_SLUG, "name": BRAND_NAME, "website": "https://nivelsystem.com"},
                "categories": categories,
                "products": sorted(products, key=lambda p: (p["category_slug"], p["sku"])),
            },
            ensure_ascii=False,
            indent=1,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"{len(found)} Nivel System products, {len(picked)} from {MIN_GROSS_EUR} EUR, {len(products)} with a photo")
    print(f"in stock: {sum(bool(p['in_stock']) for p in products)}, weight estimated: {sum(p['weight_estimated'] for p in products)}")
    for slug, n in Counter(p["category_slug"] for p in products).items():
        print(f"  {n:3} {slug}")
    for p in found:
        if p not in picked:
            print(f"  below the minimum: {p['sku']} {p['price_gross_eur']} EUR")


if __name__ == "__main__":
    main()
