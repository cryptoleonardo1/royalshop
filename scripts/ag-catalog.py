"""AG náradie range: the wholesaler's two XML feeds -> one JSON for scripts/import-ag.ts.

    python scripts/ag-catalog.py            (downloads the feeds when the URLs are set, else uses the cache)
    python scripts/ag-catalog.py --dry-run  (no photo downloads and no ag.json: prints what would be imported)

Inputs:
  AG_PRICE_FEED_URL, AG_CARDS_FEED_URL   in .env.local or the environment; the addresses carry our access
                                         token, so they are never committed
  originals/ag/cennik_export.xml         cache of the price feed (code, stock, price without VAT)
  originals/ag/sklad_karty_export.xml    cache of the product feed (names, texts, photos, category tree)
  supabase/seed-data/ag-config.json      minimum price, markup and VAT rate
Output (git-ignored, rebuilt from the feeds):
  supabase/seed-data/ag.json             every product at or above the minimum price that has a photo and a
                                         description, whether it is in stock or not
  originals/ag/img/*.webp                photos, uploaded to the product-images bucket by scripts/import-ag.ts

Stock decides only what the shop shows (src/lib/ag-feed.ts); out-of-stock products are imported too, so the
daily sync can switch them on. Photos and texts belong to AG náradie and its suppliers.
"""

import concurrent.futures as cf
import html
import io
import json
import os
import re
import sys
import unicodedata
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "originals" / "ag"
IMAGES = CACHE / "img"
OUT = ROOT / "supabase" / "seed-data" / "ag.json"
CONFIG = json.loads((ROOT / "supabase" / "seed-data" / "ag-config.json").read_text(encoding="utf-8"))
FEEDS = {"AG_PRICE_FEED_URL": CACHE / "cennik_export.xml", "AG_CARDS_FEED_URL": CACHE / "sklad_karty_export.xml"}

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36"
IMAGE_PX = 1000
IMAGE_FILE = re.compile(r"\.(jpe?g|png|gif|avif|jfif|webp)$", re.I)
# A subcategory with fewer products than this is not worth a menu entry: its products sit in the parent.
MIN_SUBCATEGORY = 5
NO_BRAND = {"", "noname", "nezadany"}
NO_BRAND_SLUG, NO_BRAND_NAME = "ostatne-znacky", "Ostatné značky"


def fold(text: str) -> str:
    plain = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", plain.lower()).strip("-")


def env(name: str) -> str | None:
    if os.environ.get(name):
        return os.environ[name]
    file = ROOT / ".env.local"
    if file.exists():
        m = re.search(rf"^{name}=(.+)$", file.read_text(encoding="utf-8"), re.M)
        if m:
            return m.group(1).strip().strip('"')
    return None


def download(url: str, timeout: int = 120) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=timeout).read()


def refresh_feeds() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    for name, file in FEEDS.items():
        url = env(name)
        try:
            if not url:
                raise RuntimeError(f"{name} is not set")
            data = download(url)
            ET.fromstring(data)  # a half-written export must not replace a good cache
            file.write_bytes(data)
            print(f"downloaded {file.name}: {len(data) // 1024} kB")
        except Exception as e:  # noqa: BLE001 - the cache is the fallback
            if not file.exists():
                raise SystemExit(f"{file.name}: no download ({e}) and no cached copy in {CACHE}")
            print(f"{file.name}: using the cached copy ({e})")


# ───────────────────────────── text ─────────────────────────────

def clean(text: str | None) -> str:
    """Feed text: HTML entities written as text ("&Oslash;"), stray tags, uneven spaces."""
    out = html.unescape(html.unescape(text or "")).replace("\xa0", " ").replace("\t", " ")
    out = re.sub(r"<br\s*/?>", "\n", out, flags=re.I)
    out = re.sub(r"<[^>]+>", "", out)
    return "\n".join(re.sub(r" {2,}", " ", line).strip() for line in out.splitlines()).strip()


def product_name(card: ET.Element) -> str:
    name = clean(card.findtext("NAZOV_ETIK")) or clean(card.findtext("NAZOV"))
    return re.sub(r"\s*\*+$", "", name.replace("\n", " ")).strip()


KEY_VALUE = re.compile(r"^([^:\n]{2,40}):\s*(\S.*)$")
BULLET = re.compile(r"^(?:-{1,2}|[•·*])\s*")


def description(card: ET.Element) -> tuple[str, list[dict]]:
    """Light markdown for the product page (paragraphs, "- " bullet lists) and the "Label: value" lines
    as specification rows."""
    text = clean(card.findtext("TECH_POPIS"))
    extra = clean(card.findtext("DOPL_INFO"))
    if extra and extra not in text:
        text = f"{text}\n{extra}"
    specs, used, blocks, bullets = [], set(), [], []

    def flush() -> None:
        if bullets:
            blocks.append("\n".join(f"- {b}" for b in bullets))
            bullets.clear()

    for line in (ln for ln in text.splitlines() if ln):
        pair = KEY_VALUE.match(line)
        if BULLET.match(line):
            bullets.append(BULLET.sub("", line))
        elif pair and not line.endswith(":"):
            key = fold(pair.group(1)).replace("-", "_")[:60]
            if key and key not in used:
                used.add(key)
                specs.append({"key": key, "label": pair.group(1).strip(), "value": pair.group(2).strip(), "unit": None, "is_filterable": False})
        else:
            flush()
            blocks.append(line)
    flush()
    return "\n\n".join(blocks), specs


def short_description(text: str) -> str:
    first = re.sub(r"^- ", "", next((ln for ln in text.splitlines() if ln), ""))
    return first if len(first) <= 180 else first[:177].rsplit(" ", 1)[0] + "…"


# ───────────────────────────── categories ─────────────────────────────

# New sections for what the machine catalogue did not have: (slug, name, sort_order). Since 2026-11-25 the
# shop keeps a handful of top-level groups (catalog.json), so these sit under one group of their own.
GROUP = {"slug": "rucne-naradie-a-dielna", "name": "Ručné náradie a dielňa", "parent_slug": None, "sort_order": 6}
SECTIONS = {
    "rucne": ("rucne-naradie", "Ručné náradie", 20),
    "rems": ("instalaterske-naradie", "Inštalatérske náradie", 21),
    "rezne": ("rezne-naradie", "Rezné náradie a brusivo", 22),
    "stavebne": ("stavebne-naradie", "Stavebné náradie", 23),
    "dielna": ("dielenske-vybavenie", "Dielenské vybavenie", 24),
    "zvaranie": ("zvaranie", "Zváranie a spájkovanie", 25),
    "dom": ("dom-a-hospodarstvo", "Dom a hospodárstvo", 26),
}
# Feed root -> section; its second level becomes our subcategory.
ROOT_SECTION = {
    "rucne-naradie": "rucne",
    "rezne-naradie": "rezne",
    "brusivo-kefy": "rezne",
    "prislusenstvo-k-elektro": "rezne",
    "stavebne-naradie": "stavebne",
    "dielenske-vybavenie": "dielna",
    "stojany-regaly": "dielna",
    "zvaranie-plamenom": "zvaranie",
    "zvaracie-potreby-spajkovanie": "zvaranie",
    "hospodarske-potreby": "dom",
}
# Subcategories added under sections that already exist: (slug, name, parent slug).
EXTRA = {
    "pneu": ("pneumaticke-naradie", "Pneumatické náradie", "klincovacky-a-kompresory"),
    "zahrada": ("zahradne-naradie", "Záhradné náradie a zavlažovanie", "zahradna-technika"),
    "ostatne": ("ostatny-sortiment", "Ostatný sortiment", "ostatne-naradie"),
}
# Power tools go into the existing machine categories by what the name says. First match wins; tested against
# the folded name ("skrutkovac-akumulatorovy-vrtaci"). Every needle of a rule must be present.
NAME_RULES: list[tuple[tuple[str, ...], str]] = [
    (("laser",), "meracia-technika"),
    (("lamp",), "radia-a-svietidla"), (("svietid",), "radia-a-svietidla"), (("radio",), "radia-a-svietidla"),
    (("teplovzdus",), "teplovzdusne-pistole"), (("lepiac",), "teplovzdusne-pistole"),
    (("vysavac",), "vysavace"),
    (("kosack",), "kosacky"),
    (("krovinorez",), "krovinorezy-a-vyzinace"), (("vyzinac",), "krovinorezy-a-vyzinace"),
    (("plotostrih",), "plotostrihy"), (("noznice", "zahrad"), "plotostrihy"), (("pruner",), "plotostrihy"),
    (("fukar",), "duchadla"), (("duchadl",), "duchadla"),
    (("retazov",), "retazove-pily"),
    (("vysokotlak",), "vysokotlakove-cistice"), (("tlakov", "cistic"), "vysokotlakove-cistice"),
    (("klincovack",), "klincovacky"), (("sponkovack",), "klincovacky"),
    (("kompresor",), "kompresory"),
    (("elektrocentral",), "elektrocentraly"),
    (("lestic",), "lesticky"),
    (("brusk", "uhl"), "uhlove-brusky"), (("brusk",), "ostatne-brusky"),
    (("chvostov",), "chvostove-pily"), (("okruzn",), "okruzne-pily"), (("ponorn", "pil"), "okruzne-pily"),
    (("priamociar",), "priamociare-pily"), (("pokos",), "pokosove-pily"), (("pila",), "ostatne-pily"),
    (("burac",), "buracie-kladiva"), (("sekac", "kladiv"), "buracie-kladiva"), (("kladiv",), "vrtacie-kladiva"),
    (("miesadl",), "miesadla"), (("miesac",), "miesadla"),
    (("utahov",), "razove-utahovaky"), (("razov",), "razove-utahovaky"),
    (("priklep",), "priklepove-skrutkovace"),
    (("skrutkovac",), "vrtacie-skrutkovace"),
    (("vrtack",), "vrtacky"),
    (("frez",), "frezy"), (("hoblik",), "hobliky"),
    (("noznic",), "rezanie-kovu"), (("prestrih",), "rezanie-kovu"),
    (("sada",), "sady-naradia"),
]
# Second level of "Elektrické a AKU náradie" when the name says nothing.
POWER_FALLBACK = {
    "brusky-uhlove-lesticky": "uhlove-brusky",
    "kladiva-vrtacie-sekacie": "vrtacie-kladiva",
    "vrtacky-skrutkovace": "vrtacky",
    "utahovaky": "razove-utahovaky",
    "pily": "ostatne-pily",
    "vysavace": "vysavace",
    "miesadla": "miesadla",
    "frezy": "frezy",
    "hobliky": "hobliky",
    "cistice-vysokotlake": "vysokotlakove-cistice",
    "elektrocentraly": "elektrocentraly",
    "pistole-teplovzdusne-a-lepiace": "teplovzdusne-pistole",
    "multifunkcne-naradie": "ostatne-pily",
    "noznice-prestrihavace": "rezanie-kovu",
    "nahradne-diely": "prislusenstvo",
}
GARDEN_MACHINES = {"kosacky", "krovinorezy-a-vyzinace", "plotostrihy", "duchadla", "retazove-pily", "vysokotlakove-cistice"}


# Batteries and chargers sold on their own: the name starts with the word ("akumulatorovy" is a cordless tool).
SPARE_START = re.compile(r"^(akumulator|bateria|nabijacka|clanok)(-|$)")


def by_name(name_slug: str) -> str | None:
    if SPARE_START.match(name_slug):
        return "prislusenstvo"
    return next((cat for needles, cat in NAME_RULES if all(n in name_slug for n in needles)), None)


def place(path: list[str], name: str) -> tuple[str, str | None]:
    """-> (existing category slug or section key, subcategory name or None)"""
    root = fold(path[0]) if path else ""
    second = path[1].strip() if len(path) > 1 else None
    third = path[2].strip() if len(path) > 2 else None
    name_slug = fold(name)
    if root == "rucne-naradie" and second and fold(second) == "rems-naradie":
        return "rems", third
    if root in ROOT_SECTION:
        return ROOT_SECTION[root], second
    if root == "elektricke-a-aku-naradie":
        fallback = POWER_FALLBACK.get(fold(second or ""), "specialne-naradie")
        return ("prislusenstvo" if fallback == "prislusenstvo" else by_name(name_slug) or fallback), None
    if root == "pneumaticke-naradie":
        return ("kompresory", None) if "kompresor" in fold(second or "") + name_slug else ("pneu", None)
    if root == "zahradne-naradie":
        if fold(second or "") == "motorove-naradie":
            found = by_name(name_slug)
            return (found if found in GARDEN_MACHINES else "ostatna-zahradna-technika"), None
        return "zahrada", None
    if root == "meradla":
        return "meracia-technika", None
    return "ostatne", None


# ───────────────────────────── photos ─────────────────────────────

def save_image(source: str, target: Path) -> bool:
    if target.exists():
        return True
    try:
        img = Image.open(io.BytesIO(download(source.replace("http://", "https://", 1), timeout=40)))
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
    except Exception:  # noqa: BLE001 - a missing photo only drops that photo
        return False


def photos(code: str, urls: list[str]) -> list[str]:
    out = []
    for source in urls:
        name = f"{code}-{len(out) + 1}.webp"
        if save_image(source, IMAGES / name):
            out.append(f"ag/{name}")
    return out


# ───────────────────────────── main ─────────────────────────────

def gross_cents(net_eur: float, markup: int, vat: int) -> int:
    """Selling price incl. markup and VAT, the same rounding as agGrossCents in src/lib/ag-feed.ts."""
    return int(int(net_eur * 1000 + 0.5) * (100 + markup) * (100 + vat) / 100_000 + 0.5)


def main() -> None:
    dry_run = "--dry-run" in sys.argv
    refresh_feeds()
    IMAGES.mkdir(parents=True, exist_ok=True)
    vat, markup, minimum = CONFIG["vat_rate"], CONFIG["markup_pct"], CONFIG["min_price_gross_eur"]

    price_root = ET.parse(FEEDS["AG_PRICE_FEED_URL"]).getroot()
    prices = {}
    for p in price_root.iter("Produkt"):
        try:
            prices[p.findtext("IntKod")] = (float(p.findtext("CenaBezDPH")), float(p.findtext("Zasoba")))
        except (TypeError, ValueError):
            continue

    picked = []
    for _, card in ET.iterparse(FEEDS["AG_CARDS_FEED_URL"]):
        if card.tag != "Karta":
            continue
        code = (card.findtext("INTKOD") or "").strip()
        if code in prices and gross_cents(prices[code][0], markup, vat) >= round(minimum * 100):
            images = [(o.findtext("URL") or "").strip() for o in card.iter("OBRAZOK")]
            main_first = sorted(
                (u for u in images if IMAGE_FILE.search(u)),
                key=lambda u: not any(o.findtext("MAIN") == "true" and (o.findtext("URL") or "").strip() == u for o in card.iter("OBRAZOK")),
            )
            text, specs = description(card)
            name = product_name(card)
            if main_first and name and (text or specs) and fold(clean(card.findtext("VYROBCA"))) not in CONFIG["skip_brands"]:
                path = [s for s in (card.findtext("STROM_PATH") or "").strip("\\").split("\\") if s.strip()]
                brand = clean(card.findtext("VYROBCA"))
                maker_code = clean(card.findtext("DOD_KOD"))
                if maker_code:
                    specs.insert(0, {"key": "kod_vyrobcu", "label": "Kód výrobcu", "value": maker_code, "unit": None, "is_filterable": False})
                try:
                    weight = float(card.findtext("HMOTNOST") or 0)
                except ValueError:
                    weight = 0
                picked.append({
                    "code": code,
                    "ean": clean(card.findtext("EAN")) or None,
                    "name": name,
                    "brand": (NO_BRAND_SLUG, NO_BRAND_NAME) if fold(brand) in NO_BRAND else (fold(brand), brand),
                    "place": place(path, name),
                    "price_net_eur": prices[code][0],
                    "stock": prices[code][1],
                    "weight_kg": round(weight, 2) if weight > 0 else None,
                    "short_description": short_description(text) or name,
                    "description": text or None,
                    "specs": specs,
                    "sources": main_first[: CONFIG["max_images"]],
                })
        card.clear()

    if dry_run:
        for product in picked:
            product["images"] = [f"ag/{product['code']}-{i + 1}.webp" for i in range(len(product["sources"]))]
    else:
        with cf.ThreadPoolExecutor(6) as pool:
            for done, (product, images) in enumerate(zip(picked, pool.map(lambda p: photos(p["code"], p["sources"]), picked)), 1):
                product["images"] = images
                if done % 250 == 0:
                    print(f"  photos {done}/{len(picked)}")
    products = [p for p in picked if p["images"]]

    # Subcategories of the new sections, from the feed's own tree; small ones fold into the section.
    sizes = Counter(p["place"] for p in products)
    categories = {GROUP["slug"]: GROUP}
    categories.update({slug: {"slug": slug, "name": name, "parent_slug": GROUP["slug"], "sort_order": order} for slug, name, order in SECTIONS.values()})
    for slug, name, parent in EXTRA.values():
        categories[slug] = {"slug": slug, "name": name, "parent_slug": parent, "sort_order": 20}
    for p in products:
        key, sub = p.pop("place")
        if key in SECTIONS:
            section = SECTIONS[key][0]
            if sub and sizes[(key, sub)] >= MIN_SUBCATEGORY:
                slug = f"{section}-{fold(sub)}"
                categories.setdefault(slug, {"slug": slug, "name": re.sub(r",(?=\S)", ", ", sub), "parent_slug": section, "sort_order": 0})
                p["category_slug"] = slug
            else:
                p["category_slug"] = section
        else:
            p["category_slug"] = EXTRA[key][0] if key in EXTRA else key
        p["brand_slug"], brand_name = p.pop("brand")
        p["brand_name"] = brand_name
        del p["sources"]
    subs = sorted((c for c in categories.values() if c["parent_slug"] in {s[0] for s in SECTIONS.values()}), key=lambda c: fold(c["name"]))
    for i, c in enumerate(subs):
        c["sort_order"] = i + 1

    brands = sorted({(p["brand_slug"], p.pop("brand_name")) for p in products})
    products.sort(key=lambda p: p["code"])
    (CACHE / "ag-dry-run.json" if dry_run else OUT).write_text(
        json.dumps(
            {
                "exported_at": price_root.findtext("Datum"),
                "brands": [{"slug": s, "name": n} for s, n in dict(brands).items()],
                "categories": list(categories.values()),
                "products": products,
            },
            ensure_ascii=False,
            indent=1,
        )
        + "\n",
        encoding="utf-8",
    )
    in_stock = sum(p["stock"] > 0 for p in products)
    print(f"{len(products)} products ({in_stock} in stock), {len(picked) - len(products)} dropped without a downloadable photo")
    print(f"{len(dict(brands))} brands, {len(categories)} new categories")
    for slug, n in Counter(p["category_slug"] for p in products).most_common():
        print(f"  {n:5} {slug}")


if __name__ == "__main__":
    main()
