import type { Metadata } from "next";
import css from "@/components/admin/admin.module.css";

export const metadata: Metadata = {
  title: { default: "Administrácia", template: "%s | Royal Shop admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className={css.root}>{children}</div>;
}
