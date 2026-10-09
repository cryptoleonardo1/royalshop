import { Big_Shoulders, Big_Shoulders_Stencil, Barlow, Martian_Mono } from "next/font/google";

const display = Big_Shoulders({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-display",
  display: "swap",
});
const stencil = Big_Shoulders_Stencil({
  subsets: ["latin", "latin-ext"],
  variable: "--font-stencil",
  display: "swap",
});
const body = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
const mono = Martian_Mono({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-mono",
  display: "swap",
});

export const fontVariables = `${display.variable} ${stencil.variable} ${body.variable} ${mono.variable}`;
