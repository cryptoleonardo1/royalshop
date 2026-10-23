import { Suspense } from "react";
import Link from "next/link";
import { AdminNav, NavList } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "@/lib/admin/auth-actions";
import css from "@/components/admin/admin.module.css";

async function SignedInAs() {
  const admin = await requireAdmin();
  return (
    <div className={css.sideFoot}>
      {admin.name}
      <form action={signOut}>
        <button type="submit" className={css.linkButton}>
          Odhlásiť sa
        </button>
      </form>
    </div>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className={css.shell}>
      <aside className={css.side}>
        <Link href="/admin" className={css.brand}>
          Royal Shop <span>Administrácia</span>
        </Link>
        <Suspense fallback={<NavList pathname="" />}>
          <AdminNav />
        </Suspense>
        <Suspense fallback={<div className={css.sideFoot} />}>
          <SignedInAs />
        </Suspense>
      </aside>
      <main className={css.main}>{children}</main>
    </div>
  );
}
