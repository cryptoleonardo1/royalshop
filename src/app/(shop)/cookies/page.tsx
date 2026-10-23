import type { Metadata } from "next";
import Link from "next/link";
import { getShopSettings } from "@/lib/catalog";
import { LegalNote, LegalPage, LegalSection } from "@/components/shop/legal-page";

export const metadata: Metadata = {
  title: "Cookies",
  description:
    "Royal Shop dnes nenastavuje žiadne cookies. Košík sa ukladá len vo vašom prehliadači. Nepoužívame analytické ani reklamné cookies.",
};

const TOC = [
  { id: "co-su-cookies", label: "Čo sú cookies" },
  { id: "co-pouzivame", label: "Čo používame" },
  { id: "kosik", label: "Košík" },
  { id: "mapa", label: "Mapa na stránke Kontakt" },
  { id: "platba", label: "Platba cez Stripe" },
  { id: "pisma", label: "Písma" },
  { id: "analytika", label: "Analytika a reklama" },
  { id: "vymazanie", label: "Ako údaje vymazať" },
  { id: "kontakt", label: "Otázky" },
];

export default async function CookiesPage() {
  const s = await getShopSettings();

  return (
    <LegalPage
      title="Cookies"
      lede="Ako Royal Shop pracuje s cookies a úložiskom vo vašom prehliadači. Stručne: dnes nenastavujeme žiadne cookies a nesledujeme vás."
      toc={TOC}
      current="/cookies"
    >
      <LegalSection id="co-su-cookies" title="1. Čo sú cookies">
        <p>
          Cookies sú malé textové súbory, ktoré webová stránka uloží do vášho prehliadača. Podobne funguje aj lokálne
          úložisko prehliadača (localStorage). Bez vášho súhlasu smieme ukladať len to, čo je nevyhnutné na službu, ktorú
          ste si sami vyžiadali (§ 109 ods. 8 zákona č. 452/2021 Z. z. o elektronických komunikáciách). Na všetko ostatné
          potrebujeme váš súhlas.
        </p>
        <p>
          E-shop Royal Shop prevádzkuje {s.companyName}. Viac o tom, ako zaobchádzame s osobnými údajmi, nájdete na
          stránke <Link href="/ochrana-osobnych-udajov">Ochrana osobných údajov</Link>.
        </p>
      </LegalSection>

      <LegalSection id="co-pouzivame" title="2. Čo používame">
        <LegalNote>
          <p>
            Náš e-shop dnes <strong>nenastavuje žiadne cookies</strong>. Používame len jeden nevyhnutný záznam v lokálnom
            úložisku prehliadača, aby si e-shop pamätal váš košík. Preto vám nezobrazujeme lištu so súhlasom.
          </p>
        </LegalNote>
        <table>
          <thead>
            <tr>
              <th scope="col">Názov</th>
              <th scope="col">Typ</th>
              <th scope="col">Poskytovateľ</th>
              <th scope="col">Účel</th>
              <th scope="col">Platnosť</th>
              <th scope="col">Kategória</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>royal-cart-v1</td>
              <td>localStorage</td>
              <td>{s.companyName}</td>
              <td>
                uchováva obsah košíka (produkty a množstvá) vo vašom prehliadači; neobsahuje žiadne osobné údaje
              </td>
              <td>kým ho nevymažete</td>
              <td>nevyhnutné (bez súhlasu)</td>
            </tr>
          </tbody>
        </table>
      </LegalSection>

      <LegalSection id="kosik" title="3. Košík">
        <p>
          Keď pridáte stroj do košíka, prehliadač si obsah košíka uloží pod názvom royal-cart-v1. Záznam je uložený iba vo
          vašom prehliadači. Na výpočet aktuálnych cien a dopravy posiela prehliadač nášmu serveru len zoznam produktov a
          množstiev, nič, čo by vás identifikovalo. Ide o úložisko nevyhnutné na službu,
          ktorú ste si sami vyžiadali, preto naň nepotrebujeme súhlas.
        </p>
        <p>Záznam zmizne, keď košík vyprázdnite alebo keď vymažete údaje prehliadača pre tento web.</p>
      </LegalSection>

      <LegalSection id="mapa" title="4. Mapa na stránke Kontakt">
        <p>
          Mapa Google na stránke <Link href="/kontakt">Kontakt</Link> sa načíta <strong>až po kliknutí</strong> na
          tlačidlo „Zobraziť mapu“. Kým nekliknete, Google od nás nič nedostane.
        </p>
        <p>
          Po kliknutí Google Ireland Ltd. získa vašu IP adresu a môže ukladať vlastné cookies. Robí to ako samostatný
          prevádzkovateľ podľa svojich{" "}
          <a href="https://policies.google.com/privacy?hl=sk" target="_blank" rel="noopener noreferrer">
            zásad ochrany súkromia
          </a>{" "}
          a{" "}
          <a href="https://policies.google.com/technologies/cookies?hl=sk" target="_blank" rel="noopener noreferrer">
            pravidiel používania cookies
          </a>
          . Údaje môže prenášať aj do USA (EU-US Data Privacy Framework).
        </p>
      </LegalSection>

      <LegalSection id="platba" title="5. Platba cez Stripe">
        <p>
          Platba prebieha na samostatnej platobnej stránke spoločnosti Stripe (checkout.stripe.com), nie na našom webe.
          Cookies na tejto stránke nastavuje Stripe ako samostatný prevádzkovateľ, najmä na bezpečnosť platieb a
          prevenciu podvodov. Podrobnosti nájdete v{" "}
          <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer">
            zásadách cookies spoločnosti Stripe
          </a>{" "}
          a v jej{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
            zásadách ochrany súkromia
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="pisma" title="6. Písma">
        <p>
          Písma, ktoré na webe vidíte, posielame z nášho vlastného servera. Pri návšteve sa preto váš prehliadač
          nepripája na Google Fonts ani na iné služby tretích strán kvôli písmam.
        </p>
      </LegalSection>

      <LegalSection id="analytika" title="7. Analytika a reklama">
        <p>
          <strong>Nepoužívame analytické ani reklamné cookies</strong>, nemeriame návštevnosť nástrojmi tretích strán a
          nesledujeme vás naprieč webmi.
        </p>
        <p>
          Ak sa to v budúcnosti zmení, takéto cookies použijeme <strong>len s vaším predchádzajúcim súhlasom</strong>.
          Pred ich nasadením pridáme lištu, v ktorej ich budete môcť prijať alebo rovnako jednoducho odmietnuť, a súhlas
          budete môcť kedykoľvek odvolať. Túto stránku zároveň aktualizujeme.
        </p>
      </LegalSection>

      <LegalSection id="vymazanie" title="8. Ako údaje vymazať">
        <p>
          Cookies aj lokálne úložisko môžete kedykoľvek vymazať alebo zablokovať v nastaveniach prehliadača, zvyčajne v
          časti Súkromie alebo Údaje stránok. Návody pre jednotlivé prehliadače:
        </p>
        <ul>
          <li>
            <a href="https://support.google.com/chrome/answer/95647?hl=sk" target="_blank" rel="noopener noreferrer">
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/sk/kb/vymazanie-cookies-a-udajov-stranok-firefox"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/sk-sk/105082" target="_blank" rel="noopener noreferrer">
              Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/sk-sk/microsoft-edge/odstránenie-súborov-cookie-v-prehliadači-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
              target="_blank"
              rel="noopener noreferrer"
            >
              Microsoft Edge
            </a>
          </li>
        </ul>
        <p>Ak lokálne úložisko zablokujete, košík nebude fungovať.</p>
      </LegalSection>

      <LegalSection id="kontakt" title="9. Otázky">
        <p>
          S otázkami k cookies nám napíšte na{" "}
          {s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : "[doplniť e-mail]"}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
