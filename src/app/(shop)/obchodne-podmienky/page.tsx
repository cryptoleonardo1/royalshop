import type { Metadata } from "next";
import Link from "next/link";
import { getShopSettings } from "@/lib/catalog";
import { formatEur } from "@/lib/money";
import {
  DELIVERY_MAX_WORKDAYS,
  LEGAL_VERSION,
  LEGAL_VALID_FROM,
  lowerFirst,
  RETURN_COST_ESTIMATES,
  SOI,
  UNAVAILABLE_REFUND_WORKDAYS,
} from "@/lib/legal";
import { LegalNote, LegalPage, LegalSection } from "@/components/shop/legal-page";

export const metadata: Metadata = {
  title: "Obchodné podmienky",
  description:
    "Všeobecné obchodné podmienky e-shopu Royal Shop: objednávka a uzavretie zmluvy, platba vopred, dodacia lehota, preprava strojov, odstúpenie, zodpovednosť za vady a podmienky pre podnikateľov.",
};

const TOC = [
  { id: "uvod", label: "1. Úvodné ustanovenia" },
  { id: "tovar-ceny", label: "2. Tovar a ceny" },
  { id: "objednavka", label: "3. Objednávka a uzavretie zmluvy" },
  { id: "platba", label: "4. Platba" },
  { id: "dodanie", label: "5. Dodanie a dodacia lehota" },
  { id: "preprava", label: "6. Preprava a prevzatie zásielky" },
  { id: "riziko", label: "7. Prechod nebezpečenstva a vlastníctva" },
  { id: "kontrola", label: "8. Kontrola strojov pred odoslaním" },
  { id: "odstupenie", label: "9. Odstúpenie od zmluvy" },
  { id: "vady", label: "10. Zodpovednosť za vady a záruky výrobcov" },
  { id: "spory", label: "11. Riešenie sporov a dohľad" },
  { id: "osobne-udaje", label: "12. Ochrana osobných údajov" },
  { id: "podnikatelia", label: "13. Osobitné ustanovenia pre podnikateľov" },
  { id: "zaver", label: "14. Záverečné ustanovenia" },
];

const EU_GUARANTEE_URL =
  "https://europa.eu/youreurope/citizens/consumers/shopping/guarantees-returns/index_sk.htm";

export default async function TermsPage() {
  const s = await getShopSettings();
  const seat = [s.street, [s.zip, s.city].filter(Boolean).join(" ")].filter(Boolean).join(", ") || "[doplniť]";
  const email = s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : "[doplniť]";
  const phone = s.phone ? <a href={`tel:${s.phone.replace(/\s+/g, "")}`}>{s.phone}</a> : "[doplniť]";
  const pickup = s.pickupAddress ?? "[doplniť]";
  const returnMin = RETURN_COST_ESTIMATES[0];
  const returnMax = RETURN_COST_ESTIMATES[RETURN_COST_ESTIMATES.length - 1];

  return (
    <LegalPage
      title="Obchodné podmienky"
      lede={
        <>
          Pravidlá nákupu v e-shope Royal Shop: ako vzniká zmluva, kedy a ako platíte, do kedy stroj doručíme a aké
          máte práva. Platia pre spotrebiteľov aj pre podnikateľov, pre podnikateľov s odchýlkami v článku 13.
        </>
      }
      toc={TOC}
      current="/obchodne-podmienky"
    >
      <LegalSection id="uvod" title="1. Úvodné ustanovenia">
        <ol>
          <li>
            Tieto všeobecné obchodné podmienky (ďalej „VOP“) upravujú kúpu tovaru prostredníctvom e-shopu Royal Shop
            (ďalej „e-shop“). Predávajúcim a prevádzkovateľom e-shopu je <strong>{s.companyName}</strong>, so sídlom{" "}
            {seat}, IČO: {s.ico ?? "[doplniť]"}, DIČ: {s.dic ?? "[doplniť]"}, IČ DPH: {s.icDph ?? "[doplniť]"}
            {s.registerInfo ? <>, {lowerFirst(s.registerInfo)}</> : null} (ďalej „predávajúci“ alebo „my“).
          </li>
          <li>
            Kontakt: e-mail {email}, telefón {phone}. Na tieto kontakty nám môžete posielať otázky, objednávky,
            reklamácie, odstúpenie od zmluvy aj žiadosti o nápravu.
          </li>
          <li>
            Adresa na osobný odber, reklamácie a vrátenie tovaru je výdajné miesto <strong>{pickup}</strong>
            {s.pickupHours ? <> (prevádzkové hodiny {s.pickupHours})</> : null}. Písomnosti môžete posielať aj na adresu
            sídla.
          </li>
          <li>
            Dohľad nad dodržiavaním predpisov na ochranu spotrebiteľa vykonáva Slovenská obchodná inšpekcia,
            príslušný je {SOI.name}, {SOI.address} (<a href={SOI.web}>{SOI.web.replace("https://", "")}</a>).
          </li>
          <li>
            <strong>Kupujúci</strong> je osoba, ktorá v e-shope odošle objednávku. Kupujúci je:
            <ul>
              <li>
                <strong>spotrebiteľ</strong>, ak je fyzickou osobou a pri kúpe nekoná v rámci svojej podnikateľskej
                činnosti alebo povolania;
              </li>
              <li>
                <strong>podnikateľ</strong>, ak kupuje tovar v súvislosti so svojou podnikateľskou činnosťou (firma,
                živnostník, iná právnická osoba).
              </li>
            </ul>
          </li>
          <li>
            V pokladni kupujúci zvolí, či nakupuje ako súkromná osoba, alebo ako firma či živnostník. Voľbou „Firma /
            živnostník“ kupujúci vyhlasuje, že tovar kupuje v súvislosti so svojím podnikaním. Rozhoduje účel nákupu,
            nie to, či má kupujúci IČO.
          </li>
          <li>
            Vzťahy so spotrebiteľmi sa riadia najmä Občianskym zákonníkom a zákonom č. 108/2024 Z. z. o ochrane
            spotrebiteľa. Vzťahy s podnikateľmi sa riadia Obchodným zákonníkom a článkom 13 týchto VOP, ktorý má pred
            ostatnými článkami prednosť.
          </li>
          <li>
            <strong>Pracovný deň</strong> je pondelok až piatok okrem štátnych sviatkov a dní pracovného pokoja v
            Slovenskej republike.
          </li>
        </ol>
      </LegalSection>

      <LegalSection id="tovar-ceny" title="2. Tovar a ceny">
        <ol>
          <li>
            Predávame nové stavebné stroje a motory. Hlavné vlastnosti každého stroja, jeho cenu a lehotu dodania
            uvádzame na stránke produktu.
          </li>
          <li>
            Všetky ceny sú konečné, vrátane DPH. Cena dopravy sa pripočítava podľa hmotnosti objednávky a vidíte ju v
            košíku a v súhrne objednávky ešte pred jej odoslaním. Prehľad cien dopravy je na stránke{" "}
            <Link href="/doprava-a-platba">Doprava a platba</Link>.
          </li>
          <li>Za spôsob platby si neúčtujeme žiadny príplatok.</li>
          <li>
            Pri zľave uvádzame aj predchádzajúcu cenu, teda najnižšiu cenu, za ktorú sme tovar ponúkali počas 30 dní
            pred zľavou.
          </li>
          <li>
            Stroje nemáme na vlastnom sklade. Objednávame ich u dodávateľa (oficiálneho dovozcu alebo priamo u výrobcu)
            až na základe vašej objednávky. Preto pri tovare uvádzame „Dostupné u dodávateľa“ alebo „Na objednávku“, nie
            „Skladom“.
          </li>
          <li>
            Pri produktoch označených „Cena na požiadanie“ nejde o ponuku na predaj. Cenu a dostupnosť vám na požiadanie
            oznámime telefonicky alebo e-mailom a zmluva vzniká až dohodou o konkrétnej cene.
          </li>
          <li>
            Fotografie sú ilustračné. Ak sa líšia od textového opisu, rozhodujúci je opis a technické parametre
            uvedené pri produkte.
          </li>
        </ol>
      </LegalSection>

      <LegalSection id="objednavka" title="3. Objednávka a uzavretie zmluvy">
        <ol>
          <li>
            Prezentácia tovaru v e-shope nie je návrhom na uzavretie zmluvy. Návrhom na uzavretie kúpnej zmluvy je
            objednávka kupujúceho.
          </li>
          <li>
            Postup objednávky: vložíte tovar do košíka, v pokladni zvolíte, či nakupujete ako súkromná osoba alebo ako
            firma či živnostník, vyplníte kontaktné a dodacie údaje, zvolíte doručenie alebo osobný odber a
            skontrolujete súhrn objednávky s hlavnými vlastnosťami tovaru a celkovou cenou vrátane dopravy. Až do
            odoslania môžete údaje opraviť a obsah košíka zmeniť. Objednávku odošlete tlačidlom{" "}
            <strong>„Objednávka s povinnosťou platby“</strong> a následne zaplatíte cez platobnú bránu.
          </li>
          <li>
            Odoslaním objednávky kupujúci potvrdzuje, že sa oboznámil s týmito VOP, s{" "}
            <Link href="/reklamacny-poriadok">reklamačným poriadkom</Link> a, ak je spotrebiteľom, s{" "}
            <Link href="/odstupenie-od-zmluvy">poučením o odstúpení od zmluvy</Link>.
          </li>
          <li>
            Bezodkladne po doručení objednávky a platby vám pošleme automatický e-mail{" "}
            <strong>„Prijali sme vašu objednávku a platbu“</strong>. Tento e-mail potvrdzuje len doručenie objednávky.{" "}
            <strong>Nie je prijatím návrhu</strong> a zmluva ním nevzniká.
          </li>
          <li>
            Po prijatí objednávky overíme dostupnosť stroja u dodávateľa. <strong>Kúpna zmluva vzniká doručením
            e-mailu „Potvrdenie objednávky“</strong>, ktorý zvyčajne posielame do 1 pracovného dňa od zaplatenia.
            Prílohou tohto e-mailu (trvanlivé médium) sú tieto VOP, reklamačný poriadok, poučenie o odstúpení od
            zmluvy a vzorový formulár na odstúpenie v znení platnom v čase objednávky.
          </li>
          <li>
            Objednávka je pre kupujúceho záväzná 5 pracovných dní od jej odoslania. Ak ju v tejto lehote nepotvrdíme,
            zaniká a celú zaplatenú sumu vám vrátime do {UNAVAILABLE_REFUND_WORKDAYS} pracovných dní.
          </li>
          <li>
            Kým vám nepošleme „Potvrdenie objednávky“, môžete objednávku bezplatne zrušiť e-mailom. Celú zaplatenú
            sumu vám vrátime najneskôr do {UNAVAILABLE_REFUND_WORKDAYS} pracovných dní.
          </li>
          <li>
            Ak objednávku nemôžeme prijať, najmä preto, že dodávateľ stroj nedodá, oznámime vám to bez zbytočného
            odkladu. Celú zaplatenú sumu vrátane dopravy vrátime najneskôr do {UNAVAILABLE_REFUND_WORKDAYS} pracovných
            dní od tohto oznámenia, rovnakým platobným prostriedkom, aký ste použili, bez akýchkoľvek poplatkov.
            Pripísanie peňazí na váš účet závisí od vašej banky a zvyčajne trvá 5 až 10 pracovných dní.
          </li>
          <li>
            Ak je k dispozícii porovnateľný stroj, môžeme vám ho ponúknuť. Iný tovar dodáme{" "}
            <strong>len s vaším výslovným súhlasom</strong> (odpoveďou na náš e-mail). Bez súhlasu vám peniaze vrátime
            podľa bodu 8.
          </li>
        </ol>
        <LegalNote>
          <p>
            <strong>Čo to znamená pre vás:</strong> pri objednávke zaplatíte hneď, ale zmluva vzniká až naším e-mailom
            „Potvrdenie objednávky“, keď máme istotu, že stroj dodávateľ dodá. Ak stroj dostupný nie je, nič nekupujete
            a celú sumu vrátane dopravy vám vrátime do {UNAVAILABLE_REFUND_WORKDAYS} pracovných dní. Iný stroj vám bez
            vášho súhlasu nepošleme.
          </p>
        </LegalNote>
      </LegalSection>

      <LegalSection id="platba" title="4. Platba">
        <ol>
          <li>
            Kúpnu cenu vrátane ceny dopravy platí kupujúci <strong>vopred, v plnej výške</strong>, pri odoslaní
            objednávky. Platiť môžete platobnou kartou, cez Apple Pay alebo Google Pay na zabezpečenej stránke
            platobnej brány Stripe.
          </li>
          <li>
            Suma sa z karty odpíše hneď po zaplatení. Ak zmluva nevznikne alebo sa zruší, vrátime ju v lehotách podľa
            článkov 3 a 5, rovnakým platobným prostriedkom a bez poplatkov.
          </li>
          <li>Pri osobnom odbere sa na mieste neplatí. Všetky platby prebiehajú online vopred.</li>
          <li>Faktúru (daňový doklad) vám pošleme e-mailom.</li>
        </ol>
      </LegalSection>

      <LegalSection id="dodanie" title="5. Dodanie a dodacia lehota">
        <ol>
          <li>Tovar doručujeme len na adresy v Slovenskej republike. Osobný odber je možný na výdajnom mieste {pickup}.</li>
          <li>
            Tovar doručíme v lehote uvedenej pri produkte a v súhrne objednávky. Ak pri produkte nie je uvedené inak,
            doručíme ho zvyčajne do 3 až 5 pracovných dní,{" "}
            <strong>najneskôr do {DELIVERY_MAX_WORKDAYS} pracovných dní od zaplatenia objednávky</strong>. Pri osobnom
            odbere ho v rovnakej lehote pripravíme na vyzdvihnutie a dáme vám vedieť. Údaj „zvyčajne“ je informácia o
            bežnej dobe dodania. Záväzná je lehota „najneskôr“. Ak je pri produkte uvedená dlhšia lehota (napríklad pri
            tovare „Na objednávku“), platí lehota uvedená pri produkte.
          </li>
          <li>
            Cena dopravy na adresu v Slovenskej republike závisí od celkovej hmotnosti objednávky:
            <ul>
              {s.shippingRates.map((r) => (
                <li key={r.name}>
                  {r.name}: {formatEur(r.priceCents)}
                </li>
              ))}
              <li>osobný odber: zdarma</li>
            </ul>
            {s.freeShippingThresholdCents != null && (
              <>Pri objednávke nad {formatEur(s.freeShippingThresholdCents)} je doprava zdarma.</>
            )}
          </li>
          <li>
            Ak zistíme, že lehotu nebudeme môcť dodržať, oznámime vám to bez zbytočného odkladu e-mailom a telefonicky
            a ponúkneme vám (a) nový termín, (b) ak je k dispozícii, iný tovar, ktorý dodáme len s vaším výslovným
            súhlasom, alebo (c) bezplatné zrušenie objednávky s vrátením celej sumy do {UNAVAILABLE_REFUND_WORKDAYS}{" "}
            pracovných dní.
          </li>
          <li>
            Ak tovar nedodáme v lehote podľa bodu 2, môžete nám poskytnúť dodatočnú primeranú lehotu a po jej márnom
            uplynutí od zmluvy odstúpiť. Bez dodatočnej lehoty môžete odstúpiť v prípadoch podľa § 613 ods. 5
            Občianskeho zákonníka (napríklad ak sme dodanie odmietli). Všetko, čo sme od vás prijali, vám vrátime bez
            zbytočného odkladu, najneskôr do 5 pracovných dní od odstúpenia.
          </li>
          <li>
            Ak po uzavretí zmluvy z dôvodov, ktoré nemôžeme ovplyvniť (výrobca alebo dodávateľ ukončil výrobu či
            dodávky, alebo stroj neprejde výstupnou skúškou a ďalší kus nie je k dispozícii v lehote dodania), nebude
            možné tovar dodať, oznámime vám to bez zbytočného odkladu. Môžete si zvoliť (a) predĺženie lehoty dodania o
            vami určenú dobu, (b) dodanie iného tovaru, ak s ním výslovne súhlasíte, alebo (c) zrušenie zmluvy. Ak do
            3 pracovných dní nezvolíte možnosť (a) alebo (b), môže od zmluvy odstúpiť ktorákoľvek strana. Zaplatenú
            sumu vrátane dopravy vrátime najneskôr do {UNAVAILABLE_REFUND_WORKDAYS} pracovných dní od odstúpenia, bez
            poplatkov. Vaše práva pri omeškaní (§ 517 a § 613 Občianskeho zákonníka) a právo spotrebiteľa odstúpiť od
            zmluvy do 14 dní tým nie sú dotknuté.
          </li>
        </ol>
      </LegalSection>

      <LegalSection id="preprava" title="6. Preprava a prevzatie zásielky">
        <ol>
          <li>
            Ľahšie stroje posielame ako balík. Ťažšie stroje doručujeme nákladným vozidlom na palete{" "}
            <strong>k obrubníku</strong>, teda na miesto prístupné nákladnému vozidlu po spevnenej komunikácii, nie do
            budovy ani na stavenisko.
          </li>
          <li>
            Prepravca vám termín doručenia vopred oznámi telefonicky (avizácia). Vyloženie palety z vozidla zabezpečuje
            kupujúci, ak sa s nami vopred nedohodne inak. Ťažké stroje treba vykladať viacerými osobami alebo
            vysokozdvižným či paletovým vozíkom. Pripravte si preto pri doručení dostatok ľudí alebo techniky.
          </li>
          <li>
            Ak zásielku v dohodnutom termíne bez dôvodu neprevezmete alebo nezabezpečíte jej vyloženie, môžeme
            požadovať náklady opakovaného doručenia, najviac vo výške ceny dopravy pre danú hmotnostnú kategóriu.
          </li>
          <li>
            Pri prevzatí <strong>odporúčame</strong> skontrolovať zásielku za prítomnosti vodiča. Ak je zjavne
            poškodená, prevezmite ju s výhradou a poškodenie zapíšte do preberacieho dokladu prepravcu, prípadne
            zásielku neprevezmite. Poškodenie zistené po vybalení nám, prosím, čo najskôr pošlite e-mailom aj s
            fotografiami, aby sme ho mohli včas uplatniť u prepravcu.
          </li>
          <li>
            <strong>Pre spotrebiteľa je postup podľa bodu 4 len odporúčaním.</strong> Ak ho nedodrží, nemá to vplyv
            na jeho práva zo zodpovednosti za vady. Pre podnikateľov platí povinnosť podľa článku 13.
          </li>
        </ol>
      </LegalSection>

      <LegalSection id="riziko" title="7. Prechod nebezpečenstva a vlastníctva">
        <ol>
          <li>
            Ak je kupujúci spotrebiteľ, vlastnícke právo a nebezpečenstvo náhodnej skazy, zhoršenia a straty tovaru
            prechádzajú na neho <strong>prevzatím tovaru</strong> od nás alebo od nami zabezpečeného prepravcu. Za
            poškodenie počas prepravy, ktorú zabezpečujeme my, preto zodpovedáme my.
          </li>
          <li>Pri osobnom odbere prechádzajú vlastníctvo aj nebezpečenstvo prevzatím tovaru na výdajnom mieste.</li>
          <li>Pre podnikateľov platí osobitná úprava v článku 13.</li>
        </ol>
      </LegalSection>

      <LegalSection id="kontrola" title="8. Kontrola strojov pred odoslaním">
        <ol>
          <li>
            Predávame výhradne <strong>nový tovar</strong>. Každý stroj pred odoslaním alebo odovzdaním vybalíme,
            skontrolujeme jeho kompletnosť, vykonáme krátku funkčnú skúšku a zabalíme ho späť.
          </li>
          <li>
            O kontrole vyhotovíme výstupný protokol (fotografie, výrobné číslo, stav počítadla motohodín, ak ho stroj
            má, a záznam o skúšobnom chode). Jeho kópiu nájdete v balení. V protokole uvádzame aj to, či je v stroji
            po skúške olej alebo palivo.
          </li>
          <li>
            Krátky skúšobný chod neznamená použitie stroja na prácu. Stroj sa ním overuje, aby ste dostali funkčný a
            kompletný tovar.
          </li>
          <li>
            Pri osobnom odbere vám stroj na požiadanie predvedieme a bezplatne vás zaškolíme v jeho obsluhe.
          </li>
        </ol>
      </LegalSection>

      <LegalSection id="odstupenie" title="9. Odstúpenie od zmluvy">
        <ol>
          <li>
            Spotrebiteľ má právo odstúpiť od zmluvy bez uvedenia dôvodu do <strong>14 dní od prevzatia tovaru</strong>.
            Odstúpiť môže aj pred prevzatím. Úplné poučenie, vzorový formulár a postup nájdete na stránke{" "}
            <Link href="/odstupenie-od-zmluvy">Odstúpenie od zmluvy</Link>. Poučenie je súčasťou zmluvy.
          </li>
          <li>
            Odstúpiť môžete prostredníctvom funkcie na stránke{" "}
            <Link href="/odstupenie-od-zmluvy#formular">Odstúpenie od zmluvy</Link>, e-mailom na {email} alebo listom
            na adresu sídla. Postačuje akékoľvek jednoznačné vyhlásenie.
          </li>
          <li>
            Platby vrátane ceny základnej dopravy vrátime do 14 dní od doručenia odstúpenia. S vrátením môžeme počkať,
            kým nám stroj príde späť alebo kým preukážete, že ste ho odoslali, podľa toho, čo nastane skôr.
          </li>
          <li>
            Priame náklady na vrátenie tovaru znáša spotrebiteľ. Ťažké stroje nemožno vrátiť bežnou poštou. Odhad
            nákladov na vrátenie podľa hmotnosti (od {formatEur(returnMin.maxCents)} pri hmotnosti {returnMin.label} po{" "}
            {formatEur(returnMax.maxCents)} pri hmotnosti {returnMax.label}) je uvedený na stránke Odstúpenie od zmluvy.
          </li>
          <li>
            Stroj si môžete vyskúšať tak, ako by ste si ho mohli vyskúšať v predajni. Za zníženie hodnoty, ktoré
            vznikne zaobchádzaním nad tento rámec (napríklad použitím na reálnu prácu), zodpovedáte. Náhradu takého
            zníženia hodnoty si od vrátenej sumy neodpočítavame, uplatňujeme ju samostatne. Odstúpenie tým nie je
            dotknuté.
          </li>
          <li>Kupujúci, ktorý nakupuje ako podnikateľ, zákonné právo na odstúpenie nemá. Pre neho platí článok 13.</li>
        </ol>
      </LegalSection>

      <LegalSection id="vady" title="10. Zodpovednosť za vady a záruky výrobcov">
        <ol>
          <li>
            Za vady, ktoré má tovar pri prevzatí, zodpovedáme podľa Občianskeho zákonníka. Spotrebiteľ môže vadu
            vytknúť (reklamovať) do dvoch rokov od prevzatia tovaru, a to do dvoch mesiacov od jej zistenia.
          </li>
          <li>
            Postup reklamácie, lehoty, vaše práva a spôsob vybavenia upravuje{" "}
            <Link href="/reklamacny-poriadok">Reklamačný poriadok</Link>. Reklamáciu môžete uplatniť e-mailom na{" "}
            {email} alebo osobne na výdajnom mieste {pickup}.
          </li>
          <li>
            Informácie o vašich zákonných právach pri vadách tovaru nájdete aj v{" "}
            <a href={EU_GUARANTEE_URL}>harmonizovanom oznámení EÚ</a>.
          </li>
          <li>
            Ak výrobca poskytuje na stroj vlastnú záruku (záruku výrobcu), jej rozsah a podmienky uvádzame pri produkte
            alebo v záručnom liste výrobcu. Záruka výrobcu sa uplatňuje za podmienok výrobcu.{" "}
            <strong>Vaše zákonné práva voči nám tým nie sú dotknuté.</strong>
          </li>
        </ol>
      </LegalSection>

      <LegalSection id="spory" title="11. Riešenie sporov a dohľad">
        <ol>
          <li>
            Ak nie ste spokojní so spôsobom, akým sme vybavili reklamáciu, alebo sa domnievate, že sme porušili vaše
            práva, môžete nám poslať <strong>žiadosť o nápravu</strong> na e-mail {email}.
          </li>
          <li>
            Ak žiadosť zamietneme alebo na ňu neodpovieme do 30 dní od jej odoslania, spotrebiteľ môže podať návrh na
            alternatívne riešenie sporu. Príslušným subjektom je Slovenská obchodná inšpekcia (
            <a href={SOI.web}>{SOI.web.replace("https://", "")}</a>) alebo iný subjekt zo{" "}
            <a href={SOI.arsListUrl}>zoznamu subjektov alternatívneho riešenia spotrebiteľských sporov</a> vedeného
            Ministerstvom hospodárstva SR. Spotrebiteľ si môže vybrať, ktorý subjekt využije.
          </li>
          <li>
            Podnet na prešetrenie porušenia práv spotrebiteľa môžete podať orgánu dohľadu: {SOI.name}, {SOI.address}.
          </li>
          <li>Právo obrátiť sa na súd tým nie je dotknuté.</li>
        </ol>
      </LegalSection>

      <LegalSection id="osobne-udaje" title="12. Ochrana osobných údajov">
        <p>
          Osobné údaje spracúvame v rozsahu potrebnom na vybavenie objednávky a plnenie zákonných povinností. Podrobnosti
          o účeloch, príjemcoch, dobe uchovávania a vašich právach sú na stránke{" "}
          <Link href="/ochrana-osobnych-udajov">Ochrana osobných údajov</Link>. Informácie o cookies a ukladaní údajov v
          prehliadači nájdete na stránke <Link href="/cookies">Cookies</Link>.
        </p>
      </LegalSection>

      <LegalSection id="podnikatelia" title="13. Osobitné ustanovenia pre podnikateľov">
        <p>
          Tento článok platí len pre kupujúceho, ktorý nakupuje ako podnikateľ (článok 1 bod 5). Ostatné ustanovenia
          VOP platia pre podnikateľa primerane, pokiaľ tento článok neurčuje inak.
        </p>
        <ol>
          <li>
            Vzťah sa riadi Obchodným zákonníkom, najmä ustanoveniami o kúpnej zmluve (§ 409 a nasl.). Tieto VOP sú
            súčasťou zmluvy, kupujúci ich prijíma odoslaním objednávky.
          </li>
          <li>
            <strong>Odstúpenie.</strong> Podnikateľ nemá zákonné právo odstúpiť od zmluvy bez uvedenia dôvodu. Bez
            právneho nároku mu môžeme umožniť vrátenie tovaru, ak (a) o to požiada do 14 dní od prevzatia a vrátenie
            s nami vopred dohodne, (b) tovar je nepoužitý, nepoškodený, kompletný a v pôvodnom obale. Náklady na
            dopravu tovaru späť znáša kupujúci. Za spracovanie vrátenia účtujeme manipulačný poplatok 10 % z ceny
            vráteného tovaru, ktorý môžeme započítať voči vracanej sume. Túto možnosť môžeme pre budúce objednávky
            zmeniť alebo zrušiť.
          </li>
          <li>
            <strong>Nebezpečenstvo a vlastníctvo.</strong> Ak tovar odosielame prepravcom, nebezpečenstvo škody na
            tovare prechádza na kupujúceho <strong>odovzdaním tovaru prvému prepravcovi</strong>. Pri osobnom odbere
            prechádza prevzatím. Vlastnícke právo kupujúci nadobúda prevzatím tovaru, nie však skôr ako úplným
            zaplatením kúpnej ceny.
          </li>
          <li>
            <strong>Prehliadka a poškodenie pri preprave.</strong> Kupujúci je povinný tovar prezrieť pri prevzatí.
            Zjavné poškodenie pri preprave je povinný zapísať do preberacieho dokladu prepravcu a oznámiť nám ho
            najneskôr do 2 pracovných dní od prevzatia. Inak sa na neskoršie uplatnenie nárokov z takého poškodenia
            hľadí podľa § 428 Obchodného zákonníka.
          </li>
          <li>
            <strong>Zodpovednosť za vady.</strong> Za vady zodpovedáme podľa § 422 a nasl. Obchodného zákonníka, teda
            za vady, ktoré mal tovar pri prechode nebezpečenstva. Vady je kupujúci povinný oznámiť písomne bez
            zbytočného odkladu po ich zistení. Skryté vady je povinný oznámiť najneskôr do{" "}
            <strong>12 mesiacov od prevzatia tovaru</strong>.
          </li>
          <li>
            Nezodpovedáme za bežné opotrebenie dielov, ktoré sa používaním spotrebúvajú (napríklad rezné kotúče,
            remene, sviečky, filtre, spodné dosky a ich gumené rohože), ani za vady spôsobené po prechode nebezpečenstva
            nesprávnym používaním, preťažením, nesprávnym palivom alebo mazivom, zanedbaním predpísanej údržby alebo
            zásahom tretej osoby.
          </li>
          <li>
            Ak vada predstavuje nepodstatné porušenie zmluvy, spôsob jej odstránenia (oprava alebo výmena) určuje
            predávajúci. Postup reklamácie pre podnikateľov upravuje{" "}
            <Link href="/reklamacny-poriadok">Reklamačný poriadok</Link>.
          </li>
          <li>
            Ak sa reklamácia ukáže ako neoprávnená, môžeme kupujúcemu účtovať náklady na diagnostiku podľa platného
            cenníka, ktorý na požiadanie zašleme pred posúdením stroja.
          </li>
          <li>
            <strong>Náhrada škody.</strong> Zmluvné strany pri uzavretí zmluvy predvídajú ako možný následok porušenia
            povinností škodu najviac do výšky kúpnej ceny tovaru, ktorého sa porušenie týka (§ 379 Obchodného
            zákonníka). Ušlý zisk a nepriame škody, napríklad prestoj stavby, strany za predvídateľnú škodu nepovažujú.
            Toto ustanovenie nie je vzdaním sa práva na náhradu škody (§ 386 Obchodného zákonníka) a nevzťahuje sa na
            škodu spôsobenú úmyselne ani na škodu na zdraví.
          </li>
          <li>
            Záruky výrobcov pri profesionálnom alebo podnikateľskom použití sa riadia podmienkami výrobcu, ktoré sa
            môžu líšiť od podmienok pre spotrebiteľov.
          </li>
          <li>
            Ustanovenia o odstúpení spotrebiteľa (článok 9), o riešení spotrebiteľských sporov (článok 11 body 1 až 3)
            a odporúčanie v článku 6 bode 5 sa na podnikateľa nevzťahujú. Spory rieši príslušný súd Slovenskej
            republiky.
          </li>
        </ol>
      </LegalSection>

      <LegalSection id="zaver" title="14. Záverečné ustanovenia">
        <ol>
          <li>
            Tieto VOP sú platné a účinné od {LEGAL_VALID_FROM} (verzia {LEGAL_VERSION}). Na zmluvu sa vzťahuje znenie
            VOP platné v čase odoslania objednávky. Verziu, s ktorou ste súhlasili, ukladáme pri každej objednávke.
          </li>
          <li>
            VOP môžeme zmeniť. Zmena sa nevzťahuje na zmluvy uzavreté pred jej účinnosťou. Predchádzajúce znenia VOP
            vám na požiadanie pošleme e-mailom.
          </li>
          <li>
            Zmluvu uzatvárame v slovenskom jazyku. Objednávku a potvrdenie objednávky archivujeme v elektronickej
            podobe. Ich kópiu dostanete e-mailom a na požiadanie vám ju pošleme znova.
          </li>
          <li>
            Zmluva sa riadi právom Slovenskej republiky. Ak je niektoré ustanovenie VOP neplatné, ostatné ustanovenia
            zostávajú v platnosti.
          </li>
        </ol>
      </LegalSection>
    </LegalPage>
  );
}
