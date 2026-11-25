"""Nivel System measuring instruments: 3gonshop.sk (shop of the Slovak importer 3gon Slovakia) -> one JSON for
scripts/import-nivel.ts.

    python scripts/nivel-catalog.py            (downloads pages and photos; pages are cached in originals/nivel/html)
    python scripts/nivel-catalog.py --cached   (no page downloads: rebuilds nivel.json from the cache)

We are an authorised Nivel System dealer and sell at 3gonshop's prices (founder, 2026-11-25). 3gon has no feed
yet, so this reads the category listings and every Nivel System product page in them.

The manufacturer's own site (nivelsystem.com/sk, cached in originals/nivel/maker) adds what 3gonshop lacks: the
full specification table, the box contents, the manuals and leaflets (linked, not copied), and the
"Odporúčané príslušenstvo" list. That list is the ONLY source of which tripod or staff is offered on which
instrument page (accessory_for), so we never pair a tripod with an instrument the manufacturer did not name.
One exception, from the tripod's own page: the motorised SJJ-M10 is "určený pre krížové lasery" with a 5/8"
mount, so it goes with the cross lasers whose specification lists a 5/8" thread.

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
    "sort_order": 5,
}
ACCESSORY_CATEGORY = "stativy-a-laty"  # also listed in src/lib/accessories.ts
# 3gonshop listing -> our subcategory (slug, name, sort order)
CATEGORIES = [
    ("/rotacne-lasery/", "rotacne-lasery", "Rotačné lasery", 1),
    ("/krizove-lasery/", "krizove-lasery", "Krížové lasery", 2),
    ("/opticke-nivelacne-pristroje/", "nivelacne-pristroje", "Nivelačné prístroje a teodolity", 3),
    ("/meranie-vzdialenosti/", "dialkomery", "Diaľkomery a meracie kolieska", 4),
    ("/digitalne-vodovahy/", "digitalne-vodovahy", "Digitálne vodováhy", 5),
    ("/stativy/", ACCESSORY_CATEGORY, "Statívy a nivelačné laty", 6),
    ("/nivelacne-laty/", ACCESSORY_CATEGORY, "Statívy a nivelačné laty", 6),
]
# Package weight when the page states none (it never does so far): rough upper estimates, only so that
# shipping falls into the right band (every Nivel item is a parcel under 40 kg). Replace with 3gon's data.
WEIGHT_GUESS = {
    "rotacne-lasery": 8, "krizove-lasery": 4, "nivelacne-pristroje": 6, "dialkomery": 1, "digitalne-vodovahy": 1.5,
    ACCESSORY_CATEGORY: 5,
}

# Tripods and staffs: 3gonshop's texts are one generic line ("Masívna konštrukcia"), so the short text and the
# specification come from here, written from the manufacturer's and 3gonshop's pages (nivelsystem.com/sk/produkt/...).
# "weight" is the package weight for shipping: stated where the manufacturer gives the tripod's weight, else a guess.
ACCESSORY_INFO = {
    "SJJ1": {
        "short": "Ľahký hliníkový statív s plochou hlavou pre optické nivelačné prístroje, rotačné lasery a teodolity, výška 0,97 až 1,6 m.",
        "specs": [("Pracovná výška", "0,97 – 1,6 m"), ("Hlava statívu", "plochá"), ("Materiál", "hliník"), ("Hmotnosť statívu", "3 kg")],
        "weight": 3.5, "weight_estimated": False,
    },
    "SJJ32": {
        "short": "Hliníkový statív s výsuvným elevačným ramenom, ktorý zdvihne rotačný laser do výšky až 3,2 m, napríklad pri podhľadoch.",
        "specs": [("Pracovná výška", "1,3 – 3,2 m"), ("Elevačné rameno", "áno"), ("Hlava statívu", "plochá"), ("Materiál", "hliník"), ("Hmotnosť statívu", "7,2 kg")],
        "weight": 8, "weight_estimated": False,
    },
    "SJJ-M1 EX": {
        "short": "Ľahký hliníkový statív pre krížové lasery a laserové diaľkomery, výška 0,62 až 1,82 m, s adaptérom na naklonenie prístroja.",
        "specs": [("Pracovná výška", "0,62 – 1,82 m"), ("Adaptér na naklonenie", "áno"), ("Materiál", "hliník"), ("Hmotnosť statívu", "1,6 kg"), ("Balenie", "statív, adaptér, prepravný vak")],
        "weight": 2, "weight_estimated": False,
    },
    "SJJ-M10 MOTOR": {
        "short": "Motorizovaný statív pre krížové lasery: výšku od 1,1 do 3,2 m nastavíte rádiovým diaľkovým ovládačom, bez kľuky.",
        "specs": [
            ("Pracovná výška", "1,1 – 3,2 m (s predĺžením 0,7 m)"), ("Diaľkové ovládanie", "rádiové, dosah do 50 m"),
            ("Upevňovací závit", "5/8″"), ("Nosnosť", "do 5 kg"), ("Napájanie", "akumulátor 7,3 V, 2 600 mAh"),
            ("Krytie", "IP56"), ("Hmotnosť statívu", "6,5 kg"), ("Balenie", "statív, diaľkový ovládač (senzor CLS-10 sa predáva samostatne)"),
        ],
        "weight": 8, "weight_estimated": False,
    },
    "LS-24": {
        "short": "Teleskopická laserová lata s milimetrovou stupnicou a posúvačom pre držiak laserového prijímača, dĺžka 2,4 m.",
        "specs": [("Dĺžka", "2,4 m"), ("Stupnica", "milimetrová"), ("Posúvač pre držiak prijímača", "áno"), ("Balenie", "lata, libela, prepravný obal")],
        "weight": 3, "weight_estimated": True,
    },
    "LS-35": {
        "short": "Teleskopická laserová lata s milimetrovou stupnicou a posúvačom pre držiak laserového prijímača, dĺžka 3,5 m.",
        "specs": [("Dĺžka", "3,5 m"), ("Stupnica", "milimetrová"), ("Posúvač pre držiak prijímača", "áno"), ("Balenie", "lata, libela, prepravný obal")],
        "weight": 4, "weight_estimated": True,
    },
    "TS-5": {
        "short": "Kódová nivelačná lata dlhá 5 m pre digitálny nivelačný prístroj Nivel System EL-32.",
        "specs": [("Dĺžka", "5 m"), ("Stupnica", "čiarový kód, milimetrové a centimetrové delenie"), ("Balenie", "lata, libela, prepravné puzdro")],
        "weight": 4, "weight_estimated": True,
    },
    "TS-50": {
        "short": "Teleskopická nivelačná lata dlhá 5 m s odolnou potlačou pre optické nivelačné prístroje.",
        "specs": [("Dĺžka", "5 m"), ("Stupnica", "milimetrové a centimetrové delenie"), ("Balenie", "lata, libela, prepravné puzdro")],
        "weight": 4, "weight_estimated": True,
    },
    "TS-70": {
        "short": "Teleskopická nivelačná lata dlhá 7 m s delením typu E a kovovými svorkami pre optické nivelačné prístroje.",
        "specs": [("Dĺžka", "7 m"), ("Stupnica", "delenie typu E"), ("Balenie", "lata, libela, prepravné puzdro")],
        "weight": 5, "weight_estimated": True,
    },
}
# 3gonshop's "Kód" of the motorised tripod is "M10", the same as the measuring wheel
CODE_OVERRIDE = {"sjj-m10-motor---motorizovany-stativ": "SJJ-M10 MOTOR"}

# ─── nivelsystem.com (manufacturer, TPI Sp. z o.o.) ───
MAKER = "https://nivelsystem.com"
MAKER_PAGES = CACHE / "maker"
MAKER_LISTINGS = [
    "krizove-lasery", "rotacne-lasery", "opticke-nivelacne-pristroje-teodolity", "laserove-dialkomery",
    "vodovahy-laserove-olovnice", "pasky-pocitadla-kilometrov", "prislusenstvo",
]
# our model code -> manufacturer page, where the name does not end with the code
MAKER_ALIAS = {"M100 DIGI": "m100-digital"}
MOTOR_TRIPOD = "SJJ-M10 MOTOR"
# GPSR: manufacturer as named on nivelsystem.com (footer, contact page). To be confirmed by 3gon.
MANUFACTURER = {
    "manufacturer_name": "TPI Sp. z o.o. (Nivel System)",
    "manufacturer_address": "Wał Miedzeszyński 598, 03-994 Varšava, Poľsko",
    "manufacturer_email": "info@nivelsystem.com",
}

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
    return description_of(block(doc, '<div class="basic-description">', '<div id="ratingTab"'))


def description_of(body: str) -> tuple[str, list[dict]]:
    """The product text as light markdown (headings as bold paragraphs, paragraphs, "- " bullet lists) and the
    specification rows found in it (two-column tables, paragraphs of "Label: value" lines).
    Sections that only carry app-store buttons are dropped; images and links lose their markup."""
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
NAME_OVERRIDE = {
    "hdm-little-friend": "Laserový diaľkomer Nivel System HDM Little Friend",
    "sjj-m10-motor---motorizovany-stativ": "Motorizovaný statív Nivel System SJJ-M10 MOTOR",
    "kodova-nivelacna-lata-ts-5-5m": "Kódová nivelačná lata Nivel System TS-5, 5 m",
    "nivelacna-lata-ts-50-5m": "Nivelačná lata Nivel System TS-50, 5 m",
    "nivelacna-lata-ts-70-7m": "Nivelačná lata Nivel System TS-70, 7 m",
}


def weight(text: str) -> float | None:
    m = re.search(r"hmotnos[tť][^0-9\n]{0,30}(\d+(?:[,.]\d+)?)\s?(kg|g)\b", text, re.I)
    if not m:
        return None
    value = float(m.group(1).replace(",", "."))
    return round(value / 1000 if m.group(2).lower() == "g" else value, 2)


def safety(name: str, code: str, category: str, text: str) -> str:
    if category == ACCESSORY_CATEGORY:
        if "lata" in name.lower():
            return SAFETY_BASE + " Vysunutú latu nepoužívajte v blízkosti elektrického vedenia."
        return SAFETY_BASE + " Statív postavte na pevný podklad, nohy zaistite a prístroj pripevnite skôr, ako ho pustíte z ruky."
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
    # 3gonshop's own address; its "-2" suffixes stay (stripping them breaks "dt-2" vs "dt-5")
    slug = path.strip("/")
    code = CODE_OVERRIDE.get(slug) or model_code(code, name)
    name = re.sub(r"(?i)\s*nivel system\s*", " ", name).strip()
    # brand before the model code, the way the rest of the shop names products
    at = name.lower().find(code.lower().split()[0])
    name = NAME_OVERRIDE.get(slug) or (f"{name[:at]}Nivel System {name[at:]}" if at >= 0 else f"Nivel System {name}")
    stated = weight("\n".join([text, *(f"{r['label']}: {r['value']}" for r in rows)]))
    status = availability.lower()
    out = {
        "slug": slug,
        "source_url": SITE + path,
        "sku": code,
        "name": re.sub(r"\s+", " ", name),
        "category_slug": category,
        "price_gross_eur": gross,
        "price_net_eur": net,
        "availability": availability,
        # "Na objednávku" = 3gon orders it (sold, no stock promise); "Momentálne nedostupné" = cannot be ordered
        "in_stock": True if status.startswith("skladom") else False if "nedostupn" in status else None,
        "weight_kg": stated or WEIGHT_GUESS[category],
        "weight_estimated": stated is None,
        "short_description": short_description(doc, text),
        "description": text or None,
        "specs": specs(name, code, category, text, rows),
        "safety_info": safety(name, code, category, text),
        "sources": images[:MAX_IMAGES],
    }
    if category == ACCESSORY_CATEGORY:
        info = ACCESSORY_INFO.get(code)
        if not info:
            raise SystemExit(f"{slug}: tripod/staff {code} has no ACCESSORY_INFO entry")
        out.update(
            short_description=info["short"],
            specs=[spec_row(label, value) for label, value in info["specs"]],
            weight_kg=info["weight"],
            weight_estimated=info["weight_estimated"],
            accessory_for=[],
        )
    return out


# ───────────────────────────── manufacturer site ─────────────────────────────

def maker_page(url: str, cached: bool) -> str | None:
    file = MAKER_PAGES / f"{fold(url.removeprefix(MAKER)) or 'index'}.html"
    if not cached:
        try:
            file.write_text(download(url).decode("utf-8"), encoding="utf-8")
        except Exception as e:  # noqa: BLE001 - a missing page only loses the extras (cached copy if any)
            print(f"  {url}: {e}")
    return file.read_text(encoding="utf-8") if file.exists() else None


def maker_listing(category: str, cached: bool) -> list[str]:
    links: list[str] = []
    n = 1
    while True:
        doc = maker_page(f"{MAKER}/sk/produkty/{category}/" + (f"page/{n}/" if n > 1 else ""), cached)
        if not doc:
            break
        found = [u.rstrip("/") for u in re.findall(rf'href="({MAKER}/sk/produkt/[^"]+)"', doc)]
        new = [u for u in dict.fromkeys(found) if u not in links]
        if not new:
            break
        links += new
        n += 1
        if f"/{category}/page/{n}/" not in doc:
            break
    return links


def maker_tabs(doc: str) -> dict[str, str]:
    """Tab title (Popis, V balení, Špecifikácia, Odporúčané príslušenstvo, ...) -> the tab's HTML."""
    tabs = {}
    for pid, title in re.findall(r'id="tab-title-([a-z_0-9]+)"[^>]*>\s*<a[^>]*>\s*<span[^>]*>\s*([^<]+?)\s*<', doc):
        i = doc.find(f'id="tab-{pid}" role="tabpanel"')
        if i < 0:
            continue
        ends = [j for j in (doc.find('class="wd-accordion-item"', i), doc.find("related-and-upsells", i), doc.find("<script", i)) if j > 0]
        tabs[title.strip()] = doc[i : min(ends) if ends else None]
    return tabs


def maker_specs(tab: str) -> list[tuple[str, str]]:
    rows = []
    for tr in re.findall(r"<tr\b[^>]*>(.*?)</tr>", tab, re.S | re.I):
        cells = [text_of(c) for c in re.findall(r"<t[dh]\b[^>]*>(.*?)</t[dh]>", tr, re.S | re.I)]
        if len(cells) >= 2 and cells[0] and cells[1] and fold(cells[0]) != "parameter":
            rows.append((cells[0].rstrip(":"), cells[1]))
    return rows


def maker_box(tab: str) -> list[str]:
    lines = []
    for m in re.finditer(r"<(p|li)\b[^>]*>(.*?)</\1>", tab, re.S | re.I):
        for part in re.split(r"<br\s*/?>", m.group(2), flags=re.I):
            line = text_of(part).strip(" –-")
            if line and line not in lines:
                lines.append(line)
    return lines


def maker_documents(doc: str) -> list[dict]:
    out, seen = [], set()
    for url, anchor in re.findall(rf'<a [^>]*href="({MAKER}/wp-content/uploads/[^"]+\.pdf)"[^>]*>(.*?)</a>', doc, re.S):
        if url in seen:
            continue
        seen.add(url)
        file = re.sub(r"(?i)pdf\.pdf$", ".pdf", url.rsplit("/", 1)[1])
        langs = list(dict.fromkeys(x.upper() for x in re.findall(r"(?<![A-Za-z])(EN|PL|DE|SK|CZ)(?![A-Za-z])", file, re.I)))
        suffix = f" ({', '.join(langs)})" if langs else ""
        manual = fold(text_of(anchor)).startswith("manual")
        out.append({
            "type": "manual" if manual else "datasheet",
            "title": ("Návod na použitie od výrobcu" if manual else "Produktový leták výrobcu") + suffix,
            "path": url,
        })
    return sorted(out, key=lambda d: d["type"] != "manual")


def maker_product(url: str, cached: bool) -> dict | None:
    doc = maker_page(url + "/", cached)
    if not doc:
        return None
    doc = doc[doc.find('id="main-content"') :]
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", doc, re.S)
    if not h1:
        return None
    tabs = maker_tabs(doc)
    recommended = tabs.get("Odporúčané príslušenstvo", "")
    return {
        "url": url,
        "title": text_of(h1.group(1)),
        "text": description_of(tabs.get("Popis", ""))[0],
        "specs": maker_specs(tabs.get("Špecifikácia", "")),
        "box": maker_box(tabs.get("V balení", "")),
        "documents": maker_documents(doc),
        "recommended": list(dict.fromkeys(u.rstrip("/") for u in re.findall(rf'href="({MAKER}/sk/produkt/[^"]+)"', recommended))),
    }


def squash(text: str) -> str:
    return fold(text).replace("-", "")


def match_maker(products: list[dict], pages: list[dict]) -> dict[str, dict]:
    """Our slug -> manufacturer page: the page title ends with our model code ("Krížový laser CLx3G MOTOR"),
    the rotary lasers carry a "DIGITAL" suffix there."""
    by_slug = {p["url"].rsplit("/", 1)[1]: p for p in pages}
    out = {}
    for p in products:
        alias = MAKER_ALIAS.get(p["sku"])
        if alias:
            hits = [by_slug[alias]] if alias in by_slug else []
        else:
            code = squash(p["sku"])
            hits = [m for m in pages if squash(m["title"]).endswith(code)] or [
                m for m in pages if squash(m["title"]).endswith(code + "digital")
            ]
        if len(hits) == 1:
            out[p["slug"]] = hits[0]
        else:
            print(f"  manufacturer page for {p['sku']}: {len(hits)} matches {[m['title'] for m in hits]}")
    return out


# Rows 3gonshop takes from the prose, superseded by the manufacturer's table
SUPERSEDED = {"presnost", "krytie", "ip", "hmotnost"}


def merge_specs(own: list[dict], maker: list[tuple[str, str]]) -> list[dict]:
    """Beam colour (our filter) first, then the manufacturer's table, then 3gonshop rows it does not cover."""
    if not maker:
        return own
    rows = [r for r in own if r["key"] == "farba_luca"]
    for label, value in maker:
        if fold(label) == "hmotnost":
            label = "Hmotnosť prístroja"
        row = spec_row(label, value)
        if row["key"] not in {r["key"] for r in rows}:
            rows.append(row)
    keys = {r["key"] for r in rows}
    rows += [r for r in own if r["key"] not in keys and r["key"] not in SUPERSEDED]
    return rows


def enrich(products: list[dict], cached: bool) -> None:
    """Manufacturer data onto our products, and accessory_for onto the tripods and staffs."""
    MAKER_PAGES.mkdir(parents=True, exist_ok=True)
    urls = list(dict.fromkeys(u for c in MAKER_LISTINGS for u in maker_listing(c, cached)))
    with cf.ThreadPoolExecutor(4) as pool:
        pages = [m for m in pool.map(lambda u: maker_product(u, cached), urls) if m]
    print(f"nivelsystem.com: {len(pages)} product pages")
    matched = match_maker(products, pages)
    slug_of = {m["url"]: slug for slug, m in matched.items()}
    accessories = {p["slug"]: p for p in products if p["category_slug"] == ACCESSORY_CATEGORY}
    motor = next((p for p in accessories.values() if p["sku"] == MOTOR_TRIPOD), None)

    for p in products:
        m = matched.get(p["slug"])
        if not m:
            continue
        p["maker_url"] = m["url"] + "/"
        p["documents"] = m["documents"]
        if not p["description"] and m["text"]:
            p["description"] = m["text"]
        if p["category_slug"] == ACCESSORY_CATEGORY:
            continue
        p["specs"] = merge_specs(p["specs"], m["specs"])
        if m["box"] and p["description"] is not None and "obsah balenia" not in p["description"].lower():
            p["description"] += "\n\n**Obsah balenia**\n\n" + "\n".join(f"- {line}" for line in m["box"])
        for url in m["recommended"]:
            target = accessories.get(slug_of.get(url, ""))
            if target:
                target["accessory_for"].append(p["slug"])
        threads = " ".join(value for label, value in m["specs"] if fold(label).startswith(("zavit", "upevn", "pripevn", "uchyt")))
        if motor and p["category_slug"] == "krizove-lasery" and "5/8" in threads:
            motor["accessory_for"].append(p["slug"])

    for a in accessories.values():
        a["accessory_for"] = sorted(set(a["accessory_for"]))
        if a["accessory_for"]:
            models = sorted({next(p["sku"] for p in products if p["slug"] == s) for s in a["accessory_for"]})
            a["specs"].append({**spec_row("Výrobca odporúča pre", ", ".join(models)), "key": "compatible"})
    missing = [p["sku"] for p in products if p["slug"] not in matched]
    print(f"  matched {len(matched)} of {len(products)}; no manufacturer page: {missing}")
    for a in accessories.values():
        print(f"  {a['sku']:14} offered with {len(a['accessory_for'])} instruments")


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
    enrich(products, cached)

    subcategories = {s: (n, o) for _, s, n, o in CATEGORIES}
    categories = [SECTION] + [{"slug": s, "name": n, "parent_slug": SECTION["slug"], "sort_order": o} for s, (n, o) in subcategories.items()]
    OUT.write_text(
        json.dumps(
            {
                "source": f"{SITE} (3gon Slovakia, s.r.o.); specifications, manuals and accessories: {MAKER}/sk",
                "brand": {"slug": BRAND_SLUG, "name": BRAND_NAME, "website": f"{MAKER}/sk/", **MANUFACTURER},
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
