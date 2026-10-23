import type { Metadata } from "next";
import Link from "next/link";
import { getShopSettings } from "@/lib/catalog";
import { LEGAL_VALID_FROM, LEGAL_VERSION, SOI, lowerFirst } from "@/lib/legal";
import { LegalNote, LegalPage, LegalSection } from "@/components/shop/legal-page";

export const metadata: Metadata = {
  title: "Reklamačný poriadok",
  description:
    "Ako vytknúť vadu stroja kúpeného v Royal Shop: lehoty, postup, preprava stroja, čo nie je vadou, práva spotrebiteľa a podmienky pre podnikateľov.",
};

const EU_NOTICE_URL = "https://europa.eu/youreurope/citizens/consumers/shopping/guarantees-returns/index_sk.htm";

const TOC = [
  { id: "uvod", label: "1. Úvodné ustanovenia" },
  { id: "zodpovednost", label: "2. Zodpovednosť za vady" },
  { id: "co-nie-je-vada", label: "3. Čo nie je vadou" },
  { id: "doklady", label: "4. Doklady, ktoré odporúčame uschovať" },
  { id: "ako-reklamovat", label: "5. Ako a kde vadu vytknúť" },
  { id: "vybavenie", label: "6. Potvrdenie a lehota vybavenia" },
  { id: "prava", label: "7. Oprava, výmena, zľava, odstúpenie" },
  { id: "zamietnutie", label: "8. Zamietnutie a znalecký posudok" },
  { id: "neprevzaty-stroj", label: "9. Neprevzatý stroj" },
  { id: "zaruky-vyrobcov", label: "10. Záruky výrobcov" },
  { id: "riesenie-sporov", label: "11. Mimosúdne riešenie sporov" },
  { id: "podnikatelia", label: "12. Kupujúci – podnikatelia" },
  { id: "zaverecne", label: "13. Záverečné ustanovenia" },
];

export default async function ComplaintsPolicyPage() {
  const s = await getShopSettings();
  const sellerAddress = [s.street, [s.zip, s.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const email = s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : "[e-mail]";
  const claimsPlace = s.pickupAddress ?? sellerAddress;

  return (
    <LegalPage
      title="Reklamačný poriadok"
      lede="Ak má stroj vadu, ozvite sa nám. Reklamáciu vždy prijmeme, stroj si na naše náklady prevezmeme a vybavíme ju najneskôr do 30 dní. Na tejto stránke nájdete postup, lehoty a aj to, čo vadou nie je."
      toc={TOC}
      current="/reklamacny-poriadok"
    >
      <h2>Časť A: Spotrebitelia</h2>

      <LegalSection id="uvod" title="1. Úvodné ustanovenia">
        <p>
          Tento reklamačný poriadok upravuje postup pri uplatnení práv zo zodpovednosti za vady tovaru kúpeného
          v e-shope Royal Shop od spoločnosti {s.companyName}, {sellerAddress}, IČO {s.ico ?? "[doplniť]"}
          {s.registerInfo ? `, ${lowerFirst(s.registerInfo)}` : ""}, e-mail {email}
          {s.phone ? `, tel. ${s.phone}` : ""} (ďalej „predávajúci“ alebo „my“).
        </p>
        <p>
          Časť A platí pre kupujúceho, ktorý je spotrebiteľom, teda fyzickou osobou, ktorá pri kúpe nekoná v rámci
          svojej podnikateľskej činnosti alebo povolania. Pre kupujúcich, ktorí nakupujú ako podnikatelia (najmä na IČO
          pre svoje podnikanie), platí <a href="#podnikatelia">časť B</a>.
        </p>
        <p>
          Práva spotrebiteľa sa riadia najmä § 612 až 626 Občianskeho zákonníka a zákonom č. 108/2024 Z. z. o ochrane
          spotrebiteľa. Tento poriadok tieto práva nijako neobmedzuje. Ak by sa niektoré jeho ustanovenie odchyľovalo
          od zákona v neprospech spotrebiteľa, platí zákon.
        </p>
        <p>
          Informácie o vašich zákonných právach pri vadách tovaru nájdete aj v harmonizovanom oznámení EÚ:{" "}
          <a href={EU_NOTICE_URL} target="_blank" rel="noopener noreferrer">
            Vaše zákonné práva pri vadách tovaru (europa.eu)
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="zodpovednost" title="2. Zodpovednosť za vady">
        <p>
          Zodpovedáme za vadu, ktorú mal tovar v čase dodania a ktorá sa prejaví do dvoch rokov od dodania, teda od
          prevzatia tovaru (§ 619 ods. 1 Občianskeho zákonníka).
        </p>
        <p>
          Po prvom odstránení vady opravou sa táto doba predlžuje o 12 mesiacov. Predĺženie nastane len raz, bez
          ohľadu na počet opráv (§ 619 ods. 4 Občianskeho zákonníka).
        </p>
        <p>
          Ak sa vada prejaví počas tejto doby, predpokladá sa, že ju tovar mal už v čase dodania. To neplatí, ak sa
          preukáže opak alebo ak je tento predpoklad nezlučiteľný s povahou tovaru alebo vady (§ 620 ods. 1
          Občianskeho zákonníka).
        </p>
      </LegalSection>

      <LegalSection id="co-nie-je-vada" title="3. Čo nie je vadou, za ktorú zodpovedáme">
        <p>
          Zodpovedáme za vady, ktoré mal stroj pri dodaní. Nezodpovedáme za poškodenie, ktoré vzniklo až po dodaní
          a ktoré stroj v čase dodania nemal. Ide najmä o prípady, keď preukážeme, že poškodenie vzniklo:
        </p>
        <ol type="a">
          <li>
            prevádzkou v rozpore s návodom na použitie alebo použitím stroja na iný účel, než na ktorý je určený
            (napríklad hutnenie materiálu, na ktorý doska nie je určená, rezanie materiálu, na ktorý nie je určený
            kotúč, chod čerpadla nasucho);
          </li>
          <li>
            použitím nesprávneho paliva, oleja alebo iných prevádzkových kvapalín, alebo prevádzkou bez nich
            (napríklad benzín namiesto nafty, nesprávna zmes pri dvojtaktnom motore, chod motora bez oleja, voda
            alebo nečistoty v palive);
          </li>
          <li>
            zanedbaním údržby predpísanej návodom (napríklad výmena oleja, čistenie a výmena vzduchového filtra,
            kontrola a napnutie remeňa, kontrola skrutkových spojov);
          </li>
          <li>
            preťažením alebo prevádzkou mimo parametrov výrobcu (napríklad trvalé preťaženie elektrocentrály,
            prevádzka na väčšom sklone, než pripúšťa návod);
          </li>
          <li>
            mechanickým poškodením, napríklad nárazom, pádom, nevhodnou prepravou alebo neodborným zdvíhaním;
          </li>
          <li>
            neodborným zásahom, úpravou alebo opravou, ak tento zásah poškodenie spôsobil, alebo použitím dielu či
            príslušenstva, ktoré nespĺňa špecifikáciu výrobcu, ak toto poškodenie spôsobilo;
          </li>
          <li>živelnou udalosťou alebo inou vonkajšou udalosťou (napríklad požiar, zaplavenie, krádež časti stroja).</li>
        </ol>

        <h3>Opotrebenie spotrebných dielov</h3>
        <p>
          Niektoré diely sa pri bežnom používaní opotrebúvajú a majú obmedzenú životnosť. Pri našich strojoch sú to
          najmä diamantové kotúče, klinové a ozubené remene, zapaľovacie sviečky, vzduchové, palivové a olejové
          filtre, spodné (základové) dosky vibračných dosiek a ubíjadiel, gumené tlmiče a silentbloky, rukoväte,
          hadice a tesnenia čerpadiel.
        </p>
        <p>
          Ich opotrebenie po dobe a intenzite používania, ktorá je pre diel daného druhu bežná, nie je vadou.
          Napríklad diamantový kotúč sa rezaním postupne spotrebúva a po určitom počte metrov rezu ho treba vymeniť.
          Ak však taký diel zlyhá predčasne, teda skôr, než je pri bežnom používaní obvyklé, vadou byť môže a takú
          reklamáciu riadne posúdime.
        </p>

        <LegalNote>
          <p>
            <strong>Čo to znamená pre vás:</strong> tento článok vysvetľuje, čo vadou nie je. Nemení zákonné
            rozloženie dôkazného bremena podľa článku 2: ak tvrdíme, že poškodenie vzniklo po dodaní, musíme to
            preukázať my. Reklamáciu preto vždy prijmeme a posúdime. Použitie neoriginálneho dielu ani servis mimo
            nás samy osebe neznamenajú stratu vašich práv; rozhoduje, či práve to poškodenie spôsobilo.
          </p>
        </LegalNote>
      </LegalSection>

      <LegalSection id="doklady" title="4. Doklady, ktoré odporúčame uschovať">
        <p>Pre rýchle a bezproblémové vybavenie reklamácie odporúčame uschovať:</p>
        <ul>
          <li>návod na použitie v slovenčine, ktorý je súčasťou balenia, a dodržiavať v ňom predpísanú údržbu;</li>
          <li>
            protokol o skúšobnom chode, ktorý ku každému stroju prikladáme (výrobné číslo, stav počítadla motohodín,
            ak ho stroj má, záznam z funkčnej skúšky);
          </li>
          <li>záznam o zaškolení, ak ste stroj preberali osobne a absolvovali ste zaškolenie;</li>
          <li>faktúru (daňový doklad) a potvrdenie objednávky;</li>
          <li>
            doklady o servise a údržbe (napríklad o výmene oleja a filtrov) a pri poruche aj fotografie alebo video
            stroja a stav počítadla motohodín.
          </li>
        </ul>
        <p>
          Tieto doklady pomáhajú rýchlo zistiť príčinu poruchy. Nie sú podmienkou reklamácie: vadu môžete vytknúť
          aj bez nich, napríklad ak ste návod alebo protokol stratili.
        </p>
      </LegalSection>

      <LegalSection id="ako-reklamovat" title="5. Ako a kde vadu vytknúť (reklamovať)">
        <p>Vadu môžete vytknúť ktorýmkoľvek z týchto spôsobov:</p>
        <ul>
          <li>
            <strong>e-mailom</strong> na {email}. Uveďte číslo objednávky, opis vady a kedy sa prejavila a pripojte
            fotografie alebo video. Ak môžete, uveďte aj výrobné číslo stroja, stav počítadla motohodín a či si
            želáte opravu alebo výmenu;
          </li>
          <li>
            <strong>osobne</strong> na výdajnom mieste {claimsPlace}
            {s.pickupHours ? ` v prevádzkových hodinách (${s.pickupHours})` : " v prevádzkových hodinách"};
          </li>
          <li>
            <strong>poštou</strong> na adresu {s.companyName}, {sellerAddress}.
          </li>
        </ul>
        <p>
          Ak vám vopred, najneskôr pred odoslaním objednávky (napríklad pri produkte), oznámime autorizovaný servis,
          v ktorom možno vadu vytknúť, môžete ju vytknúť aj tam. Konanie takého servisu sa považuje za naše konanie
          a zodpovednosť za vady zostáva na nás (§ 622 ods. 5 Občianskeho zákonníka).
        </p>
        <p>
          Vadu treba vytknúť do dvoch mesiacov od jej zistenia, najneskôr do uplynutia doby podľa článku 2 (§ 621
          ods. 3 Občianskeho zákonníka). Odporúčame ozvať sa hneď, ako vadu zistíte, a stroj s vadou ďalej
          nepoužívať, aby sa poškodenie nezväčšilo.
        </p>
        <p>
          Chýbajúce údaje, fotografie alebo doklady nie sú dôvodom na odmietnutie reklamácie. Ak niečo potrebujeme
          doplniť, ozveme sa vám.
        </p>

        <h3>Preprava stroja</h3>
        <p>
          Stroj nemusíte k nám dopraviť. Pri vytknutí vady zabezpečíme a zaplatíme jeho prevzatie (odvoz od vás,
          pri ťažkých strojoch paletovou prepravou), prípadne sa dohodneme na posúdení alebo oprave na mieste.
          Opravený alebo vymenený stroj vám na naše náklady doručíme späť. Ak si stroj prinesiete alebo dopravíte
          sami, máte nárok na náhradu účelne vynaložených nákladov; uplatnite ho do dvoch mesiacov od vrátenia
          opraveného stroja (§ 509 Občianskeho zákonníka).
        </p>
        <p>
          Pred odvozom stroja so spaľovacím motorom vás požiadame o vypustenie paliva z nádrže, pretože dopravcovia
          stroje s palivom spravidla neprevezmú. Ak to nie je možné, dohodneme sa na inom riešení.
        </p>
      </LegalSection>

      <LegalSection id="vybavenie" title="6. Potvrdenie a lehota vybavenia">
        <p>
          Hneď po vytknutí vady vám vydáme písomné potvrdenie (e-mailom alebo v listinnej podobe). Potvrdenie
          obsahuje lehotu, v ktorej vadu odstránime.
        </p>
        <p>
          Vadu odstránime najneskôr do 30 dní odo dňa jej vytknutia. Dlhšia lehota je možná len z objektívneho
          dôvodu, ktorý nemôžeme ovplyvniť (§ 622 ods. 3 a § 623 ods. 4 Občianskeho zákonníka); o takom dôvode vás
          bez zbytočného odkladu informujeme.
        </p>
        <p>
          Oprava aj výmena sú pre vás bezplatné a vykonáme ich bez závažných ťažkostí pre vás, vrátane prepravy
          stroja tam aj späť.
        </p>
      </LegalSection>

      <LegalSection id="prava" title="7. Vaše práva: oprava, výmena, zľava, odstúpenie">
        <p>
          <strong>Oprava alebo výmena.</strong> Ak má stroj vadu, môžete si vybrať, či ju odstránime opravou alebo
          výmenou stroja. Zvolený spôsob môžeme odmietnuť len vtedy, ak nie je možný alebo by bol v porovnaní
          s druhým spôsobom neprimerane nákladný (§ 623 ods. 1 Občianskeho zákonníka). Na vašu žiadosť vám pri
          výmene môžeme dodať aj renovovaný stroj.
        </p>
        <p>
          <strong>Informácia pred opravou.</strong> Pred odstránením vady vás vždy informujeme o vašom práve vybrať si
          medzi opravou a výmenou a o tom, že sa doba zodpovednosti po prvej oprave predlžuje o 12 mesiacov, a to
          len raz (§ 623 ods. 2 Občianskeho zákonníka).
        </p>
        <p>
          <strong>Zľava alebo odstúpenie od zmluvy.</strong> Máte právo na primeranú zľavu z ceny alebo môžete od
          zmluvy odstúpiť, najmä ak vadu neodstránime opravou ani výmenou alebo ich odmietneme, ak sa rovnaká vada
          opakuje napriek oprave, ak je vada taká závažná, že to odôvodňuje okamžitú zľavu alebo odstúpenie, alebo
          ak je zrejmé, že vadu neodstránime včas alebo bez závažných ťažkostí pre vás (§ 624 ods. 1 Občianskeho
          zákonníka). Od zmluvy nemožno odstúpiť, ak je vada zanedbateľná alebo ak ste sa na jej vzniku podieľali
          (§ 624 ods. 4 Občianskeho zákonníka).
        </p>
        <p>
          Ak od zmluvy odstúpite, vrátime vám kúpnu cenu najneskôr do 14 dní, rovnakým spôsobom, akým ste platili.
          Za bežné opotrebenie ani za užívanie stroja do odstúpenia od vás nič nepožadujeme.
        </p>
        <LegalNote>
          <p>
            <strong>Čo to znamená pre vás:</strong> najprv si vyberáte opravu alebo výmenu. Zľava alebo vrátenie
            peňazí prichádzajú na rad, ak oprava ani výmena nepomôžu alebo nie sú možné.
          </p>
        </LegalNote>
      </LegalSection>

      <LegalSection id="zamietnutie" title="8. Zamietnutie reklamácie a znalecký posudok">
        <p>
          Ak po posúdení stroja zistíme, že nejde o vadu, za ktorú zodpovedáme (článok 3), dôvody zamietnutia vám
          oznámime písomne (§ 622 ods. 4 Občianskeho zákonníka). K oznámeniu pripojíme technický nález a podľa
          potreby fotodokumentáciu a vyjadrenie autorizovaného servisu. Zároveň vás informujeme o možnosti
          mimosúdneho riešenia sporu (článok 11).
        </p>
        <p>
          Ak so zamietnutím nesúhlasíte a znaleckým posudkom alebo odborným stanoviskom akreditovanej osoby
          preukážete, že za vadu zodpovedáme, môžete vadu vytknúť opakovane. Vtedy zodpovednosť odmietnuť
          nemôžeme a náklady na posudok alebo stanovisko vám uhradíme (§ 622 ods. 4 a § 509 Občianskeho
          zákonníka). Lehota dvoch mesiacov od zistenia vady sa v tomto prípade neuplatní.
        </p>
        <p>
          Po zamietnutí vám môžeme ponúknuť platenú opravu. Pred opravou vám oznámime jej cenu (alebo spôsob jej
          výpočtu a najvyššiu cenu); opravu vykonáme len s vaším súhlasom. O spôsobe vrátenia neopraveného stroja
          sa s vami dohodneme; osobný odber na výdajnom mieste je bezplatný.
        </p>
      </LegalSection>

      <LegalSection id="neprevzaty-stroj" title="9. Neprevzatý stroj">
        <p>
          Ak si opravený, vymenený alebo neopravený stroj neprevezmete do 6 mesiacov odo dňa, keď ste ho mali
          prevziať, môžeme ho predať. Keďže ide o vec väčšej hodnoty, vopred vás o tom upovedomíme a poskytneme vám
          primeranú dodatočnú lehotu na prevzatie. Výťažok z predaja po odpočítaní nákladov na úschovu a predaj vám
          vyplatíme, ak oň požiadate (§ 623 ods. 8 Občianskeho zákonníka).
        </p>
      </LegalSection>

      <LegalSection id="zaruky-vyrobcov" title="10. Záruky výrobcov">
        <p>
          Ak výrobca k stroju poskytuje vlastnú záruku (záruku výrobcu, spotrebiteľskú záruku), jej dĺžka
          a podmienky sú uvedené pri produkte alebo v záručnom liste priloženom k stroju. Záruka výrobcu sa
          uplatňuje za podmienok záručného listu.
        </p>
        <p>
          Záruka výrobcu je nad rámec zákona a vaše zákonné práva voči nám podľa článkov 2 až 8 nijako neobmedzuje.
          Vadu môžete vždy vytknúť aj u nás.
        </p>
      </LegalSection>

      <LegalSection id="riesenie-sporov" title="11. Mimosúdne riešenie sporov">
        <p>
          Ak nie ste spokojní so spôsobom, akým sme reklamáciu vybavili, alebo sa domnievate, že sme porušili vaše
          práva, môžete nám poslať žiadosť o nápravu e-mailom na {email}.
        </p>
        <p>
          Ak na žiadosť odpovieme zamietavo alebo na ňu neodpovieme do 30 dní od jej odoslania, môžete podať návrh
          na začatie alternatívneho riešenia sporu. Príslušným subjektom je{" "}
          <a href={SOI.web} target="_blank" rel="noopener noreferrer">
            Slovenská obchodná inšpekcia
          </a>{" "}
          alebo iný oprávnený subjekt zo{" "}
          <a href={SOI.arsListUrl} target="_blank" rel="noopener noreferrer">
            zoznamu Ministerstva hospodárstva SR
          </a>{" "}
          (§ 11 zákona č. 391/2015 Z. z.). Spotrebiteľ si môže vybrať, ktorému z nich návrh podá. Tým nie je
          dotknuté vaše právo obrátiť sa na súd.
        </p>
        <p>
          Dozor nad dodržiavaním predpisov na ochranu spotrebiteľa vykonáva {SOI.name}, {SOI.address}.
        </p>
      </LegalSection>

      <h2>Časť B: Kupujúci – podnikatelia</h2>

      <LegalSection id="podnikatelia" title="12. Kupujúci – podnikatelia">
        <p>
          Táto časť platí pre kupujúceho, ktorý nie je spotrebiteľom a kupuje v súvislosti so svojou podnikateľskou
          činnosťou (najmä obchodné spoločnosti a živnostníci nakupujúci na IČO). Časť A sa na neho nevzťahuje
          s výnimkou spôsobov vytknutia vady podľa článku 5.
        </p>

        <h3>12.1 Právny režim</h3>
        <p>
          Zodpovednosť za vady sa riadi Obchodným zákonníkom (najmä § 422 až 441) a týmto článkom. Predávajúci
          zodpovedá za vadu, ktorú mal tovar v čase prechodu nebezpečenstva škody na kupujúceho, teda pri odovzdaní
          tovaru prvému dopravcovi alebo pri osobnom odbere. Kupujúci preukazuje, že vada existovala v tom čase.
          Predávajúci neposkytuje záruku za akosť, ak ju výslovne písomne neprevezme.
        </p>

        <h3>12.2 Prehliadka tovaru</h3>
        <p>
          Kupujúci je povinný tovar prezrieť pri prevzatí. Zjavné vady a poškodenie pri preprave je povinný
          vyznačiť v preberacom protokole alebo v doklade dopravcu a oznámiť nám ich najneskôr do 2 pracovných dní
          od prevzatia. Inak môže uplatniť nároky z týchto vád len vtedy, ak preukáže, že tovar ich mal už pri
          prechode nebezpečenstva škody (§ 427 Obchodného zákonníka).
        </p>

        <h3>12.3 Oznámenie vád</h3>
        <p>
          Vady je kupujúci povinný oznámiť písomne (stačí e-mail) bez zbytočného odkladu po ich zistení, najneskôr
          do 12 mesiacov od dodania tovaru.
        </p>

        <h3>12.4 Čo nie je vadou</h3>
        <p>
          Predávajúci nezodpovedá za opotrebenie spotrebných a opotrebiteľných dielov (článok 3) ani za vady
          a poškodenie, ktoré vznikli po prechode nebezpečenstva škody, najmä nesprávnym používaním alebo
          prevádzkou v rozpore s návodom, preťažením, nesprávnym palivom, olejom alebo mazivom, zanedbaním
          predpísanej údržby, mechanickým poškodením, zásahom tretej osoby alebo vonkajšou udalosťou.
        </p>

        <h3>12.5 Nároky z vád</h3>
        <p>
          Predávajúci je oprávnený zvoliť spôsob odstránenia vady (opravu alebo výmenu). Zľavu z ceny alebo
          odstúpenie od zmluvy môže kupujúci uplatniť, len ak predávajúci vadu neodstráni ani v primeranej
          dodatočnej lehote, najmenej 30 dní. Tým nie sú dotknuté práva kupujúceho pri podstatnom porušení zmluvy
          podľa § 436 Obchodného zákonníka.
        </p>

        <h3>12.6 Preprava a diagnostika</h3>
        <p>
          Kupujúci dopraví tovar na výdajné miesto {claimsPlace} alebo do servisu, ktorý mu určíme, na vlastné
          náklady. Ak je reklamácia oprávnená, preukázané primerané náklady na dopravu mu uhradíme a opravený alebo
          vymenený tovar mu doručíme na naše náklady. Ak reklamácia oprávnená nie je, môžeme kupujúcemu účtovať
          náklady na diagnostiku podľa cenníka, ktorý mu oznámime vopred, a náklady na dopravu.
        </p>

        <h3>12.7 Náhrada škody</h3>
        <p>
          Zmluvné strany považujú za predvídateľnú škodu (§ 379 Obchodného zákonníka) škodu najviac do výšky kúpnej
          ceny dotknutého tovaru. Ušlý zisk a nepriame škody (napríklad prestoj stavby alebo zmluvné pokuty voči
          tretím osobám) strany za predvídateľné nepovažujú. Tým nie je dotknuté § 386 ods. 1 Obchodného zákonníka.
        </p>

        <h3>12.8 Záruky výrobcov</h3>
        <p>
          Záruky výrobcov pri profesionálnom a podnikateľskom použití sa riadia podmienkami výrobcu, ktoré bývajú
          odlišné (často kratšie) ako pri spotrebiteľoch. Podmienky sú uvedené pri produkte alebo v záručnom liste.
        </p>

        <h3>12.9 Rozhodné právo</h3>
        <p>
          Vzťahy s podnikateľmi sa riadia právom Slovenskej republiky, najmä Obchodným zákonníkom. Spory rozhodujú
          slovenské súdy príslušné podľa sídla predávajúceho.
        </p>
      </LegalSection>

      <LegalSection id="zaverecne" title="13. Záverečné ustanovenia">
        <p>
          Tento reklamačný poriadok je súčasťou{" "}
          <Link href="/obchodne-podmienky">obchodných podmienok</Link> a platí od {LEGAL_VALID_FROM} (verzia{" "}
          {LEGAL_VERSION}). Na každú objednávku sa vzťahuje znenie platné v čase jej odoslania. Ak ste spotrebiteľ
          a stroj si chcete len vrátiť bez udania dôvodu, pozrite si stránku{" "}
          <Link href="/odstupenie-od-zmluvy">Odstúpenie od zmluvy</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
