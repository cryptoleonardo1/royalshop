import { readdirSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Commissioner, Instrument_Serif, Martian_Mono } from "next/font/google";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  Check,
  Factory,
  FileText,
  MapPin,
  Phone,
  PlugZap,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  User,
} from "lucide-react";
import { categories, eur, net, products, usps, type MockProduct } from "../_data";
import { BuyBox } from "./BuyBox";
import { Gallery } from "./Gallery";
import { Stage } from "./Stage";
import s from "./b.module.css";

const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--b-display",
  display: "swap",
});

const body = Commissioner({
  subsets: ["latin", "latin-ext"],
  axes: ["FLAR"],
  variable: "--b-body",
  display: "swap",
});

const mono = Martian_Mono({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--b-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Návrh B — Dielňa po zotmení · Royal Shop",
  description: "Dizajnový koncept e-shopu Royal Shop: profesionálne náradie Makita a stavebné stroje NTC.",
  robots: { index: false, follow: false },
};

/* ---------- product photos from /public/demo-products (matched by SKU or slug) ---------- */

const IMG_EXT = /\.(avif|webp|png|jpe?g)$/i;

function productImages(): Record<string, string> {
  let files: string[] = [];
  try {
    files = readdirSync(path.join(process.cwd(), "public", "demo-products"))
      .filter((f) => IMG_EXT.test(f))
      .sort();
  } catch {
    return {};
  }
  const out: Record<string, string> = {};
  for (const p of products) {
    const keys = [p.sku.toLowerCase(), p.slug.toLowerCase()];
    const stemOf = (f: string) => f.replace(IMG_EXT, "").toLowerCase();
    const file =
      files.find((f) => keys.includes(stemOf(f))) ??
      files.find((f) => keys.some((k) => stemOf(f).startsWith(`${k}-`) || stemOf(f).startsWith(`${k}_`)));
    if (file) out[p.slug] = `/demo-products/${encodeURIComponent(file)}`;
  }
  return out;
}

/* ---------- small pieces ---------- */

const navItems = [...categories.map((c) => c.name), "Akcie"];
const uspIcons = [PlugZap, Truck, Store, BadgeCheck];
const testSteps = ["Chod naprázdno", "Príklep a sekanie", "Kábel a vypínač", "Príslušenstvo v kufri"];

function tagClass(tag: string) {
  if (tag === "Akcia") return `${s.tag} ${s.tagSale}`;
  if (tag === "Novinka") return `${s.tag} ${s.tagNew}`;
  return s.tag;
}

function discount(p: MockProduct) {
  return p.compareAt ? Math.round((1 - p.priceGross / p.compareAt) * 100) : 0;
}

function SectionHead({ index, kicker, title, lead, id }: { index: string; kicker: string; title: ReactNode; lead?: string; id: string }) {
  return (
    <header className={s.sectionHead}>
      <p className={s.kicker}>
        <span>{index}</span> {kicker}
      </p>
      <h2 id={id} className={s.h2}>
        {title}
      </h2>
      {lead && <p className={s.sectionLead}>{lead}</p>}
    </header>
  );
}

function ProductCard({ p, img }: { p: MockProduct; img: string | null }) {
  const off = discount(p);
  return (
    <article className={s.card} aria-labelledby={`b-p-${p.slug}`}>
      <div className={s.cardMedia}>
        <Stage src={img} alt={p.name} sku={p.sku} brand={p.brand} sizes="(min-width: 1100px) 400px, (min-width: 700px) 50vw, 100vw" />
        {p.tag && <span className={tagClass(p.tag)}>{p.tag}</span>}
        {(p.platform || p.kit) && (
          <span className={s.platformBadge}>
            {p.platform}
            {p.platform && p.kit ? " · " : ""}
            {p.kit ? "set s batériami" : ""}
          </span>
        )}
      </div>
      <div className={s.cardBody}>
        <p className={s.cardMeta}>
          <span className={s.cardBrand}>{p.brand}</span>
          <span className={s.cardSku}>
            <span className={s.srOnly}>Kód: </span>
            {p.sku}
          </span>
        </p>
        <h3 id={`b-p-${p.slug}`} className={s.cardTitle}>
          <a href={p.slug === products[0].slug ? "#detail" : "#vyber"}>{p.name}</a>
        </h3>
        <dl className={s.cardSpecs}>
          {p.specs.slice(0, 3).map((sp) => (
            <div key={sp.label}>
              <dt>{sp.label}</dt>
              <dd>{sp.value}</dd>
            </div>
          ))}
        </dl>
        <div className={s.cardFoot}>
          <div className={s.priceBlock}>
            {p.compareAt && (
              <p className={s.priceWas}>
                <del>
                  <span className={s.srOnly}>Pôvodná cena </span>
                  {eur(p.compareAt)}
                </del>
                <span className={s.offChip}>−{off} %</span>
              </p>
            )}
            <p className={s.priceGross}>
              {eur(p.priceGross)} <span>s DPH</span>
            </p>
            <p className={s.priceNet}>{eur(net(p.priceGross))} bez DPH</p>
          </div>
          <button type="button" className={`${s.btnPrimary} ${s.btnAdd}`} aria-label={`Do košíka: ${p.name}`}>
            <ShoppingBag size={17} aria-hidden="true" />
            <span>Do košíka</span>
          </button>
        </div>
        {p.compareAt && <p className={s.omnibus}>Najnižšia cena za 30 dní pred zľavou: {eur(p.compareAt)}</p>}
        <p className={s.lead}>
          <Truck size={15} aria-hidden="true" /> Skladom · doručenie {p.leadDays}
        </p>
      </div>
    </article>
  );
}

/* ---------- page ---------- */

export default function DesignB() {
  const images = productImages();
  const hero = products[0];
  const heroImg = images[hero.slug] ?? null;
  const totalCount = categories.reduce((n, c) => n + c.count, 0);

  return (
    <div lang="sk" className={`${display.variable} ${body.variable} ${mono.variable} ${s.root}`}>
      <a href="#obsah" className={s.skip}>
        Preskočiť na obsah
      </a>

      {/* ---------- top bar ---------- */}
      <div className={s.topbar}>
        <ul className={s.wrap}>
          <li>
            <Truck size={14} aria-hidden="true" /> Doprava zdarma od {eur(2000)}
          </li>
          <li>
            <MapPin size={14} aria-hidden="true" /> Osobný odber Senec
          </li>
          <li>
            <Phone size={14} aria-hidden="true" /> <a href="tel:+421900000000">+421 900 000 000</a>
          </li>
        </ul>
      </div>

      {/* ---------- header ---------- */}
      <header className={s.header}>
        <div className={`${s.wrap} ${s.headerRow}`}>
          <a href="#" className={s.logo} aria-label="Royal Shop — úvod">
            <span className={s.logoRoyal}>ROYAL</span>
            <span className={s.logoShop}>SHOP</span>
          </a>
          <form role="search" className={s.search} action="#vyber">
            <label htmlFor="b-search" className={s.srOnly}>
              Hľadať v obchode
            </label>
            <input id="b-search" type="search" name="q" placeholder="Hľadať model, kód alebo EAN" autoComplete="off" />
            <button type="submit" aria-label="Hľadať">
              <Search size={18} aria-hidden="true" />
            </button>
          </form>
          <nav className={s.actions} aria-label="Používateľ">
            <a href="#">
              <User size={20} aria-hidden="true" />
              <span>Účet</span>
            </a>
            <a href="#">
              <span className={s.cartIcon}>
                <ShoppingBag size={20} aria-hidden="true" />
                <span className={s.cartCount} aria-hidden="true">2</span>
              </span>
              <span>
                Košík<span className={s.srOnly}>, 2 položky</span>
              </span>
            </a>
          </nav>
        </div>
        <nav className={s.catNav} aria-label="Kategórie">
          <ul className={s.wrap}>
            {navItems.map((n) => (
              <li key={n}>
                <a href="#kategorie" className={n === "Akcie" ? s.catNavSale : undefined}>
                  {n}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="obsah">
        {/* ---------- hero ---------- */}
        <section className={s.hero} aria-labelledby="b-hero-title">
          <div className={`${s.wrap} ${s.heroGrid}`}>
            <div className={s.heroCopy}>
              <p className={s.eyebrow}>Autorizovaný predajca Makita · NTC</p>
              <h1 id="b-hero-title" className={s.h1}>
                <span>Každý stroj</span> <span>zapneme skôr,</span> <span>než ho <em>zabalíme.</em></span>
              </h1>
              <p className={s.heroLead}>
                Profesionálne náradie a stavebné stroje, ktoré pred odoslaním prejdú skúškou v našej dielni v Senci. Plná
                záruka výrobcu, doprava zdarma od {eur(2000)}.
              </p>
              <div className={s.heroCtas}>
                <a href="#vyber" className={s.btnPrimary}>
                  Vybrať náradie <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a href="#platforma" className={s.btnGhost}>
                  Mám batérie Makita
                </a>
              </div>
              <dl className={s.heroStats}>
                <div>
                  <dt>Produktov v ponuke</dt>
                  <dd>{totalCount.toLocaleString("sk-SK")}</dd>
                </div>
                <div>
                  <dt>Doručenie</dt>
                  <dd>3–4 dni</dd>
                </div>
                <div>
                  <dt>Strojov testujeme</dt>
                  <dd>100 %</dd>
                </div>
              </dl>
            </div>

            <div className={s.heroVisual}>
              <span className={s.beam} aria-hidden="true" />
              <Stage
                src={heroImg}
                alt={`${hero.brand} ${hero.name}`}
                sku={hero.sku}
                brand={hero.brand}
                sizes="(min-width: 1000px) 560px, 92vw"
                variant="hero"
                preload
              />
              <aside className={s.ticket} aria-label="Ukážka testovacieho protokolu">
                <p className={s.ticketHead}>
                  <span>Testovací protokol</span>
                  <span>№ 0417</span>
                </p>
                <p className={s.ticketModel}>
                  {hero.brand} {hero.sku}
                </p>
                <ul>
                  {testSteps.map((t) => (
                    <li key={t}>
                      <Check size={14} aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
                <p className={s.ticketFoot}>
                  <span>Dielňa Senec</span>
                  <a href="#detail">
                    {eur(hero.priceGross)} <ArrowRight size={14} aria-hidden="true" />
                  </a>
                </p>
              </aside>
            </div>
          </div>
        </section>

        {/* ---------- battery platform ---------- */}
        <section className={s.section} aria-labelledby="platforma">
          <div className={s.wrap}>
            <SectionHead
              index="01"
              id="platforma"
              kicker="Batériové platformy"
              title={
                <>
                  Máte batérie? <em>Vyberte platformu.</em>
                </>
              }
              lead="Ukážeme vám len stroje, ktoré pobežia na batériách, ktoré už máte v kufri."
            />
            <div className={s.platforms}>
              <a href="#vyber" className={s.platform}>
                <span className={s.platformVolt}>
                  18<small>V</small>
                </span>
                <span className={s.platformName}>LXT</span>
                <span className={s.gauge} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span className={s.platformText}>
                  Najširší systém Makita — viac ako 300 strojov na jednu batériu. Pre dielňu, montáže aj stavbu.
                </span>
                <span className={s.platformCta}>
                  Zobraziť stroje 18V LXT <ArrowRight size={16} aria-hidden="true" />
                </span>
              </a>
              <a href="#vyber" className={s.platform}>
                <span className={s.platformVolt}>
                  40<small>V max</small>
                </span>
                <span className={s.platformName}>XGT</span>
                <span className={s.gauge} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span className={s.platformText}>
                  Výkon sieťových strojov bez kábla. Na ťažké vŕtanie, búranie, rezanie a uťahovanie.
                </span>
                <span className={s.platformCta}>
                  Zobraziť stroje 40V XGT <ArrowRight size={16} aria-hidden="true" />
                </span>
              </a>
            </div>
            <p className={s.platformAlt}>
              Ešte nemáte batérie? <a href="#vyber">Vyberte si set s batériami a nabíjačkou</a>
            </p>
          </div>
        </section>

        {/* ---------- categories ---------- */}
        <section className={s.section} aria-labelledby="kategorie">
          <div className={s.wrap}>
            <SectionHead index="02" id="kategorie" kicker="Sortiment" title="Kategórie" />
            <ul className={s.cats}>
              {categories.map((c, i) => (
                <li key={c.name}>
                  <a href="#vyber" className={s.cat}>
                    <span className={s.catIndex} aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={s.catName}>{c.name}</span>
                    <span className={s.catCount}>{c.count} produktov</span>
                    <ArrowUpRight className={s.catArrow} size={22} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- featured products ---------- */}
        <section className={s.section} aria-labelledby="vyber">
          <div className={s.wrap}>
            <SectionHead
              index="03"
              id="vyber"
              kicker="Na pracovnom stole"
              title={
                <>
                  Vybrané <em>stroje</em>
                </>
              }
              lead="Skladom v Senci, prekontrolované a pripravené na expedíciu."
            />
            <div className={s.grid}>
              {products.map((p) => (
                <ProductCard key={p.slug} p={p} img={images[p.slug] ?? null} />
              ))}
            </div>
          </div>
        </section>

        {/* ---------- USP strip ---------- */}
        <section className={s.usps} aria-label="Prečo nakupovať u nás">
          <ul className={s.wrap}>
            {usps.map((u, i) => {
              const Icon = uspIcons[i % uspIcons.length];
              return (
                <li key={u.title}>
                  <span className={s.uspIcon}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{u.title}</strong>
                    <span>{u.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---------- product detail concept ---------- */}
        <section className={s.detail} aria-labelledby="detail">
          <div className={s.wrap}>
            <p className={s.conceptRule}>
              <span>Koncept · stránka produktu</span>
            </p>
            <nav aria-label="Omrvinky" className={s.crumbs}>
              <ol>
                <li>
                  <a href="#">Domov</a>
                </li>
                <li>
                  <a href="#kategorie">Kladivá a búracie stroje</a>
                </li>
                <li>
                  <a href="#kategorie">{hero.category}</a>
                </li>
                <li aria-current="page">{hero.sku}</li>
              </ol>
            </nav>

            <div className={s.detailGrid}>
              <Gallery src={heroImg} alt={`${hero.brand} ${hero.name}`} sku={hero.sku} brand={hero.brand} />

              <div className={s.buy}>
                <p className={s.buyMeta}>
                  {hero.tag && <span className={tagClass(hero.tag)}>{hero.tag}</span>}
                  <span className={s.cardBrand}>{hero.brand}</span>
                </p>
                <h2 id="detail" className={s.detailTitle}>
                  {hero.name}
                </h2>
                <p className={s.detailCodes}>
                  <span>Kód: {hero.sku}</span>
                  <span>Kategória: {hero.category}</span>
                  <span className={s.inStock}>Skladom 4 ks</span>
                </p>

                <div className={s.detailPrice}>
                  <p className={s.detailGross}>
                    {eur(hero.priceGross)} <span>s DPH</span>
                  </p>
                  <p className={s.detailNet}>{eur(net(hero.priceGross))} bez DPH (pre firmy)</p>
                </div>

                <ul className={s.delivery}>
                  <li>
                    <Truck size={18} aria-hidden="true" />
                    <span>
                      {/* Mock date for the concept; the real shop computes it from stock + cut-off. */}
                      <strong>Doručíme do štvrtka 15. 10.</strong>
                      <span>pri objednávke do 14:00 · {hero.leadDays}</span>
                    </span>
                  </li>
                  <li>
                    <Store size={18} aria-hidden="true" />
                    <span>
                      <strong>Osobný odber Senec</strong>
                      <span>pripravené do 2 pracovných dní, zadarmo</span>
                    </span>
                  </li>
                </ul>

                <BuyBox productName={`${hero.brand} ${hero.sku}`} />

                <div className={s.assurances}>
                  <div className={s.assurance}>
                    <PlugZap size={20} aria-hidden="true" />
                    <div>
                      <h3>Otestujeme pred odoslaním</h3>
                      <p>
                        Kladivo pred zabalením zapojíme, preveríme príklep, sekanie aj stav kábla. Podpísaný protokol nájdete
                        v balíku.
                      </p>
                    </div>
                  </div>
                  <div className={s.assurance}>
                    <ShieldCheck size={20} aria-hidden="true" />
                    <div>
                      <h3>Záruka 24 mesiacov</h3>
                      <p>Originálny tovar od autorizovaného predajcu. Servis cez autorizované stredisko Makita.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={s.detailLower}>
              <table className={s.specTable}>
                <caption>Technické parametre</caption>
                <tbody>
                  {[
                    ...hero.specs,
                    { label: "Značka", value: hero.brand },
                    { label: "Kód výrobcu", value: hero.sku },
                    { label: "Kategória", value: hero.category },
                    { label: "Dodacia lehota", value: hero.leadDays },
                  ].map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      <td>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={s.detailAside}>
                {hero.rentalPerDay && (
                  <a href="#" className={s.rental}>
                    <span className={s.rentalKicker}>
                      <CalendarClock size={16} aria-hidden="true" /> Royal Stroje · požičovňa
                    </span>
                    <span className={s.rentalTitle}>Najprv vyskúšať?</span>
                    <span className={s.rentalText}>
                      Požičajte si {hero.sku} v Royal Stroje od <strong>{eur(hero.rentalPerDay)}/deň</strong> a otestujte ho
                      na vlastnej stavbe.
                    </span>
                    <span className={s.rentalCta}>
                      Rezervovať v požičovni <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </a>
                )}

                <section className={s.gpsr} aria-labelledby="b-gpsr">
                  <h3 id="b-gpsr">
                    <Factory size={18} aria-hidden="true" /> Výrobca a bezpečnosť (GPSR)
                  </h3>
                  <dl>
                    <div>
                      <dt>Výrobca</dt>
                      <dd>Makita Corporation, 3-11-8 Sumiyoshi-cho, Anjo, Aichi 446-8502, Japonsko</dd>
                    </div>
                    <div>
                      <dt>Zodpovedná osoba v EÚ</dt>
                      <dd>Makita s.r.o., Banská Bystrica, Slovensko</dd>
                    </div>
                  </dl>
                  <a href="#">
                    <FileText size={16} aria-hidden="true" /> Bezpečnostné pokyny a návod (PDF)
                  </a>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- footer ---------- */}
      <footer className={s.footer}>
        <div className={`${s.wrap} ${s.footerGrid}`}>
          <div className={s.footerBrand}>
            <p className={s.logo} aria-hidden="true">
              <span className={s.logoRoyal}>ROYAL</span>
              <span className={s.logoShop}>SHOP</span>
            </p>
            <address>
              Royal Shop s.r.o. <span className={s.muted}>(pracovný názov)</span>
              <br />
              Ulica 00, 903 01 Senec
              <br />
              IČO: 00 000 000 · DIČ: 0000000000
              <br />
              <a href="mailto:info@example.sk">info@example.sk</a> · <a href="tel:+421900000000">+421 900 000 000</a>
            </address>
          </div>
          <nav aria-label="Informácie pre zákazníkov" className={s.footerLinks}>
            <h2>Nákup</h2>
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
            <h2>Rozmysleli ste si to?</h2>
            <p>Od zmluvy môžete odstúpiť do 14 dní od prevzatia tovaru, bez udania dôvodu.</p>
            <a href="#" className={s.withdraw}>
              Odstúpiť od zmluvy tu <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
        <p className={`${s.wrap} ${s.footerBottom}`}>
          <span>© 2026 Royal Shop</span>
          <span>Ceny sú uvedené vrátane 23 % DPH.</span>
        </p>
      </footer>

      <p className={s.draftLabel}>Návrh B — Dielňa po zotmení</p>
    </div>
  );
}
