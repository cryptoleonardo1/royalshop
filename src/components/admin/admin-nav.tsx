"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart } from "lucide-react";
import css from "./admin.module.css";

const LINKS = [
  { href: "/admin", label: "Prehľad", icon: LayoutDashboard, exact: true },
  { href: "/admin/objednavky", label: "Objednávky", icon: ShoppingCart, exact: false },
];

// Planned modules (docs/07-admin-konzola-plan.md), shown so the team knows what is coming.
const SOON = ["Faktúry", "Odstúpenia", "Reklamácie", "Produkty", "Nastavenia"];

// Pathname is request data: the layout renders <NavList pathname=""> as the Suspense fallback.
export function AdminNav() {
  return <NavList pathname={usePathname()} />;
}

export function NavList({ pathname }: { pathname: string }) {
  return (
    <nav className={css.nav} aria-label="Administrácia">
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={css.navLink} aria-current={active ? "page" : undefined}>
            <Icon size={16} aria-hidden="true" /> {label}
          </Link>
        );
      })}
      {SOON.map((label) => (
        <span key={label} className={`${css.navLink} ${css.navSoon}`}>
          {label} <small>čoskoro</small>
        </span>
      ))}
    </nav>
  );
}
