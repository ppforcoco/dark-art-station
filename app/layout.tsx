import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
        {/*
          ── Inline critical styles ──────────────────────────────────────────
          Kept as a <style> block (not a preloaded external file) so it is
          render-blocking only for its own tiny payload — no browser warning.
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

          /* ── Announcement Bar ── */
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
          .hw-announce-bar a:hover {
            color: #dc2626;
          }
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

          /* ── Mobile: hide the long text, show short version ── */
          .hw-announce-full { display: inline; }
          .hw-announce-short { display: none; }

          @media (max-width: 600px) {
            .hw-announce-bar a {
              font-size: 0.58rem;
              letter-spacing: 0.06em;
              padding: 0 8px;
            }
            .hw-announce-dot {
              margin: 0 5px;
            }
            .hw-announce-full { display: none; }
            .hw-announce-short { display: inline; }
          }

          @media (max-width: 380px) {
            .hw-announce-bar a {
              font-size: 0.52rem;
              letter-spacing: 0.04em;
            }
          }
        ` }} />

        {/*
          ── Theme + night-mode init (must run synchronously before paint) ──
          These are plain <script> tags, not Next.js <Script> components,
          because they must block rendering to avoid a flash of wrong theme.
          They are covered by 'unsafe-inline' in script-src.
        */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('hw-theme');if(t){document.documentElement.setAttribute('data-theme',t);if(t==='fog'){document.documentElement.style.backgroundColor='#ece9e2';document.documentElement.style.color='#1c1a17';}else if(t==='ghost'){document.documentElement.style.backgroundColor='#0d0d14';document.documentElement.style.color='#e0e0f8';}else{document.documentElement.style.backgroundColor='#0c0b14';document.documentElement.style.color='#e8e4dc';}}else{document.documentElement.style.backgroundColor='#0c0b14';document.documentElement.style.color='#e8e4dc';}}catch(e){}})();` }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var h=new Date().getHours();if(h>=20||h<6)document.documentElement.setAttribute('data-night','true');}catch(e){}})();` }} />

        {/*
          ── GA4 Consent + Trusted-Types bootstrap ───────────────────────────
          FIX 1 (sequence): strategy="beforeInteractive" ensures consent and
          the goog#html Trusted-Types policy are registered BEFORE the GA
          library is fetched and parsed. Previously "afterInteractive" meant
          the library could arrive and try to execute before consent was set,
          causing "Event processing aborted during validation".

          FIX 2 (Trusted-Types): GTM/gtag inject <script> tags via innerHTML
          and document.write. Both are blocked by Require-Trusted-Types-For:
          'script' unless a policy named exactly "goog#html" exists. We create
          it here. The policy name is hard-coded in the GTM source — it is not
          configurable. The matching header change is in next.config.ts.
        */}
        {gaId && (
          <Script id="consent-and-tt-init" strategy="beforeInteractive">{`
            (function() {
              // ── Trusted-Types policy for GTM/gtag ──
              // GTM looks for a policy named 'goog#html' specifically.
              if (typeof trustedTypes !== 'undefined' && trustedTypes.createPolicy) {
                try {
                  trustedTypes.createPolicy('goog#html', {
                    createHTML:      function(s) { return s; },
                    createScript:    function(s) { return s; },
                    createScriptURL: function(s) { return s; },
                  });
                } catch(e) {
                  // Policy may already exist if the page is navigated to twice
                  // in the same context — safe to ignore.
                }
              }

              // ── GA4 consent defaults ──
              // Must be set before gtag('config', ...) fires, which is why
              // this whole block is beforeInteractive.
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('consent', 'default', {
                ad_storage:              'denied',
                ad_user_data:            'denied',
                ad_personalization:      'denied',
                analytics_storage:       'granted',
                functionality_storage:   'granted',
                personalization_storage: 'denied',
                security_storage:        'granted'
              });
              gtag('set', 'url_passthrough', true);
            })();
          `}</Script>
        )}

        {/*
          ── Resource hints ──────────────────────────────────────────────────
          Only origins actually needed on every page. GoogleAnalytics (below)
          adds its own preconnect to googletagmanager.com, so we omit it here
          to avoid duplicate hints.
          No manual CSS <link rel="preload"> — Next.js handles chunked CSS
          loading automatically; manual preloads for unused stylesheets trigger
          a browser warning ("preload but not used within a few seconds").
        */}
        <link rel="preconnect" href="https://assets.hauntedwallpapers.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://assets.hauntedwallpapers.com" />
        <link rel="preconnect" href="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev" />

        {/*
          ── PWA manifest + icons ─────────────────────────────────────────────
          /icons/icon-180.png was 404-ing. Removed. The apple-touch-icon
          (<link rel="apple-touch-icon">) already points to /apple-touch-icon.png
          which exists. Standard PWA icon sizes (192, 512) kept. The manifest
          itself should also not reference icon-180.png — check public/manifest.json
          and remove that entry there too if present.
        */}
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

        {/* ── Announcement Bar ── */}
        <div className="hw-announce-bar">
          <a href="https://hauntedwallpapers.com/blog/the-skeleton-collection-4k-visions-for-the-obsessed">
            <span className="hw-announce-dot" aria-hidden="true" />
            <span className="hw-announce-full">
              THE TOWN HAS BEEN WATCHING YOUR OBSESSION WITH SKELETONS...
            </span>
            <span className="hw-announce-short">
              ENTER BONE STREET
            </span>
            <span className="hw-announce-dot" aria-hidden="true" />
            <span className="hw-announce-full">ENTER BONE STREET</span>
            <span className="hw-announce-dot" aria-hidden="true" />
          </a>
        </div>

        <Header />
        <main className="content-wrapper">
          {children}
        </main>
        <Footer />
        <ClientComponents />
        <PWARegister />

        {/*
          ── GA4 via @next/third-parties ──────────────────────────────────────
          FIX 3 (GTM/gtag conflict): Previously the code loaded gtag/js manually
          AND called gtag('config') in a second Script tag. This caused a race
          where 'config' could fire before the library validated, producing
          "Event processing aborted during validation".

          GoogleAnalytics from @next/third-parties handles the script load and
          the config call atomically — it will not call config until the library
          is ready. It also adds its own preconnect hints and uses afterInteractive
          by default, so it runs after hydration.

          Consent is already set in the beforeInteractive block above, so by the
          time this fires analytics_storage is 'granted' and the config command
          passes validation.

          Cloudflare note: the script is served from googletagmanager.com with
          Content-Type: application/javascript. If Cloudflare rewrites it to
          text/plain, go to Cloudflare → Speed → Optimization and disable
          "Rocket Loader" — it is the most common cause of MIME-type mangling
          for third-party scripts. Also confirm your Page Rule / Cache Rule for
          gtag/js is set to "Bypass Cache".
        */}
        {/* GA4 scripts — no @next/third-parties dependency */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga-init"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html:
              }}
            />
            {/*
              Social referral detection: reads document.referrer and fires
              gtag('event','social_referral') for Pinterest, Instagram, etc.
              Uses dangerouslySetInnerHTML so JS dollar signs are never
              parsed as JSX template expressions.
            */}
            <Script
              id="source-detect"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html:
                  '(function(){' +
                  'var ref=document.referrer;' +
                  'if(!ref)return;' +
                  'try{if(new URL(ref).hostname===window.location.hostname)return;}catch(_){return;}' +
                  'var MAP=[' +
                    '{p:/pinterest\.co/i,s:"Pinterest"},' +
                    '{p:/pin\.it/i,s:"Pinterest"},' +
                    '{p:/instagram\.com/i,s:"Instagram"},' +
                    '{p:/facebook\.com/i,s:"Facebook"},' +
                    '{p:/fb\.me/i,s:"Facebook"},' +
                    '{p:/twitter\.com/i,s:"Twitter/X"},' +
                    '{p:/x\.com/i,s:"Twitter/X"},' +
                    '{p:/t\.co/i,s:"Twitter/X"},' +
                    '{p:/reddit\.com/i,s:"Reddit"},' +
                    '{p:/tiktok\.com/i,s:"TikTok"},' +
                    '{p:/youtube\.com/i,s:"YouTube"},' +
                    '{p:/youtu\.be/i,s:"YouTube"}' +
                  '];' +
                  'var matched=null;' +
                  'for(var i=0;i<MAP.length;i++){if(MAP[i].p.test(ref)){matched=MAP[i].s;break;}}' +
                  'if(!matched)return;' +
                  'var a=0,iv=setInterval(function(){' +
                    'a++;' +
                    'if(typeof window.gtag==="function"){' +
                      'clearInterval(iv);' +
                      'window.gtag("event","social_referral",' +
                        '{source:matched,referrer_url:ref,landing_page:window.location.pathname,' +
                        'event_category:"acquisition",non_interaction:true});' +
                    '}else if(a>=30){clearInterval(iv);}' +
                  '},100);' +
                  '})();'
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}