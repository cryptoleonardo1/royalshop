import type { Metadata } from "next";
import Link from "next/link";
import { getShopSettings } from "@/lib/catalog";
import { UOOU, lowerFirst } from "@/lib/legal";
import { LegalNote, LegalPage, LegalSection } from "@/components/shop/legal-page";

export const metadata: Metadata = {
  title: "Ochrana osobných údajov",
  description:
    "Aké osobné údaje Royal Shop spracúva pri objednávke, na aký účel, ako dlho, komu ich poskytuje a aké máte práva podľa GDPR.",
};

const TOC = [
  { id: "prevadzkovatel", label: "Kto spracúva vaše údaje" },
  { id: "kontakt", label: "Ako nás kontaktovať" },
  { id: "zdroj", label: "Odkiaľ údaje máme" },
  { id: "ucely", label: "Účely, právne základy a doba uchovávania" },
  { id: "povinnost", label: "Musíte nám údaje poskytnúť?" },
  { id: "prijemcovia", label: "Komu údaje poskytujeme" },
  { id: "prenos", label: "Prenos mimo EÚ" },
  { id: "automatizovane", label: "Automatizované rozhodovanie" },
  { id: "prava", label: "Vaše práva" },
  { id: "staznost", label: "Sťažnosť" },
  { id: "zabezpecenie", label: "Zabezpečenie" },
  { id: "zmeny", label: "Zmeny týchto zásad" },
];

export default async function PrivacyPage() {
  const s = await getShopSettings();
  const seat = [s.street, [s.zip, s.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const email = s.email ?? "[doplniť e-mail]";

  return (
    <LegalPage
      title="Ochrana osobných údajov"
      lede="Informácie o tom, ako pri nákupe v Royal Shop zaobchádzame s vašimi osobnými údajmi (čl. 13 GDPR)."
      toc={TOC}
      current="/ochrana-osobnych-udajov"
    >
      <LegalSection id="prevadzkovatel" title="1. Kto spracúva vaše údaje">
        <p>
          Prevádzkovateľom je <strong>{s.companyName}</strong>
          {seat ? <>, so sídlom {seat}</> : null}, IČO {s.ico ?? "[doplniť]"}, DIČ {s.dic ?? "[doplniť]"}, IČ DPH{" "}
          {s.icDph ?? "[doplniť]"}
          {s.registerInfo ? <>, {lowerFirst(s.registerInfo)}</> : null} (ďalej „my“), prevádzkovateľ e-shopu Royal
          Shop.
        </p>
      </LegalSection>

      <LegalSection id="kontakt" title="2. Ako nás kontaktovať">
        <p>
          E-mail: {s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : "[doplniť]"}
          {s.phone ? <> · telefón: {s.phone}</> : null} · poštou na adresu sídla s označením „GDPR“.
        </p>
        <p>
          Zodpovednú osobu (DPO) sme nevymenovali, pretože nám táto povinnosť podľa čl. 37 GDPR nevzniká. Všetky otázky k
          osobným údajom vybavujeme na e-maile {email}.
        </p>
      </LegalSection>

      <LegalSection id="zdroj" title="3. Odkiaľ údaje máme">
        <p>
          Údaje nám poskytujete vy sami pri objednávke, reklamácii, odstúpení od zmluvy alebo keď nám napíšete či
          zavoláte. Ak objednávku zadal niekto iný a vy ste uvedení ako príjemca alebo kontaktná osoba firmy, údaje sme
          dostali od neho.
        </p>
        <p>
          O platbe nám platobná brána Stripe oznámi jej výsledok a základné údaje (napríklad posledné 4 číslice a krajinu
          karty). Úplné číslo karty nikdy nevidíme.
        </p>
      </LegalSection>

      <LegalSection id="ucely" title="4. Účely, právne základy a doba uchovávania">
        <table>
          <thead>
            <tr>
              <th scope="col">Účel</th>
              <th scope="col">Údaje</th>
              <th scope="col">Právny základ</th>
              <th scope="col">Ako dlho</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Objednávka a plnenie kúpnej zmluvy</strong>: prijatie a potvrdenie objednávky, platba,
                objednanie stroja u dodávateľa, kontrola a skúšobný chod, doručenie alebo osobný odber, informácie o
                stave objednávky
              </td>
              <td>
                meno a priezvisko, e-mail, telefón, fakturačná a doručovacia adresa, pri firme obchodné meno, IČO, DIČ a
                IČ DPH, obsah objednávky, poznámka, údaje o platbe
              </td>
              <td>
                plnenie zmluvy a opatrenia pred jej uzavretím (čl. 6 ods. 1 písm. b) GDPR); pri kontaktnej osobe firmy
                náš oprávnený záujem komunikovať so zástupcom zmluvnej strany (čl. 6 ods. 1 písm. f))
              </td>
              <td>počas plnenia zmluvy, potom podľa riadku „Právne nároky“</td>
            </tr>
            <tr>
              <td>
                <strong>Účtovníctvo a dane</strong>: faktúry, dobropisy, doklady o platbe
              </td>
              <td>identifikačné a fakturačné údaje, položky, sumy</td>
              <td>
                zákonná povinnosť podľa zákona o účtovníctve a zákona o DPH (čl. 6 ods. 1 písm. c))
              </td>
              <td>10 rokov nasledujúcich po roku, ktorého sa doklad týka</td>
            </tr>
            <tr>
              <td>
                <strong>Reklamácie a odstúpenie od zmluvy</strong>: prijatie, vybavenie a potvrdenie, vrátenie peňazí,
                komunikácia so servisom alebo výrobcom
              </td>
              <td>
                údaje z objednávky, popis vady, fotografie, výrobné číslo, protokol zo skúšky stroja, komunikácia, číslo
                účtu na vrátenie peňazí
              </td>
              <td>
                zákonná povinnosť podľa Občianskeho zákonníka a zákona o ochrane spotrebiteľa (čl. 6 ods. 1 písm. c));
                pri firmách plnenie zmluvy (čl. 6 ods. 1 písm. b))
              </td>
              <td>5 rokov od vybavenia reklamácie alebo od odstúpenia</td>
            </tr>
            <tr>
              <td>
                <strong>Právne nároky</strong>: preukazovanie, uplatňovanie a obhajoba
              </td>
              <td>
                údaje o objednávke a platbe, komunikácia, verzia obchodných podmienok, s ktorou ste súhlasili, a čas
                súhlasu
              </td>
              <td>oprávnený záujem (čl. 6 ods. 1 písm. f))</td>
              <td>5 rokov od dodania tovaru; pri prebiehajúcom spore až do jeho skončenia</td>
            </tr>
            <tr>
              <td>
                <strong>Komunikácia</strong>: odpovede na otázky e-mailom alebo telefonicky
              </td>
              <td>meno, kontakt, obsah správy</td>
              <td>
                opatrenia pred uzavretím zmluvy alebo plnenie zmluvy (čl. 6 ods. 1 písm. b)), ak sa otázka týka nákupu;
                inak oprávnený záujem odpovedať na vašu správu (čl. 6 ods. 1 písm. f))
              </td>
              <td>1 rok od vybavenia; ak sa týka objednávky, rovnako dlho ako objednávka</td>
            </tr>
            <tr>
              <td>
                <strong>Bezpečnosť a prevencia podvodov</strong>: kontrola platieb, ochrana pred zneužitím, technické
                záznamy servera
              </td>
              <td>údaje o platbe, IP adresa a údaje o zariadení v záznamoch servera</td>
              <td>oprávnený záujem na bezpečnosti služby a ochrane pred podvodmi (čl. 6 ods. 1 písm. f))</td>
              <td>záznamy servera krátko, najviac 30 dní; údaje v Stripe podľa zásad Stripe</td>
            </tr>
            <tr>
              <td>
                <strong>Cookies a lokálne úložisko prehliadača</strong>
              </td>
              <td>
                podľa stránky <Link href="/cookies">Cookies</Link>
              </td>
              <td>nevyhnutné pre službu, ktorú ste si vyžiadali (§ 109 ods. 8 zákona o elektronických komunikáciách)</td>
              <td>podľa stránky Cookies</td>
            </tr>
          </tbody>
        </table>
        <LegalNote>
          <p>
            Momentálne vám <strong>neposielame žiadne marketingové e-maily</strong> ani newsletter. Údaje z objednávky
            nepoužívame na reklamu a nikomu ich nepredávame.
          </p>
        </LegalNote>
      </LegalSection>

      <LegalSection id="povinnost" title="5. Musíte nám údaje poskytnúť?">
        <p>
          Údaje označené v objednávke ako povinné potrebujeme na uzavretie a splnenie kúpnej zmluvy. Bez nich objednávku
          nevybavíme. Údaje na faktúre vyžaduje zákon. Ostatné údaje (napríklad poznámka k objednávke) sú dobrovoľné.
        </p>
      </LegalSection>

      <LegalSection id="prijemcovia" title="6. Komu údaje poskytujeme">
        <p>
          Údaje poskytujeme len tým, ktorí ich potrebujú na uvedené účely. Sprostredkovatelia ich spracúvajú iba podľa
          našich pokynov a na základe zmluvy.
        </p>
        <table>
          <thead>
            <tr>
              <th scope="col">Príjemca</th>
              <th scope="col">Rola</th>
              <th scope="col">Na čo</th>
              <th scope="col">Kde</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Stripe Payments Europe Ltd. (Írsko)</td>
              <td>
                sprostredkovateľ pri spracovaní platby; samostatný prevádzkovateľ pri prevencii podvodov a plnení
                povinností proti praniu špinavých peňazí
              </td>
              <td>platby kartou, Apple Pay a Google Pay</td>
              <td>EÚ a USA</td>
            </tr>
            <tr>
              <td>Supabase</td>
              <td>sprostredkovateľ</td>
              <td>databáza objednávok a ukladanie súborov</td>
              <td>údaje uložené v EÚ (Frankfurt)</td>
            </tr>
            <tr>
              <td>Vercel Inc. (USA)</td>
              <td>sprostredkovateľ</td>
              <td>hosting webu a serverové funkcie</td>
              <td>EÚ a USA</td>
            </tr>
            <tr>
              <td>Resend (USA), po nasadení</td>
              <td>sprostredkovateľ</td>
              <td>odosielanie e-mailov k objednávke</td>
              <td>USA</td>
            </tr>
            <tr>
              <td>prepravné a kuriérske spoločnosti</td>
              <td>podľa zmluvy s dopravcom</td>
              <td>doručenie zásielky (meno, adresa, telefón, e-mail)</td>
              <td>Slovensko a EÚ</td>
            </tr>
            <tr>
              <td>účtovník</td>
              <td>sprostredkovateľ</td>
              <td>vedenie účtovníctva</td>
              <td>Slovensko</td>
            </tr>
            <tr>
              <td>dodávatelia a výrobcovia strojov</td>
              <td>samostatní prevádzkovatelia</td>
              <td>len ak vám stroj doručujú priamo (meno, adresa, telefón)</td>
              <td>EÚ</td>
            </tr>
            <tr>
              <td>Google Ireland Ltd.</td>
              <td>samostatný prevádzkovateľ</td>
              <td>
                mapa na stránke <Link href="/kontakt">Kontakt</Link>, len ak ju sami otvoríte kliknutím
              </td>
              <td>EÚ a USA</td>
            </tr>
            <tr>
              <td>advokát, súd, exekútor; orgány verejnej moci (napríklad SOI, finančná správa, polícia)</td>
              <td>samostatní prevádzkovatelia</td>
              <td>uplatnenie a obhajoba nárokov, alebo ak to ukladá zákon</td>
              <td>Slovensko</td>
            </tr>
          </tbody>
        </table>
      </LegalSection>

      <LegalSection id="prenos" title="7. Prenos mimo EÚ">
        <p>
          Niektorí naši poskytovatelia (Vercel, Stripe, Resend, pri mape Google) sídlia v USA alebo tam majú prístup k
          údajom. Prenos sa opiera o rozhodnutie Európskej komisie o primeranosti pre rámec{" "}
          <strong>EU-US Data Privacy Framework</strong> (pri certifikovaných spoločnostiach) a o{" "}
          <strong>štandardné zmluvné doložky</strong> schválené Európskou komisiou. Kópiu týchto záruk vám na požiadanie
          poskytneme.
        </p>
      </LegalSection>

      <LegalSection id="automatizovane" title="8. Automatizované rozhodovanie">
        <p>
          Platby kartou kontroluje služba <strong>Stripe Radar</strong>. Automaticky vyhodnocuje riziko podvodu a
          podozrivú platbu môže zamietnuť. Ide o rozhodnutie potrebné na uzavretie zmluvy (čl. 22 ods. 2 písm. a) GDPR) a
          Stripe ho robí aj ako samostatný prevádzkovateľ.
        </p>
        <p>
          Ak bola vaša platba zamietnutá, napíšte nám na {email}. Máte právo, aby situáciu posúdil človek, vyjadriť svoj
          názor a rozhodnutie napadnúť. Iné automatizované rozhodovanie ani profilovanie s právnymi účinkami
          nerobíme.
        </p>
      </LegalSection>

      <LegalSection id="prava" title="9. Vaše práva">
        <p>Máte právo:</p>
        <ul>
          <li>na prístup k svojim údajom a ich kópiu (čl. 15 GDPR),</li>
          <li>na opravu nesprávnych údajov (čl. 16),</li>
          <li>na vymazanie (čl. 17), ak nám to nebráni zákonná povinnosť, napríklad uchovávať faktúry,</li>
          <li>na obmedzenie spracúvania (čl. 18),</li>
          <li>na prenosnosť údajov, ktoré spracúvame na základe zmluvy alebo súhlasu (čl. 20),</li>
          <li>
            namietať proti spracúvaniu na základe oprávneného záujmu (čl. 21). Proti priamemu marketingu môžete namietať
            kedykoľvek a bez udania dôvodu,
          </li>
          <li>nebyť predmetom výlučne automatizovaného rozhodnutia bez možnosti ľudského posúdenia (čl. 22),</li>
          <li>odvolať súhlas kedykoľvek, ak sme vás oň požiadali. Odvolanie nemá vplyv na spracúvanie pred ním.</li>
        </ul>
        <p>
          Žiadosti posielajte na {email}. Vybavíme ich bezplatne <strong>do 1 mesiaca</strong>, v zložitých prípadoch
          najviac o ďalšie 2 mesiace, o čom vás vopred informujeme. Aby sme údaje nevydali inej osobe, môžeme si overiť
          vašu totožnosť.
        </p>
      </LegalSection>

      <LegalSection id="staznost" title="10. Sťažnosť">
        <p>
          Ak si myslíte, že s vašimi údajmi zaobchádzame v rozpore so zákonom, môžete podať návrh na začatie konania na{" "}
          <strong>{UOOU.name}</strong>, {UOOU.address},{" "}
          <a href={UOOU.web} target="_blank" rel="noopener noreferrer">
            {UOOU.web.replace(/^https?:\/\//, "")}
          </a>
          . Najprv sa však môžete obrátiť na nás a problém sa pokúsime vyriešiť.
        </p>
      </LegalSection>

      <LegalSection id="zabezpecenie" title="11. Zabezpečenie">
        <p>
          Web používa šifrované spojenie (HTTPS). K údajom majú prístup len poverené osoby, a to len v rozsahu ich úlohy.
          Prístup v databáze je obmedzený oprávneniami. Údaje o platobnej karte spracúva iba Stripe, k nám sa
          nedostanú.
        </p>
      </LegalSection>

      <LegalSection id="zmeny" title="12. Zmeny týchto zásad">
        <p>
          Zásady aktualizujeme, keď sa zmení spôsob spracúvania, napríklad keď spustíme zákaznícke účty alebo začneme
          posielať marketingové e-maily. Dátum účinnosti je uvedený hore. Predchádzajúce verzie vám poskytneme na požiadanie.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
