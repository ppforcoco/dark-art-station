import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Cinzel_Decorative, Cormorant_Garamond, Space_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientComponents from "@/components/ClientComponents";
import PWARegister from "@/components/PWARegister";

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
    // Only reference icon files that actually exist in /public.
    // icon-180.png does NOT exist → removed to eliminate the 404 console error.
    // The PWA manifest is handled by app/manifest.ts (see that file).
    icon: [
      { url: "/favicon.ico",       sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png",      sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png",      sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  alternates: { canonical: SITE_URL, languages: { "en-US": SITE_URL } },
  verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" dir="ltr" style={{ backgroundColor: "#0c0b14", color: "#e8e4dc" }}>
      <head>
        {/*
          ── Critical inline styles ───────────────────────────────────────────
          Inlined here so zero extra network requests are needed for above-the-
          fold rendering. Do NOT add <link rel="preload"> for CSS chunks — Next.js
          App Router already preloads every chunk it generates, and adding manual
          preloads for the same files produces the "preloaded but not used within
          a few seconds" browser warnings seen in the console.
        */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media(pointer:fine){html,body,*,*::before,*::after{cursor:none!important}}
          @keyframes hw-flicker {
            0%,100%{opacity:1}
            8%{opacity:.85}
            15%{opacity:1}
            42%{opacity:.9}
            45%{opacity:1}
            70%{opacity:.88}
            72%{opacity:1}
          }
          .hw-announce-bar {
            position: sticky;
            top: 0;
            z-index: 9999;
            height: 36px;
            background: #000000;
            border-bottom: 1px solid #dc2626;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .hw-announce-bar a {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0;
            width: 100%;
            height: 100%;
            text-decoration: none;
            color: #ffffff;
            font-family: var(--font-space, monospace);
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0 12px;
            animation: hw-flicker 6s infinite;
          }
          .hw-announce-bar a:hover { color: #dc2626; }
          .hw-announce-dot {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #dc2626;
            margin: 0 8px;
            flex-shrink: 0;
            box-shadow: 0 0 6px #dc2626;
          }
          .hw-announce-full  { display: inline; }
          .hw-announce-short { display: none; }
          @media (max-width: 600px) {
            .hw-announce-bar a { font-size: 0.58rem; letter-spacing: 0.06em; padding: 0 8px; }
            .hw-announce-dot   { margin: 0 5px; }
            .hw-announce-full  { display: none; }
            .hw-announce-short { display: inline; }
          }
          @media (max-width: 380px) {
            .hw-announce-bar a { font-size: 0.52rem; letter-spacing: 0.04em; }
          }
        ` }} />

        {/*
          ── Synchronous theme + night-mode init ─────────────────────────────
          Plain <script> (not Next.js <Script>) so it blocks paint and prevents
          a flash of wrong background colour. Covered by 'unsafe-inline' in CSP.
        */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('hw-theme');if(t){document.documentElement.setAttribute('data-theme',t);if(t==='fog'){document.documentElement.style.backgroundColor='#ece9e2';document.documentElement.style.color='#1c1a17';}else if(t==='ghost'){document.documentElement.style.backgroundColor='#0d0d14';document.documentElement.style.color='#e0e0f8';}else{document.documentElement.style.backgroundColor='#0c0b14';document.documentElement.style.color='#e8e4dc';}}else{document.documentElement.style.backgroundColor='#0c0b14';document.documentElement.style.color='#e8e4dc';}}catch(e){}})();` }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var h=new Date().getHours();if(h>=20||h<6)document.documentElement.setAttribute('data-night','true');}catch(e){}})();` }} />

        {/*
          ── GA4: Trusted-Types policy + consent defaults ─────────────────────
          WHY beforeInteractive:
            The console log shows the sequence:
              gtm.init_consent (id:3) → gtm.init (id:4) → [tags fire] → gtag('config')
                                                                          ↑ ABORTED
            The config command aborts because GA4's internal validator checks
            that consent defaults were already pushed to dataLayer before config
            runs. Using "afterInteractive" (the previous setting) meant the GA
            library could load and reach config BEFORE our consent snippet ran.
            beforeInteractive guarantees consent is in dataLayer first.

          WHY goog#html Trusted-Types policy:
            GTM injects script tags via innerHTML which is blocked by
            Require-Trusted-Types-For: 'script' unless a policy named exactly
            "goog#html" exists. That name is hard-coded in the GTM bundle.
            next.config.ts also adds it to the Trusted-Types header allowlist.
        */}
        {gaId && (
          <Script id="consent-and-tt-init" strategy="beforeInteractive">{`
            (function () {
              // 1. Register the Trusted-Types policy GTM requires.
              if (typeof trustedTypes !== 'undefined' && trustedTypes.createPolicy) {
                try {
                  trustedTypes.createPolicy('goog#html', {
                    createHTML:      function (s) { return s; },
                    createScript:    function (s) { return s; },
                    createScriptURL: function (s) { return s; },
                  });
                } catch (_) {
                  // Already registered on client-side navigation — safe to ignore.
                }
              }

              // 2. Push consent defaults into dataLayer BEFORE the GA library loads.
              window.dataLayer = window.dataLayer || [];
              function gtag() { dataLayer.push(arguments); }
              window.gtag = gtag;
              gtag('consent', 'default', {
                ad_storage:              'denied',
                ad_user_data:            'denied',
                ad_personalization:      'denied',
                analytics_storage:       'granted',
                functionality_storage:   'granted',
                personalization_storage: 'denied',
                security_storage:        'granted',
              });
              gtag('set', 'url_passthrough', true);
            })();
          `}</Script>
        )}

        {/*
          ── Resource hints ───────────────────────────────────────────────────
          Only preconnect to origins needed on EVERY page load.
          <GoogleAnalytics> (below) adds its own preconnect to googletagmanager.com
          so we deliberately omit it here to avoid a duplicate hint.
          No manual <link rel="preload"> for CSS or fonts — Next.js handles those
          automatically. Adding extra preloads for the same chunks causes the
          "preloaded but not used" warning that fills the console.
        */}
        <link rel="preconnect" href="https://assets.hauntedwallpapers.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://assets.hauntedwallpapers.com" />
        <link rel="preconnect" href="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev" />

        {/*
          ── PWA / icons ──────────────────────────────────────────────────────
          manifest.json is now generated by app/manifest.ts (Next.js built-in).
          That file only lists /icon-192.png and /icon-512.png which actually
          exist, eliminating the "icon-180.png — 404" and the manifest download
          error. Delete public/manifest.json if one exists — app/manifest.ts
          takes precedence and having both causes a conflict.

          Icon links here mirror what app/manifest.ts declares so browsers that
          read <link> tags directly (Safari, older Chrome) also resolve correctly.
        */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/x-icon"  href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32"  href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />

        <meta name="p:domain_verify" content="6f1c92d3b0307e9bf30220a5068ce8af" />
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

        <div className="hw-announce-bar">
          <a href="https://hauntedwallpapers.com/blog/the-skeleton-collection-4k-visions-for-the-obsessed">
            <span className="hw-announce-dot" aria-hidden="true" />
            <span className="hw-announce-full">THE TOWN HAS BEEN WATCHING YOUR OBSESSION WITH SKELETONS...</span>
            <span className="hw-announce-short">ENTER BONE STREET</span>
            <span className="hw-announce-dot" aria-hidden="true" />
            <span className="hw-announce-full">ENTER BONE STREET</span>
            <span className="hw-announce-dot" aria-hidden="true" />
          </a>
        </div>

        <Header />
        <main className="content-wrapper">{children}</main>
        <Footer />
        <ClientComponents />
        <PWARegister />

        {/*
          ── GA4 script ───────────────────────────────────────────────────────
          @next/third-parties GoogleAnalytics loads gtag/js and fires
          gtag('config') atomically after the library is validated — no manual
          Script tags needed. Consent defaults are already in dataLayer from the
          beforeInteractive block above, so config passes validation cleanly.
        */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}