"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart-store";

// Rendered on the order page right after checkout: the order now holds the items.
export function ClearCart() {
  useEffect(() => clearCart(), []);
  return null;
}
