import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getShopSettings } from "@/lib/catalog";
import { RETURN_COST_ESTIMATES } from "@/lib/legal";
import { formatEur } from "@/lib/money";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomer } from "@/lib/account/auth";
import { getProfile } from "@/lib/account/data";
import { prefillFromToken } from "@/lib/returns-server";
import { LegalNote, LegalPage, LegalSection } from "@/components/shop/legal-page";
import { WithdrawalForm } from "@/components/shop/withdrawal-form";

export const metadata: Metadata = {
  title: "Odstúpenie od zmluvy",
  description:
    "Poučenie o práve spotrebiteľa odstúpiť od zmluvy do 14 dní, ako si stroj vyskúšať, ako ho vrátiť, náklady na vrátenie a vzorový formulár.",
};

const WITHDRAWAL_PATH = "/odstupenie-od-zmluvy";
const MAIL_SUBJECT = "Odstúpenie od zmluvy – objednávka č. …";

const TOC = [
  { id: "kto", label: "1. Kto môže odstúpiť" },
  { id: "poucenie", label: "2. Poučenie o odstúpení od zmluvy" },
  { id: "vyskusanie", label: "3. Ako si stroj vyskúšať" },
  { id: "znizenie-hodnoty", label: "4. Zníženie hodnoty stroja" },
  { id: "vratenie-stroja", label: "5. Ako stroj vrátiť" },
  { id: "vratenie-penazi", label: "6. Vrátenie peňazí" },
  { id: "formular", label: "7. Odstúpiť od zmluvy tu" },
  { id: "vzorovy-formular", label: "8. Vzorový formulár" },
];

const TEST_OK = [
  "rozbalenie, prehliadka stroja, kontrola príslušenstva, štítkov a výrobného čísla",
  "doplnenie oleja a paliva podľa návodu",
  "krátke naštartovanie motora a chod naprázdno (najviac približne 10 minút), overenie otáčok a vypnutia",
  "krátke zapnutie vibrácie (najviac približne 2 minúty) na čistej, pevnej a rovnej podložke",
  "krátka skúška elektrocentrály s malou záťažou, napríklad pripojeným náradím",
  "krátke nasatie čistej vody čerpadlom",
  "overenie ovládacích prvkov",
];

const TEST_BEYOND = [
  "hutnenie reálnej plochy (zemina, štrk, piesok, dlažba), práca na stavbe",
  "rezanie betónu, asfaltu, kameňa alebo dlažby, aj jeden skúšobný rez do reálneho materiálu",
  "ponorenie vibrátora do betónu",
  "čerpanie kalnej vody, kalu alebo vody s nečistotami",
  "napájanie stavby alebo iná dlhšia prevádzka elektrocentrály",
  "chod motora v trvaní niekoľkých hodín",
  "zmeny nastavení, demontáž, zásahy do motora alebo konštrukcie, odstránenie plomb",
];

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// Prefill: the order's secret link (?objednavka=…&t=… from the order page or the portal), else the signed-in
// customer's name and e-mail. Request data, so it streams in under Suspense; the rest of the page is static.
async function PrefilledWithdrawalForm({ searchParams }: { searchParams: PageProps<"/odstupenie-od-zmluvy">["searchParams"] }) {
  const sp = await searchParams;
  const number = first(sp.objednavka).slice(0, 30);
  const token = first(sp.t);
  const fromOrder = number && token ? await prefillFromToken(createAdminClient(), number, token) : null;
  if (fromOrder) return <WithdrawalForm initial={fromOrder} />;
  const customer = await getCustomer();
  const profile = customer ? await getProfile(customer.id) : null;
  const name = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") : "";
  return <WithdrawalForm initial={{ orderNumber: number, name, email: profile?.email ?? "" }} />;
}

export default async function WithdrawalPage({ searchParams }: PageProps<"/odstupenie-od-zmluvy">) {
  const s = await getShopSettings();
  const sellerAddress = [s.street, [s.zip, s.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const returnAddress = s.pickupAddress ?? sellerAddress;
  const mailHref = s.email ? `mailto:${s.email}?subject=${encodeURIComponent(MAIL_SUBJECT)}` : null;
  const email = s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : "[e-mail]";

  return (
    <LegalPage
      title="Odstúpenie od zmluvy"
      lede="Ak ste stroj kúpili ako spotrebiteľ, môžete od zmluvy odstúpiť do 14 dní od prevzatia bez udania dôvodu. Tu nájdete zákonné poučenie, praktické rady, ako si stroj vyskúšať a ako ho vrátiť, a vzorový formulár."
      toc={TOC}
      current={WITHDRAWAL_PATH}
    >
      <LegalSection id="kto" title="1. Kto môže odstúpiť od zmluvy">
        <p>
          Právo odstúpiť od zmluvy bez uvedenia dôvodu má kupujúci, ktorý je <strong>spotrebiteľom</strong>, teda
          fyzická osoba, ktorá pri kúpe nekoná v rámci svojej podnikateľskej činnosti alebo povolania (§ 19 a nasl.
          zákona č. 108/2024 Z. z. o ochrane spotrebiteľa) a uzavrel zmluvu <strong>na diaľku</strong>, napríklad
          zaplatením cez odkaz na stránke objednávky. Platí to aj vtedy, ak ste si takto kúpený stroj vyzdvihli osobne
          na výdajnom mieste.
        </p>
        <p>
          Ak ste stroj po nezáväznej rezervácii <strong>kúpili osobne v našej predajni</strong> (kúpnu zmluvu ste
          podpísali a zaplatili na mieste), nejde o zmluvu uzavretú na diaľku a zákonné právo na odstúpenie do 14 dní
          sa na ňu nevzťahuje. Pred kúpou si stroj môžete v predajni pozrieť a vyskúšať. Práva pri vade stroja
          (reklamácia) máte v oboch prípadoch rovnaké.
        </p>
        <p>
          Kupujúci, ktorý nakupuje ako <strong>podnikateľ</strong> (najmä obchodná spoločnosť alebo živnostník na IČO
          pre svoje podnikanie), zákonné právo na odstúpenie nemá. Nepoužitý stroj nám môže vrátiť len po
          predchádzajúcej dohode podľa našej dobrovoľnej politiky vrátenia pre podnikateľov, ktorú nájdete
          v <Link href="/obchodne-podmienky">obchodných podmienkach</Link>.
        </p>
        <p>
          Odstúpiť nemožno od zmluvy o dodaní tovaru vyrobeného podľa špecifikácií spotrebiteľa alebo na mieru
          (§ 19 ods. 1 písm. c) zákona č. 108/2024 Z. z.), napríklad stroja s individuálnou úpravou mimo našej
          štandardnej ponuky. Na takú výnimku vás vždy výslovne upozorníme pred uzavretím zmluvy. Výber stroja alebo
          jeho variantu z našej ponuky výnimkou nie je, aj keď stroj objednávame u dodávateľa až na základe vašej
          objednávky.
        </p>
        <p>
          Odstúpenie od zmluvy nie je reklamácia. Ak má stroj vadu, postupujte podľa{" "}
          <Link href="/reklamacny-poriadok">reklamačného poriadku</Link>.
        </p>
      </LegalSection>

      <LegalSection id="poucenie" title="2. Poučenie o uplatnení práva spotrebiteľa na odstúpenie od zmluvy">
        <p>
          <strong>
            Poučenie o uplatnení práva spotrebiteľa na odstúpenie od zmluvy uzavretej na diaľku
          </strong>
        </p>

        <h3>1. Právo na odstúpenie od zmluvy</h3>
        <p>Máte právo odstúpiť od tejto zmluvy bez uvedenia dôvodu v lehote 14 dní.</p>
        <p>
          Lehota na odstúpenie od zmluvy uplynie po 14 dňoch odo dňa, keď Vy alebo Vami určená tretia osoba okrem
          dopravcu prevezmete tovar. Ak ste si v jednej objednávke objednali viac tovarov, ktoré sa dodávajú
          oddelene, lehota uplynie po 14 dňoch odo dňa, keď Vy alebo Vami určená tretia osoba okrem dopravcu
          prevezmete tovar, ktorý bol dodaný ako posledný. Ak sa dodáva tovar pozostávajúci z viacerých častí,
          lehota uplynie po 14 dňoch odo dňa, keď Vy alebo Vami určená tretia osoba okrem dopravcu prevezmete
          poslednú časť tovaru.
        </p>
        <p>
          Pri uplatnení práva na odstúpenie od zmluvy nás informujte o svojom rozhodnutí odstúpiť od tejto zmluvy
          jednoznačným vyhlásením (napríklad listom zaslaným poštou alebo e-mailom) na adrese: {s.companyName},{" "}
          {sellerAddress}
          {s.phone ? `, tel. ${s.phone}` : ""}, e-mail: {email}. Na tento účel môžete použiť{" "}
          <a href="#vzorovy-formular">vzorový formulár na odstúpenie od zmluvy</a>, ktorý sme Vám odovzdali alebo
          zaslali, jeho použitie však nie je povinné.
        </p>
        <p>
          Právo na odstúpenie od zmluvy môžete uplatniť aj online na adrese{" "}
          <Link href={`${WITHDRAWAL_PATH}#formular`}>{WITHDRAWAL_PATH}#formular</Link> (časť „Odstúpiť od zmluvy
          tu“ na tejto stránke e-shopu, odkaz nájdete v pätičke každej stránky a pri objednávke vo Vašom účte). Ak využijete túto možnosť, potvrdenie o doručení odstúpenia od
          zmluvy vrátane jeho obsahu, dátumu a času jeho odoslania Vám bezodkladne poskytneme na trvanlivom médiu
          (napríklad e-mailom).
        </p>
        <p>
          Lehota na odstúpenie od zmluvy je zachovaná, ak zašlete oznámenie o uplatnení práva na odstúpenie od
          zmluvy pred tým, ako uplynie lehota na odstúpenie od zmluvy.
        </p>

        <h3>2. Dôsledky odstúpenia od zmluvy</h3>
        <p>
          Po odstúpení od zmluvy Vám vrátime všetky platby, ktoré ste uhradili v súvislosti s uzavretím zmluvy,
          vrátane nákladov na doručenie tovaru k Vám. To sa nevzťahuje na dodatočné náklady, ak ste si zvolili iný
          druh doručenia, ako je najlacnejší bežný spôsob doručenia, ktorý ponúkame. Platby Vám budú vrátené
          najneskôr do 14 dní odo dňa, keď nám bude doručené Vaše oznámenie o odstúpení od tejto zmluvy. Úhrada
          bude uskutočnená rovnakým spôsobom, aký ste použili pri Vašej platbe, ak ste výslovne nesúhlasili s iným
          spôsobom úhrady, a to bez účtovania akýchkoľvek ďalších poplatkov.
        </p>
        <p>
          S vrátením platby môžeme čakať do vrátenia tovaru späť na našu adresu alebo do preukázania, že ste tovar
          odoslali späť, podľa toho, čo nastane skôr.
        </p>
        <p>
          Zašlite nám tovar späť alebo ho prineste na našu adresu {s.companyName}, výdajné miesto {returnAddress}{" "}
          najneskôr do 14 dní odo dňa uplatnenia práva na odstúpenie od zmluvy. Lehota sa považuje za zachovanú, ak
          tovar odošlete späť pred uplynutím 14-dňovej lehoty.
        </p>
        <p>
          Priame náklady na vrátenie tovaru znášate Vy. Tovar, ktorý vzhľadom na jeho hmotnosť nemožno vrátiť poštou
          ani bežnou balíkovou zásielkou, je potrebné vrátiť paletovou prepravou. Predpokladaný odhad týchto
          nákladov je podľa hmotnosti tovaru:
        </p>
        <table>
          <caption>Predpokladaný odhad priamych nákladov na vrátenie tovaru</caption>
          <thead>
            <tr>
              <th scope="col">Hmotnosť tovaru</th>
              <th scope="col">Predpokladaný odhad nákladov</th>
            </tr>
          </thead>
          <tbody>
            {RETURN_COST_ESTIMATES.map((r) => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td>najviac {formatEur(r.maxCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Predpokladaný odhad pre konkrétny tovar je uvedený aj pri tovare v e-shope a v potvrdení objednávky.
        </p>
        <p>
          Zodpovedáte len za akékoľvek zníženie hodnoty tovaru v dôsledku zaobchádzania s ním iným spôsobom, aký je
          potrebný na zistenie povahy, vlastností a funkčnosti tovaru.
        </p>
      </LegalSection>

      <LegalSection id="vyskusanie" title="3. Ako si stroj vyskúšať, aby ste nestratili peniaze">
        <p>
          Stroj si môžete prezrieť a vyskúšať tak, ako by ste si ho mohli vyskúšať u nás na predvádzacej ploche.
          Stačí to na zistenie, či je kompletný, či naštartuje a či funguje. Reálna práca so strojom už je nad
          rámec vyskúšania a môže znížiť jeho hodnotu, pretože po nej stroj nemožno predať ako nový.
        </p>
        <LegalNote>
          <p>
            <strong>Nie je to podmienka odstúpenia.</strong> Od zmluvy môžete odstúpiť vždy, aj keď ste stroj
            používali. Nasledujúce rady vám majú pomôcť vyhnúť sa tomu, aby ste nám museli platiť náhradu za
            zníženie hodnoty stroja (časť 4).
          </p>
        </LegalNote>
        <p>Odporúčaný postup skúšky:</p>
        <ol>
          <li>Stroj rozbaľte, prezrite a skontrolujte príslušenstvo. Prečítajte si návod.</li>
          <li>Doplňte olej a palivo podľa návodu.</li>
          <li>Motor krátko naštartujte a nechajte bežať naprázdno, najviac približne 10 minút.</li>
          <li>Vibráciu alebo pracovnú funkciu zapnite najviac na približne 2 minúty na čistej pevnej podložke.</li>
          <li>Nerežte ani nehutnite reálny materiál a vibrátor neponárajte do betónu.</li>
        </ol>
        <table>
          <caption>Čo zvyčajne zodpovedá vyskúšaniu a čo je už nad jeho rámec</caption>
          <thead>
            <tr>
              <th scope="col">V rámci vyskúšania</th>
              <th scope="col">Nad rámec vyskúšania</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(TEST_OK.length, TEST_BEYOND.length) }, (_, i) => (
              <tr key={i}>
                <td>{TEST_OK[i] ?? ""}</td>
                <td>{TEST_BEYOND[i] ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Ak si stroj vyzdvihnete osobne, vyskúšame ho spolu s vami pri odovzdaní a bezplatne vás zaškolíme.
          Funkčnosť stroja si tak overíte priamo u nás.
        </p>
      </LegalSection>

      <LegalSection id="znizenie-hodnoty" title="4. Zníženie hodnoty stroja">
        <p>
          Ak so strojom zaobchádzate nad rámec toho, čo je potrebné na zistenie jeho povahy, vlastností
          a funkčnosti, zodpovedáte za zníženie jeho hodnoty (§ 21 ods. 4 zákona č. 108/2024 Z. z.). Zníženie
          hodnoty môžu tvoriť najmä primerané náklady na čistenie a opravu, výmenu opotrebovaných dielov (napríklad
          spodnej dosky, diamantového kotúča, filtrov alebo oleja) a objektívne odôvodnený rozdiel medzi cenou
          nového stroja a cenou, za ktorú ho môžeme predať ako použitý. Pri stroji, ktorý bol reálne používaný alebo
          poškodený, to môže byť aj vysoká suma.
        </p>
        <p>Postupujeme takto:</p>
        <ul>
          <li>
            Každý stroj pred odoslaním vybalíme, skontrolujeme a krátko vyskúšame. Jeho stav (výrobné číslo, stav
            počítadla motohodín, ak ho stroj má, fotografie, záznam zo skúšobného chodu) zaznamenáme do protokolu,
            ktorého kópiu dostanete.
          </li>
          <li>
            Rovnako zdokumentujeme stav vráteného stroja pri jeho prevzatí. Odporúčame, aby ste si aj vy pred
            odoslaním stroj odfotili alebo natočili vrátane počítadla motohodín. Dokumentácia na oboch stranách
            predchádza sporom.
          </li>
          <li>
            Aj keď zistíme zníženie hodnoty, vrátime vám platby v plnej výške v lehote podľa časti 6. Nič si z nich
            sami neodpočítame (jednostranné započítanie zákon zakazuje, § 22 ods. 8 zákona č. 108/2024 Z. z.).
          </li>
          <li>
            Nárok na náhradu zníženia hodnoty vám oznámime samostatne a písomne, s vyčíslením a podkladmi
            (porovnanie s protokolom pred odoslaním, fotografie, cena opravy). Môžete sa k nemu vyjadriť; ak sa
            nedohodneme, môžete využiť aj mimosúdne riešenie sporu podľa{" "}
            <Link href="/reklamacny-poriadok#riesenie-sporov">reklamačného poriadku</Link>.
          </li>
        </ul>
        <p>Za samotné otvorenie obalu ani za bežné vyskúšanie stroja od vás nič nepožadujeme.</p>
      </LegalSection>

      <LegalSection id="vratenie-stroja" title="5. Ako stroj vrátiť">
        <p>
          Stroj nám pošlite alebo ho prineste na výdajné miesto {returnAddress}
          {s.pickupHours ? ` (${s.pickupHours})` : ""} najneskôr do 14 dní odo dňa, keď ste odstúpili od zmluvy.
          Lehota je zachovaná, ak stroj v posledný deň lehoty odošlete.
        </p>
        <ul>
          <li>
            <strong>Vypustite palivo z nádrže</strong> stroja so spaľovacím motorom (olej v motore ponechajte)
            a zabezpečte stroj proti úniku kvapalín. Stroj s palivom je pri preprave nebezpečný tovar a dopravcovia
            ho spravidla neprevezmú.
          </li>
          <li>
            Ťažší stroj pevne upevnite na paletu, aby sa pri preprave nepoškodil. Pri drahšom stroji odporúčame
            zásielku pripoistiť.
          </li>
          <li>
            Odporúčame vrátiť stroj kompletný, s príslušenstvom, návodom a dokladmi, pokiaľ možno v pôvodnom obale.
            Je to odporúčanie, nie podmienka odstúpenia.
          </li>
          <li>
            Ak chcete, na vašu žiadosť vám sprostredkujeme odvoz stroja naším zmluvným dopravcom. Prepravu v takom
            prípade platíte vy, najviac vo výške predpokladaného odhadu podľa časti 2.
          </li>
        </ul>
        <p>Priame náklady na vrátenie stroja znášate vy. Odhad podľa hmotnosti stroja nájdete v časti 2.</p>
      </LegalSection>

      <LegalSection id="vratenie-penazi" title="6. Vrátenie peňazí">
        <ul>
          <li>
            Všetky platby vrátane nákladov na doručenie vám vrátime najneskôr do 14 dní odo dňa, keď nám bude
            doručené oznámenie o odstúpení. Nevraciame len dodatočné náklady, ak ste si zvolili iný ako najlacnejší
            bežný spôsob doručenia, ktorý ponúkame.
          </li>
          <li>
            Peniaze vrátime rovnakým spôsobom, akým ste platili (pri platbe kartou, Apple Pay alebo Google Pay na
            tú istú kartu), bez akýchkoľvek poplatkov. Iným spôsobom len vtedy, ak s tým výslovne súhlasíte.
          </li>
          <li>
            S vrátením platby môžeme počkať, kým nám stroj príde späť alebo kým nám preukážete, že ste ho odoslali
            (napríklad potvrdením dopravcu), podľa toho, čo nastane skôr.
          </li>
          <li>
            Ak odstúpite len od časti objednávky, vrátime platby v rozsahu zodpovedajúcom odstúpeniu.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="formular" title="7. Odstúpiť od zmluvy tu">
        <p>
          Od zmluvy môžete odstúpiť priamo tu, aj bez prihlásenia. Vyplňte meno a priezvisko, číslo objednávky
          a e-mail, ktorý ste zadali pri objednávke. Dôvod uvádzať nemusíte. V druhom kroku uvidíte presné znenie
          odstúpenia a odošlete ho tlačidlom „Potvrdiť odstúpenie od zmluvy“. Hneď potom zobrazíme potvrdenie
          s obsahom odstúpenia, dátumom a časom odoslania, ktoré si môžete uložiť alebo vytlačiť.
        </p>
        <Suspense fallback={<WithdrawalForm />}>
          <PrefilledWithdrawalForm searchParams={searchParams} />
        </Suspense>
        <p>
          Odstúpiť môžete aj inak, vyplneným <a href="#vzorovy-formular">vzorovým formulárom</a> alebo akýmkoľvek
          jednoznačným vyhlásením, že od zmluvy odstupujete:
        </p>
        <ul>
          <li>
            e-mailom na {mailHref ? <a href={mailHref}>{s.email}</a> : "[e-mail]"} s predmetom „{MAIL_SUBJECT}“,
            alebo
          </li>
          <li>
            listom na adresu {s.companyName}, {sellerAddress}.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="vzorovy-formular" title="8. Vzorový formulár na odstúpenie od zmluvy">
        <blockquote>
          <p>
            <strong>
              VZOROVÝ FORMULÁR NA ODSTÚPENIE OD ZMLUVY UZAVRETEJ NA DIAĽKU A ZMLUVY UZAVRETEJ MIMO PREVÁDZKOVÝCH
              PRIESTOROV OBCHODNÍKA
            </strong>
          </p>
          <p>
            (Vyplňte a zašlite tento formulár, len ak si želáte odstúpiť od zmluvy uzavretej na diaľku alebo od
            zmluvy uzavretej mimo prevádzkových priestorov obchodníka.)
          </p>
          <p>
            – Komu: {s.companyName}, {sellerAddress}, e-mail: {s.email ?? "[e-mail]"}
          </p>
          <p>
            – Týmto oznamujem/oznamujeme*, že odstupujem/odstupujeme* od zmluvy o dodaní alebo poskytnutí tohto
            produktu: ..............
          </p>
          <p>– Dátum objednania/dátum prijatia* ..............</p>
          <p>– Meno a priezvisko spotrebiteľa/spotrebiteľov* ..............</p>
          <p>– Adresa spotrebiteľa/spotrebiteľov* ..............</p>
          <p>
            – Podpis spotrebiteľa/spotrebiteľov* (ak sa tento formulár podáva v listinnej podobe) ..............
          </p>
          <p>– Dátum ..............</p>
          <p>* Nehodiace sa prečiarknite.</p>
        </blockquote>
      </LegalSection>
    </LegalPage>
  );
}
