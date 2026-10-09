// Shared mock content for the three design directions (/navrh/a|b|c). Not used by the real shop.

export interface MockProduct {
  slug: string;
  name: string;
  brand: string;
  sku: string;
  category: string;
  priceGross: number; // EUR incl. VAT
  compareAt?: number;
  platform?: "18V LXT" | "40V XGT";
  kit?: boolean;
  leadDays: string;
  tag?: string;
  specs: { label: string; value: string }[];
  rentalPerDay?: number;
}

export const products: MockProduct[] = [
  {
    slug: "makita-hr4013c",
    name: "Kombinované kladivo SDS-max HR4013C",
    brand: "Makita",
    sku: "HR4013C",
    category: "Kladivá",
    priceGross: 899,
    leadDays: "3–4 pracovné dni",
    tag: "Bestseller",
    specs: [
      { label: "Príkon", value: "1 100 W" },
      { label: "Energia úderu", value: "8 J" },
      { label: "Upínanie", value: "SDS-max" },
      { label: "Hmotnosť", value: "6,8 kg" },
    ],
    rentalPerDay: 25,
  },
  {
    slug: "makita-dhr400zku",
    name: "AKU kladivo SDS-max 2×18V DHR400ZKU",
    brand: "Makita",
    sku: "DHR400ZKU",
    category: "AKU kladivá",
    priceGross: 1149,
    compareAt: 1289,
    platform: "18V LXT",
    leadDays: "3–4 pracovné dni",
    tag: "Akcia",
    specs: [
      { label: "Napätie", value: "2 × 18 V" },
      { label: "Energia úderu", value: "8 J" },
      { label: "Motor", value: "bezuhlíkový" },
      { label: "Hmotnosť", value: "8,0 kg" },
    ],
  },
  {
    slug: "makita-tw001gm201",
    name: "AKU rázový uťahovák 1\" XGT TW001GM201",
    brand: "Makita",
    sku: "TW001GM201",
    category: "Uťahováky",
    priceGross: 1389,
    platform: "40V XGT",
    kit: true,
    leadDays: "3–4 pracovné dni",
    specs: [
      { label: "Napätie", value: "40 V max" },
      { label: "Krútiaci moment", value: "1 800 Nm" },
      { label: "Batérie", value: "2 × 4,0 Ah" },
      { label: "Hmotnosť", value: "3,9 kg" },
    ],
    rentalPerDay: 20,
  },
  {
    slug: "makita-ga9071x1",
    name: "Uhlová brúska 230 mm GA9071X1",
    brand: "Makita",
    sku: "GA9071X1",
    category: "Brúsky",
    priceGross: 289,
    leadDays: "3–4 pracovné dni",
    specs: [
      { label: "Príkon", value: "2 800 W" },
      { label: "Priemer kotúča", value: "230 mm" },
      { label: "Otáčky", value: "6 600 min⁻¹" },
      { label: "Hmotnosť", value: "5,9 kg" },
    ],
  },
  {
    slug: "makita-uc016gt101",
    name: "AKU reťazová píla XGT UC016GT101",
    brand: "Makita",
    sku: "UC016GT101",
    category: "Píly",
    priceGross: 749,
    platform: "40V XGT",
    kit: true,
    leadDays: "3–4 pracovné dni",
    tag: "Novinka",
    specs: [
      { label: "Napätie", value: "40 V max" },
      { label: "Dĺžka lišty", value: "40 cm" },
      { label: "Batéria", value: "1 × 5,0 Ah" },
      { label: "Hmotnosť", value: "5,8 kg" },
    ],
  },
  {
    slug: "ntc-vd-60-h",
    name: "Vibračná doska VD 60/H",
    brand: "NTC",
    sku: "VD60H",
    category: "Vibračné dosky",
    priceGross: 1690,
    leadDays: "5–7 pracovných dní",
    specs: [
      { label: "Motor", value: "Honda GX160" },
      { label: "Odstredivá sila", value: "12 kN" },
      { label: "Šírka dosky", value: "50 cm" },
      { label: "Hmotnosť", value: "60 kg" },
    ],
    rentalPerDay: 35,
  },
];

export const categories = [
  { name: "AKU náradie", count: 412 },
  { name: "Kladivá a búracie stroje", count: 96 },
  { name: "Brúsky a píly", count: 188 },
  { name: "Stavebné stroje", count: 74 },
  { name: "Záhradná technika", count: 131 },
  { name: "Batérie a nabíjačky", count: 58 },
];

export const usps = [
  { title: "Otestované pred odoslaním", text: "Každý stroj zapneme, skontrolujeme a až potom zabalíme." },
  { title: "Doprava zdarma od 2 000 €", text: "Ťažké stroje privezieme vlastnou technikou." },
  { title: "Osobný odber v Senci", text: "Vyzdvihnete si ho na pobočke Royal Stroje." },
  { title: "Autorizovaný predajca", text: "Originálny tovar s plnou zárukou výrobcu." },
];

export function eur(v: number) {
  return new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" }).format(v);
}

export function net(v: number) {
  return v / 1.23;
}
