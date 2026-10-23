import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, GraduationCap, MessageSquareText, Wrench } from "lucide-react";
import {
  getAllProducts,
  getBrands,
  getFeaturedProducts,
  getSaleProducts,
  getShopSettings,
  getTopCategories,
} from "@/lib/catalog";
import { deliveryDays } from "@/lib/format";
import { formatEur } from "@/lib/money";
import { cheapestRateCents } from "@/lib/shipping";
import { delay, ProductGrid } from "@/components/shop/product-card";
import css from "@/components/shop/shop.module.css";

const INSPECTION = [
  "Vybalené a vizuálne skontrolované",
  "Olej, palivo a filtre skontrolované",
  "Skúšobný chod pod záťažou · 10 min",
  "Funkcie a príslušenstvo overené",
  "Zabalené s protokolom a návodom",
];

const SERVICES = [
  {
    icon: MessageSquareText,
    title: "Vysvetlenie produktu",
    text: "Stroj vám ukážeme naživo, porovnáme modely a poradíme, ktorý sa hodí na vašu prácu.",
  },
  {
    icon: GraduationCap,
    title: "Zaškolenie na obsluhu",
    text: "Naučíme vás stroj naštartovať, nastaviť, bezpečne s ním pracovať a starať sa oň.",
  },
  {
    icon: Wrench,
    title: "Odskúšanie v predajni",
    text: "Pred kúpou si stroj vyskúšate na vlastné ruky priamo v našej predajni v Boldogu pri Senci.",
  },
];

// Our main partner brand leads the brand grid (highlighted tile); the rest keep the product-count order.
const PRIMARY_BRAND = "golz";
const brandsFirst = <T extends { slug: string }>(brands: T[]) => [
  ...brands.filter((b) => b.slug === PRIMARY_BRAND),
  ...brands.filter((b) => b.slug !== PRIMARY_BRAND),
];

export default async function HomePage() {
  const [settings, categories, featured, sale, brands, all] = await Promise.all([
    getShopSettings(),
    getTopCategories(),
    getFeaturedProducts(6),
    getSaleProducts(3),
    getBrands(),
    getAllProducts(),
  ]);

  const ticketProduct = featured.find((p) => p.sku) ?? all[0];
  const spans = all.map((p) => deliveryDays(p.leadDays, settings.handlingDays));
  const fastest = Math.min(...spans.map((d) => d.min));
  const slowest = Math.max(...spans.map((d) => d.max));
  const usps = [
    {
      title: "Od výrobcov",
      text: "Stroje odoberáme od výrobcov a ich oficiálnych zastúpení, preto máme dobré ceny a plnú záruku.",
    },
    {
      title: "Odskúšané pred odoslaním",
      text: "Každý stroj naštartujeme a skontrolujeme. Do balenia dáme podpísaný protokol.",
    },
    {
      title: "Zaškolenie pri odbere",
      text: "Pri osobnom odbere v Boldogu vám stroj ukážeme, poradíme so starostlivosťou a povieme, na čo si dať pozor.",
    },
    {
      title: "Vždy poradíme",
      text: "Otázky k stroju aj reklamácie riešime telefonicky alebo e-mailom. Reklamáciu vybavíme priamo s výrobcom.",
    },
  ];
  const shownCategories = categories.filter((c) => c.productCount > 0);

  return (
    <>
      <section className={css.hero} aria-labelledby="hero-title">
        <div className={`${css.wrap} ${css.heroGrid}`}>
          <div className={css.heroCopy}>
            <p className={`${css.tape} ${css.rise}`} style={delay(1)}>
              Prémiové stavebné stroje
            </p>
            <h1 id="hero-title" className={css.heroTitle}>
              <span className={css.rise} style={delay(2)}>
                Prémiové stroje
              </span>
              <span className={`${css.heroHi} ${css.rise}`} style={delay(3)}>
                od výrobcov,
              </span>
              <span className={css.rise} style={delay(4)}>
                za férové ceny.
              </span>
            </h1>
            <p className={`${css.heroLede} ${css.rise}`} style={delay(5)}>
              NTC, Bomag, Honda, Gölz, Enar a Atlas Copco od výrobcov a ich oficiálnych zastúpení. Každý stroj pred
              odoslaním odskúšame, pri osobnom odbere vás naň zaškolíme a prípadnú reklamáciu riešime priamo s
              výrobcom. A keď si nebudete vedieť rady, stačí zavolať alebo napísať.
            </p>
            <div className={`${css.heroCtas} ${css.rise}`} style={delay(6)}>
              <Link href="/produkty" className={css.btnPrimary}>
                Nakupovať stroje <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <a href="#odporucane" className={css.btnGhost}>
                Odporúčané stroje
              </a>
            </div>
            <ul className={`${css.heroFacts} ${css.rise}`} style={delay(7)}>
              <li>
                <strong>
                  {fastest}–{slowest} dní
                </strong>{" "}
                doručenie vrátane testu
              </li>
              <li>
                {settings.freeShippingThresholdCents != null ? (
                  <>
                    <strong>{formatEur(settings.freeShippingThresholdCents)}</strong> doprava zdarma
                  </>
                ) : (
                  <>
                    <strong>od {formatEur(cheapestRateCents(settings.shippingRates))}</strong> doprava po celom Slovensku
                  </>
                )}
              </li>
              <li>
                <strong>Boldog</strong> osobný odber pri Senci
              </li>
            </ul>
          </div>

          {ticketProduct && (
            <aside
              className={`${css.ticket} ${css.dark} ${css.rise}`}
              style={delay(4)}
              aria-label="Ukážka kontrolného protokolu"
            >
              <span className={css.ticketHole} aria-hidden="true" />
              <p className={css.ticketHead}>
                <span>Kontrolný protokol</span>
                <span className={css.ticketNo}>№ 04 812</span>
              </p>
              <p className={css.ticketModel}>
                {ticketProduct.brand.name} {ticketProduct.sku}
              </p>
              <ol className={css.ticketList}>
                {INSPECTION.map((step, i) => (
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
                <span>Boldog</span>
              </p>
              <span className={css.stamp} aria-hidden="true">
                <span>OK</span>
                <small>Otestované</small>
              </span>
            </aside>
          )}
        </div>

        <div className={css.cautionTape} aria-hidden="true">
          <div className={css.cautionTrack}>
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                Odskúšané pred odoslaním ✕ Od výrobcov ✕ Zaškolenie zadarmo ✕ Osobný odber pri Senci ✕ Ťažké stroje na palete po celom Slovensku
                ✕{" "}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={css.section} aria-labelledby="cat-title">
        <div className={css.wrap}>
          <div className={css.sectionHead}>
            <span className={css.tape}>01 / Sortiment</span>
            <h2 id="cat-title" className={css.h2}>
              Kategórie
            </h2>
            <Link href="/produkty" className={css.headLink}>
              Celý sortiment <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <ul className={css.cats}>
            {shownCategories.map((c, i) => (
              <li key={c.slug} className={css.cat}>
                <Link href={`/kategoria/${c.slug}`}>
                  <span className={css.catIdx}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={css.catName}>{c.name}</span>
                  <span className={css.catCount}>
                    {c.productCount} {c.productCount === 1 ? "stroj" : c.productCount < 5 ? "stroje" : "strojov"}{" "}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={css.section} aria-labelledby="brand-title">
        <div className={css.wrap}>
          <div className={css.sectionHead}>
            <span className={css.tape}>02 / Značky</span>
            <h2 id="brand-title" className={css.h2}>
              Značky, za ktorými <span>si stojíme</span>
            </h2>
          </div>
          <ul className={css.brands}>
            {brandsFirst(brands).map((b, i) => (
              <li key={b.slug} className={b.slug === PRIMARY_BRAND ? `${css.brandTile} ${css.brandHot}` : css.brandTile}>
                <Link href={`/produkty?znacka=${b.slug}`}>
                  <span className={css.catIdx}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={css.brandName}>{b.name}</span>
                  <span className={css.brandCats}>{b.categories.join(" · ")}</span>
                  <span className={css.catCount}>
                    {b.productCount} {b.productCount === 1 ? "stroj" : b.productCount < 5 ? "stroje" : "strojov"}{" "}
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={css.section} aria-labelledby="featured-title" id="odporucane">
        <div className={css.wrap}>
          <div className={css.sectionHead}>
            <span className={css.tape}>03 / Výber</span>
            <h2 id="featured-title" className={css.h2}>
              Odporúčané stroje
            </h2>
            <Link href="/produkty" className={css.headLink}>
              Všetky produkty <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <ProductGrid products={featured} handlingDays={settings.handlingDays} />
        </div>
      </section>

      <section className={css.section} aria-labelledby="services-title">
        <div className={css.wrap}>
          <div className={css.sectionHead}>
            <span className={css.tape}>04 / Služby</span>
            <h2 id="services-title" className={css.h2}>
              Služby v predajni <span>zadarmo</span>
            </h2>
          </div>
          <ul className={css.services}>
            {SERVICES.map(({ icon: Icon, title, text }) => (
              <li key={title} className={css.service}>
                <span className={css.serviceIcon}>
                  <Icon size={26} aria-hidden="true" />
                </span>
                <span className={css.serviceFree}>Zadarmo</span>
                <h3 className={css.serviceTitle}>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
          <p className={css.servicesNote}>
            Royal Stroje, Recká cesta 182, Boldog pri Senci · ku každému stroju z nášho sortimentu, pri kúpe aj pred ňou.
          </p>
        </div>
      </section>

      {sale.length > 0 && (
        <section className={css.section} aria-labelledby="sale-title">
          <div className={css.wrap}>
            <div className={css.sectionHead}>
              <span className={css.tapeHi}>05 / Akcia</span>
              <h2 id="sale-title" className={css.h2}>
                Zľavnené stroje
              </h2>
              <Link href="/produkty?akcia=1&zoradit=zlava" className={css.headLink}>
                Všetky akcie <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <ProductGrid products={sale} handlingDays={settings.handlingDays} />
          </div>
        </section>
      )}

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
    </>
  );
}
