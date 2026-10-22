"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import css from "./shop.module.css";

// The header is sticky (CSS). On phones it would take a quarter of the screen, so there it slides away
// while scrolling down and comes back on the first scroll up; on wider screens it always stays.
const PHONE = "(max-width: 799px)";
const HIDE_AFTER = 300; // px scrolled before the header may hide (past the top bar and header itself)

export function StickyHeader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const phone = window.matchMedia(PHONE);
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const header = ref.current;
      if (!phone.matches || !header) {
        setHidden(false);
      } else if (y < lastY - 4 || header.contains(document.activeElement)) {
        setHidden(false);
      } else if (y > lastY + 4 && y > HIDE_AFTER) {
        setHidden(true);
      }
      if (Math.abs(y - lastY) > 4) lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    phone.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      phone.removeEventListener("change", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      ref={ref}
      className={css.header}
      data-hidden={hidden || undefined}
      onFocusCapture={() => setHidden(false)}
    >
      {children}
    </header>
  );
}
