// app/layout.tsx
// FIXES:
//  1. cormorant preload: false  — saves ~30 KB on first paint; body text renders fine with system font first
//  2. GA consent script wrapped in try/catch — stops "Event processing aborted" console errors
//  3. icon-192 + icon-512 added to <head> manifest link (PWA fix for NG/KE/MM/IN Android users)
//  4. GTM preconnect uses crossOrigin="anonymous" — avoids extra CORS preflight round trip

import type { Metadata, Viewport } from "next";
import { Cinzel_Decorative, Cormorant_Garamond, Space_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientComponents from "@/components/ClientComponents";

// ── Fonts: all use display:swap — no render blocking ──────────────────────
const cinzel = Cinzel_Decorative({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  // preload: false — Cinzel only appears in headings below the fold on mobile.
  // Removing preload saves ~25 KB of render-blocking font fetch on first paint.
  // display:swap means headings render in system font first, Cinzel swaps in.
  preload: false,
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  // FIX 1: was `preload: true` — deprioritised so body text doesn't block LCP.
  // System serif renders first, Cormorant swaps in via display:swap with zero layout shift.
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
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" dir="ltr" style={{ backgroundColor: "#0c0b14", color: "#e8e4dc" }}>
      <head>
        {/* ── Inline: hides cursor before paint, no network request ──── */}
        <style dangerouslySetInnerHTML={{ __html: `@media(pointer:fine){html,body,*,*::before,*::after{cursor:none!important}}` }} />

        {/* ── Theme + Night mode — inline, no render blocking ─────────── */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('hw-theme');if(t){document.documentElement.setAttribute('data-theme',t);if(t==='fog'){document.documentElement.style.backgroundColor='#ece9e2';document.documentElement.style.color='#1c1a17';}else if(t==='ghost'){document.documentElement.style.backgroundColor='#0d0d14';document.documentElement.style.color='#e0e0f8';}else{document.documentElement.style.backgroundColor='#0c0b14';document.documentElement.style.color='#e8e4dc';}}else{document.documentElement.style.backgroundColor='#0c0b14';document.documentElement.style.color='#e8e4dc';}}catch(e){}})();` }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var h=new Date().getHours();if(h>=20||h<6)document.documentElement.setAttribute('data-night','true');}catch(e){}})();` }} />

        {/* ── Preconnect: CDN first, GTM second ───────────────────────── */}
        <link rel="preconnect" href="https://assets.hauntedwallpapers.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://assets.hauntedwallpapers.com" />
        <link rel="preconnect" href="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev" />
        {gaId && <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />}

        {/* LCP preload moved to app/page.tsx — only needed on homepage.
            Keeping it here caused browser warnings on every non-home page. */}

        {/* ── PWA & Icons ─────────────────────────────────────────────── */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        {/* FIX 2: PWA icons explicitly referenced — Chrome Android (dominant in NG/KE/MM/IN)
            requires icon-192.png + icon-512.png to exist in /public.
            The manifest.json must also list these. See /public/manifest.json. */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />

        {/* ── Pinterest Domain Verification ───────────────────────────── */}
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

        {/* ── Google Consent Mode v2 (must be before GA script) ───────── */}
        {/* FIX 4: wrapped in try/catch — prevents "Event processing aborted" console errors
            that occur when GTM is intercepted by ad blockers or regional proxies (NG/KE/MM/IN).
            The gtag() function definition is also guarded so re-declaration is safe. */}
        <script dangerouslySetInnerHTML={{ __html: `try{window.dataLayer=window.dataLayer||[];if(typeof window.gtag!=='function'){window.gtag=function(){dataLayer.push(arguments);};}gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','functionality_storage':'granted','personalization_storage':'denied','security_storage':'granted','wait_for_update':500});gtag('set','url_passthrough',true);}catch(e){}` }} />

        {/* ── Google Analytics 4 ─────────────────────────────────────────
            FIX: Load GA4 script immediately (async, non-blocking) so GTM tags
            (scroll depth, click events) always have a live measurement context.
            Deferring to interaction caused "Event processing aborted" because
            GTM fired gtag() commands before the GA4 script was initialised.
            The script is async so it never blocks rendering or LCP.         */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script dangerouslySetInnerHTML={{ __html: `try{window.dataLayer=window.dataLayer||[];if(typeof window.gtag!=="function"){window.gtag=function(){dataLayer.push(arguments);};}gtag("js",new Date());gtag("config","${gaId}",{send_page_view:true});}catch(e){}` }} />
          </>
        )}
      </head>
      <body className={`${cormorant.variable} ${cinzel.variable} ${spaceMono.variable}`}>
        {/* ── Structured Data — Organization + WebSite + BreadcrumbList ── */}
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
        <div className="content-wrapper">
          {children}
        </div>
        <Footer />

        {/* ── All client-only components in one deferred wrapper ───────── */}
        <ClientComponents />
      </body>
    </html>
  );
}