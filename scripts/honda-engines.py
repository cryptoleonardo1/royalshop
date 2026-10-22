"""Public Honda GX engine price list for the "Motory" category page.

    python scripts/honda-engines.py

Input (git-ignored, the repo is public):
  docs/cenniky/data/honda-motory.csv   kategoria,model,popis,cena_bez_dph_czk,poznamka
  docs/cenniky/data/zdroje.json        exchange rate + validity of the Honda engine price list
Output (committed, shown on the website):
  src/data/honda-engines.json          recommended retail price incl. VAT in EUR cents per engine variant

Only the customer-facing retail price leaves this script: no CZK prices, no purchase prices.
The EUR price is computed exactly like the supplier workbook (scripts/cennik.py): CZK / rate,
rounded to cents, x 1.23, rounded to cents.
"""

import csv
import json
import re
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "docs" / "cenniky" / "data"
OUT = ROOT / "src" / "data" / "honda-engines.json"

CENT = Decimal("0.01")


def round_cents(x: Decimal) -> Decimal:
    return x.quantize(CENT, rounding=ROUND_HALF_UP)


def main() -> None:
    sources = json.loads((DATA / "zdroje.json").read_text(encoding="utf-8"))
    rate = Decimal(str(sources["rate"]))
    vat = Decimal(str(sources["vat"]))

    engines = []
    with open(DATA / "honda-motory.csv", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            # "Model GX160H2, Typ QX, Verze 3, Barva OH"; Verze can be "—" (empty in the printed list).
            m = re.fullmatch(r"Model (\S+), Typ (\S+), Verze (\S+), Barva (\S+)", row["popis"])
            if not m:
                raise SystemExit(f"Unexpected description: {row['popis']}")
            model, typ, version, colour = m.groups()
            net = round_cents(Decimal(row["cena_bez_dph_czk"]) / rate)
            gross = round_cents(net * (1 + vat))
            engines.append({
                "code": row["model"],
                "model": model,
                "type": typ,
                "version": None if version == "—" else version,
                "colour": colour,
                "priceGrossCents": int(gross * 100),
            })

    engines.sort(key=lambda e: e["code"])
    out = {
        "source": "Cenník motorov Honda (BG Technik / Unicon), odporúčané koncové ceny",
        "validFrom": "2026-10-01",
        "validTo": "2026-12-31",
        "vatRate": int(vat * 100),
        "engines": engines,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"{len(engines)} engines -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
