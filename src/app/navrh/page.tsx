import Link from "next/link";

export const metadata = { title: "Návrhy dizajnu" };

const directions = [
  { href: "/navrh/a", name: "A — Technický list", text: "Svetlý, inžiniersky presný. Technické listy, jemná mriežka, jedna signálna farba." },
  { href: "/navrh/b", name: "B — Dielňa po zotmení", text: "Tmavý prémiový. Produkty v svetle reflektora, teplý kovový akcent." },
  { href: "/navrh/c", name: "C — Stavenisko", text: "Výrazný a úžitkový. Veľké kondenzované písmo, betón, reflexná farba." },
];

export default function DesignIndex() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "64px 16px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Royal Shop: návrhy dizajnu</h1>
      <p style={{ color: "#555", marginBottom: 32 }}>
        Tri vizuálne smery tej istej stránky (domov + detail produktu). Vyberte jeden, prípadne kombináciu.
      </p>
      <ul style={{ display: "grid", gap: 16, listStyle: "none", padding: 0 }}>
        {directions.map((d) => (
          <li key={d.href}>
            <Link
              href={d.href}
              style={{ display: "block", padding: 20, border: "1px solid #ddd", borderRadius: 12, color: "inherit", textDecoration: "none" }}
            >
              <strong style={{ fontSize: 18 }}>{d.name}</strong>
              <span style={{ display: "block", color: "#555", marginTop: 4 }}>{d.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
