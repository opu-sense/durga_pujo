import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Manrope, Noto_Serif_Bengali, Hind_Siliguri, Dancing_Script } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const notoBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["600", "700", "800"],
  variable: "--font-noto-bengali",
});
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600"],
  variable: "--font-hind-siliguri",
});
const dancing = Dancing_Script({ subsets: ["latin"], weight: ["600"], variable: "--font-dancing" });

export const metadata: Metadata = {
  title: "Durga Pujo — Songs of the Festival",
  description: "A curated Durga Pujo & Mahalaya music experience. Pujo asche.",
};

export const viewport: Viewport = {
  themeColor: "#0b0a08",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <body
        className={`${manrope.variable} ${notoBengali.variable} ${hindSiliguri.variable} ${dancing.variable} bg-ink font-sans text-cream`}
      >
        {children}
      </body>
    </html>
  );
}
