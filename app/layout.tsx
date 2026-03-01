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
  title: "Haunted Wallpapers | Dark Fantasy Art & Occult Wallpapers",
  description:
    "Free dark fantasy wallpapers, tarot art, and occult designs. Download high-resolution AI art collections. Skeletons, demons, goddesses and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsPid = process.env.NEXT_PUBLIC_ADSENSE_PID;
  return (
    <html lang="en">
      <head>
        {adsPid && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsPid}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={`${cormorant.variable} ${cinzel.variable} ${spaceMono.variable}`}>
        <Cursor />
        {children}
      </body>
    </html>
  );
}