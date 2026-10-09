import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Zap } from "lucide-react";
import {
  getAllProducts,
  getFeaturedProducts,
  getPlatformCounts,
  getSaleProducts,
  getShopSettings,
  getTopCategories,
} from "@/lib/catalog";
import { deliveryDays } from "@/lib/format";
import { formatEur } from "@/lib/money";
import { delay, ProductGrid } from "@/components/shop/product-card";
import css from "@/components/shop/shop.module.css";

const INSPECTION = [
  "Vybalené a vizuálne skontrolované",
  "Skúšobný chod naprázdno · 60 s",
  "Funkcie a príslušenstvo overené",
  "Batérie nabité, nabíjačka OK",
  "Zabalené späť s protokolom",
];

export default async function HomePage() {
  const [settings, categories, featured, sale, platforms, all] = await Promise.all([
    getShopSettings(),
    getTopCategories(),
    getFeaturedProducts(6),
    getSaleProducts(3),
    getPlatformCounts(),
    getAllProducts(),
  ]);

  const ticketProduct = featured.find((p) => p.sku) ?? all[0];
  const spans = all.map((p) => deliveryDays(p.leadDays, settings.handlingDays));
  const fastest = Math.min(...spans.map((d) => d.min));
  const slowest = Math.max(...spans.map((d) => d.max));
  const usps = [
    { title: "Otestované pred odoslaním", text: "Každý stroj zapneme, skontrolujeme a až potom zabalíme." },
    {
      title: `Doprava zdarma od ${formatEur(settings.freeShippingThresholdCents)}`,
      text: "Ťažké stroje privezieme vlastnou technikou.",
    },
    { title: "Osobný odber v Senci", text: "Vyzdvihnete si ho na pobočke Royal Stroje." },
    { title: "Autorizovaný predajca", text: "Originálny tovar s plnou zárukou výrobcu." },
  ];
  const shownCategories = categories.filter((c) => c.productCount > 0);

  return (
    <>
      <section className={css.hero} aria-labelledby="hero-title">
        <div className={`${css.wrap} ${css.heroGrid}`}>
          <div className={css.heroCopy}>
            <p className={`${css.tape} ${css.rise}`} style={delay(1)}>
              Makita · NTC · autorizovaný predajca
            </p>
            <h1 id="hero-title" className={css.heroTitle}>
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
              Každý stroj vybalíme, zapneme a skontrolujeme ešte v Senci. Na stavbu vám príde náradie, ktoré už raz
              bežalo — s podpísaným protokolom v krabici.
            </p>
            <div className={`${css.heroCtas} ${css.rise}`} style={delay(6)}>
              <Link href="/produkty" className={css.btnPrimary}>
                Nakupovať náradie <ArrowRight size={20} aria-hidden="true" />
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
                <strong>{formatEur(settings.freeShippingThresholdCents)}</strong> doprava zdarma
              </li>
              <li>
                <strong>Senec</strong> osobný odber
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
                <span>Senec</span>
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
                Otestované pred odoslaním ✕ Autorizovaný predajca Makita ✕ Osobný odber Senec ✕ Ťažké stroje vlastnou
                dopravou ✕{" "}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={css.section} aria-labelledby="platform-title">
        <div className={css.wrap}>
          <div className={css.sectionHead}>
            <span className={css.tape}>01 / Batérie</span>
            <h2 id="platform-title" className={css.h2}>
              Máte batérie? <span>Vyberte platformu</span>
            </h2>
          </div>

          <div className={css.platforms}>
            <Link href="/produkty?platforma=lxt" className={`${css.platform} ${css.platformLxt} ${css.dark}`}>
              <span className={css.platformVolt}>
                18<small>V</small>
              </span>
              <span className={css.platformName}>LXT</span>
              <span className={css.platformText}>
                Najširší systém Makita. Stovky strojov — vŕtačky, brúsky, kladivá aj záhrada — na jednu batériu.
              </span>
              <span className={css.platformFoot}>
                <span>{platforms.LXT_18V} v ponuke</span>
                <span className={css.platformGo}>
                  Náradie 18V LXT <ArrowRight size={18} aria-hidden="true" />
                </span>
              </span>
            </Link>
            <Link href="/produkty?platforma=xgt" className={`${css.platform} ${css.platformXgt}`}>
              <span className={css.platformVolt}>
                40<small>V</small>
              </span>
              <span className={css.platformName}>XGT</span>
              <span className={css.platformText}>
                Pre najťažšiu prácu: výkon sieťových strojov bez kábla. Uťahováky, píly a búracie kladivá.
              </span>
              <span className={css.platformFoot}>
                <span>{platforms.XGT_40V} v ponuke</span>
                <span className={css.platformGo}>
                  Náradie 40V XGT <ArrowRight size={18} aria-hidden="true" />
                </span>
              </span>
            </Link>
          </div>
          <p className={css.platformNote}>
            <Zap size={16} aria-hidden="true" />
            Batérie nemáte? Hľadajte označenie <strong>Sada s batériami</strong> — v balení je nabíjačka aj akumulátory.
          </p>
        </div>
      </section>

      <section className={css.section} aria-labelledby="cat-title">
        <div className={css.wrap}>
          <div className={css.sectionHead}>
            <span className={css.tape}>02 / Sortiment</span>
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
                    {c.productCount} {c.productCount === 1 ? "produkt" : c.productCount < 5 ? "produkty" : "produktov"}{" "}
                    <ArrowUpRight size={18} aria-hidden="true" />
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

      {sale.length > 0 && (
        <section className={css.section} aria-labelledby="sale-title">
          <div className={css.wrap}>
            <div className={css.sectionHead}>
              <span className={css.tapeHi}>04 / Akcia</span>
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
