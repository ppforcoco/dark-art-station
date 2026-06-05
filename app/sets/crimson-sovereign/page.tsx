// app/sets/crimson-sovereign/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

const BASE =
  "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Crimson%20Sovereign%20%7C%20Dark%20Fantasy%20Gaming%20Character%20Matching%20Setup%20Kit";
const BASE_4K = `${BASE}/4k`;

const THUMBNAIL =
  "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Crimson%20Sovereign%20%7C%20Dark%20Fantasy%20Gaming%20Character%20Matching%20Setup%20Kit/4k/Complete%20matching%20dark%20fantasy%20gaming%20character%20setup%20kit%20for%20PC%20phone%20and%20watch%20free.png";

const WALLPAPERS = [
  {
    id: "castle-desktop",
    label: "Gothic Castle Desktop",
    download: `${BASE_4K}/crimson-sovereign-dark-fantasy-gaming-character-castle-4k-desktop.jpg`,
    filename: "crimson-sovereign-castle-desktop-4k.jpg",
    preview: `${BASE}/crimson-sovereign-dark-fantasy-gaming-character-castle-4k-desktop.webp`,
    seoAlt: "Crimson Sovereign dark fantasy gaming character standing before a gothic castle 4K desktop wallpaper",
  },
  {
    id: "pc-landscape",
    label: "PC Setup Landscape",
    download: `${BASE_4K}/ark-fantasy-gaming-character-4k-wallpaper-pc-setup-aesthetic.jpg`,
    filename: "crimson-sovereign-pc-4k.jpg",
    preview: `${BASE}/ark-fantasy-gaming-character-4k-wallpaper-pc-setup-aesthetic.webp`,
    seoAlt: "Dark fantasy gaming character 4K background for professional gaming PC setup aesthetic",
  },
  {
    id: "lockscreen",
    label: "iPhone Lockscreen",
    download: `${BASE_4K}/crimson-red-gaming-character-dark-fantasy-iphone-lockscreen-4k.jpg`,
    filename: "crimson-sovereign-lockscreen-4k.jpg",
    preview: `${BASE}/crimson-red-gaming-character-dark-fantasy-iphone-lockscreen-4k.webp`,
    seoAlt: "Intense dark fantasy gaming character with red eyes vertical wallpaper for iPhone 15 Pro Max",
  },
  {
    id: "mobile-grin",
    label: "OLED Mobile",
    download: `${BASE_4K}/gaming-character-dark-fantasy-mobile-wallpaper-oled.jpg`,
    filename: "crimson-sovereign-mobile-4k.jpg",
    preview: `${BASE}/gaming-character-dark-fantasy-mobile-wallpaper-oled.webp`,
    seoAlt: "Evil demon gaming character dark fantasy aesthetic mobile wallpaper for OLED screens",
  },
  {
    id: "homescreen",
    label: "Blurred Home Screen",
    download: `${BASE_4K}/blurred-dark-fantasy-gaming-character-iphone-homescreen-background.jpg`,
    filename: "crimson-sovereign-homescreen-4k.jpg",
    preview: `${BASE}/blurred-dark-fantasy-gaming-character-iphone-homescreen-background.webp`,
    seoAlt: "Blurred dark fantasy gaming character background for mobile home screen wallpaper",
  },
  {
    id: "avatar-square",
    label: "Square Avatar",
    download: `${BASE_4K}/dark-fantasy-gaming-character-red-eyes-horror-avatar-square.jpg`,
    filename: "crimson-sovereign-avatar-4k.jpg",
    preview: `${BASE}/dark-fantasy-gaming-character-red-eyes-horror-avatar-square.webp`,
    seoAlt: "Gothic gaming character with glowing red eyes square profile picture for horror fans",
  },
  {
    id: "circle-pfp",
    label: "Circle PFP",
    download: `${BASE_4K}/crimson-sovereign-gaming-character-circle-pfp-discord-hd.jpg`,
    filename: "crimson-sovereign-circle-pfp-4k.jpg",
    preview: `${BASE}/crimson-sovereign-gaming-character-circle-pfp-discord-hd.webp`,
    seoAlt: "Crimson sovereign gaming character circle PFP for Discord and social media",
  },
  {
    id: "smartwatch",
    label: "Smartwatch Face",
    download: `${BASE_4K}/dark-fantasy-gaming-character-red-eyes-horror-watch.jpg`,
    filename: "crimson-sovereign-watch-4k.jpg",
    preview: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Crimson%20Sovereign%20%7C%20Dark%20Fantasy%20Gaming%20Character%20Matching%20Setup%20Kit/4k/dark-fantasy-crimson-watch.webp",
    seoAlt: "Complete matching dark fantasy gaming character setup kit for PC phone and watch free",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "The Crimson Sovereign | Dark Fantasy Gaming Character Matching Setup Kit",
    description:
      'Download "The Crimson Sovereign" matching setup kit. Premium 4K dark fantasy gaming character wallpapers for PC, iPhone, and Smartwatch. Manually optimized for OLED displays and high-end gaming setups.',
    keywords: [
      "crimson sovereign wallpaper",
      "dark fantasy gaming character wallpaper",
      "matching gaming setup kit",
      "gothic castle 4K wallpaper",
      "gaming character OLED wallpaper",
      "dark fantasy iPhone wallpaper",
      "gaming character smartwatch face",
      "dark fantasy PC background",
      "crimson gaming aesthetic",
      "horror gaming character wallpaper",
      "matching setup kit phone watch desktop",
      "4K dark fantasy background",
      "gothic gaming character pfp",
      "fantasy character lockscreen",
      "dark gaming aesthetic wallpaper",
    ],
    openGraph: {
      title: "The Crimson Sovereign — Dark Fantasy Gaming Character Matching Setup Kit | Haunted Wallpapers",
      description:
        'Download "The Crimson Sovereign" matching setup kit. Premium 4K dark fantasy gaming character wallpapers for PC, iPhone, and Smartwatch.',
      url: `${SITE_URL}/sets/crimson-sovereign`,
      siteName: "Haunted Wallpapers",
      type: "website",
      images: [
        {
          url: THUMBNAIL,
          width: 1200,
          height: 630,
          alt: "Complete matching dark fantasy gaming character setup kit for PC phone and watch free",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "The Crimson Sovereign — Dark Fantasy Gaming Character Matching Setup Kit",
      description:
        "Premium 4K dark fantasy gaming character wallpapers. Every screen covered — PC, iPhone, smartwatch.",
      images: [THUMBNAIL],
    },
    alternates: { canonical: `${SITE_URL}/sets/crimson-sovereign` },
  };
}

export const revalidate = 86400;



export default function CrimsonSovereignPage() {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The Crimson Sovereign — Dark Fantasy Gaming Character Matching Setup Kit",
    description:
      "Premium 4K dark fantasy gaming character wallpapers for PC, iPhone, and Smartwatch. Manually optimized for OLED displays and high-end gaming setups.",
    url: `${SITE_URL}/sets/crimson-sovereign`,
    numberOfItems: WALLPAPERS.length,
    itemListElement: WALLPAPERS.map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${w.label} — The Crimson Sovereign`,
      image: w.preview,
      url: w.download,
    })),
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary, #0d0d14)",
        color: "var(--text-primary, #e0e0f8)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Atmospheric noise overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.4,
        }}
      />

      {/* Crimson radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(192,0,26,0.12) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── BREADCRUMBS ── */}
        <nav
          aria-label="Breadcrumb"
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "clamp(28px,5vw,48px) clamp(20px,5vw,60px) 0",
          }}
        >
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-space, monospace)",
              fontSize: "0.55rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            <li>
              <Link href="/" style={{ color: "#60608a", textDecoration: "none" }}>Home</Link>
            </li>
            <li style={{ color: "#24243a" }}>›</li>
            <li>
              <Link href="/sets" style={{ color: "#60608a", textDecoration: "none" }}>Matching Sets</Link>
            </li>
            <li style={{ color: "#24243a" }}>›</li>
            <li style={{ color: "#d8d8f0" }}>The Crimson Sovereign</li>
          </ol>
        </nav>

        {/* ── HERO ── */}
        <header
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "clamp(32px,5vw,56px) clamp(20px,5vw,60px) 0",
          }}
        >
          <div className="cs-set-badge">
            <span className="cs-set-badge__num">Set No. 04</span>
            <span className="cs-set-badge__div">—</span>
            <span className="cs-set-badge__sub">Dark Fantasy Gaming Character Kit</span>
            <span className="cs-premium-badge">⚡ Premium</span>
          </div>

          {/* Hero collage */}
          <div className="cs-collage" aria-label="Preview of all wallpapers in this set">
            {/* Desktop — 16:9 full width */}
            <div className="cs-collage__desktop">
              <div className="cs-collage__device-label">Desktop · 16:9</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={WALLPAPERS[0].preview}
                alt="Crimson Sovereign gothic castle 4K desktop wallpaper"
                className="cs-collage__img"
                loading="eager"
              />
              <div className="cs-collage__scanlines" aria-hidden="true" />
            </div>

            {/* Mobile + Watch row */}
            <div className="cs-collage__bottom-row">
              <div className="cs-collage__phone-wrap">
                <div className="cs-collage__device-label">Mobile · 9:16</div>
                <div className="cs-collage__phone-shell">
                  <div className="cs-collage__island" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={WALLPAPERS[2].preview}
                    alt="Crimson Sovereign dark fantasy lockscreen wallpaper"
                    className="cs-collage__phone-img"
                    loading="eager"
                  />
                  <div className="cs-collage__gloss" aria-hidden="true" />
                  <div className="cs-collage__home-bar" aria-hidden="true" />
                </div>
              </div>

              <div className="cs-collage__watch-wrap">
                <div className="cs-collage__device-label">Watch · 1:1</div>
                <div className="cs-collage__watch-shell">
                  <div className="cs-collage__watch-crown" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Crimson%20Sovereign%20%7C%20Dark%20Fantasy%20Gaming%20Character%20Matching%20Setup%20Kit/4k/dark-fantasy-crimson-watch.webp"
                    alt="Crimson Sovereign smartwatch face dark fantasy"
                    className="cs-collage__watch-img"
                    loading="eager"
                  />
                  <div className="cs-collage__watch-gloss" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>

          {/* Title block */}
          <div style={{ marginTop: "clamp(28px,4vw,48px)" }}>
            <h1
              style={{
                fontFamily: "var(--font-cinzel, serif)",
                fontSize: "clamp(2rem, 5vw, 3.8rem)",
                fontWeight: 900,
                lineHeight: 1.0,
                margin: "0 0 8px",
                letterSpacing: "0.04em",
                color: "#f0e8d8",
                textShadow: "0 4px 40px rgba(192,0,26,0.35), 0 0 80px rgba(255,60,0,0.12)",
              }}
            >
              The Crimson Sovereign
            </h1>
            <p
              style={{
                fontFamily: "var(--font-cormorant, serif)",
                fontSize: "clamp(1rem, 1.6vw, 1.15rem)",
                lineHeight: 1.75,
                maxWidth: "700px",
                color: "rgba(224,224,248,0.7)",
                margin: 0,
              }}
            >
              Download the complete Crimson Sovereign matching wallpaper kit. Premium 4K dark fantasy
              gaming character backgrounds manually optimised for OLED displays, high-end gaming setups,
              and every device in your ecosystem — from desktop to smartwatch.
            </p>
          </div>
        </header>

        {/* ── LORE SECTION ── */}
        <section
          style={{
            maxWidth: "1100px",
            margin: "clamp(48px,7vw,80px) auto 0",
            padding: "0 clamp(20px,5vw,60px)",
          }}
        >
          <div className="cs-lore">
            <div className="cs-lore__bar" aria-hidden="true" />
            <div className="cs-lore__content">
              <h2 className="cs-lore__title">Shadows of the Crimson Fortress</h2>
              <p className="cs-lore__body">
                In the highest peaks of our digital town stands the Crimson Fortress — a structure
                built from obsidian that hums with a silent, dark energy. Within these walls, the{" "}
                <span style={{ color: "#c0001a", fontStyle: "italic" }}>Crimson Sovereign</span>{" "}
                orchestrates the movements of the night. He is not alone in his watch; beside him
                stands The Lunar Sentinel, his most trusted guardian. Together, they ensure that the
                fortress remains a place of absolute power and silence.
              </p>
              <p className="cs-lore__body">
                This collection follows the transformation of the Sovereign's energy and introduces the
                Sentinel who guards his flank — a complete multi-device setup for your entire ecosystem.
              </p>
            </div>
          </div>
        </section>

        {/* ── WALLPAPERS GRID ── */}
        <section
          style={{
            maxWidth: "1100px",
            margin: "clamp(48px,7vw,80px) auto 0",
            padding: "0 clamp(20px,5vw,60px)",
          }}
        >
          <div className="cs-section-head">
            <span className="cs-section-eyebrow">What is Included in This Setup Kit</span>
            <h2 className="cs-section-title">8 Wallpapers. Every Screen Covered.</h2>
          </div>

          <div className="cs-wall-layout">

            {/* ROW 1: Two landscape desktops */}
            <div className="cs-wall-row-2col">
              {[WALLPAPERS[0], WALLPAPERS[1]].map((w) => (
                <div key={w.id} className="cs-wall-item">
                  <div className="cs-wall-item__frame cs-wall-item__frame--16-9">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.preview} alt={w.seoAlt} className="cs-wall-item__img" loading="eager" />
                    <div className="cs-wall-item__corners" aria-hidden="true">
                      <span /><span /><span /><span />
                    </div>
                  </div>
                  <div className="cs-wall-item__footer">
                    <span className="cs-wall-item__label">{w.label}</span>
                  <a href="#download-kit" className="sets-dl-hint">↓ Download 4K</a></div>
                </div>
              ))}
            </div>

            {/* ROW 2: Three portrait mobiles */}
            <div className="cs-wall-row-3col">
              {[WALLPAPERS[2], WALLPAPERS[3], WALLPAPERS[4]].map((w) => (
                <div key={w.id} className="cs-wall-item">
                  <div className="cs-wall-item__frame cs-wall-item__frame--9-16">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.preview} alt={w.seoAlt} className="cs-wall-item__img" loading="lazy" />
                    <div className="cs-wall-item__corners" aria-hidden="true">
                      <span /><span /><span /><span />
                    </div>
                  </div>
                  <div className="cs-wall-item__footer">
                    <span className="cs-wall-item__label">{w.label}</span>
                  <a href="#download-kit" className="sets-dl-hint">↓ Download 4K</a></div>
                </div>
              ))}
            </div>

            {/* ROW 3: Three squares — avatar + circle pfp + watch */}
            <div className="cs-wall-row-3col">
              {[WALLPAPERS[5], WALLPAPERS[6], WALLPAPERS[7]].map((w) => (
                <div key={w.id} className="cs-wall-item">
                  <div className="cs-wall-item__frame cs-wall-item__frame--1-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.preview} alt={w.seoAlt} className="cs-wall-item__img" loading="lazy" />
                    <div className="cs-wall-item__corners" aria-hidden="true">
                      <span /><span /><span /><span />
                    </div>
                  </div>
                  <div className="cs-wall-item__footer">
                    <span className="cs-wall-item__label">{w.label}</span>
                  <a href="#download-kit" className="sets-dl-hint">↓ Download 4K</a></div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── THREE PHASES ── */}
        <section
          style={{
            maxWidth: "1100px",
            margin: "clamp(64px,8vw,96px) auto 0",
            padding: "0 clamp(20px,5vw,60px)",
          }}
        >
          <div className="cs-section-head">
            <span className="cs-section-eyebrow">The Sovereign's Arc</span>
            <h2 className="cs-section-title">Three Phases of the Crimson Fortress</h2>
          </div>

          <div className="cs-phases">
            {[
              {
                num: "01",
                title: "The Silent Command",
                color: "#8a1a1a",
                body: "The journey begins at the fortress gates. The Crimson Sovereign stands in his standard form, projecting an aura of calm but undeniable authority. This landscape set is designed for the professional gamer's desktop — a wide, immersive view of gothic architecture under a blood-red eclipse, with clean space for system icons while keeping the character's presence focused.",
                best: "Professional gaming desktops and widescreen monitors.",
              },
              {
                num: "02",
                title: "The Crimson Pulse",
                color: "#c0001a",
                body: "When the fortress is challenged, the Sovereign's energy shifts. A deep, red pulse ignites within his eyes and across his armor. This vertical version is a high-detail crop optimised for iPhone and Android lockscreens — engineered for OLED displays where the deep blacks of the fortress contrast perfectly with glowing red highlights, saving battery while delivering maximum visual impact.",
                best: "iPhone and Android lockscreens, OLED display setups.",
              },
              {
                num: "03",
                title: "The Shadow Sentinel",
                color: "#ff2a00",
                body: "Guarding the secret passages of the fortress is the Lunar Sentinel. While the Sovereign commands from the front, the Sentinel watches from the shadows. Use the Sovereign for your lockscreen and the Sentinel for your smartwatch — or mix them across devices to represent the dual power of the Crimson Fortress.",
                best: "Smartwatch faces, Discord PFP, and social media avatars.",
              },
            ].map((phase) => (
              <div key={phase.num} className="cs-phase">
                <span className="cs-phase__num" style={{ color: phase.color }}>
                  {phase.num}
                </span>
                <div
                  className="cs-phase__line"
                  style={{ background: phase.color, opacity: 0.3 }}
                />
                <div className="cs-phase__body">
                  <h3 className="cs-phase__title" style={{ color: phase.color }}>
                    {phase.title}
                  </h3>
                  <p className="cs-phase__text">{phase.body}</p>
                  <p className="cs-phase__best">
                    <span style={{ color: "#60608a" }}>Best for: </span>
                    {phase.best}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY MATCHING SETS ── */}
        <section
          style={{
            maxWidth: "1100px",
            margin: "clamp(64px,8vw,96px) auto 0",
            padding: "0 clamp(20px,5vw,60px)",
          }}
        >
          <div className="cs-why">
            <h2 className="cs-why__title">Why the Crimson Sovereign Belongs on Every Screen</h2>
            <p className="cs-why__body">
              Your gaming setup is more than hardware — it is an identity. The Crimson Sovereign is
              built for those who demand consistency across their entire digital ecosystem. Whether you
              are mid-session at your fortress of a desk, checking notifications on your phone, or
              glancing at your watch between rounds, the Sovereign's presence follows you.
            </p>
            <p className="cs-why__body">
              This collection is crafted for fans of Dark Fantasy, Gothic Gaming Aesthetics, and
              high-impact OLED-first design. Every image in this kit has been manually tuned —
              not auto-cropped — so the character always lands in the right position on every
              form factor.
            </p>

            <div className="cs-why__tags">
              {[
                "dark fantasy",
                "gaming character",
                "gothic aesthetic",
                "OLED optimised",
                "crimson gaming setup",
                "4K wallpaper kit",
                "matching setup",
                "discord pfp",
              ].map((t) => (
                <span key={t} className="cs-why__tag">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── DOWNLOAD ALL CTA ── */}
        <section id="download-kit"<section
          style={{
            maxWidth: "1100px",
            margin: "clamp(48px,7vw,80px) auto clamp(64px,10vw,120px)",
            padding: "0 clamp(20px,5vw,60px)",
          }}
        >
          <div id="download-kit" className="cs-cta-block">
            <div className="cs-cta-block__glow" aria-hidden="true" />
            <span className="cs-cta-block__eyebrow">Free. No account. No watermarks.</span>
            <h2 className="cs-cta-block__title">Download the Complete Kit</h2>
            <p className="cs-cta-block__sub">
              All 8 wallpapers. Full 4K resolution. Every device covered.
            </p>
            <div className="cs-cta-block__btns">
              {WALLPAPERS.map((w) => (
                <a
                  key={w.id}
                  href={w.download}
                  download={w.filename}
                  className="cs-cta-btn"
                >
                  {w.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── EXPLORE MORE ── */}
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 clamp(20px,5vw,60px)" }}>
          <div className="cs-section-head">
            <span className="cs-section-eyebrow">Keep Exploring</span>
            <h2 className="cs-section-title">Explore More Matching Sets</h2>
          </div>
          <div className="cs-explore-grid">
            <Link href="/sets/haunted-anime-student" className="cs-explore-card cs-explore-card--link">
              <div className="cs-explore-card__thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Cursed%20Student%3A%20A%20Matching%20Dark%20Anime%20Horror%20Kit/cursed-student-dark-anime-4k-desktop-background.webp"
                  alt="The Cursed Student matching dark anime horror wallpaper set"
                  className="cs-explore-card__img"
                  loading="lazy"
                />
                <span className="cs-explore-card__badge">Set No. 01</span>
              </div>
              <div className="cs-explore-card__body">
                <h3 className="cs-explore-card__title">The Cursed Student</h3>
                <p className="cs-explore-card__desc">Psychological horror anime. Three phases of possession across PC, phone, and watch.</p>
                <span className="cs-explore-card__cta">View Set →</span>
              </div>
            </Link>
            <Link href="/sets/whispering-woods" className="cs-explore-card cs-explore-card--link">
              <div className="cs-explore-card__thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Whispering%20Woods%3A%20A%20Matching%20Dark%20Nature%20Setup%20Kit/whispering-woods-foggy-horror-forest-4k-deskto.webp"
                  alt="The Whispering Woods matching dark nature horror wallpaper set"
                  className="cs-explore-card__img"
                  loading="lazy"
                />
                <span className="cs-explore-card__badge">Set No. 02</span>
              </div>
              <div className="cs-explore-card__body">
                <h3 className="cs-explore-card__title">The Whispering Woods</h3>
                <p className="cs-explore-card__desc">A dark nature horror aesthetic. The forest watches. Five 4K wallpapers for every screen.</p>
                <span className="cs-explore-card__cta">View Set →</span>
              </div>
            </Link>
            <Link href="/sets/ghost-pitch" className="cs-explore-card cs-explore-card--link">
              <div className="cs-explore-card__thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Ghost%20Pitch%3A%20A%20Matching%20Dark%20Soccer%20Setup%20Kit/haunted-soccer-stadium-midnight-4k-desktop.webp"
                  alt="The Ghost Pitch haunted soccer stadium dark horror matching wallpaper set"
                  className="cs-explore-card__img"
                  loading="lazy"
                />
                <span className="cs-explore-card__badge">Set No. 03</span>
              </div>
              <div className="cs-explore-card__body">
                <h3 className="cs-explore-card__title">The Ghost Pitch</h3>
                <p className="cs-explore-card__desc">A haunted soccer stadium at midnight. The game goes on — even after death.</p>
                <span className="cs-explore-card__cta">View Set →</span>
              </div>
            </Link>
          </div>
        </section>

        {/* ── BACK LINK ── */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 clamp(20px,5vw,60px) 48px",
            borderTop: "1px solid rgba(192,0,26,0.15)",
            paddingTop: "32px",
            marginTop: "clamp(48px,7vw,80px)",
          }}
        >
          <Link
            href="/sets"
            style={{
              fontFamily: "var(--font-space, monospace)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#60608a",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            ← All Matching Sets
          </Link>
        </div>
      </div>

      {/* ── STYLES ── */}
      <style>{`
        /* ── Premium badge ── */
        .cs-premium-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-space, monospace);
          font-size: 0.52rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ff6a00;
          background: linear-gradient(135deg, rgba(255,106,0,0.12) 0%, rgba(192,0,26,0.12) 100%);
          border: 1px solid rgba(255,106,0,0.4);
          padding: 5px 12px;
          border-radius: 2px;
          font-weight: 700;
          box-shadow: 0 0 16px rgba(255,106,0,0.15);
          animation: cs-premium-pulse 3s ease-in-out infinite;
        }
        @keyframes cs-premium-pulse {
          0%,100% { box-shadow: 0 0 16px rgba(255,106,0,0.15); }
          50% { box-shadow: 0 0 28px rgba(255,106,0,0.3), 0 0 48px rgba(192,0,26,0.12); }
        }

        /* ── WALLPAPER LAYOUT ── */
        .cs-wall-layout {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .cs-wall-row-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          align-items: start;
        }
        .cs-wall-row-3col {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          align-items: start;
        }

        /* ── Individual wall item ── */
        .cs-wall-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cs-wall-item__frame {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(192,0,26,0.2);
          background: #080810;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        .cs-wall-item__frame:hover {
          border-color: rgba(192,0,26,0.55);
          box-shadow: 0 0 32px rgba(192,0,26,0.12);
        }
        .cs-wall-item__frame--16-9 { aspect-ratio: 16 / 9; width: 100%; }
        .cs-wall-item__frame--9-16 { aspect-ratio: 9 / 16; width: 100%; }
        .cs-wall-item__frame--1-1  { aspect-ratio: 1 / 1;  width: 100%; }

        .cs-wall-item__img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .cs-wall-item__frame:hover .cs-wall-item__img { transform: scale(1.03); }

        /* Corner brackets */
        .cs-wall-item__corners {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .cs-wall-item__corners span {
          position: absolute;
          width: 12px; height: 12px;
          border-color: rgba(192,0,26,0.55);
          border-style: solid;
        }
        .cs-wall-item__corners span:nth-child(1) { top: 6px; left: 6px; border-width: 1.5px 0 0 1.5px; }
        .cs-wall-item__corners span:nth-child(2) { top: 6px; right: 6px; border-width: 1.5px 1.5px 0 0; }
        .cs-wall-item__corners span:nth-child(3) { bottom: 6px; left: 6px; border-width: 0 0 1.5px 1.5px; }
        .cs-wall-item__corners span:nth-child(4) { bottom: 6px; right: 6px; border-width: 0 1.5px 1.5px 0; }

        /* Hover overlay */
        .cs-wall-item__overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 10px;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        .cs-wall-item__frame:hover .cs-wall-item__overlay {
          opacity: 1;
          pointer-events: auto;
        }

        /* Footer */
        .cs-wall-item__footer {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 0 2px;
        }
        .cs-wall-item__label {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(0.7rem, 1.1vw, 0.85rem);
          color: #e8ddd0;
          letter-spacing: 0.03em;
        }
        .cs-pin-btn:hover { background: #c0001b; transform: translateY(-1px); }

        /* ── Responsive ── */
        @media (max-width: 700px) {
          .cs-wall-row-2col { grid-template-columns: 1fr; }
          .cs-wall-row-3col { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 440px) {
          .cs-wall-row-3col { grid-template-columns: 1fr; }
        }

        /* ── COLLAGE ── */
        .cs-collage {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: clamp(24px,4vw,40px);
        }
        .cs-collage__desktop {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          border: 2px solid #0f0f1e;
          box-shadow: 0 0 0 4px #0a0a14, 0 0 0 6px rgba(20,20,40,0.9), 0 0 80px rgba(0,0,0,0.7);
          animation: cs-glow-desk 4s ease-in-out infinite;
          aspect-ratio: 16/9;
          background: #080810;
          width: 100%;
        }
        @keyframes cs-glow-desk {
          0%,100% { box-shadow: 0 0 0 4px #0a0a14, 0 0 0 6px rgba(20,20,40,0.9), 0 0 80px rgba(0,0,0,0.7); }
          50%      { box-shadow: 0 0 0 4px #0a0a14, 0 0 0 6px rgba(20,20,40,0.9), 0 0 80px rgba(0,0,0,0.7), 0 0 120px rgba(192,0,26,0.15); }
        }
        .cs-collage__bottom-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .cs-collage__device-label {
          position: relative;
          top: auto; left: auto;
          display: block;
          margin-bottom: 8px;
          background: none;
          padding: 0;
          font-family: var(--font-space, monospace);
          font-size: 0.52rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
        }
        .cs-collage__desktop .cs-collage__device-label {
          position: absolute;
          top: 10px; left: 12px;
          background: rgba(0,0,0,0.65);
          padding: 3px 8px;
          border-radius: 2px;
          z-index: 2;
          margin-bottom: 0;
        }
        .cs-collage__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .cs-collage__scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px
          );
          pointer-events: none;
        }
        .cs-collage__phone-wrap {
          position: relative;
          width: clamp(90px, 15%, 160px);
          flex-shrink: 0;
        }
        .cs-collage__phone-shell {
          position: relative;
          width: 100%;
          aspect-ratio: 9/16;
          border-radius: 28px;
          overflow: hidden;
          border: 2px solid #0f0f1e;
          background: #080810;
          animation: cs-glow-phone 4s ease-in-out infinite 1s;
          box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 12px 48px rgba(0,0,0,0.8);
        }
        @keyframes cs-glow-phone {
          0%,100% { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 12px 48px rgba(0,0,0,0.8); }
          50%      { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 12px 48px rgba(0,0,0,0.8), 0 0 50px rgba(192,0,26,0.18); }
        }
        .cs-collage__island {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 35%;
          height: 10px;
          background: #000;
          border-radius: 6px;
          z-index: 3;
        }
        .cs-collage__phone-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .cs-collage__gloss {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 40%);
          pointer-events: none;
        }
        .cs-collage__home-bar {
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 33%;
          height: 3px;
          background: rgba(255,255,255,0.22);
          border-radius: 2px;
        }
        .cs-collage__watch-wrap {
          width: clamp(72px, 11%, 124px);
          flex-shrink: 0;
          position: relative;
          align-self: flex-end;
        }
        .cs-collage__watch-shell {
          position: relative;
          width: 100%;
          aspect-ratio: 1/1;
          border-radius: 32% / 28%;
          overflow: hidden;
          border: 2px solid #0f0f1e;
          background: #080810;
          animation: cs-glow-watch 4s ease-in-out infinite 2s;
          box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 8px 32px rgba(0,0,0,0.75);
        }
        @keyframes cs-glow-watch {
          0%,100% { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 8px 32px rgba(0,0,0,0.75); }
          50%      { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 8px 32px rgba(0,0,0,0.75), 0 0 40px rgba(192,0,26,0.2); }
        }
        .cs-collage__watch-crown {
          position: absolute;
          right: -6px;
          top: 42%;
          width: 6px;
          height: 18px;
          background: #181828;
          border-radius: 0 3px 3px 0;
        }
        .cs-collage__watch-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .cs-collage__watch-gloss {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 45%);
          pointer-events: none;
        }
        @media (max-width: 480px) {
          .cs-collage__watch-wrap { display: none; }
          .cs-collage__phone-wrap { width: clamp(80px, 20%, 130px); }
        }

        /* ── Lore ── */
        .cs-lore {
          display: grid;
          grid-template-columns: 3px 1fr;
          gap: 28px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(192,0,26,0.15);
          padding: clamp(24px,4vw,40px);
          position: relative;
          overflow: hidden;
        }
        .cs-lore::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 80% at 0% 50%, rgba(192,0,26,0.05), transparent);
          pointer-events: none;
        }
        .cs-lore__bar {
          background: linear-gradient(to bottom, transparent, #c0001a, transparent);
          border-radius: 2px;
          flex-shrink: 0;
        }
        .cs-lore__title {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(1.1rem,2vw,1.5rem);
          font-weight: 700;
          color: #f0e8d8;
          margin: 0 0 16px;
          letter-spacing: 0.04em;
        }
        .cs-lore__body {
          font-family: var(--font-cormorant, serif);
          font-size: clamp(1rem,1.5vw,1.1rem);
          line-height: 1.8;
          color: rgba(224,224,248,0.65);
          margin: 0 0 12px;
        }
        .cs-lore__body:last-child { margin-bottom: 0; }

        /* ── Section head ── */
        .cs-section-head { margin-bottom: clamp(28px,4vw,48px); }
        .cs-section-eyebrow {
          display: block;
          font-family: var(--font-space, monospace);
          font-size: 0.56rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #c0001a;
          margin-bottom: 10px;
        }
        .cs-section-title {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(1.4rem,3vw,2.2rem);
          font-weight: 700;
          color: #f0e8d8;
          margin: 0;
          letter-spacing: 0.04em;
        }

        /* ── Phases ── */
        .cs-phases { display: flex; flex-direction: column; gap: 32px; }
        .cs-phase {
          display: grid;
          grid-template-columns: 40px 2px 1fr;
          gap: 20px;
          align-items: start;
        }
        .cs-phase__num {
          font-family: var(--font-cinzel, serif);
          font-size: 1rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          line-height: 1;
          padding-top: 2px;
        }
        .cs-phase__line { width: 2px; min-height: 100%; border-radius: 1px; }
        .cs-phase__title {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(0.95rem,1.6vw,1.15rem);
          font-weight: 700;
          margin: 0 0 12px;
          letter-spacing: 0.04em;
        }
        .cs-phase__text {
          font-family: var(--font-cormorant, serif);
          font-size: clamp(0.95rem,1.4vw,1.05rem);
          line-height: 1.8;
          color: rgba(224,224,248,0.62);
          margin: 0 0 10px;
        }
        .cs-phase__best {
          font-family: var(--font-space, monospace);
          font-size: 0.56rem;
          letter-spacing: 0.12em;
          color: rgba(224,224,248,0.5);
          margin: 0;
        }

        /* ── Why section ── */
        .cs-why {
          border: 1px solid rgba(192,0,26,0.15);
          padding: clamp(28px,4vw,48px);
          position: relative;
          overflow: hidden;
        }
        .cs-why::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 100% 50%, rgba(192,0,26,0.05), transparent);
          pointer-events: none;
        }
        .cs-why__title {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(1.2rem,2.5vw,1.8rem);
          font-weight: 700;
          color: #f0e8d8;
          margin: 0 0 20px;
          letter-spacing: 0.04em;
        }
        .cs-why__body {
          font-family: var(--font-cormorant, serif);
          font-size: clamp(0.98rem,1.5vw,1.08rem);
          line-height: 1.8;
          color: rgba(224,224,248,0.65);
          margin: 0 0 16px;
          max-width: 720px;
        }
        .cs-why__body:last-of-type { margin-bottom: 24px; }
        .cs-why__tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .cs-why__tag {
          font-family: var(--font-space, monospace);
          font-size: 0.56rem;
          letter-spacing: 0.12em;
          color: rgba(192,0,26,0.7);
        }

        /* ── CTA block ── */
        .cs-cta-block {
          position: relative;
          border: 1px solid rgba(192,0,26,0.3);
          padding: clamp(32px,5vw,56px);
          text-align: center;
          overflow: hidden;
        }
        .cs-cta-block__glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(192,0,26,0.09), transparent);
          pointer-events: none;
        }
        .cs-cta-block__eyebrow {
          display: block;
          font-family: var(--font-space, monospace);
          font-size: 0.56rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #60608a;
          margin-bottom: 14px;
          position: relative;
        }
        .cs-cta-block__title {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(1.4rem,3vw,2.2rem);
          font-weight: 700;
          color: #f0e8d8;
          margin: 0 0 10px;
          position: relative;
        }
        .cs-cta-block__sub {
          font-family: var(--font-cormorant, serif);
          font-size: 1rem;
          color: rgba(224,224,248,0.55);
          margin: 0 0 28px;
          position: relative;
        }
        .cs-cta-block__btns {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          position: relative;
        }
        .cs-cta-btn {
          display: inline-flex;
          align-items: center;
          padding: 12px 22px;
          background: transparent;
          color: rgba(224,224,248,0.8);
          border: 1px solid rgba(192,0,26,0.35);
          border-radius: 2px;
          font-family: var(--font-space, monospace);
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .cs-cta-btn:hover {
          border-color: rgba(192,0,26,0.7);
          color: #fff;
          background: rgba(192,0,26,0.1);
          box-shadow: 0 0 20px rgba(192,0,26,0.18);
        }

        /* ── Explore More Grid ── */
        .cs-explore-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: clamp(16px,2.5vw,24px);
          margin-bottom: clamp(48px,8vw,80px);
        }
        .cs-explore-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(192,0,26,0.12);
          overflow: hidden;
          transition: border-color 0.3s, box-shadow 0.3s;
          text-decoration: none;
          display: block;
        }
        .cs-explore-card:hover {
          border-color: rgba(192,0,26,0.35);
          box-shadow: 0 0 30px rgba(192,0,26,0.05);
        }
        .cs-explore-card__thumb {
          aspect-ratio: 16/9;
          background: #08060e;
          position: relative;
          overflow: hidden;
        }
        .cs-explore-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .cs-explore-card:hover .cs-explore-card__img { transform: scale(1.04); }
        .cs-explore-card__badge {
          position: absolute;
          top: 8px; left: 10px;
          font-family: var(--font-space, monospace);
          font-size: 0.48rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c0001a;
          background: rgba(0,0,0,0.75);
          border: 1px solid rgba(192,0,26,0.35);
          padding: 2px 7px;
          border-radius: 2px;
        }
        .cs-explore-card__body { padding: clamp(14px,2vw,20px); }
        .cs-explore-card__title {
          font-family: var(--font-cinzel, serif);
          font-size: 0.95rem;
          font-weight: 700;
          color: #f0e8d8;
          margin: 0 0 8px;
          letter-spacing: 0.04em;
        }
        .cs-explore-card__desc {
          font-family: var(--font-cormorant, serif);
          font-size: 0.9rem;
          line-height: 1.65;
          color: rgba(224,224,248,0.5);
          margin: 0 0 10px;
        }
        .cs-explore-card__cta {
          font-family: var(--font-space, monospace);
          font-size: 0.56rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #c0001a;
        }

        /* ── Set No Badge ── */
        .cs-set-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .cs-set-badge__num {
          font-family: var(--font-space, monospace);
          font-size: clamp(0.75rem, 1.5vw, 0.9rem);
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #c0001a;
          background: rgba(192,0,26,0.08);
          border: 1px solid rgba(192,0,26,0.35);
          padding: 6px 16px;
          border-radius: 2px;
          font-weight: 700;
        }
        .cs-set-badge__div {
          color: rgba(192,0,26,0.4);
          font-size: 1.2rem;
        }
        .cs-set-badge__sub {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(0.9rem, 2vw, 1.2rem);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f0e8d8;
          font-weight: 700;
        }

        @media (max-width: 500px) {
          .cs-set-badge { flex-direction: column; align-items: flex-start; gap: 8px; }
          .cs-phase { grid-template-columns: 32px 2px 1fr; gap: 12px; }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    </main>
  );
}