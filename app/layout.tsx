import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientComponents from "@/components/ClientComponents";
import PWARegister from "@/components/PWARegister";
import AmbientPlayer from "@/components/AmbientPlayer";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";
const SITE_NAME = "Haunted Wallpapers";
const OG_IMAGE  = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/og-image.webp";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#0c0b14",
};

export const metadata: Metadata = {
  title: "Haunted Wallpapers | Free Dark Fantasy Wallpapers",
  description:
    "Free dark fantasy wallpapers for iPhone, Android and PC. Download high-resolution AI art — horror, gothic, street style, dark humor and more.",
  keywords: [
    "dark wallpapers", "horror wallpapers", "gothic wallpapers",
    "iPhone wallpapers", "Android wallpapers", "HD wallpapers",
    "AI art", "dark fantasy", "free wallpapers", "AMOLED wallpapers",
  ],
  metadataBase: new URL(SITE_URL),
  robots: {
    index: true, follow: true, nocache: false,
    googleBot: {
      index: true, follow: true,
      "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1,
    },
  },
  openGraph: {
    title:       "Haunted Wallpapers | Free Dark Fantasy Wallpapers",
    description: "Free dark fantasy wallpapers for iPhone, Android and PC. Download high-resolution AI art collections.",
    url: SITE_URL, siteName: SITE_NAME, type: "website", locale: "en_US",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Haunted Wallpapers — Dark Fantasy & Horror Art", type: "image/webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Haunted Wallpapers | Free Dark Fantasy Wallpapers",
    description: "Free dark fantasy wallpapers for iPhone, Android and PC. Download high-resolution AI art collections.",
    images: [OG_IMAGE], creator: "@hauntedwallpapers",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  alternates: { canonical: SITE_URL, languages: { "en-US": SITE_URL } },
  verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined },
};

// NOTE: CSP is set via response headers in next.config.ts only.
// No meta CSP tag here — the HTTP header always wins.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning style={{ backgroundColor: "#0c0b14", color: "#e8e4dc" }}>
      <head>
        {/* ── Hero image preload — LCP hint ───────────────────────────────── */}
        <link
          rel="preload"
          as="image"
          href="https://assets.hauntedwallpapers.com/extras/the-haunted-wallpapers-hero-section-image-mobile-dark-wallpapers-thumbnail.avif"
          type="image/avif"
          fetchPriority="high"
        />

        {/* ── Critical inline CSS ─────────────────────────────────────────── */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes hw-flicker {
            0%,100%{opacity:1}
            8%{opacity:.85}
            15%{opacity:1}
            42%{opacity:.9}
            45%{opacity:1}
            70%{opacity:.88}
            72%{opacity:1}
          }
        ` }} />

        {/* ── Theme init — must run before paint ───────────────────────────── */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('hw-theme');if(t){document.documentElement.setAttribute('data-theme',t);if(t==='fog'){document.documentElement.style.backgroundColor='#ece9e2';document.documentElement.style.color='#1c1a17';}else if(t==='ghost'){document.documentElement.style.backgroundColor='#0d0d14';document.documentElement.style.color='#e0e0f8';}else{document.documentElement.style.backgroundColor='#0c0b14';document.documentElement.style.color='#e8e4dc';}}else{document.documentElement.style.backgroundColor='#0c0b14';document.documentElement.style.color='#e8e4dc';}}catch(e){}})();` }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var h=new Date().getHours();if(h>=20||h<6)document.documentElement.setAttribute('data-night','true');}catch(e){}})();` }} />

        {/* ── PWA ─────────────────────────────────────────────────────────── */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />

        <meta name="p:domain_verify" content="6f1c92d3b0307e9bf30220a5068ce8af" />
        <meta name="b0081adf43b5553f44ff0be1b38995754b86db3d" content="b0081adf43b5553f44ff0be1b38995754b86db3d" />
        <meta name="clckd" content="92b4a62639498edfec7c4465cd7f19df" />
        <meta name="monetag" content="53e26003203fc193ee1c865da18679cf" />
        <meta name="theme-color" content="#0c0b14" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Haunted WP" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
        {process.env.NEXT_PUBLIC_GSC_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GSC_VERIFICATION} />
        )}
      </head>

      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org", "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                name: SITE_NAME, url: SITE_URL,
                logo: { "@type": "ImageObject", url: OG_IMAGE, width: 1200, height: 630 },
                sameAs: [],
                description: "Free dark fantasy wallpapers for iPhone, Android and PC. Bold original AI art.",
                contactPoint: { "@type": "ContactPoint", url: `${SITE_URL}/contact`, contactType: "Customer Support", availableLanguage: "en" },
              },
              {
                "@context": "https://schema.org", "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: SITE_URL, name: SITE_NAME,
                description: "Free dark fantasy wallpapers. Download HD wallpapers for iPhone, Android and PC.",
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
        <Header />
        <main className="content-wrapper">
          {children}
        </main>
        <Footer />
        <AmbientPlayer />
        <ClientComponents />
        <PWARegister />
        <script
          async
          src="https://cloud.umami.is/script.js"
          data-website-id="8aa04b22-aab2-4f50-b5cc-d2602ad3739a"
        />
      </body>
    </html>
  );
}