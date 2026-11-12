"use client";

import { useEffect, type ComponentProps } from "react";
import Link from "next/link";

// Next keeps previously visited pages in the DOM (hidden), so nothing here may rely on ids or on
// <style> tags rendered by a page: both would also match or apply for the hidden copies.

/** Pager link: the page changes in place and the view jumps to the top of the listing it belongs to. */
export function PageLink(props: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      scroll={false}
      onClick={(e) => e.currentTarget.closest("[data-listing]")?.scrollIntoView({ block: "start" })}
    />
  );
}

/** Marks the header menu item of the section the visible page belongs to (styled via [data-current]). */
export function ActiveSection({ slug }: { slug: string }) {
  useEffect(() => {
    const link = document.querySelector(`nav[data-cat-nav] a[href="/kategoria/${CSS.escape(slug)}"]`);
    link?.setAttribute("data-current", "");
    return () => link?.removeAttribute("data-current");
  }, [slug]);
  return null;
}
