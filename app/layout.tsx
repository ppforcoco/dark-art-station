import type { Metadata } from "next";
import { Cinzel_Decorative, Cormorant_Garamond, Space_Mono } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel_Decorative({ 
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-cinzel" 
});

const cormorant = Cormorant_Garamond({ 
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-cormorant" 
});

const spaceMono = Space_Mono({ 
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space" 
});

export const metadata: Metadata = {
  title: "VOIDCANVAS | Art Born From The Abyss",
  description: "Premium dark fantasy wallpapers, tarot art, and occult designs. Download high-resolution AI art collections.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${cormorant.variable} ${cinzel.variable} ${spaceMono.variable} font-body bg-[#070710] text-[#d4cde8] min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}