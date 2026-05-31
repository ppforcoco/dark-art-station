import type { Metadata, Viewport } from "next";
import { Cinzel_Decorative, Cormorant_Garamond } from "next/font/google";
// ✅ REMOVED: Space_Mono — replaced with system monospace stack in CSS
// Cutting from 3 Google Font families → 2 saves ~30-40KB + 1 fewer font request
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientComponents from "@/components/ClientComponents";
import PWARegister from "@/components/PWARegister";

// ── FONT 1: Display / Headings ───────────────────────────────────────────────
// Used for: logo, section titles, hero title, nav logo
// preload: true  → fetched in the first HTTP request, never blocks LCP text
// display: swap  → shows fallback font immediately, swaps when ready (no invisible text)
const cinzel = Cinzel_Decorative({
  weight: ["900"],           // only 900 used in practice — drops ~60KB
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  preload: true,
  adjustFontFallback: false, // manual fallback metrics in globals.css
});

// ── FONT 2: Body / Prose ─────────────────────────────────────────────────────
// Used for: all body copy, card descriptions, footer links, blog content
// This is the LCP font — preloading it directly drops LCP by ~800ms-1.5s
const cormorant = Cormorant_Garamond({
  weight: ["400", "600"],    // drop 300 — not used in hot paths
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
  adjustFontFallback: false, // manual fallback metrics in globals.css
});

// ── Space Mono REMOVED ───────────────────────────────────────────────────────
// All --font-space usages in CSS now fall back to: 'Courier New', 'Lucida Console', monospace
// System monospace loads instantly — zero network request, zero render blocking
// The visual difference is negligible for small UI labels (nav links, badges, pills)

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning style={{ backgroundColor: "#0c0b14", color: "#e8e4dc" }}>
      <head>
        {/* ── Critical inline CSS ─────────────────────────────────────────────
            Only the flicker keyframe — no cursor:none here.
            Cursor hiding is now done ONLY in the Cursor component (pointer:fine only)
            and in globals.css. This prevents mobile users from ever getting
            cursor:none applied (which caused the "site can't load" flash on iOS). */}
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

        {/* ── Theme init — must run before paint ─────────────────────────────
            Sets background/text color from localStorage before first paint.
            This prevents the white flash on dark-theme sites.
            IMPORTANT: This is correct and necessary — do not remove. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('hw-theme');if(t){document.documentElement.setAttribute('data-theme',t);if(t==='fog'){document.documentElement.style.backgroundColor='#ece9e2';document.documentElement.style.color='#1c1a17';}else if(t==='ghost'){document.documentElement.style.backgroundColor='#0d0d14';document.documentElement.style.color='#e0e0f8';}else{document.documentElement.style.backgroundColor='#0c0b14';document.documentElement.style.color='#e8e4dc';}}else{document.documentElement.style.backgroundColor='#0c0b14';document.documentElement.style.color='#e8e4dc';}}catch(e){}})();` }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var h=new Date().getHours();if(h>=20||h<6)document.documentElement.setAttribute('data-night','true');}catch(e){}})();` }} />

        {/* ── CSS preload consumer ────────────────────────────────────────────
            Promotes preloaded CSS chunks to stylesheets immediately.
            Silences "preloaded but not used" console warnings. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){function f(){document.querySelectorAll('link[rel="preload"][as="style"]').forEach(function(l){l.rel='stylesheet';});}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',f,{once:true});}else{f();}window.addEventListener('load',f,{once:true});})();` }} />

        {/* ── CDN preconnect ──────────────────────────────────────────────────
            Establishes TCP+TLS handshake to image CDN before first image request.
            Only 2 preconnects — Lighthouse warns at >4. */}
        <link rel="preconnect" href="https://assets.hauntedwallpapers.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://assets.hauntedwallpapers.com" />

        {/* ── LCP Hero image preload ──────────────────────────────────────────
            ✅ KEPT: This tells the browser to fetch the hero image IMMEDIATELY
            alongside HTML — before CSS/JS is even parsed.
            Result: hero image is ready by the time React renders it → LCP drops.
            fetchPriority="high" puts it at the top of the browser's fetch queue. */}
        <link
          rel="preload"
          as="image"
          href="https://assets.hauntedwallpapers.com/extras/the-haunted-wallpapers-hero-section-image-mobile-dark-wallpapers-thumbnail.avif"
          type="image/avif"
          fetchPriority="high"
        />

        {/* ── PWA ─────────────────────────────────────────────────────────── */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />

        <meta name="p:domain_verify" content="6f1c92d3b0307e9bf30220a5068ce8af" />
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

        {/* Umami Analytics — defer so it never blocks rendering */}
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="8aa04b22-aab2-4f50-b5cc-d2602ad3739a"
        />
      </head>

      {/* ✅ Only 2 font variables — cinzel + cormorant
          --font-space is gone. CSS falls back to system monospace automatically. */}
      <body className={`${cormorant.variable} ${cinzel.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org", "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                name: SITE_NAME, url: SITE_URL,
                logo: { "@type": "ImageObject", url: OG_IMAGE, width: 1200, height: 630 },
                sameAs: ["https://www.pinterest.com/TheFreemiumWallpapers/"],
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
        <ClientComponents />
        <PWARegister />
      </body>
    </html>
  );
}