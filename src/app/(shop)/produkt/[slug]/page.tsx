import { Fragment, Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowUpRight, BatteryCharging, Check, Factory, FileText, Mail, Phone, ShieldCheck, Store, Truck } from "lucide-react";
import {
  getCategoryContext,
  getProduct,
  getProductSlugs,
  getShopSettings,
  type ProductDetail,
  type ShopSettings,
} from "@/lib/catalog";
import { deliveryDays, formatDeliveryDate, formatSpecValue, PLATFORM_LABEL, workDaysText } from "@/lib/format";
import { formatEur, netFromGross } from "@/lib/money";
import { discountPct, referencePrice } from "@/lib/pricing";
import { estimateDelivery, rateFor, shippingPrice } from "@/lib/shipping";
import { Gallery } from "@/components/shop/gallery";
import { BuyBox } from "@/components/shop/buy-box";
import { ProductGrid } from "@/components/shop/product-card";
import css from "@/components/shop/shop.module.css";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/produkt/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Produkt nenájdený" };
  return {
    title: p.seoTitle ?? p.name,
    description: p.seoDescription ?? p.shortDescription ?? undefined,
    openGraph: p.image ? { images: [{ url: p.image.path }] } : undefined,
  };
}

// Descriptions are stored as light markdown: blank-line paragraphs and **bold**.
function RichText({ text }: { text: string }) {
  return text
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para, i) => (
      <p key={i}>
        {para
          .split(/(\*\*[^*]+\*\*)/g)
          .map((part, j): ReactNode =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            ),
          )}
      </p>
    ));
}

// Depends on today's date, so it renders per request inside its own Suspense boundary.
async function DeliveryEstimate({ product, settings }: { product: ProductDetail; settings: ShopSettings }) {
  await connection();
  const { handlingDays } = settings;
  const lead = [product.leadDays.max];
  const pickup = formatDeliveryDate(estimateDelivery(lead, handlingDays, "pickup_senec"));
  const delivered = formatDeliveryDate(estimateDelivery(lead, handlingDays, "courier"), "acc");
  // Price for this product alone; in the cart the band follows the weight of the whole order.
  const rate = rateFor(product.weightKg, settings.shippingRates);
  const shipping = shippingPrice("courier", product.priceGrossCents, product.weightKg, {
    rates: settings.shippingRates,
    freeShippingThresholdCents: settings.freeShippingThresholdCents,
  });
  return (
    <ul className={css.delivery}>
      {product.shippingClass !== "pickup_only" && (
        <li>
          <Truck size={20} aria-hidden="true" />
          <span>
            <strong>Doručíme na adresu predpokladane v {delivered}</strong>
            doprava {shipping === 0 ? "zdarma" : formatEur(shipping)} ({rate.name}) · pri objednávke dnes, vrátane testu
            pred odoslaním
          </span>
        </li>
      )}
      <li>
        <Store size={20} aria-hidden="true" />
        <span>
          <strong>Osobný odber v predajni — {pickup}</strong>
          zdarma, po otestovaní pripravíme na pobočke
        </span>
      </li>
    </ul>
  );
}

function DeliveryFallback({ product, handlingDays }: { product: ProductDetail; handlingDays: number }) {
  const days = deliveryDays(product.leadDays, handlingDays);
  return (
    <ul className={css.delivery}>
      <li>
        <Truck size={20} aria-hidden="true" />
        <span>
          <strong>Doručenie {workDaysText(days.min, days.max)}</strong>
          vrátane testu pred odoslaním
        </span>
      </li>
    </ul>
  );
}

// Replaces the buy box for "cena na požiadanie" products: the customer calls or writes instead.
function PriceRequest({ product, phone, email }: { product: ProductDetail; phone: string | null; email: string | null }) {
  const subject = encodeURIComponent(`Cena: ${product.name}${product.sku ? ` (${product.sku})` : ""}`);
  return (
    <div className={css.buyBox}>
      <div className={css.buyRow}>
        {phone && (
          <a href={`tel:${phone.replace(/\s+/g, "")}`} className={css.addBig}>
            <Phone size={22} aria-hidden="true" /> Zavolať
          </a>
        )}
        {email && (
          <a href={`mailto:${email}?subject=${subject}`} className={css.askPrice}>
            <Mail size={20} aria-hidden="true" /> Napísať e-mail
          </a>
        )}
      </div>
      {phone && <p className={css.buyTotal}>{phone}{email && <span> · {email}</span>}</p>}
    </div>
  );
}

async function ProductView({ params }: Pick<PageProps<"/produkt/[slug]">, "params">) {
  const { slug } = await params;
  const [p, settings] = await Promise.all([getProduct(slug), getShopSettings()]);
  if (!p) notFound();
  const ctx = await getCategoryContext(p.category.slug);

  const off = discountPct(p);
  const ref = referencePrice(p);
  const keySpecs = p.specs.filter((s) => s.key !== "brushless").slice(0, 4);
  const cartItem = {
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    priceGrossCents: p.priceGrossCents,
    image: p.image?.path ?? null,
  };
  const specRows: { label: string; value: string }[] = [
    { label: "Značka", value: p.brand.name },
    ...(p.sku ? [{ label: "Kód výrobcu", value: p.sku }] : []),
    ...(p.ean ? [{ label: "EAN", value: p.ean }] : []),
    ...(p.batteryPlatform !== "none"
      ? [
          { label: "Napájanie", value: `Akumulátor ${PLATFORM_LABEL[p.batteryPlatform]}` },
          { label: "Výbava", value: p.isKit ? "Sada s batériami a nabíjačkou" : "Bez batérie a nabíjačky (solo)" },
        ]
      : []),
    ...p.specs.map((s) => ({ label: s.label, value: formatSpecValue(s.value, s.unit) })),
    ...(p.weightKg ? [{ label: "Hmotnosť balenia", value: formatSpecValue(String(p.weightKg), "kg") }] : []),
  ];

  return (
    <>
      <section className={css.pdp} aria-labelledby="pdp-title">
        <div className={css.wrap}>
          <div className={css.pdpTop}>
            <nav aria-label="Omrvinky">
              <ol className={css.crumbs}>
                <li>
                  <Link href="/">Domov</Link>
                </li>
                {ctx &&
                  [...ctx.ancestors, ctx.category].map((c) => (
                    <li key={c.slug}>
                      <Link href={`/kategoria/${c.slug}`}>{c.name}</Link>
                    </li>
                  ))}
                <li aria-current="page">{p.sku ?? p.name}</li>
              </ol>
            </nav>
          </div>

          <div className={css.pdpGrid}>
            <Gallery images={p.images} name={p.name} sku={p.sku} categorySlug={p.category.slug} />

            <div className={css.buyCol}>
              <div className={css.pdpMeta}>
                <span className={css.brand}>{p.brand.name}</span>
                {p.batteryPlatform !== "none" && (
                  <span className={p.batteryPlatform === "XGT_40V" ? css.chipXgt : css.chipLxt}>
                    <BatteryCharging size={13} aria-hidden="true" />
                    {PLATFORM_LABEL[p.batteryPlatform]}
                  </span>
                )}
                {p.isKit && <span className={css.chipKit}>Sada s batériami</span>}
                {off > 0 && <span className={css.tapeHi}>Akcia −{off} %</span>}
              </div>
              <h1 id="pdp-title" className={css.pdpTitle}>
                {p.name}
              </h1>
              {(p.sku || p.ean) && (
                <dl className={css.ids}>
                  {p.sku && (
                    <div>
                      <dt>Kód</dt>
                      <dd>{p.sku}</dd>
                    </div>
                  )}
                  {p.ean && (
                    <div>
                      <dt>EAN</dt>
                      <dd>{p.ean}</dd>
                    </div>
                  )}
                </dl>
              )}
              {p.shortDescription && <p className={css.pdpLede}>{p.shortDescription}</p>}

              {keySpecs.length > 0 && (
                <ul className={css.keySpecs}>
                  {keySpecs.map((s) => (
                    <li key={s.key}>
                      <span>{s.label}</span>
                      <strong>{formatSpecValue(s.value, s.unit)}</strong>
                    </li>
                  ))}
                </ul>
              )}

              {p.priceOnRequest ? (
                <div className={css.priceBox}>
                  <p className={css.pdpPriceAsk}>Cena na požiadanie</p>
                  <p className={css.pdpNet}>
                    <span>Aktuálnu cenu a dostupnosť vám radi povieme telefonicky alebo e-mailom.</span>
                  </p>
                </div>
              ) : (
                <div className={css.priceBox}>
                  <p className={css.pdpPrice}>
                    {formatEur(p.priceGrossCents)} <span className={css.vat}>s DPH</span>
                  </p>
                  <p className={css.pdpNet}>
                    {formatEur(netFromGross(p.priceGrossCents, p.vatRate))} <span>bez DPH · cena za 1 ks</span>
                  </p>
                  {ref && (
                    <p className={css.omnibus}>
                      Najnižšia cena za posledných 30 dní pred zľavou: <strong>{formatEur(ref)}</strong> · zľava {off} %
                    </p>
                  )}
                </div>
              )}

              <Suspense fallback={<DeliveryFallback product={p} handlingDays={settings.handlingDays} />}>
                <DeliveryEstimate product={p} settings={settings} />
              </Suspense>

              {p.priceOnRequest ? (
                <PriceRequest product={p} phone={settings.phone} email={settings.email} />
              ) : (
                <BuyBox item={cartItem} />
              )}

              <div className={`${css.testNote} ${css.dark}`}>
                <span className={css.testStamp} aria-hidden="true">
                  <Check size={26} strokeWidth={3} />
                </span>
                <div>
                  <p className={css.testTitle}>Otestujeme pred odoslaním</p>
                  <p>
                    Stroj pred zabalením spustíme, overíme všetky funkcie a do balenia priložíme podpísaný kontrolný
                    protokol so sériovým číslom.
                  </p>
                </div>
              </div>

              <div className={css.warranty}>
                <ShieldCheck size={22} aria-hidden="true" />
                <div>
                  <p>
                    <strong>Záruka {p.warrantyMonths} mesiacov</strong> · vrátenie do 14 dní od prevzatia
                    (spotrebitelia)
                  </p>
                  {p.manufacturerWarrantyNote && (
                    <details className={css.warrantyMore}>
                      <summary>Predĺžená záruka výrobcu</summary>
                      <p>{p.manufacturerWarrantyNote}</p>
                    </details>
                  )}
                </div>
              </div>

              <div className={css.pdpServices}>
                <p className={css.pdpServicesTitle}>
                  <Store size={18} aria-hidden="true" /> Zadarmo v predajni pri Senci
                </p>
                <ul>
                  {["Vysvetlenie stroja a poradenstvo", "Zaškolenie na obsluhu", "Odskúšanie pred kúpou"].map((service) => (
                    <li key={service}>
                      <Check size={16} strokeWidth={3} aria-hidden="true" /> {service}
                    </li>
                  ))}
                </ul>
              </div>

              {p.rentalUrl && (
                <a href={p.rentalUrl} className={css.rental} target="_blank" rel="noopener">
                  <span className={css.rentalEyebrow}>Royal Stroje · požičovňa</span>
                  <span className={css.rentalTitle}>Najprv vyskúšať?</span>
                  <span className={css.rentalText}>Tento stroj si môžete požičať v Royal Stroje v Boldogu pri Senci.</span>
                  <span className={css.rentalGo}>
                    Pozrieť prenájom <ArrowUpRight size={18} aria-hidden="true" />
                    <span className={css.srOnly}> (otvorí sa v novom okne)</span>
                  </span>
                </a>
              )}
            </div>
          </div>

          <div className={css.pdpLower}>
            <div className={css.pdpMain}>
              {p.description && (
                <section className={css.prose} aria-labelledby="pdp-desc">
                  <h2 id="pdp-desc" className={css.proseTitle}>
                    Popis
                  </h2>
                  <RichText text={p.description} />
                </section>
              )}
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
            </div>

            <aside className={css.gpsr} aria-labelledby="gpsr-title">
              <p id="gpsr-title" className={css.gpsrHead}>
                <Factory size={18} aria-hidden="true" /> Bezpečnosť výrobku · GPSR
              </p>
              <dl className={css.gpsrList}>
                {p.manufacturer.name && (
                  <div>
                    <dt>Výrobca</dt>
                    <dd>
                      {p.manufacturer.name}
                      {p.manufacturer.address && (
                        <>
                          <br />
                          {p.manufacturer.address}
                        </>
                      )}
                      {p.manufacturer.email && (
                        <>
                          <br />
                          <a href={`mailto:${p.manufacturer.email}`}>{p.manufacturer.email}</a>
                        </>
                      )}
                    </dd>
                  </div>
                )}
                {p.safetyInfo && (
                  <div>
                    <dt>Bezpečnostné upozornenia</dt>
                    <dd>{p.safetyInfo}</dd>
                  </div>
                )}
              </dl>
              {p.documents.length > 0 ? (
                p.documents.map((d) => (
                  <a key={d.path} href={d.path} className={css.gpsrLink}>
                    <FileText size={18} aria-hidden="true" /> {d.title}
                  </a>
                ))
              ) : (
                <p className={css.gpsrNote}>
                  <FileText size={18} aria-hidden="true" /> Návod a bezpečnostné pokyny v slovenčine sú súčasťou
                  balenia.
                </p>
              )}
            </aside>
          </div>
        </div>
      </section>

      {p.batteries.length > 0 && (
        <section className={css.section} aria-labelledby="batteries-title">
          <div className={css.wrap}>
            <div className={css.sectionHead}>
              <span className={css.tape}>Príslušenstvo</span>
              <h2 id="batteries-title" className={css.h2}>
                Kompatibilné batérie
              </h2>
            </div>
            <ProductGrid products={p.batteries} handlingDays={settings.handlingDays} />
          </div>
        </section>
      )}
    </>
  );
}

function ProductSkeleton() {
  return (
    <section className={css.pdp} aria-busy="true">
      <div className={css.wrap}>
        <div className={css.pdpGrid}>
          <div className={css.galleryMain} />
          <div className={css.buyCol}>
            <p className={css.resultCount}>Načítavam produkt…</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProductPage(props: PageProps<"/produkt/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductView params={props.params} />
    </Suspense>
  );
}
