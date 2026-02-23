import type { Metadata } from "next";
import { Cinzel_Decorative, Cormorant_Garamond, Space_Mono } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/Cursor";

const cinzel = Cinzel_Decorative({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VOIDCANVAS | Art Born From The Abyss",
  description:
    "Premium dark fantasy wallpapers, tarot art, and occult designs. Download high-resolution AI art collections.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${cinzel.variable} ${spaceMono.variable}`}>
        <Cursor />
        {children}
      </body>
    </html>
  );
}