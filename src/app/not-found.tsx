import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShopShell } from "@/components/shop/chrome";
import css from "@/components/shop/shop.module.css";

export default function NotFound() {
  return (
    <ShopShell>
      <section className={`${css.wrap} ${css.page} ${css.notFound}`} aria-labelledby="nf-title">
        <p className={css.notFoundCode} aria-hidden="true">
          404
        </p>
        <h1 id="nf-title" className={css.pageTitle}>
          Táto stránka je mimo stavby
        </h1>
        <p className={css.pageLede}>
          Adresa neexistuje alebo produkt už nepredávame. Skúste vyhľadávanie alebo sa vráťte do sortimentu.
        </p>
        <div className={css.heroCtas}>
          <Link href="/produkty" className={css.btnPrimary}>
            Celý sortiment <ArrowRight size={20} aria-hidden="true" />
          </Link>
          <Link href="/" className={css.btnGhost}>
            Na úvod
          </Link>
        </div>
      </section>
    </ShopShell>
  );
}
