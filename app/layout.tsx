// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Cinzel_Decorative, Cormorant_Garamond, Space_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HalloweenCountdown from "@/components/HalloweenCountdown";
import Cursor from "@/components/Cursor";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import CookieBanner from "@/components/CookieBanner";
import ScrollReset from "@/components/ScrollReset";
import FeedbackWidget from "@/components/FeedbackWidget";
// ⛔ StickyMobileAd removed — custom fixed-position ad wrapper violates AdSense placement
// policies. Use a proper AdSense Anchor Ad unit from your AdSense dashboard instead.

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
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#0c0b14",
};

export const metadata: Metadata = {
  title: "Haunted Wallpapers | Free Dark Fantasy Wallpapers",
  description:
    "Free dark fantasy wallpapers for iPhone, Android and PC. Download high-resolution AI art — horror, gothic, street style, dark humor and more.",
  keywords: [
    "dark wallpapers",
    "horror wallpapers",
    "gothic wallpapers",
    "iPhone wallpapers",
    "Android wallpapers",
    "HD wallpapers",
    "AI art",
    "dark fantasy",
    "free wallpapers",
    "AMOLED wallpapers",
  ],
  metadataBase: new URL(SITE_URL),
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title:       "Haunted Wallpapers | Free Dark Fantasy Wallpapers",
    description: "Free dark fantasy wallpapers for iPhone, Android and PC. Download high-resolution AI art collections.",
    url:         SITE_URL,
    siteName:    SITE_NAME,
    type:        "website",
    locale:      "en_US",
    images: [
      {
        url:    OG_IMAGE,
        width:  1200,
        height: 630,
        alt:    "Haunted Wallpapers — Dark Fantasy & Horror Art",
        type:   "image/jpeg",
      },
    ],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Haunted Wallpapers | Free Dark Fantasy Wallpapers",
    description: "Free dark fantasy wallpapers for iPhone, Android and PC. Download high-resolution AI art collections.",
    images:      [OG_IMAGE],
    creator:     "@hauntedwallpapers",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  alternates: { 
    canonical: SITE_URL,
    languages: {
      "en-US": SITE_URL,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* ── Cursor: hide native cursor instantly — before any paint ─── */}
        <style dangerouslySetInnerHTML={{ __html: `@media(pointer:fine){html,body,*,*::before,*::after{cursor:none!important}}` }} />
        {/* ── Dark mode + Night mode scripts ────────────────────────────── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('hw-theme');if(t){document.documentElement.setAttribute('data-theme',t);if(t==='fog'){document.documentElement.style.backgroundColor='#ece9e2';document.documentElement.style.color='#1c1a17';}else if(t==='ghost'){document.documentElement.style.backgroundColor='#0d0d14';document.documentElement.style.color='#e0e0f8';}}}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var h=new Date().getHours();if(h>=20||h<6)document.documentElement.setAttribute('data-night','true');}catch(e){}})();`,
          }}
        />
        
        {/* ── Preconnect to CDN for faster asset loading ─────────────────── */}
        <link rel="preconnect" href="https://assets.hauntedwallpapers.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://assets.hauntedwallpapers.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* ── PWA & Icons ──────────────────────────────────────────────────── */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        
        {/* ── Theme & Mobile Settings ──────────────────────────────────────── */}
        <meta name="theme-color" content="#0c0b14" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Haunted WP" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* ── Google Site Verification ────────────────────────────────────── */}
        {process.env.NEXT_PUBLIC_GSC_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GSC_VERIFICATION} />
        )}
        
        {/* ── Google AdSense Account Verification ──────────────────────────── */}
        {process.env.NEXT_PUBLIC_ADSENSE_PID && (
          <meta name="google-adsense-account" content={process.env.NEXT_PUBLIC_ADSENSE_PID} />
        )}
        
        {/* ── Google AdSense Script ────────────────────────────────────────── */}
        {process.env.NEXT_PUBLIC_ADSENSE_PID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PID}`}
            crossOrigin="anonymous"
          />
        )}
        
        {/* ── Google Consent Mode v2 ───────────────────────────────────────── */}
        {/*                                                                     */}
        {/*  ✅ CORRECT: All ad/tracking consent defaults to DENIED.            */}
        {/*  This is required by Google's EU User Consent Policy.               */}
        {/*  The CookieBanner component calls gtag('consent','update',...)      */}
        {/*  with 'granted' only after the user explicitly clicks Accept.       */}
        {/*  functionality_storage and security_storage are granted by default  */}
        {/*  as these cover essential site features (theme, scroll state).      */}
        {/*                                                                     */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  'ad_storage':'denied',
  'ad_user_data':'denied',
  'ad_personalization':'denied',
  'analytics_storage':'denied',
  'functionality_storage':'granted',
  'personalization_storage':'denied',
  'security_storage':'granted',
  'wait_for_update':2000
});
gtag('set','url_passthrough',true);
`.trim(),
          }}
        />
        
        {/* ── Google Analytics 4 ──────────────────────────────────────────── */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}',{send_page_view:true,anonymize_ip:true});`,
              }}
            />
          </>
        )}
      </head>
      <body className={`${cormorant.variable} ${cinzel.variable} ${spaceMono.variable}`}>
        {/* ── Structured Data - Organization ────────────────────────────── */}
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
                logo: { 
                  "@type": "ImageObject", 
                  url: OG_IMAGE, 
                  width: 1200, 
                  height: 630 
                },
                sameAs: ["https://www.pinterest.com/TheFreemiumWallpapers/"],
                description: "Free dark fantasy wallpapers for iPhone, Android and PC. Bold original AI art.",
                contactPoint: {
                  "@type": "ContactPoint",
                  url: `${SITE_URL}/contact`,
                  contactType: "Customer Support",
                  availableLanguage: "en"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: SITE_URL,
                name: SITE_NAME,
                description: "Free dark fantasy wallpapers. Download HD wallpapers for iPhone, Android and PC.",
                publisher: { "@id": `${SITE_URL}/#organization` },
                potentialAction: {
                  "@type": "SearchAction",
                  target: { 
                    "@type": "EntryPoint", 
                    urlTemplate: `${SITE_URL}/search?q={search_term_string}` 
                  },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: SITE_URL
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Shop",
                    item: `${SITE_URL}/shop`
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "Collections",
                    item: `${SITE_URL}/collections`
                  }
                ]
              }
            ]),
          }}
        />
        
        {/* ── Layout Components ──────────────────────────────────────────── */}
        <Cursor />
        <ScrollReset />
        <HalloweenCountdown />
        <Header />
        <div className="content-wrapper">
          {children}
        </div>
        <Footer />
        <ScrollToTopButton />
        <CookieBanner />
        {/* StickyMobileAd removed — use AdSense Anchor Ad unit from dashboard instead */}
        <FeedbackWidget />
      </body>
    </html>
  );
}