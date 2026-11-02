import { Check } from "lucide-react";
import css from "@/components/shop/shop.module.css";

const PERKS = [
  "Všetky objednávky na jednom mieste",
  "Priebeh objednávky krok za krokom, od overenia až po doručenie",
  "Sledovanie zásielky a predpokladaný dátum doručenia",
  "Predvyplnené údaje pri ďalšom nákupe",
  "Rýchly kontakt cez WhatsApp k vašej objednávke",
];

export function AccountPerks() {
  return (
    <aside className={css.gpsr} aria-label="Čo získate s účtom">
      <p className={css.gpsrHead}>S účtom máte</p>
      <ul className={css.perks}>
        {PERKS.map((p) => (
          <li key={p}>
            <Check size={18} strokeWidth={3} aria-hidden="true" /> {p}
          </li>
        ))}
      </ul>
    </aside>
  );
}
