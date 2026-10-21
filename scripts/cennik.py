"""Supplier price-list workbook: one sheet per brand, CZK -> EUR via one exchange-rate cell.

    python scripts/cennik.py

Inputs (git-ignored, the repo is public):
  docs/cenniky/data/zdroje.json   rate + one entry per brand (sheet name, CSV files, price-list metadata)
  docs/cenniky/data/*.csv         kategoria,model,popis,cena_bez_dph_czk,poznamka  (one file per supplier PDF)
Output:
  docs/cenniky/Cennik-dodavatelov.xlsx

Re-running after a new price list keeps the columns people fill in by hand (our price, competitor
price, units sold, own note), matched by sheet + model, and moves a changed CZK price into
"Predchádzajúca cena" so the change % shows what got more expensive.
"""

import csv
import json
import re
from datetime import date
from pathlib import Path

from openpyxl import Workbook, load_workbook
from openpyxl.comments import Comment
from openpyxl.formatting.rule import CellIsRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "docs" / "cenniky" / "data"
OUT = ROOT / "docs" / "cenniky" / "Cennik-dodavatelov.xlsx"
CATALOG = ROOT / "supabase" / "seed-data" / "catalog.json"

FONT = "Arial"
INPUT_FILL = PatternFill("solid", fgColor="FFF2CC")  # cells people fill in
HEAD_FILL = PatternFill("solid", fgColor="0F0F0E")
HIVIS = "FF6A13"
THIN = Side(style="thin", color="BFBFBF")

# (header, width, kind) — kind: data | formula | input
COLUMNS = [
    ("Kategória", 34, "data"),
    ("Model", 22, "data"),
    ("Popis", 40, "data"),
    ("Cena bez DPH (CZK)", 14, "data"),
    ("Cena bez DPH (EUR)", 14, "formula"),
    ("Cena s DPH 23 % (EUR)", 14, "formula"),
    ("Nákupná cena bez DPH (EUR)", 14, "formula"),
    ("V e-shope", 10, "data"),
    ("Naša predajná cena s DPH (EUR)", 16, "input"),
    ("Marža %", 10, "formula"),
    ("Cena konkurencie s DPH (EUR)", 16, "input"),
    ("Konkurent / odkaz", 24, "input"),
    ("Predané ks", 10, "input"),
    ("Predchádzajúca cena (CZK)", 14, "data"),
    ("Zmena ceny %", 10, "formula"),
    ("Poznámka z cenníka", 30, "data"),
    ("Naša poznámka", 30, "input"),
]
COL = {h: i + 1 for i, (h, _, _) in enumerate(COLUMNS)}
INPUT_HEADERS = [h for h, _, k in COLUMNS if k == "input"]
HEADER_ROW = 4
RATE = "Kurz!$B$4"
VAT = "Kurz!$B$5"
DISCOUNT = "$D$3"  # per-sheet supplier discount off the list price


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def catalog_skus() -> dict[str, set[str]]:
    by_brand: dict[str, set[str]] = {}
    for p in json.loads(CATALOG.read_text(encoding="utf-8"))["products"]:
        # Kit SKUs ("DINGO 230V + TDX 3 m + AX 58") match on the base unit.
        by_brand.setdefault(p["brand_slug"], set()).add(norm(p["sku"].split("+")[0].replace("230V", "")))
    return by_brand


def in_eshop(model: str, skus: set[str]) -> str | None:
    """'áno' = exactly the catalog model; 'variant' = same base model with another engine/kit/code
    (e.g. VD 15P vs VD 15, or Honda GX160 engine variant codes)."""
    m = norm(model)
    if not m:
        return None
    if m in skus:
        return "áno"
    if any(len(s) >= 4 and m.startswith(s) and not m[len(s)].isdigit() for s in skus):
        return "variant"
    return None


def previous_state() -> dict[tuple[str, str], dict]:
    """Hand-filled columns and last CZK price from the current workbook, keyed by (sheet, model)."""
    if not OUT.exists():
        return {}
    wb = load_workbook(OUT)  # formulas irrelevant: we only read data and input columns
    state = {}
    for ws in wb.worksheets:
        if ws.title in ("Prehľad", "Kurz"):
            continue
        headers = {ws.cell(HEADER_ROW, c).value: c for c in range(1, ws.max_column + 1)}
        if "Model" not in headers:
            continue
        state[(ws.title, "__discount__")] = ws["D3"].value
        for r in range(HEADER_ROW + 1, ws.max_row + 1):
            model = ws.cell(r, headers["Model"]).value
            if not model:
                continue
            key = (ws.title, f"{ws.cell(r, headers['Kategória']).value}|{model}|{ws.cell(r, headers['Popis']).value or ''}")
            state[key] = {h: ws.cell(r, headers[h]).value for h in INPUT_HEADERS if h in headers}
            state[key]["czk"] = ws.cell(r, headers["Cena bez DPH (CZK)"]).value
            state[key]["prev"] = ws.cell(r, headers["Predchádzajúca cena (CZK)"]).value
    return state


def style_header(ws, row: int, ncols: int):
    for c in range(1, ncols + 1):
        cell = ws.cell(row, c)
        cell.font = Font(name=FONT, bold=True, color="FFFFFF", size=10)
        cell.fill = HEAD_FILL
        cell.alignment = Alignment(wrap_text=True, vertical="center")
    ws.row_dimensions[row].height = 42


def build_rate_sheet(wb: Workbook, cfg: dict):
    ws = wb.create_sheet("Kurz")
    ws["A1"] = "Kurz a DPH"
    ws["A1"].font = Font(name=FONT, bold=True, size=14)
    ws["A2"] = "Žlté bunky môžete meniť. Všetky ceny v EUR na záložkách značiek sa prepočítajú z týchto hodnôt."
    ws["A2"].font = Font(name=FONT, italic=True, size=9, color="595959")
    rows = [
        ("Kurz CZK za 1 EUR", cfg["rate"], "0.000"),
        ("DPH SR", cfg["vat"], "0%"),
        ("Dátum kurzu", cfg["rate_date"], None),
        ("Zdroj kurzu", cfg["rate_source"], None),
    ]
    for i, (label, value, fmt) in enumerate(rows, start=4):
        ws.cell(i, 1, label).font = Font(name=FONT, bold=True)
        cell = ws.cell(i, 2, value)
        cell.font = Font(name=FONT, color="0000FF" if i < 6 else "000000")
        if i < 6:
            cell.fill = INPUT_FILL
        if fmt:
            cell.number_format = fmt
    ws["B4"].comment = Comment(f"Kurz ČNB k {cfg['rate_date']}: {cfg['rate']} CZK/EUR. {cfg['rate_source']}", "Royal Shop")
    ws.column_dimensions["A"].width = 22
    ws.column_dimensions["B"].width = 70


def build_brand_sheet(wb: Workbook, brand: dict, skus: set[str], prev: dict, today: str) -> int:
    ws = wb.create_sheet(brand["sheet"])
    ws["A1"] = f"{brand['sheet']} – cenník dodávateľa"
    ws["A1"].font = Font(name=FONT, bold=True, size=14)
    ws["A2"] = " · ".join(filter(None, [brand.get("price_basis"), f"Cenník: {brand['date']}", brand.get("validity")]))
    ws["A2"].font = Font(name=FONT, size=9, color="595959")
    ws["A3"] = "Rabat dodávateľa (zľava z cenníka):"
    ws["A3"].font = Font(name=FONT, bold=True, size=10)
    old_discount = prev.get((brand["sheet"], "__discount__"))
    ws["D3"] = old_discount if old_discount is not None else 0
    ws["D3"].number_format = "0.0%"
    ws["D3"].font = Font(name=FONT, bold=True, color="0000FF")
    ws["D3"].fill = INPUT_FILL
    ws["D3"].comment = Comment(
        "Cenník obsahuje odporúčané koncové ceny. Doplňte dohodnutý rabat (napr. 25 %), "
        "z neho sa vypočíta nákupná cena a marža.", "Royal Shop")
    ws["E3"] = "← doplňte po dohode s dodávateľom; 0 % = nákupná cena sa rovná cenníku"
    ws["E3"].font = Font(name=FONT, italic=True, size=9, color="595959")
    for i, (h, width, kind) in enumerate(COLUMNS, start=1):
        ws.cell(HEADER_ROW, i, h)
        ws.column_dimensions[get_column_letter(i)].width = width
    style_header(ws, HEADER_ROW, len(COLUMNS))
    for h in INPUT_HEADERS:
        ws.cell(HEADER_ROW, COL[h]).font = Font(name=FONT, bold=True, color=HIVIS, size=10)

    rows = []
    for name in brand["files"]:
        with open(DATA / name, encoding="utf-8-sig", newline="") as f:
            rows += list(csv.DictReader(f))

    letter = {h: get_column_letter(COL[h]) for h in COL}
    r = HEADER_ROW
    for row in rows:
        r += 1
        czk = float(row["cena_bez_dph_czk"])
        key = (brand["sheet"], f"{row['kategoria']}|{row['model']}|{row['popis'] or ''}")
        old = prev.get(key, {})
        prev_czk = old.get("prev")
        if old.get("czk") is not None and abs(float(old["czk"]) - czk) > 0.004:
            prev_czk = old["czk"]
        values = {
            "Kategória": row["kategoria"],
            "Model": row["model"],
            "Popis": row["popis"],
            "Cena bez DPH (CZK)": czk,
            "Cena bez DPH (EUR)": f"=ROUND({letter['Cena bez DPH (CZK)']}{r}/{RATE},2)",
            "Cena s DPH 23 % (EUR)": f"=ROUND({letter['Cena bez DPH (EUR)']}{r}*(1+{VAT}),2)",
            "Nákupná cena bez DPH (EUR)": f"=ROUND({letter['Cena bez DPH (EUR)']}{r}*(1-{DISCOUNT}),2)",
            "V e-shope": in_eshop(row["model"], skus),
            "Marža %": (
                f'=IF({letter["Naša predajná cena s DPH (EUR)"]}{r}="","",'
                f'({letter["Naša predajná cena s DPH (EUR)"]}{r}/(1+{VAT})-{letter["Nákupná cena bez DPH (EUR)"]}{r})'
                f'/({letter["Naša predajná cena s DPH (EUR)"]}{r}/(1+{VAT})))'
            ),
            "Predchádzajúca cena (CZK)": prev_czk,
            "Zmena ceny %": (
                f'=IF({letter["Predchádzajúca cena (CZK)"]}{r}="","",'
                f'{letter["Cena bez DPH (CZK)"]}{r}/{letter["Predchádzajúca cena (CZK)"]}{r}-1)'
            ),
            "Poznámka z cenníka": row.get("poznamka") or None,
        }
        for h in INPUT_HEADERS:
            values[h] = old.get(h)
        for h, v in values.items():
            cell = ws.cell(r, COL[h], v)
            cell.font = Font(name=FONT, size=10)
            cell.border = Border(bottom=THIN)
        for h in INPUT_HEADERS:
            ws.cell(r, COL[h]).fill = INPUT_FILL
            ws.cell(r, COL[h]).font = Font(name=FONT, size=10, color="0000FF")
        if values["V e-shope"] == "áno":
            ws.cell(r, COL["Model"]).font = Font(name=FONT, size=10, bold=True)

    last = max(r, HEADER_ROW + 1)
    fmt = {
        "Cena bez DPH (CZK)": '#,##0.00 "Kč"',
        "Cena bez DPH (EUR)": '#,##0.00 "€"',
        "Cena s DPH 23 % (EUR)": '#,##0.00 "€"',
        "Nákupná cena bez DPH (EUR)": '#,##0.00 "€"',
        "Naša predajná cena s DPH (EUR)": '#,##0.00 "€"',
        "Cena konkurencie s DPH (EUR)": '#,##0.00 "€"',
        "Predchádzajúca cena (CZK)": '#,##0.00 "Kč"',
        "Marža %": "0.0%",
        "Zmena ceny %": "+0.0%;-0.0%;0.0%",
        "Predané ks": "0",
    }
    for h, f in fmt.items():
        for rr in range(HEADER_ROW + 1, last + 1):
            ws.cell(rr, COL[h]).number_format = f
    rng = f"{letter['Zmena ceny %']}{HEADER_ROW + 1}:{letter['Zmena ceny %']}{last}"
    ws.conditional_formatting.add(rng, CellIsRule(operator="greaterThan", formula=["0"], font=Font(color="C00000")))
    ws.conditional_formatting.add(rng, CellIsRule(operator="lessThan", formula=["0"], font=Font(color="008000")))
    for rr in range(HEADER_ROW + 1, last + 1):
        ws.cell(rr, COL["Popis"]).alignment = Alignment(wrap_text=True, vertical="top")
        ws.cell(rr, COL["Kategória"]).alignment = Alignment(wrap_text=True, vertical="top")
    ws.freeze_panes = ws.cell(HEADER_ROW + 1, COL["Popis"])
    ws.auto_filter.ref = f"A{HEADER_ROW}:{get_column_letter(len(COLUMNS))}{last}"
    return r - HEADER_ROW


def build_overview(wb: Workbook, cfg: dict, today: str):
    ws = wb.active
    ws.title = "Prehľad"
    ws["A1"] = "Cenníky dodávateľov – prehľad"
    ws["A1"].font = Font(name=FONT, bold=True, size=14)
    ws["A2"] = f"Vygenerované {today}. Kurz a DPH sa menia na záložke „Kurz“. Žlté stĺpce na záložkách značiek vypĺňate vy, pri novom cenníku zostanú zachované."
    ws["A2"].font = Font(name=FONT, italic=True, size=9, color="595959")
    headers = ["Záložka", "Dodávateľ", "Súbor cenníka", "Dátum cenníka", "Platnosť", "Typ cien", "Rabat", "Položiek", "V e-shope", "Poznámka"]
    widths = [14, 22, 44, 14, 24, 34, 9, 10, 10, 50]
    for i, (h, w) in enumerate(zip(headers, widths), start=1):
        ws.cell(4, i, h)
        ws.column_dimensions[get_column_letter(i)].width = w
    style_header(ws, 4, len(headers))
    for r, b in enumerate(cfg["brands"], start=5):
        sheet = f"'{b['sheet']}'"
        vals = [
            b["sheet"], b.get("supplier"), b["source"], b["date"], b.get("validity"), b.get("price_basis"),
            f"={sheet}!D3",
            f"=COUNTA({sheet}!B{HEADER_ROW + 1}:B2000)",
            f'=COUNTIF({sheet}!{get_column_letter(COL["V e-shope"])}{HEADER_ROW + 1}:{get_column_letter(COL["V e-shope"])}2000,"áno")&" + "&COUNTIF({sheet}!{get_column_letter(COL["V e-shope"])}{HEADER_ROW + 1}:{get_column_letter(COL["V e-shope"])}2000,"variant")&" variant"',
            b.get("note"),
        ]
        for c, v in enumerate(vals, start=1):
            cell = ws.cell(r, c, v)
            cell.font = Font(name=FONT, size=10)
            cell.alignment = Alignment(wrap_text=True, vertical="top")
            cell.border = Border(bottom=THIN)
        ws.cell(r, 7).number_format = "0.0%"
        ws.cell(r, 1).hyperlink = f"#{sheet}!A1"
        ws.cell(r, 1).font = Font(name=FONT, size=10, color="0563C1", underline="single")
    legend = len(cfg["brands"]) + 7
    notes = [
        "Ako aktualizovať: nový PDF cenník uložte do docs/cenniky/ a povedzte Claudovi „aktualizuj cenník <značka>“.",
        "Stĺpce: Cena bez DPH (EUR) = CZK / kurz, zaokrúhlené na 2 desatinné miesta; Cena s DPH = EUR bez DPH × (1 + DPH SR).",
        "Nákupná cena = cenníková cena bez DPH × (1 − rabat). Rabat dodávateľa je v bunke D3 na každej záložke značky.",
        "Marža % = (naša cena bez DPH − nákupná cena) / naša cena bez DPH.",
        "V e-shope: „áno“ = presne tento model je v katalógu e-shopu (tučne); „variant“ = iná verzia toho istého modelu (iný motor, výbava alebo kód).",
        "Zmena ceny % = oproti predchádzajúcemu cenníku (červená = zdraženie, zelená = zlacnenie).",
    ]
    for i, n in enumerate(notes):
        ws.cell(legend + i, 1, n).font = Font(name=FONT, size=9, color="595959")
    ws.freeze_panes = "A5"


def main():
    cfg = json.loads((DATA / "zdroje.json").read_text(encoding="utf-8"))
    today = date.today().strftime("%d. %m. %Y")
    skus = catalog_skus()
    prev = previous_state()
    wb = Workbook()
    counts = {}
    for b in cfg["brands"]:
        counts[b["sheet"]] = build_brand_sheet(wb, b, skus.get(b["brand_slug"], set()), prev, today)
    build_overview(wb, cfg, today)
    build_rate_sheet(wb, cfg)
    wb.move_sheet("Prehľad", offset=-len(wb.sheetnames) + 1)
    wb.move_sheet("Kurz", offset=-(len(wb.sheetnames) - 2))
    wb.calculation.fullCalcOnLoad = True  # no cached values from openpyxl; Excel computes on open
    OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUT)
    print(OUT, counts)


if __name__ == "__main__":
    main()
