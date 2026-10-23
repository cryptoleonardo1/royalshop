import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2, Clock, Mail, Navigation, Phone, Store } from "lucide-react";
import { getShopSettings } from "@/lib/catalog";
import { MapEmbed } from "@/components/shop/map-embed";
import css from "@/components/shop/shop.module.css";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Royal stroje s. r. o., Recká cesta 182, Boldog pri Senci. Telefón, e-mail, osobný odber tovaru v požičovni a mapa.",
};

// Pickup point = the Royal Stroje rental yard (same pin as royalstroje.sk/kontakt).
const PICKUP = { lat: 48.224467, lng: 17.418349, mapsUrl: "https://maps.app.goo.gl/A7HSGKNYctVqgRuq8" };
const EMBED_URL = `https://maps.google.com/maps?q=${PICKUP.lat},${PICKUP.lng}&z=16&hl=sk&output=embed`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${PICKUP.lat},${PICKUP.lng}`;

const GALLERY = [
  { src: "/kontakt/dvor.webp", width: 1600, height: 1200, alt: "Dvor požičovne s minibagrom JCB a nakladačmi" },
  { src: "/kontakt/strojovy-park.webp", width: 1280, height: 960, alt: "Strojový park: dumper, nakladač a minibager" },
  { src: "/kontakt/predajna.webp", width: 1600, height: 1096, alt: "Interiér predajne s náradím a príslušenstvom" },
  { src: "/kontakt/predajna-regaly.webp", width: 1600, height: 1003, alt: "Regály s náradím v predajni" },
];

export default async function ContactPage() {
  const s = await getShopSettings();
  const tel = s.phone?.replace(/\s+/g, "");

  return (
    <div className={`${css.wrap} ${css.page}`}>
      <header className={css.pageHead}>
        <nav aria-label="Omrvinky">
          <ol className={css.crumbs}>
            <li>
              <Link href="/">Domov</Link>
            </li>
            <li aria-current="page">Kontakt</li>
          </ol>
        </nav>
        <h1 className={css.pageTitle}>Kontakt</h1>
        <p className={css.pageLede}>
          Royal Shop prevádzkuje {s.companyName}, požičovňa stavebných strojov v Boldogu pri Senci. Objednaný stroj si
          môžete vyzdvihnúť priamo u nás, otestovaný a pripravený na prácu.
        </p>
      </header>

      <div className={css.contactGrid}>
        <ul className={css.contactCards}>
          {s.phone && (
            <li className={css.contactCard}>
              <Phone size={24} aria-hidden="true" />
              <div>
                <p className={css.contactLabel}>Telefón</p>
                <a href={`tel:${tel}`} className={css.contactBig}>
                  {s.phone}
                </a>
                {s.pickupHours && <p>{s.pickupHours}</p>}
              </div>
            </li>
          )}
          {s.email && (
            <li className={css.contactCard}>
              <Mail size={24} aria-hidden="true" />
              <div>
                <p className={css.contactLabel}>E-mail</p>
                <a href={`mailto:${s.email}`} className={css.contactBig}>
                  {s.email}
                </a>
                <p>Otázky k strojom, objednávkam aj cenové ponuky</p>
              </div>
            </li>
          )}
          {s.pickupAddress && (
            <li className={`${css.contactCard} ${css.contactCardHot}`}>
              <Store size={24} aria-hidden="true" />
              <div>
                <p className={css.contactLabel}>Osobný odber</p>
                <p className={css.contactStrong}>{s.pickupAddress}</p>
                {s.pickupHours && (
                  <p className={css.contactHours}>
                    <Clock size={16} aria-hidden="true" /> {s.pickupHours}
                  </p>
                )}
                <p>Zdarma. Ozveme sa vám, keď bude stroj otestovaný a pripravený na vyzdvihnutie.</p>
              </div>
            </li>
          )}
          <li className={css.contactCard}>
            <Building2 size={24} aria-hidden="true" />
            <div>
              <p className={css.contactLabel}>Prevádzkovateľ</p>
              <address className={css.contactAddress}>
                <strong>{s.companyName}</strong>
                <br />
                {[s.street, [s.zip, s.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                <br />
                IČO: {s.ico ?? "[doplniť]"} · DIČ: {s.dic ?? "[doplniť]"}
                <br />
                IČ DPH: {s.icDph ?? "[doplniť]"}
                {s.registerInfo && (
                  <>
                    <br />
                    {s.registerInfo}
                  </>
                )}
              </address>
            </div>
          </li>
        </ul>

        <figure className={css.contactPhoto}>
          <Image
            src="/kontakt/pozicovna.webp"
            alt="Požičovňa Royal Stroje: hala s logom, minibager JCB a nakladač Avant na dvore"
            width={1600}
            height={1335}
            sizes="(max-width: 1023px) 100vw, 50vw"
            preload
          />
          <figcaption>Požičovňa a výdajné miesto Royal Stroje, Recká cesta 182, Boldog</figcaption>
        </figure>
      </div>

      <section className={css.contactSection} aria-labelledby="map-title">
        <div className={css.sectionHead}>
          <span className={css.tape}>Mapa</span>
          <h2 id="map-title" className={css.h2}>
            Kde nás nájdete
          </h2>
        </div>
        <div className={css.mapGrid}>
          <MapEmbed src={EMBED_URL} title="Mapa: výdajné miesto Royal Stroje, Recká cesta 182, Boldog" />
          <div className={css.mapInfo}>
            <p className={css.contactLabel}>Výdajné miesto</p>
            <p className={css.mapAddress}>
              Recká cesta 182
              <br />
              925 26 Boldog
            </p>
            <p>Pri Senci, areál požičovne Royal Stroje.</p>
            {s.pickupHours && (
              <p className={css.contactHours}>
                <Clock size={16} aria-hidden="true" /> {s.pickupHours}
              </p>
            )}
            <div className={css.mapActions}>
              <a href={PICKUP.mapsUrl} target="_blank" rel="noopener noreferrer" className={css.mapBtn}>
                Otvoriť v Google Maps <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className={css.mapLink}>
                <Navigation size={18} aria-hidden="true" /> Navigovať
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={css.contactSection} aria-labelledby="gallery-title">
        <div className={css.sectionHead}>
          <span className={css.tape}>Galéria</span>
          <h2 id="gallery-title" className={css.h2}>
            Požičovňa a predajňa
          </h2>
        </div>
        <ul className={css.gallery}>
          {GALLERY.map((g) => (
            <li key={g.src}>
              <Image src={g.src} alt={g.alt} width={g.width} height={g.height} sizes="(max-width: 639px) 100vw, 50vw" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
