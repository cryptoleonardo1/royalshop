import Link from "next/link";
import { LogOut, Package, UserRound } from "lucide-react";
import { signOut } from "@/lib/account/actions";
import css from "@/components/shop/shop.module.css";

const LINKS = [
  { href: "/ucet", label: "Moje objednávky", key: "orders", Icon: Package },
  { href: "/ucet/profil", label: "Profil a nastavenia", key: "profile", Icon: UserRound },
] as const;

export function AccountNav({ current }: { current: (typeof LINKS)[number]["key"] }) {
  return (
    <nav aria-label="Môj účet" className={css.accountNav}>
      <ul>
        {LINKS.map(({ href, label, key, Icon }) => (
          <li key={key}>
            <Link href={href} aria-current={current === key ? "page" : undefined}>
              <Icon size={18} aria-hidden="true" /> {label}
            </Link>
          </li>
        ))}
      </ul>
      <form action={signOut}>
        <button type="submit">
          <LogOut size={18} aria-hidden="true" /> Odhlásiť sa
        </button>
      </form>
    </nav>
  );
}
