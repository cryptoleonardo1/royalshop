import type { Metadata } from "next";
import Link from "next/link";
import { getShopSettings } from "@/lib/catalog";
import { formatEur } from "@/lib/money";
import { DELIVERY_MAX_WORKDAYS, RETURN_COST_ESTIMATES, UNAVAILABLE_REFUND_WORKDAYS } from "@/lib/legal";
import { LegalNote, LegalPage, LegalSection } from "@/components/shop/legal-page";

export const metadata: Metadata = {
  title: "Doprava a platba",
  description:
    "Doručenie stavebných strojov po celom Slovensku podľa hmotnosti objednávky, osobný odber v Boldogu zdarma, dodacia lehota a platba vopred kartou, Apple Pay alebo Google Pay.",
};

const TOC = [
  { id: "dorucenie", label: "Doručenie len na Slovensku" },
  { id: "cena-dopravy", label: "Cena dopravy" },
  { id: "dodacia-lehota", label: "Dodacia lehota" },
  { id: "osobny-odber", label: "Osobný odber" },
  { id: "tazke-stroje", label: "Preprava ťažkých strojov" },
  { id: "platba", label: "Platba" },
  { id: "vratenie", label: "Vrátenie tovaru – náklady" },
  { id: "spatny-zber", label: "Spätný zber elektroodpadu a batérií" },
];

export default async function ShippingPaymentPage() {
  const s = await getShopSettings();
  const contact = [s.email, s.phone].filter(Boolean).join(" alebo ");

  return (
    <LegalPage
      title="Doprava a platba"
      lede="Kam doručujeme, koľko stojí doprava, kedy stroj dostanete a ako sa platí. Všetky ceny sú vrátane DPH."
      toc={TOC}
      current="/doprava-a-platba"
    >
      <LegalSection id="dorucenie" title="1. Doručenie len na Slovensku">
        <p>
          Tovar doručujeme <strong>iba na adresy na území Slovenskej republiky</strong>. Nakúpiť u nás môže ktokoľvek,
          aj zákazník z iného štátu EÚ, ak si tovar nechá doručiť na adresu na Slovensku alebo si ho osobne vyzdvihne v
          Boldogu.
        </p>
      </LegalSection>

      <LegalSection id="cena-dopravy" title="2. Cena dopravy">
        <p>
          Cenu dopravy určujeme podľa <strong>celkovej hmotnosti objednávky</strong>, teda všetkých strojov v nej spolu.
          Platí rovnako pre celé Slovensko. Presnú sumu uvidíte v košíku a v pokladni ešte pred odoslaním objednávky.
        </p>
        <table>
          <thead>
            <tr>
              <th scope="col">Hmotnosť objednávky</th>
              <th scope="col">Cena dopravy s DPH</th>
            </tr>
          </thead>
          <tbody>
            {s.shippingRates.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{formatEur(r.priceCents)}</td>
              </tr>
            ))}
            <tr>
              <td>Osobný odber v Boldogu (akákoľvek hmotnosť)</td>
              <td>zdarma</td>
            </tr>
          </tbody>
        </table>
        {s.freeShippingThresholdCents != null ? (
          <p>
            Pri objednávke v hodnote od {formatEur(s.freeShippingThresholdCents)} vrátane DPH je doručenie na adresu
            zdarma.
          </p>
        ) : (
          <p>Dopravu zdarma od určitej sumy objednávky momentálne neponúkame. Osobný odber je vždy zdarma.</p>
        )}
      </LegalSection>

      <LegalSection id="dodacia-lehota" title="3. Dodacia lehota">
        <p>
          Stroje objednávame u dodávateľa až po vašej objednávke. Každý stroj pred odoslaním vybalíme, skontrolujeme
          kompletnosť, krátko ho vyskúšame a znova zabalíme. S tým všetkým počíta táto lehota:
        </p>
        <LegalNote>
          <p>
            Doručenie <strong>zvyčajne do 3–5 pracovných dní</strong>, najneskôr{" "}
            <strong>do {DELIVERY_MAX_WORKDAYS} pracovných dní od zaplatenia</strong> objednávky.
          </p>
        </LegalNote>
        <ul>
          <li>
            Záväzná je lehota „najneskôr“. Údaj „zvyčajne 3–5 pracovných dní“ je informácia o bežnej dobe dodania.
          </li>
          <li>Ak je pri produkte uvedená dlhšia lehota (napríklad „Na objednávku“), platí lehota pri produkte.</li>
          <li>Pri osobnom odbere vám stroj v rovnakej lehote pripravíme na vyzdvihnutie.</li>
          <li>
            Stav objednávky môžete sledovať cez odkaz v e-maile, ktorý dostanete po objednaní. Neskôr ho uvidíte aj v
            zákazníckom účte.
          </li>
        </ul>
        <h3>Ak lehotu nestihneme</h3>
        <p>
          Ak zistíme, že lehotu nedodržíme, oznámime vám to bez zbytočného odkladu e-mailom aj telefonicky a ponúkneme
          vám nový termín, iný stroj (len s vaším výslovným súhlasom) alebo bezplatné zrušenie objednávky s vrátením
          celej sumy do {UNAVAILABLE_REFUND_WORKDAYS} pracovných dní.
        </p>
        <p>
          Ak vám tovar v lehote nedodáme, môžete nám určiť dodatočnú primeranú lehotu. Ak ani v nej nedodáme, môžete od
          zmluvy odstúpiť a všetko, čo ste zaplatili, vám vrátime (§ 517 a § 613 Občianskeho zákonníka).
        </p>
        <h3>Ak stroj nie je dostupný</h3>
        <p>
          Ak dodávateľ dostupnosť nepotvrdí ešte pred naším e-mailom „Potvrdenie objednávky“, zmluva nevznikne. Hneď vám
          dáme vedieť a celú sumu vrátane dopravy vrátime do {UNAVAILABLE_REFUND_WORKDAYS} pracovných dní rovnakým
          spôsobom, akým ste platili, bez akýchkoľvek poplatkov. Iný stroj vám pošleme len s vaším výslovným súhlasom.
        </p>
      </LegalSection>

      <LegalSection id="osobny-odber" title="4. Osobný odber">
        <p>
          Objednávku si môžete zdarma vyzdvihnúť vo výdajnom mieste{" "}
          <strong>{s.pickupAddress ?? "[doplniť adresu výdajného miesta]"}</strong>
          {s.pickupHours ? <>, v čase {s.pickupHours}</> : null}.
        </p>
        <ul>
          <li>Keď bude stroj otestovaný a pripravený, ozveme sa vám e-mailom alebo telefonicky. Prísť stačí až potom.</li>
          <li>Pri preberaní uveďte číslo objednávky a preukážte sa dokladom totožnosti.</li>
          <li>
            Pri odbere s vami urobíme skúšobný chod a bezplatne vás zaškolíme na obsluhu stroja. Zaškolenie potvrdíte
            podpisom.
          </li>
          <li>Na mieste sa nič neplatí. Objednávka je vždy uhradená vopred online.</li>
          <li>Na odvoz ťažkého stroja si zabezpečte vozidlo s dostatočnou nosnosťou a upevnenie nákladu.</li>
        </ul>
      </LegalSection>

      <LegalSection id="tazke-stroje" title="5. Preprava ťažkých strojov">
        <p>
          Zásielky nad 40 kg doručujeme na palete nákladným vozidlom. Dopravca vám vopred zavolá a dohodne termín
          doručenia.
        </p>
        <ul>
          <li>
            Stroj odovzdáme <strong>k obrubníku</strong>, teda na miesto prístupné nákladnému autu (spevnená plocha pri
            vjazde). Doprava nezahŕňa vynášanie do budovy, na poschodie ani na stavenisko mimo spevnenej komunikácie.
          </li>
          <li>
            <strong>Vyloženie zabezpečuje kupujúci</strong>, ak sa nedohodneme inak. Ťažké stroje potrebujú niekoľko
            ľudí, paletový vozík alebo vysokozdvižný vozík.
          </li>
          <li>
            Zabezpečte prosím prístup pre nákladné vozidlo. Ak je príjazd obmedzený (úzka ulica, zákaz vjazdu,
            nespevnený terén), napíšte to do poznámky k objednávke a spôsob doručenia dohodneme vopred.
          </li>
        </ul>
        <h3>Kontrola zásielky pri prevzatí</h3>
        <p>
          Odporúčame vám pri prevzatí za prítomnosti vodiča skontrolovať obal a paletu. Ak je zásielka zjavne poškodená,
          zapíšte poškodenie do preberacieho dokladu dopravcu, odfoťte ho a čo najskôr nám ho oznámte
          {contact ? <> na {contact}</> : null}. Zásielku môžete aj odmietnuť prevziať. Pomôže nám to rýchlo uplatniť
          škodu u dopravcu.
        </p>
        <LegalNote>
          <p>
            Pre spotrebiteľa je to <strong>iba odporúčanie</strong>. Ak ho nedodržíte, vaše práva zo zodpovednosti za
            vady tým nijako nestrácate. Riziko poškodenia tovaru prechádza na vás až jeho prevzatím, takže poškodenie
            počas prepravy ide na náš účet.
          </p>
        </LegalNote>
        <p>
          <strong>Ak nakupujete ako podnikateľ</strong>, tovar ste povinní prezrieť pri prevzatí a zjavné poškodenie
          prepravou zapísať do preberacieho dokladu dopravcu a oznámiť nám ho najneskôr do 2 pracovných dní od prevzatia
          (§ 427 a § 428 Obchodného zákonníka). Na podnikateľa prechádza riziko odovzdaním tovaru prvému dopravcovi.
        </p>
      </LegalSection>

      <LegalSection id="platba" title="6. Platba">
        <p>
          Platíte online cez zabezpečenú platobnú bránu Stripe: <strong>platobnou kartou</strong> (Visa, Mastercard),
          cez <strong>Apple Pay</strong> alebo <strong>Google Pay</strong>. Údaje o vašej karte nevidíme ani neukladáme.
        </p>
        <h3>Platba vopred</h3>
        <p>
          Kúpnu cenu vrátane ceny dopravy platíte <strong>vopred, v plnej výške</strong>, pri odoslaní objednávky. Suma
          sa z vášho účtu <strong>odpíše hneď</strong> po zaplatení. Na mieste pri odbere ani pri doručení sa už nič
          neplatí.
        </p>
        <p>
          Hneď po zaplatení vám príde automatický e-mail „Prijali sme vašu objednávku a platbu“. Ešte nejde o prijatie
          objednávky. Kúpna zmluva vzniká až naším e-mailom „Potvrdenie objednávky“, ktorý pošleme po potvrdení
          dostupnosti u dodávateľa, zvyčajne do 1 pracovného dňa. Dovtedy môžete objednávku bezplatne zrušiť.
        </p>
        <h3>Kedy a ako vraciame peniaze</h3>
        <ul>
          <li>
            Ak objednávku neprijmeme alebo ju pred potvrdením zrušíte, celú zaplatenú sumu vrátane dopravy vrátime{" "}
            <strong>najneskôr do {UNAVAILABLE_REFUND_WORKDAYS} pracovných dní</strong>.
          </li>
          <li>
            Pri odstúpení od zmluvy vraciame peniaze podľa pravidiel na stránke{" "}
            <Link href="/odstupenie-od-zmluvy">Odstúpenie od zmluvy</Link>.
          </li>
          <li>
            Peniaze vraciame rovnakým spôsobom, akým ste platili, bez poplatkov. Kedy ich uvidíte na účte, závisí od
            vašej banky, zvyčajne do niekoľkých dní.
          </li>
        </ul>
        <p>Za spôsob platby si <strong>neúčtujeme žiadny poplatok</strong>.</p>
        <h3>Faktúra</h3>
        <p>
          Faktúru (daňový doklad) vám pošleme e-mailom vo formáte PDF. Ak nakupujete na firmu, vyberte v pokladni nákup
          na firmu a uveďte obchodné meno, IČO, DIČ a IČ DPH. Faktúru vystavíme na tieto údaje.
        </p>
      </LegalSection>

      <LegalSection id="vratenie" title="7. Vrátenie tovaru – náklady">
        <p>
          Ako spotrebiteľ môžete od zmluvy odstúpiť do 14 dní od prevzatia tovaru. Postup, vzorový formulár a všetky
          podmienky nájdete na stránke <Link href="/odstupenie-od-zmluvy">Odstúpenie od zmluvy</Link>.
        </p>
        <p>
          Pri odstúpení znášate <strong>priame náklady na vrátenie tovaru</strong>. Stroje sa pre svoju hmotnosť a
          rozmery nedajú poslať späť bežnou poštou. Odhad nákladov na vrátenie podľa hmotnosti zásielky:
        </p>
        <table>
          <thead>
            <tr>
              <th scope="col">Hmotnosť zásielky</th>
              <th scope="col">Odhad nákladov na vrátenie</th>
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
        <p>Stroj nám môžete vrátiť aj osobne vo výdajnom mieste v Boldogu, vtedy vám náklady na prepravu nevzniknú.</p>
      </LegalSection>

      <LegalSection id="spatny-zber" title="8. Spätný zber elektroodpadu a batérií">
        <p>
          <strong>Bezplatný spätný zber kus za kus.</strong> Ak u nás kúpite nové elektrozariadenie (napríklad
          elektrickú pílu alebo ponorné čerpadlo), bezplatne od vás prevezmeme starý elektroodpad rovnakého druhu a s
          rovnakým účelom. Nemusíte platiť žiadny poplatok ani kupovať inú službu.
        </p>
        <p>
          <strong>Kde:</strong> výdajné miesto {s.pickupAddress ?? "[doplniť adresu výdajného miesta]"}
          {s.pickupHours ? <>, počas prevádzkových hodín ({s.pickupHours})</> : null}.
        </p>
        <p>
          <strong>Prečo zbierať oddelene:</strong> elektroodpad môže obsahovať látky škodlivé pre životné prostredie a
          zdravie ľudí. Nepatrí do zmesového komunálneho odpadu. Oddeleným zberom umožníte opätovné použitie a
          recykláciu surovín. Elektroodpad odovzdávajte kompletný a nerozobratý.
        </p>
        <p>
          <strong>Symbol preškrtnutej smetnej nádoby</strong> na výrobku, obale alebo v návode znamená, že výrobok sa
          nesmie vyhodiť spolu s komunálnym odpadom a musí sa odovzdať do oddeleného zberu.
        </p>
        <p>
          <strong>Ďalšie možnosti:</strong> elektroodpad môžete bezplatne odovzdať aj na zbernom dvore vašej obce alebo
          u iného predajcu elektrozariadení pri kúpe nového zariadenia.
        </p>
        <p>
          <strong>Batérie a akumulátory</strong> (napríklad štartovacie akumulátory strojov s elektrickým štartom)
          nevyhadzujte do zmesového odpadu. Olovené akumulátory obsahujú olovo a kyselinu sírovú. Použité batérie
          rovnakého druhu, aký predávame, od vás bezplatne prevezmeme vo výdajnom mieste v Boldogu.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
