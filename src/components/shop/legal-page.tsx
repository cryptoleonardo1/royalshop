import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL_PAGES, LEGAL_VALID_FROM } from "@/lib/legal";
import css from "./shop.module.css";

// Shared frame for the legal pages: breadcrumbs, title, table of contents, prose, links to the sibling pages.
// Content is plain JSX inside <LegalSection>s; the `.legal` styles cover p, ul, ol, table, h3, blockquote.

export interface TocItem {
  id: string;
  label: string;
}

export function LegalPage({
  title,
  lede,
  toc,
  current,
  children,
}: {
  title: string;
  lede?: ReactNode;
  toc?: TocItem[];
  current: string; // href of this page, hidden from the "see also" list
  children: ReactNode;
}) {
  return (
    <div className={`${css.wrap} ${css.page}`}>
      <header className={css.pageHead}>
        <nav aria-label="Omrvinky">
          <ol className={css.crumbs}>
            <li>
              <Link href="/">Domov</Link>
            </li>
            <li aria-current="page">{title}</li>
          </ol>
        </nav>
        <h1 className={css.pageTitle}>{title}</h1>
        {lede && <p className={css.pageLede}>{lede}</p>}
        <p className={css.legalMeta}>Platné od {LEGAL_VALID_FROM}</p>
      </header>

      <div className={css.legalGrid}>
        {toc && toc.length > 0 && (
          <nav className={css.legalToc} aria-label="Obsah stránky">
            <p className={css.legalTocHead}>Obsah</p>
            <ol>
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`}>{t.label}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className={css.legal}>
          {children}
          <nav className={css.legalSeeAlso} aria-label="Ďalšie informácie pre zákazníkov">
            <p className={css.legalTocHead}>Ďalšie informácie</p>
            <ul>
              {LEGAL_PAGES.filter((p) => p.href !== current).map((p) => (
                <li key={p.href}>
                  <Link href={p.href}>{p.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/kontakt">Kontakt</Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={css.legalSection}>
      <h2 id={`${id}-h`}>{title}</h2>
      {children}
    </section>
  );
}

// A highlighted box for the key point of a section (e.g. "what this means for you").
export function LegalNote({ children }: { children: ReactNode }) {
  return <div className={css.legalNoteBox}>{children}</div>;
}
