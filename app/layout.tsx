// app/layout.tsx
//
// ROOT CAUSE ANALYSIS — why GA4 data was not arriving:
//
// PROBLEM 1 — DUAL LOAD (critical):
//   The console log "js?id=G-R70T1BS71S" appearing as the script source for ALL
//   GTM messages ("Tag fired", "Processing commands", "Processing GTAG command")
//   means the GTM container itself contains a GA4 tag for G-R70T1BS71S.
//   The old layout.tsx ALSO loaded gtag/js?id=G-R70T1BS71S directly.
//   Two gtag instances for the same Measurement ID = gtag config fires twice,
//   the second one collides with the first mid-validation → "Event processing
//   aborted during validation" → no hits reach GA4.
//   FIX: Remove the direct gtag/js script entirely. Load ONLY GTM via
//   @next/third-parties/google GoogleTagManager. GTM handles GA4 internally.
//
// PROBLEM 2 — MANUAL SCRIPT vs @next/third-parties (secondary):
//   next/script + manual gtag snippets don't integrate with Next.js App Router's
//   streaming/hydration lifecycle. @next/third-parties/google is the official
//   Next.js abstraction — it handles script ordering, strategy, and afterInteractive
//   injection correctly and is maintained alongside Next.js releases.
//
// PROBLEM 3 — CONSENT RACE CONDITION (secondary):
//   The old code set consent default in an inline <script dangerouslySetInnerHTML>
//   that runs synchronously, but the gtag function it calls isn't defined yet at
//   that point (gtag/js loads afterInteractive). The consent push went into a
//   dataLayer that GTM then reprocessed after load — causing a second consent
//   update to collide with the config command mid-validation.
//   FIX: Consent default is set in a single beforeInteractive inline script via
//   <Script strategy="beforeInteractive"> — this is the only correct place that
//   guarantees consent is registered BEFORE any GTM/gtag processing begins.
//
// PROBLEM 4 — CSS MIME TYPE:
//   This is a server/CDN header issue, not fixable in layout.tsx.
//   Fix lives in next.config.ts (provided separately) — adds:
//     Content-Type: text/css for /_next/static/css/*
//   If deploying on Vercel: also add headers in vercel.json (provided separately).
//   If behind Nginx: set types { text/css css; } in mime.types block.

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";
import { Cinzel_Decorative, Cormorant_Garamond, Space_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientComponents from "@/components/ClientComponents";

// ── Fonts ──────────────────────────────────────────────────────────────────
const cinzel = Cinzel_Decorative({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  preload: false,
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  preload: false,
});

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
  // IMPORTANT: This must be your GTM Container ID (format: GTM-XXXXXXX), NOT your
  // GA4 Measurement ID (G-XXXXXXXXXX). GTM manages GA4 internally via its container.
  // Set NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX in your .env.local / Vercel env vars.
  // Delete NEXT_PUBLIC_GA_ID from your env — it's no longer used here.
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID as string | undefined;

  return (
    <html lang="en" dir="ltr" style={{ backgroundColor: "#0c0b14", color: "#e8e4dc" }}>
      <head>
        {/* ── Inline cursor hide — no network request ──────────────────── */}
        <style dangerouslySetInnerHTML={{ __html: `@media(pointer:fine){html,body,*,*::before,*::after{cursor:none!important}}` }} />

        {/* ── Theme + Night mode — must run before paint ───────────────── */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('hw-theme');if(t){document.documentElement.setAttribute('data-theme',t);if(t==='fog'){document.documentElement.style.backgroundColor='#ece9e2';document.documentElement.style.color='#1c1a17';}else if(t==='ghost'){document.documentElement.style.backgroundColor='#0d0d14';document.documentElement.style.color='#e0e0f8';}else{document.documentElement.style.backgroundColor='#0c0b14';document.documentElement.style.color='#e8e4dc';}}else{document.documentElement.style.backgroundColor='#0c0b14';document.documentElement.style.color='#e8e4dc';}}catch(e){}})();` }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var h=new Date().getHours();if(h>=20||h<6)document.documentElement.setAttribute('data-night','true');}catch(e){}})();` }} />

        {/* ── Google Consent Mode v2 — MUST be set before GTM loads ───────
            Strategy: beforeInteractive ensures this inline script runs
            synchronously in <head> before ANY other script (including GTM).
            This is the ONLY pattern that prevents the consent race condition.
            GTM reads these values on init — no update needed, no collision.  */}
        {gtmId && (
          <Script id="consent-init" strategy="beforeInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage:             'denied',
              ad_user_data:           'denied',
              ad_personalization:     'denied',
              analytics_storage:      'granted',
              functionality_storage:  'granted',
              personalization_storage:'denied',
              security_storage:       'granted'
            });
            gtag('set', 'url_passthrough', true);
          `}</Script>
        )}

        {/* ── Preconnects ─────────────────────────────────────────────── */}
        <link rel="preconnect" href="https://assets.hauntedwallpapers.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://assets.hauntedwallpapers.com" />
        <link rel="preconnect" href="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev" />
        {gtmId && <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />}

        {/* ── PWA & Icons ─────────────────────────────────────────────── */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />

        {/* ── Pinterest verification ───────────────────────────────────── */}
        <meta name="p:domain_verify" content="6f1c92d3b0307e9bf30220a5068ce8af" />

        {/* ── Mobile meta ─────────────────────────────────────────────── */}
        <meta name="theme-color" content="#0c0b14" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Haunted WP" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />

        {process.env.NEXT_PUBLIC_GSC_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GSC_VERIFICATION} />
        )}
      </head>

      <body className={`${cormorant.variable} ${cinzel.variable} ${spaceMono.variable}`}>
        {/* ── Structured Data ──────────────────────────────────────────── */}
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
              {
                "@context": "https://schema.org", "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home",        item: SITE_URL },
                  { "@type": "ListItem", position: 2, name: "Shop",        item: `${SITE_URL}/shop` },
                  { "@type": "ListItem", position: 3, name: "Collections", item: `${SITE_URL}/collections` },
                ],
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

        {/* ── GTM via official @next/third-parties — loads afterInteractive ─
            This is the ONLY analytics script in the entire app.
            GA4 fires through the GTM container — do NOT add a separate
            GoogleAnalytics component or any manual gtag/js script.          */}
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
      </body>
    </html>
  );
}