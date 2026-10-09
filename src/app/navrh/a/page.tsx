import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ClipboardCheck,
  Factory,
  Phone,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  UserRound,
} from "lucide-react";
import { categories, eur, net, products, usps, type MockProduct } from "../_data";
import { Balloon, BatteryDrawing, DimH, kindFor, ToolDrawing } from "./Drawing";
import { Gallery } from "./Gallery";
import { BuyBox } from "./BuyBox";
import s from "./a.module.css";

const display = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--a-display",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--a-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Návrh A — Technický list · Royal Shop",
  description: "Dizajnový koncept e-shopu Royal Shop: profesionálne náradie Makita a NTC.",
  robots: { index: false, follow: false },
};

/* ---------- product images from /public/demo-products (optional) ---------- */

const IMG_EXT = /\.(jpe?g|png|webp|avif)$/i;
const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");

function productImages(): Record<string, string[]> {
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(path.join(process.cwd(), "public", "demo-products"))
      .filter((f) => IMG_EXT.test(f))
      .sort();
  } catch {
    return {};
  }
  const map: Record<string, string[]> = {};
  for (const p of products) {
    const sku = norm(p.sku);
    const slug = norm(p.slug);
    map[p.slug] = files
      .filter((f) => {
        const base = norm(f.replace(IMG_EXT, ""));
        return base.includes(sku) || base === slug;
      })
      .map((f) => `/demo-products/${encodeURIComponent(f)}`);
  }
  return map;
}

/* ---------- small pieces ---------- */

const nav = [
  "AKU náradie",
  "Kladivá",
  "Brúsky",
  "Píly",
  "Stavebné stroje",
  "Záhrada",
  "Batérie a nabíjačky",
  "Príslušenstvo",
  "Akcie",
];

function SectionHead({ no, title, kicker, id }: { no: string; title: string; kicker?: string; id: string }) {
  return (
    <header className={s.sectionHead}>
      <span className={s.sectionNo} aria-hidden="true">
        {no}
      </span>
      <h2 id={id} className={s.sectionTitle}>
        {title}
      </h2>
      {kicker && <p className={s.sectionKicker}>{kicker}</p>}
    </header>
  );
}

function Price({ p, size = "md" }: { p: MockProduct; size?: "md" | "lg" }) {
  const off = p.compareAt ? Math.round((1 - p.priceGross / p.compareAt) * 100) : 0;
  return (
    <div className={`${s.price} ${size === "lg" ? s.priceLg : ""}`}>
      {p.compareAt && (
        <p className={s.priceWas}>
          <del>
            <span className={s.srOnly}>Pôvodná cena </span>
            {eur(p.compareAt)}
          </del>
          <span className={s.priceOff}>−{off} %</span>
        </p>
      )}
      <p className={s.priceNow}>
        {eur(p.priceGross)}
        <span className={s.priceVat}>s DPH</span>
      </p>
      <p className={s.priceNet}>{eur(net(p.priceGross))} bez DPH</p>
      {p.compareAt && <p className={s.priceNote}>Najnižšia cena za 30 dní: {eur(p.compareAt)}</p>}
    </div>
  );
}

function Visual({ p, src }: { p: MockProduct; src?: string }) {
  return (
    <div className={s.visual}>
      {src ? (
        <Image src={src} alt={p.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" className={s.photo} />
      ) : (
        <>
          <ToolDrawing kind={kindFor(p.category)} />
          <span className={s.visualMono} aria-hidden="true">
            {p.sku}
          </span>
          <span className={s.visualNote} aria-hidden="true">
            nákres · foto čoskoro
          </span>
        </>
      )}
    </div>
  );
}

const tagClass: Record<string, string> = {
  Akcia: s.tagSale,
  Novinka: s.tagNew,
  Bestseller: s.tagBest,
};

/* ---------- page ---------- */

export default function Page() {
  const imgs = productImages();
  const featured = products.slice(0, 6);
  const d = products[0];
  const dImgs = imgs[d.slug] ?? [];
  const usIcons = [ClipboardCheck, Truck, Store, BadgeCheck];

  return (
    <div lang="sk" className={`${display.variable} ${mono.variable} ${s.root}`}>
      <a href="#obsah" className={s.skip}>
        Preskočiť na obsah
      </a>

      {/* ============ HEADER ============ */}
      <div className={s.topbar}>
        <div className={s.wrap}>
          <ul className={s.topbarList}>
            <li>Doprava zdarma od {eur(2000).replace(",00", "")}</li>
            <li>Osobný odber Senec</li>
            <li>
              <a href="tel:+421900000000" className={s.topbarLink}>
                <Phone size={13} aria-hidden="true" /> +421 900 000 000
              </a>
            </li>
          </ul>
          <span className={s.topbarAside}>Po–Pi 7:00–16:00</span>
        </div>
      </div>

      <header className={s.header}>
        <div className={`${s.wrap} ${s.headerRow}`}>
          <a href="#" className={s.logo} aria-label="Royal Shop – domov">
            <span className={s.logoMark} aria-hidden="true" />
            ROYAL<span className={s.logoThin}>SHOP</span>
          </a>
          <form className={s.search} role="search" action="#">
            <label htmlFor="q-a" className={s.srOnly}>
              Hľadať
            </label>
            <Search size={18} aria-hidden="true" className={s.searchIcon} />
            <input id="q-a" name="q" type="search" placeholder="Hľadať model, kód alebo EAN" className={s.searchInput} autoComplete="off" />
            <button type="submit" className={s.searchBtn}>
              Hľadať
            </button>
          </form>
          <nav className={s.account} aria-label="Používateľ">
            <a href="#" className={s.accountLink}>
              <UserRound size={20} aria-hidden="true" />
              <span>Účet</span>
            </a>
            <a href="#" className={s.accountLink}>
              <ShoppingCart size={20} aria-hidden="true" />
              <span>Košík</span>
              <span className={s.cartCount}>
                2<span className={s.srOnly}> položky</span>
              </span>
            </a>
          </nav>
        </div>
        <nav className={s.catNav} aria-label="Kategórie">
          <ul className={`${s.wrap} ${s.catNavList}`}>
            {nav.map((n, i) => (
              <li key={n}>
                <a href="#kategorie" className={s.catNavLink}>
                  <span className={s.catNavNo} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {n}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="obsah">
        {/* ============ HERO ============ */}
        <section className={s.hero} aria-labelledby="hero-title">
          <div className={`${s.wrap} ${s.heroGrid}`}>
            <div className={s.heroCopy}>
              <p className={`${s.eyebrow} ${s.reveal}`} style={{ "--i": 0 } as React.CSSProperties}>
                Autorizovaný predajca Makita &amp; NTC · Senec
              </p>
              <h1 id="hero-title" className={`${s.heroTitle} ${s.reveal}`} style={{ "--i": 1 } as React.CSSProperties}>
                Profesionálne náradie.
                <br />
                <span className={s.heroMark}>Overené</span> pred odoslaním.
              </h1>
              <p className={`${s.heroLead} ${s.reveal}`} style={{ "--i": 2 } as React.CSSProperties}>
                Každý stroj vybalíme, zapneme a skontrolujeme chod. Do balíka priložíme podpísaný testovací protokol —
                na stavbu príde náradie, ktoré už raz pracovalo.
              </p>
              <div className={`${s.heroCtas} ${s.reveal}`} style={{ "--i": 3 } as React.CSSProperties}>
                <a href="#produkty" className={`${s.btnPrimary} ${s.btnBig}`}>
                  Prejsť do katalógu <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a href="#platforma" className={s.btnGhost}>
                  Vybrať podľa batérie
                </a>
              </div>
              <dl className={`${s.heroStats} ${s.reveal}`} style={{ "--i": 4 } as React.CSSProperties}>
                <div>
                  <dt>Modelov v ponuke</dt>
                  <dd>1 000+</dd>
                </div>
                <div>
                  <dt>Testovací protokol</dt>
                  <dd>ku každému</dd>
                </div>
                <div>
                  <dt>Osobný odber</dt>
                  <dd>Senec</dd>
                </div>
              </dl>
            </div>

            <figure className={`${s.plate} ${s.reveal}`} style={{ "--i": 2 } as React.CSSProperties}>
              <div className={s.plateHead} aria-hidden="true">
                <span>Obr. 01</span>
                <span>Pohľad zboku</span>
                <span>M 1:5</span>
              </div>
              <div className={s.plateArt}>
                {dImgs[0] ? (
                  <Image src={dImgs[0]} alt={d.name} fill priority sizes="(max-width: 900px) 100vw, 50vw" className={s.photo} />
                ) : (
                  <ToolDrawing kind="hammer" animate viewBox="-12 -4 264 176">
                    <DimH x1={4} x2={216} y={160} from={142} label={d.sku} />
                    <Balloon n={1} cx={140} cy={18} tx={142} ty={66} />
                    <Balloon n={2} cx={30} cy={36} tx={52} ty={58} />
                    <Balloon n={3} cx={20} cy={98} tx={26} ty={67} />
                    <Balloon n={4} cx={232} cy={42} tx={214} ty={74} />
                  </ToolDrawing>
                )}
              </div>
              <figcaption className={s.plateLegend}>
                <ol>
                  {d.specs.map((sp) => (
                    <li key={sp.label}>
                      <span className={s.legendLabel}>{sp.label}</span>
                      <span className={s.legendValue}>{sp.value}</span>
                    </li>
                  ))}
                </ol>
                <div className={s.titleBlock}>
                  <span className={s.tbKey}>Model</span>
                  <span className={s.tbVal}>{d.brand} {d.sku}</span>
                  <span className={s.tbKey}>Od</span>
                  <span className={s.tbVal}>{eur(d.priceGross)}</span>
                  <a href="#detail" className={s.tbLink}>
                    Detail <ArrowRight size={14} aria-hidden="true" />
                  </a>
                </div>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ============ PLATFORM ============ */}
        <section className={s.section} aria-labelledby="platforma" id="platforma-sec">
          <div className={s.wrap}>
            <SectionHead no="01" id="platforma" title="Máte batérie? Vyberte platformu." kicker="Akumulátory Makita sú v rámci platformy vzájomne kompatibilné. Ukážeme vám len stroje, ktoré pobežia na vaše batérie." />
            <div className={s.platforms}>
              {[
                {
                  v: "18V",
                  sys: "LXT",
                  title: "Najširší systém na trhu",
                  text: "Vŕtačky, skrutkovače, brúsky, píly aj záhradná technika. Dva 18V články spojíte do 36 V.",
                  count: 286,
                  tall: false,
                },
                {
                  v: "40V",
                  sys: "XGT",
                  title: "Výkon pre ťažké nasadenie",
                  text: "Kladivá, rázové uťahováky a reťazové píly s výkonom sieťových strojov — bez kábla.",
                  count: 142,
                  tall: true,
                },
              ].map((pf) => (
                <a key={pf.sys} href="#produkty" className={s.platform}>
                  <span className={s.platformTop}>
                    <span className={s.platformV}>
                      {pf.v}
                      <span className={s.platformSys}>{pf.sys}</span>
                    </span>
                    <BatteryDrawing tall={pf.tall} />
                  </span>
                  <span className={s.platformTitle}>{pf.title}</span>
                  <span className={s.platformText}>{pf.text}</span>
                  <span className={s.platformFoot}>
                    <span>{pf.count} strojov skladom</span>
                    <span className={s.platformGo}>
                      Zobraziť {pf.v} {pf.sys} <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CATEGORIES ============ */}
        <section className={s.section} aria-labelledby="kategorie">
          <div className={s.wrap}>
            <SectionHead no="02" id="kategorie" title="Kategórie" />
            <ul className={s.cats}>
              {categories.map((c, i) => (
                <li key={c.name}>
                  <a href="#" className={s.cat}>
                    <span className={s.catNo}>K–{String(i + 1).padStart(2, "0")}</span>
                    <span className={s.catName}>{c.name}</span>
                    <span className={s.catCount}>
                      {c.count.toLocaleString("sk-SK")} <span>položiek</span>
                    </span>
                    <ArrowUpRight size={20} aria-hidden="true" className={s.catArrow} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ PRODUCTS ============ */}
        <section className={s.section} aria-labelledby="produkty">
          <div className={s.wrap}>
            <SectionHead no="03" id="produkty" title="Odporúčané stroje" kicker="Ceny vrátane 23 % DPH. Pre firmy zobrazujeme aj cenu bez DPH." />
            <ul className={s.products}>
              {featured.map((p) => (
                <li key={p.slug} className={s.product}>
                  <article className={s.productInner} aria-labelledby={`p-${p.slug}`}>
                    <div className={s.productMedia}>
                      <Visual p={p} src={imgs[p.slug]?.[0]} />
                      {p.tag && <span className={`${s.tag} ${tagClass[p.tag] ?? ""}`}>{p.tag}</span>}
                      {p.platform && <span className={s.platformChip}>{p.platform}{p.kit ? " · set" : ""}</span>}
                    </div>
                    <div className={s.productBody}>
                      <p className={s.productBrand}>
                        {p.brand}
                        <span className={s.productSku}>Kód {p.sku}</span>
                      </p>
                      <h3 id={`p-${p.slug}`} className={s.productName}>
                        <a href={p === d ? "#detail" : "#"}>{p.name}</a>
                      </h3>
                      <dl className={s.productSpecs}>
                        {p.specs.map((sp) => (
                          <div key={sp.label}>
                            <dt>{sp.label}</dt>
                            <dd>{sp.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    <div className={s.productFoot}>
                      <Price p={p} />
                      <p className={s.lead}>
                        <Truck size={15} aria-hidden="true" /> Doručenie {p.leadDays}
                      </p>
                      <button type="button" className={s.btnPrimary}>
                        <ShoppingCart size={17} aria-hidden="true" /> Do košíka
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ USP ============ */}
        <section className={s.usps} aria-label="Prečo nakúpiť u nás">
          <ul className={`${s.wrap} ${s.uspList}`}>
            {usps.map((u, i) => {
              const Icon = usIcons[i] ?? BadgeCheck;
              return (
                <li key={u.title} className={s.usp}>
                  <span className={s.uspNo} aria-hidden="true">
                    §{i + 1}
                  </span>
                  <Icon size={22} aria-hidden="true" className={s.uspIcon} />
                  <h3 className={s.uspTitle}>{u.title}</h3>
                  <p className={s.uspText}>{u.text}</p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ============ PRODUCT DETAIL CONCEPT ============ */}
        <section className={`${s.section} ${s.detailSection}`} aria-labelledby="detail">
          <div className={s.wrap}>
            <div className={s.conceptRule} aria-hidden="true">
              <span>Koncept</span>
              <span>Detail produktu</span>
            </div>
            <nav aria-label="Omrvinky" className={s.crumbs}>
              <ol>
                <li>
                  <a href="#">Domov</a>
                </li>
                <li>
                  <a href="#">Kladivá a búracie stroje</a>
                </li>
                <li aria-current="page">{d.sku}</li>
              </ol>
            </nav>

            <div className={s.detailGrid}>
              <Gallery images={dImgs} kind={kindFor(d.category)} sku={d.sku} name={d.name} />

              <div className={s.detailInfo}>
                <p className={s.productBrand}>
                  {d.brand}
                  <span className={s.productSku}>Kód {d.sku}</span>
                  {d.tag && <span className={`${s.tag} ${s.tagInline} ${tagClass[d.tag] ?? ""}`}>{d.tag}</span>}
                </p>
                <h2 id="detail" className={s.detailTitle}>
                  {d.name}
                </h2>

                <div className={s.buyCard}>
                  <Price p={d} size="lg" />
                  <ul className={s.delivery}>
                    <li>
                      <span className={s.stockDot} aria-hidden="true" /> Skladom u dodávateľa
                    </li>
                    <li>
                      <Truck size={16} aria-hidden="true" />
                      <span>
                        Doručíme do <strong>štvrtka 15. 10.</strong> ({d.leadDays})
                      </span>
                    </li>
                    <li>
                      <Store size={16} aria-hidden="true" />
                      <span>Osobný odber Senec — zadarmo</span>
                    </li>
                  </ul>
                  <BuyBox unitLabel={d.sku} />
                </div>

                <aside className={s.tested} aria-labelledby="tested-t">
                  <ClipboardCheck size={22} aria-hidden="true" />
                  <div>
                    <h3 id="tested-t">Otestujeme pred odoslaním</h3>
                    <p>
                      Stroj zapneme, skontrolujeme príklep, otáčky a izoláciu. Výsledok zapíšeme do protokolu, ktorý
                      nájdete v balení.
                    </p>
                  </div>
                </aside>

                <p className={s.warranty}>
                  <ShieldCheck size={18} aria-hidden="true" />
                  <span>
                    <strong>Záruka 24 mesiacov</strong> · servis cez autorizované stredisko Makita v SR
                  </span>
                </p>

                {d.rentalPerDay ? (
                  <a href="#" className={s.rental}>
                    <span className={s.rentalKicker}>Royal Stroje · požičovňa</span>
                    <span className={s.rentalTitle}>Najprv vyskúšať?</span>
                    <span className={s.rentalText}>
                      Požičajte si ho v Royal Stroje od <strong>{d.rentalPerDay} €/deň</strong>
                    </span>
                    <ArrowUpRight size={22} aria-hidden="true" className={s.rentalArrow} />
                  </a>
                ) : null}
              </div>
            </div>

            <div className={s.detailLower}>
              <section aria-labelledby="specs-t">
                <h3 id="specs-t" className={s.subTitle}>
                  Technické parametre
                </h3>
                <table className={s.specTable}>
                  <tbody>
                    <tr>
                      <th scope="row">Značka</th>
                      <td>{d.brand}</td>
                    </tr>
                    <tr>
                      <th scope="row">Kód výrobcu</th>
                      <td>{d.sku}</td>
                    </tr>
                    <tr>
                      <th scope="row">Kategória</th>
                      <td>{d.category}</td>
                    </tr>
                    {d.specs.map((sp) => (
                      <tr key={sp.label}>
                        <th scope="row">{sp.label}</th>
                        <td>{sp.value}</td>
                      </tr>
                    ))}
                    <tr>
                      <th scope="row">Napájanie</th>
                      <td>230 V / 50 Hz, sieťový kábel</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section aria-labelledby="gpsr-t" className={s.gpsr}>
                <h3 id="gpsr-t" className={s.subTitle}>
                  <Factory size={18} aria-hidden="true" /> Výrobca a bezpečnosť (GPSR)
                </h3>
                <dl>
                  <div>
                    <dt>Výrobca</dt>
                    <dd>
                      Makita Corporation
                      <br />
                      Anjo, Aichi, Japonsko
                    </dd>
                  </div>
                  <div>
                    <dt>Zodpovedná osoba v EÚ</dt>
                    <dd>
                      Makita s.r.o.
                      <br />
                      Banská Bystrica, Slovensko
                    </dd>
                  </div>
                </dl>
                <p className={s.gpsrLinks}>
                  <a href="#">Návod na použitie (PDF)</a>
                  <a href="#">Bezpečnostné pokyny (PDF)</a>
                  <a href="#">Vyhlásenie o zhode CE</a>
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className={s.footer}>
        <div className={`${s.wrap} ${s.footerGrid}`}>
          <div className={s.footerCo}>
            <p className={s.footerLogo}>
              ROYAL<span className={s.logoThin}>SHOP</span>
            </p>
            <address>
              [Obchodné meno s.r.o.]
              <br />
              [Ulica a číslo], 903 01 Senec
              <br />
              IČO: [00 000 000] · DIČ: [0000000000]
              <br />
              IČ DPH: [SK0000000000]
              <br />
              Zapísaná v OR OS [—], odd. Sro, vl. č. [—]
            </address>
          </div>
          <nav aria-label="Informácie pre zákazníkov" className={s.footerNav}>
            <h2 className={s.footerHead}>Nákup</h2>
            <ul>
              <li>
                <a href="#">Obchodné podmienky</a>
              </li>
              <li>
                <a href="#">Reklamačný poriadok</a>
              </li>
              <li>
                <a href="#">Ochrana osobných údajov</a>
              </li>
              <li>
                <a href="#">Doprava a platba</a>
              </li>
              <li>
                <a href="#">Kontakt</a>
              </li>
            </ul>
          </nav>
          <div className={s.footerWithdraw}>
            <h2 className={s.footerHead}>Spotrebiteľ</h2>
            <p>Tovar kúpený online môžete vrátiť do 14 dní bez udania dôvodu.</p>
            <a href="#" className={s.withdraw}>
              Odstúpiť od zmluvy tu <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className={`${s.wrap} ${s.footerBase}`}>
          <span>© 2026 Royal Shop</span>
          <span>Ceny vrátane DPH 23 %</span>
          <span>List 1/1</span>
        </div>
      </footer>

      <p className={s.draftLabel}>
        Návrh A — Technický list
      </p>
    </div>
  );
}
