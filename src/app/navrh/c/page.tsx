import type { CSSProperties } from "react";
import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Big_Shoulders, Big_Shoulders_Stencil, Barlow, Martian_Mono } from "next/font/google";
import {
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  Check,
  Clock,
  Factory,
  FileText,
  Phone,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  Undo2,
  User,
  Zap,
} from "lucide-react";
import { products, categories, usps, eur, net, type MockProduct } from "../_data";
import { Placeholder } from "./placeholder";
import { Gallery } from "./gallery";
import { BuyBox } from "./buy-box";
import css from "./stavenisko.module.css";

export const metadata: Metadata = {
  title: "Návrh C — Stavenisko",
  description: "Dizajnový návrh C pre Royal Shop: utilitárny, kontrastný, stavenisko.",
  robots: { index: false, follow: false },
};

const display = Big_Shoulders({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-c-display",
  display: "swap",
});
const stencil = Big_Shoulders_Stencil({
  subsets: ["latin", "latin-ext"],
  variable: "--font-c-stencil",
  display: "swap",
});
const body = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-c-body",
  display: "swap",
});
const mono = Martian_Mono({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-c-mono",
  display: "swap",
});

/* ---------- product photos from /public/demo-products (matched by sku or slug) ---------- */

const IMG_DIR = path.join(process.cwd(), "public", "demo-products");
const IMG_EXT = /\.(png|jpe?g|webp|avif|svg)$/i;
const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");

function productImages(): Map<string, string[]> {
  let files: string[] = [];
  try {
    files = fs.readdirSync(IMG_DIR).filter((f) => IMG_EXT.test(f)).sort();
  } catch {
    files = [];
  }
  const map = new Map<string, string[]>();
  for (const p of products) {
    const keys = [norm(p.sku), norm(p.slug)];
    const hits = files
      .filter((f) => {
        const stem = norm(f.replace(IMG_EXT, ""));
        return keys.some((k) => stem === k || stem.includes(k));
      })
      // base shot ("makita-x.webp") before variants ("makita-x-2.webp")
      .sort((a, b) => a.length - b.length || a.localeCompare(b));
    map.set(
      p.slug,
      hits.map((f) => `/demo-products/${f}`),
    );
  }
  return map;
}

/* ---------- small helpers ---------- */

const delay = (n: number) => ({ "--d": n }) as CSSProperties;
const pct = (p: MockProduct) => (p.compareAt ? Math.round((1 - p.priceGross / p.compareAt) * 100) : 0);

const catNav = [
  "AKU náradie",
  "Kladivá a búracie stroje",
  "Brúsky a píly",
  "Stavebné stroje",
  "Záhradná technika",
  "Batérie a nabíjačky",
  "Príslušenstvo",
];

const inspection = [
  "Vybalené a vizuálne skontrolované",
  "Skúšobný chod naprázdno · 60 s",
  "Príklep a sekanie overené",
  "Batérie nabité, nabíjačka OK",
  "Zabalené späť s protokolom",
];

function ProductMedia({ p, src }: { p: MockProduct; src?: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`${p.brand} ${p.name}`}
        fill
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
        className={css.productImg}
        unoptimized={src.toLowerCase().endsWith(".svg")}
      />
    );
  }
  return <Placeholder sku={p.sku} name={`${p.brand} ${p.name}`} category={p.category} />;
}

function ProductCard({ p, src, i }: { p: MockProduct; src?: string; i: number }) {
  const off = pct(p);
  return (
    <article className={`${css.card} ${css.rise}`} style={delay(6 + i)} aria-labelledby={`c-p-${p.slug}`}>
      <div className={css.cardMedia}>
        <ProductMedia p={p} src={src} />
        <div className={css.cardBadges}>
          {p.tag && (
            <span className={p.tag === "Akcia" ? css.saleBadge : css.tapeHi}>
              {p.tag === "Akcia" ? <span>Akcia −{off} %</span> : p.tag}
            </span>
          )}
        </div>
        <span className={css.qcMark} title="Otestované pred odoslaním">
          <Check size={14} strokeWidth={3} aria-hidden="true" /> QC
        </span>
      </div>

      <div className={css.cardBody}>
        <div className={css.cardMeta}>
          <span className={css.brand}>{p.brand}</span>
          {p.platform && (
            <span className={p.platform === "18V LXT" ? css.chipLxt : css.chipXgt}>
              <BatteryCharging size={13} aria-hidden="true" />
              {p.platform}
            </span>
          )}
          {p.kit && <span className={css.chipKit}>Set s batériami</span>}
        </div>

        <h3 id={`c-p-${p.slug}`} className={css.cardTitle}>
          <a href="#detail" className={css.cardLink}>
            {p.name}
          </a>
        </h3>
        <span className={css.tape}>
          <span className={css.srOnly}>Kód: </span>
          {p.sku}
        </span>

        <dl className={css.specs}>
          {p.specs.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>

        <p className={css.lead}>
          <Truck size={16} aria-hidden="true" />
          Doručenie {p.leadDays}
        </p>

        <div className={css.cardPrice}>
          {p.compareAt && (
            <p className={css.was}>
              <span className={css.srOnly}>Pôvodná cena: </span>
              <s>{eur(p.compareAt)}</s>
            </p>
          )}
          <p className={css.priceBig}>
            {eur(p.priceGross)} <span className={css.vat}>s DPH</span>
          </p>
          <p className={css.priceNet}>{eur(net(p.priceGross))} bez DPH</p>
          {p.compareAt && (
            <p className={css.omnibus}>Najnižšia cena za 30 dní pred zľavou: {eur(p.compareAt)}</p>
          )}
        </div>

        <button type="button" className={css.addBtn}>
          <ShoppingCart size={20} aria-hidden="true" />
          Do košíka
          <span className={css.srOnly}>: {p.name}</span>
        </button>
      </div>
    </article>
  );
}

export default function NavrhCPage() {
  const images = productImages();
  const featured = products.slice(0, 6);
  const pd = products[0];
  const pdImages = images.get(pd.slug) ?? [];

  const lxtCount = products.filter((p) => p.platform === "18V LXT").length;
  const xgtCount = products.filter((p) => p.platform === "40V XGT").length;

  const specRows: { label: string; value: string }[] = [
    { label: "Značka", value: pd.brand },
    { label: "Kód výrobcu", value: pd.sku },
    { label: "Kategória", value: pd.category },
    { label: "Napájanie", value: pd.platform ?? "Sieťové 230 V" },
    ...pd.specs,
    { label: "Dodacia lehota", value: pd.leadDays },
  ];

  return (
    <div
      id="top"
      className={`${display.variable} ${stencil.variable} ${body.variable} ${mono.variable} ${css.root}`}
    >
      <a href="#obsah" className={css.skip}>
        Preskočiť na obsah
      </a>

      {/* ============ TOP BAR ============ */}
      <div className={`${css.topbar} ${css.dark}`}>
        <div className={css.wrap}>
          <ul className={css.topList}>
            <li>
              <Truck size={14} aria-hidden="true" /> Doprava zdarma od {eur(2000)}
            </li>
            <li>
              <Store size={14} aria-hidden="true" /> Osobný odber Senec
            </li>
            <li>
              <Phone size={14} aria-hidden="true" /> <a href="tel:+421900000000">+421 900 000 000</a>
            </li>
          </ul>
          <span className={css.topHours}>
            <Clock size={14} aria-hidden="true" /> Po–Pi 7:00–16:00
          </span>
        </div>
      </div>

      {/* ============ HEADER ============ */}
      <header className={`${css.header} ${css.rise}`} style={delay(0)}>
        <div className={`${css.wrap} ${css.headerGrid}`}>
          <a href="#top" className={css.logo} aria-label="Royal Shop – úvod">
            <span className={css.logoRoyal}>Royal</span>
            <span className={css.logoShop}>Shop</span>
          </a>

          <form role="search" className={css.search}>
            <label htmlFor="c-search" className={css.srOnly}>
              Hľadať v obchode
            </label>
            <input
              id="c-search"
              type="search"
              name="q"
              placeholder="Hľadať model, kód alebo EAN"
              autoComplete="off"
            />
            <button type="submit" aria-label="Hľadať">
              <Search size={20} aria-hidden="true" />
            </button>
          </form>

          <nav aria-label="Používateľ" className={css.userNav}>
            <a href="#ucet">
              <User size={20} aria-hidden="true" />
              <span>Účet</span>
            </a>
            <a href="#kosik" className={css.cartLink}>
              <ShoppingCart size={20} aria-hidden="true" />
              <span>Košík</span>
              <span className={css.cartCount}>
                2<span className={css.srOnly}> položky</span>
              </span>
            </a>
          </nav>
        </div>

        <nav aria-label="Kategórie" className={css.catNav}>
          <ul className={css.wrap}>
            {catNav.map((c) => (
              <li key={c}>
                <a href="#kategorie">{c}</a>
              </li>
            ))}
            <li>
              <a href="#produkty" className={css.catNavHot}>
                Akcie
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main id="obsah">
        {/* ============ HERO ============ */}
        <section className={css.hero} aria-labelledby="c-hero-title">
          <div className={`${css.wrap} ${css.heroGrid}`}>
            <div className={css.heroCopy}>
              <p className={`${css.tape} ${css.rise}`} style={delay(1)}>
                Makita · NTC · autorizovaný predajca
              </p>
              <h1 id="c-hero-title" className={css.heroTitle}>
                <span className={css.rise} style={delay(2)}>
                  Profesionálne náradie,
                </span>
                <span className={`${css.heroHi} ${css.rise}`} style={delay(3)}>
                  overené
                </span>
                <span className={css.rise} style={delay(4)}>
                  pred odoslaním.
                </span>
              </h1>
              <p className={`${css.heroLede} ${css.rise}`} style={delay(5)}>
                Každý stroj vybalíme, zapneme a skontrolujeme ešte v Senci. Na stavbu vám príde náradie, ktoré
                už raz bežalo — s podpísaným protokolom v krabici.
              </p>
              <div className={`${css.heroCtas} ${css.rise}`} style={delay(6)}>
                <a href="#produkty" className={css.btnPrimary}>
                  Nakupovať náradie <ArrowRight size={20} aria-hidden="true" />
                </a>
                <a href="#detail" className={css.btnGhost}>
                  Ako testujeme
                </a>
              </div>
              <ul className={`${css.heroFacts} ${css.rise}`} style={delay(7)}>
                <li>
                  <strong>3–4 dni</strong> doručenie na Slovensku
                </li>
                <li>
                  <strong>{eur(2000)}</strong> doprava zdarma
                </li>
                <li>
                  <strong>Senec</strong> osobný odber
                </li>
              </ul>
            </div>

            <aside className={`${css.ticket} ${css.dark} ${css.rise}`} style={delay(4)} aria-label="Ukážka kontrolného protokolu">
              <span className={css.ticketHole} aria-hidden="true" />
              <p className={css.ticketHead}>
                <span>Kontrolný protokol</span>
                <span className={css.ticketNo}>№ 04 812</span>
              </p>
              <p className={css.ticketModel}>
                {pd.brand} {pd.sku}
              </p>
              <ol className={css.ticketList}>
                {inspection.map((step, i) => (
                  <li key={step} className={css.rise} style={delay(6 + i)}>
                    <span className={css.ticketBox}>
                      <Check size={16} strokeWidth={3} aria-hidden="true" />
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className={css.ticketFoot}>
                <span>Technik: M. K.</span>
                <span>Senec · 09/10</span>
              </p>
              <span className={css.stamp} aria-hidden="true">
                <span>OK</span>
                <small>Otestované</small>
              </span>
            </aside>
          </div>

          <div className={css.cautionTape} aria-hidden="true">
            <div className={css.cautionTrack}>
              {Array.from({ length: 2 }).map((_, k) => (
                <span key={k}>
                  Otestované pred odoslaním ✕ Autorizovaný predajca Makita ✕ Osobný odber Senec ✕ Ťažké stroje
                  vlastnou dopravou ✕{" "}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PLATFORM PICKER ============ */}
        <section className={css.section} aria-labelledby="c-platform-title" id="platforma">
          <div className={css.wrap}>
            <div className={css.sectionHead}>
              <span className={css.tape}>01 / Batérie</span>
              <h2 id="c-platform-title" className={css.h2}>
                Máte batérie? <span>Vyberte platformu</span>
              </h2>
            </div>

            <div className={css.platforms}>
              <a href="#produkty" className={`${css.platform} ${css.platformLxt} ${css.dark}`}>
                <span className={css.platformVolt}>
                  18<small>V</small>
                </span>
                <span className={css.platformName}>LXT</span>
                <span className={css.platformText}>
                  Najširší systém Makita. Stovky strojov — vŕtačky, brúsky, kladivá aj záhrada — na jednu batériu.
                </span>
                <span className={css.platformFoot}>
                  <span>{lxtCount} vo výbere</span>
                  <span className={css.platformGo}>
                    Náradie 18V LXT <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </span>
              </a>
              <a href="#produkty" className={`${css.platform} ${css.platformXgt}`}>
                <span className={css.platformVolt}>
                  40<small>V</small>
                </span>
                <span className={css.platformName}>XGT</span>
                <span className={css.platformText}>
                  Pre najťažšiu prácu: výkon sieťových strojov bez kábla. Uťahováky, píly a búracie kladivá.
                </span>
                <span className={css.platformFoot}>
                  <span>{xgtCount} vo výbere</span>
                  <span className={css.platformGo}>
                    Náradie 40V XGT <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </span>
              </a>
            </div>
            <p className={css.platformNote}>
              <Zap size={16} aria-hidden="true" />
              Batérie nemáte? Hľadajte označenie <strong>Set s batériami</strong> — v balení je nabíjačka aj
              akumulátory.
            </p>
          </div>
        </section>

        {/* ============ CATEGORIES ============ */}
        <section className={css.section} aria-labelledby="c-cat-title" id="kategorie">
          <div className={css.wrap}>
            <div className={css.sectionHead}>
              <span className={css.tape}>02 / Sortiment</span>
              <h2 id="c-cat-title" className={css.h2}>
                Kategórie
              </h2>
              <a href="#kategorie" className={css.headLink}>
                Celý sortiment <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <ul className={css.cats}>
              {categories.map((c, i) => (
                <li key={c.name} className={css.cat}>
                  <a href="#produkty">
                    <span className={css.catIdx}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={css.catName}>{c.name}</span>
                    <span className={css.catCount}>
                      {c.count} produktov <ArrowUpRight size={18} aria-hidden="true" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ FEATURED PRODUCTS ============ */}
        <section className={css.section} aria-labelledby="c-prod-title" id="produkty">
          <div className={css.wrap}>
            <div className={css.sectionHead}>
              <span className={css.tape}>03 / Výber</span>
              <h2 id="c-prod-title" className={css.h2}>
                Odporúčané stroje
              </h2>
              <a href="#produkty" className={css.headLink}>
                Všetky novinky <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <div className={css.grid}>
              {featured.map((p, i) => (
                <ProductCard key={p.slug} p={p} src={images.get(p.slug)?.[0]} i={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ USP ============ */}
        <section className={`${css.usps} ${css.dark}`} aria-label="Prečo Royal Shop">
          <ul className={`${css.wrap} ${css.uspGrid}`}>
            {usps.map((u, i) => (
              <li key={u.title} className={css.usp}>
                <span className={css.uspNum}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={css.uspTitle}>{u.title}</h3>
                <p>{u.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ============ PRODUCT DETAIL CONCEPT ============ */}
        <section className={css.pdp} aria-labelledby="c-pdp-title" id="detail">
          <div className={css.wrap}>
            <div className={css.pdpTop}>
              <span className={css.tapeHi}>Koncept · detail produktu</span>
              <nav aria-label="Omrvinky">
                <ol className={css.crumbs}>
                  <li>
                    <a href="#top">Domov</a>
                  </li>
                  <li>
                    <a href="#kategorie">Kladivá a búracie stroje</a>
                  </li>
                  <li>
                    <a href="#kategorie">{pd.category}</a>
                  </li>
                  <li aria-current="page">{pd.sku}</li>
                </ol>
              </nav>
            </div>

            <div className={css.pdpGrid}>
              <Gallery images={pdImages} name={`${pd.brand} ${pd.name}`} sku={pd.sku} category={pd.category} />

              <div className={css.buyCol}>
                <div className={css.pdpMeta}>
                  <span className={css.brand}>{pd.brand}</span>
                  {pd.tag && <span className={css.tapeHi}>{pd.tag}</span>}
                  <span className={css.stock}>
                    <span className={css.stockDot} aria-hidden="true" /> Skladom v Senci
                  </span>
                </div>
                <h2 id="c-pdp-title" className={css.pdpTitle}>
                  {pd.name}
                </h2>
                <dl className={css.ids}>
                  <div>
                    <dt>Kód</dt>
                    <dd>{pd.sku}</dd>
                  </div>
                  <div>
                    <dt>EAN</dt>
                    <dd>0088381 000000</dd>
                  </div>
                </dl>

                <ul className={css.keySpecs}>
                  {pd.specs.map((s) => (
                    <li key={s.label}>
                      <span>{s.label}</span>
                      <strong>{s.value}</strong>
                    </li>
                  ))}
                </ul>

                <div className={css.priceBox}>
                  <p className={css.pdpPrice}>
                    {eur(pd.priceGross)} <span className={css.vat}>s DPH</span>
                  </p>
                  <p className={css.pdpNet}>
                    {eur(net(pd.priceGross))} <span>bez DPH · cena za 1 ks</span>
                  </p>
                </div>

                <ul className={css.delivery}>
                  <li>
                    <Truck size={20} aria-hidden="true" />
                    <span>
                      <strong>Doručíme do štvrtka 15. 10.</strong> pri objednávke dnes do 14:00
                    </span>
                  </li>
                  <li>
                    <Store size={20} aria-hidden="true" />
                    <span>
                      <strong>Osobný odber Senec</strong> — pripravené v pondelok 12. 10. od 8:00, zdarma
                    </span>
                  </li>
                </ul>

                <BuyBox unitPrice={pd.priceGross} name={`${pd.brand} ${pd.sku}`} />

                <div className={`${css.testNote} ${css.dark}`}>
                  <span className={css.testStamp} aria-hidden="true">
                    <Check size={26} strokeWidth={3} />
                  </span>
                  <div>
                    <p className={css.testTitle}>Otestujeme pred odoslaním</p>
                    <p>
                      Kladivo pred zabalením spustíme, overíme príklep aj sekanie a do balenia priložíme podpísaný
                      kontrolný protokol.
                    </p>
                  </div>
                </div>

                <p className={css.warranty}>
                  <ShieldCheck size={22} aria-hidden="true" />
                  <span>
                    <strong>Záruka 24 mesiacov</strong> · servis v autorizovanom stredisku Makita · vrátenie do 14
                    dní
                  </span>
                </p>

                {pd.rentalPerDay && (
                  <a href="#royal-stroje" className={css.rental}>
                    <span className={css.rentalEyebrow}>Royal Stroje · požičovňa</span>
                    <span className={css.rentalTitle}>Najprv vyskúšať?</span>
                    <span className={css.rentalText}>
                      Požičajte si ho v Royal Stroje od <strong>{eur(pd.rentalPerDay)}/deň</strong>.
                    </span>
                    <span className={css.rentalGo}>
                      Rezervovať prenájom <ArrowUpRight size={18} aria-hidden="true" />
                    </span>
                  </a>
                )}
              </div>
            </div>

            <div className={css.pdpLower}>
              <table className={css.specTable}>
                <caption>Technické parametre</caption>
                <tbody>
                  {specRows.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      <td>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <aside className={css.gpsr} aria-labelledby="c-gpsr-title">
                <p id="c-gpsr-title" className={css.gpsrHead}>
                  <Factory size={18} aria-hidden="true" /> Bezpečnosť výrobku · GPSR
                </p>
                <dl className={css.gpsrList}>
                  <div>
                    <dt>Výrobca</dt>
                    <dd>
                      Makita Corporation
                      <br />
                      3-11-8 Sumiyoshi-cho, Anjo, Aichi 446-8502, Japonsko
                    </dd>
                  </div>
                  <div>
                    <dt>Zodpovedná osoba v EÚ</dt>
                    <dd>
                      Makita s.r.o.
                      <br />
                      Banská Bystrica, Slovenská republika
                    </dd>
                  </div>
                </dl>
                <a href="#navod" className={css.gpsrLink}>
                  <FileText size={18} aria-hidden="true" /> Návod a bezpečnostné pokyny (PDF)
                </a>
              </aside>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className={`${css.footer} ${css.dark}`}>
        <div className={css.wrap}>
          <p className={css.footMark} aria-hidden="true">
            Royal <span>Shop</span>
          </p>

          <div className={css.footGrid}>
            <div className={css.footCol}>
              <p className={css.footHead}>Prevádzkovateľ</p>
              <address>
                [Obchodné meno s.r.o.]
                <br />
                [Ulica a číslo], 903 01 Senec
                <br />
                IČO: [doplniť] · DIČ: [doplniť]
                <br />
                IČ DPH: [doplniť]
                <br />
                Zapísaná v OR [súd, oddiel, vložka]
              </address>
            </div>

            <nav className={css.footCol} aria-label="Informácie pre zákazníkov">
              <p className={css.footHead}>Nákup</p>
              <ul className={css.footLinks}>
                <li>
                  <a href="#vop">Obchodné podmienky</a>
                </li>
                <li>
                  <a href="#reklamacie">Reklamačný poriadok</a>
                </li>
                <li>
                  <a href="#gdpr">Ochrana osobných údajov</a>
                </li>
                <li>
                  <a href="#doprava">Doprava a platba</a>
                </li>
                <li>
                  <a href="#kontakt">Kontakt</a>
                </li>
              </ul>
            </nav>

            <div className={css.footCol}>
              <a href="#odstupenie" className={css.withdraw}>
                <span className={css.withdrawInner}>
                  <Undo2 size={22} aria-hidden="true" />
                  <span>
                    Odstúpiť od zmluvy tu
                    <small>Do 14 dní od prevzatia, online formulár</small>
                  </span>
                  <ArrowRight size={22} aria-hidden="true" />
                </span>
              </a>
            </div>
          </div>

          <p className={css.footBottom}>
            <span>© 2026 Royal Shop</span>
            <span>Ceny vrátane 23 % DPH</span>
          </p>
        </div>
      </footer>

      <p className={css.draftLabel}>Návrh C — Stavenisko</p>
    </div>
  );
}
