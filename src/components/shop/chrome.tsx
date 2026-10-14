import type { ReactNode } from "react";
import Link from "next/link";
import Form from "next/form";
import { ArrowRight, Clock, Mail, Phone, Search, Store, Truck, Undo2, User } from "lucide-react";
import { getShopSettings, getTopCategories } from "@/lib/catalog";
import { formatEur } from "@/lib/money";
import { fontVariables } from "./fonts";
import { CartLink } from "./cart-buttons";
import css from "./shop.module.css";

export async function ShopShell({ children }: { children: ReactNode }) {
  const [settings, categories] = await Promise.all([getShopSettings(), getTopCategories()]);
  const tel = settings.phone?.replace(/\s+/g, "");

  return (
    <div id="top" className={`${fontVariables} ${css.root}`}>
      <a href="#obsah" className={css.skip}>
        Preskočiť na obsah
      </a>

      <div className={`${css.topbar} ${css.dark}`}>
        <div className={css.wrap}>
          <ul className={css.topList}>
            <li>
              <Truck size={14} aria-hidden="true" /> Doprava zdarma od {formatEur(settings.freeShippingThresholdCents)}
            </li>
            <li>
              <Store size={14} aria-hidden="true" /> Osobný odber Senec
            </li>
            {settings.phone && (
              <li>
                <Phone size={14} aria-hidden="true" /> <a href={`tel:${tel}`}>{settings.phone}</a>
              </li>
            )}
          </ul>
          {settings.pickupHours && (
            <span className={css.topHours}>
              <Clock size={14} aria-hidden="true" /> {settings.pickupHours}
            </span>
          )}
        </div>
      </div>

      <header className={css.header}>
        <div className={`${css.wrap} ${css.headerGrid}`}>
          <Link href="/" className={css.logo} aria-label="Royal Shop – úvod">
            <span className={css.logoRoyal}>Royal</span>
            <span className={css.logoShop}>Shop</span>
          </Link>

          <Form action="/hladat" role="search" className={css.search}>
            <label htmlFor="site-search" className={css.srOnly}>
              Hľadať v obchode
            </label>
            <input
              id="site-search"
              type="search"
              name="q"
              placeholder="Hľadať model, kód alebo EAN"
              autoComplete="off"
              enterKeyHint="search"
              required
            />
            <button type="submit" aria-label="Hľadať">
              <Search size={20} aria-hidden="true" />
            </button>
          </Form>

          <nav aria-label="Používateľ" className={css.userNav}>
            <Link href="/ucet">
              <User size={20} aria-hidden="true" />
              <span>Účet</span>
            </Link>
            <CartLink />
          </nav>
        </div>

        <nav aria-label="Kategórie" className={css.catNav}>
          <ul className={css.wrap}>
            {categories
              .filter((c) => c.productCount > 0)
              .map((c) => (
                <li key={c.slug}>
                  <Link href={`/kategoria/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            <li>
              <Link href="/produkty?akcia=1" className={css.catNavHot}>
                Akcie
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main id="obsah">{children}</main>

      {(settings.phone || settings.email) && (
        <section className={css.ask} aria-labelledby="ask-title">
          <div className={`${css.wrap} ${css.askGrid}`}>
            <div>
              <h2 id="ask-title" className={css.askTitle}>
                Nenašli ste stroj, ktorý hľadáte?
              </h2>
              <p className={css.askText}>Zavolajte nám a dohodneme sa. Stroj vám radi zoháňame aj mimo ponuky e-shopu.</p>
            </div>
            <div className={css.askActions}>
              {settings.phone && (
                <a href={`tel:${tel}`} className={css.askCall}>
                  <Phone size={22} aria-hidden="true" /> {settings.phone}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className={css.askMail}>
                  <Mail size={18} aria-hidden="true" /> {settings.email}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <footer className={`${css.footer} ${css.dark}`}>
        <div className={css.wrap}>
          <p className={css.footMark} aria-hidden="true">
            Royal <span>Shop</span>
          </p>

          <div className={css.footGrid}>
            <div className={css.footCol}>
              <p className={css.footHead}>Prevádzkovateľ</p>
              <address>
                {settings.companyName}
                {(settings.street || settings.city) && (
                  <>
                    <br />
                    {[settings.street, [settings.zip, settings.city].filter(Boolean).join(" ")]
                      .filter(Boolean)
                      .join(", ")}
                  </>
                )}
                <br />
                IČO: {settings.ico ?? "[doplniť]"} · DIČ: {settings.dic ?? "[doplniť]"}
                <br />
                IČ DPH: {settings.icDph ?? "[doplniť]"}
                <br />
                {settings.registerInfo ?? "Zapísaná v OR [súd, oddiel, vložka]"}
                {settings.email && (
                  <>
                    <br />
                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </>
                )}
              </address>
            </div>

            <nav className={css.footCol} aria-label="Informácie pre zákazníkov">
              <p className={css.footHead}>Nákup</p>
              <ul className={css.footLinks}>
                <li>
                  <Link href="/obchodne-podmienky">Obchodné podmienky</Link>
                </li>
                <li>
                  <Link href="/reklamacny-poriadok">Reklamačný poriadok</Link>
                </li>
                <li>
                  <Link href="/ochrana-osobnych-udajov">Ochrana osobných údajov</Link>
                </li>
                <li>
                  <Link href="/doprava-a-platba">Doprava a platba</Link>
                </li>
                <li>
                  <Link href="/kontakt">Kontakt</Link>
                </li>
              </ul>
            </nav>

            <div className={css.footCol}>
              <Link href="/odstupenie" className={css.withdraw}>
                <span className={css.withdrawInner}>
                  <Undo2 size={22} aria-hidden="true" />
                  <span>
                    Odstúpiť od zmluvy tu
                    <small>Do 14 dní od prevzatia, online formulár</small>
                  </span>
                  <ArrowRight size={22} aria-hidden="true" />
                </span>
              </Link>
            </div>
          </div>

          <p className={css.footBottom}>
            <span>© 2026 {settings.companyName}</span>
            <span>Ceny vrátane DPH · demo verzia</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
