// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Cinzel_Decorative, Cormorant_Garamond, Space_Mono } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/Cursor";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HalloweenCountdown from "@/components/HalloweenCountdown";

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const SITE_NAME = "Haunted Wallpapers";
const OG_IMAGE  = `${SITE_URL}/og-image.jpg`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Haunted Wallpapers | Free Dark Fantasy & Occult Wallpapers",
  description:
    "Free dark fantasy wallpapers, tarot art, and occult designs. Download high-resolution AI art collections. Skeletons, demons, goddesses and more.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title:       "Haunted Wallpapers | Free Dark Fantasy & Occult Wallpapers",
    description: "Free dark fantasy wallpapers, tarot art, and occult designs. Download high-resolution AI art collections.",
    url:         SITE_URL,
    siteName:    SITE_NAME,
    type:        "website",
    images: [
      {
        url:    OG_IMAGE,
        width:  1200,
        height: 630,
        alt:    "Haunted Wallpapers — Dark Fantasy & Occult Art",
      },
    ],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Haunted Wallpapers | Free Dark Fantasy & Occult Wallpapers",
    description: "Free dark fantasy wallpapers, tarot art, and occult designs. Download high-resolution AI art collections.",
    images:      [OG_IMAGE],
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsPid = process.env.NEXT_PUBLIC_ADSENSE_PID;
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('hw-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://assets.hauntedwallpapers.com" />
        <link rel="dns-prefetch" href="https://assets.hauntedwallpapers.com" />
        {adsPid && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsPid}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={`${cormorant.variable} ${cinzel.variable} ${spaceMono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                name: SITE_NAME,
                url: SITE_URL,
                logo: { "@type": "ImageObject", url: OG_IMAGE, width: 1200, height: 630 },
                sameAs: ["https://instagram.com/hauntedwallpapers","https://pinterest.com/hauntedwallpapers"],
                description: "Free dark fantasy wallpapers, tarot art, and occult designs for iPhone, Android and PC.",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: SITE_URL,
                name: SITE_NAME,
                description: "Free dark fantasy wallpapers and occult art. Download 4K wallpapers for iPhone, Android and PC.",
                publisher: { "@id": `${SITE_URL}/#organization` },
                potentialAction: {
                  "@type": "SearchAction",
                  target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <Cursor />
        <HalloweenCountdown />
        <Header />
        <div className="content-wrapper">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}