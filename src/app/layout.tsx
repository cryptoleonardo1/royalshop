import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Royal Shop – profesionálne náradie a stroje",
    template: "%s | Royal Shop",
  },
  description: "Profesionálne náradie Makita a stavebné stroje, overené pred odoslaním. Osobný odber v Senci.",
  // Demo phase: keep the whole site out of search engines until launch.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sk" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
