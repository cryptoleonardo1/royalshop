import { ShopShell } from "@/components/shop/chrome";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return <ShopShell>{children}</ShopShell>;
}
