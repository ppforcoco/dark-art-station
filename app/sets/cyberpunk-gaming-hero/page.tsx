// app/sets/cyberpunk-gaming-hero/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

const BASE =
  "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/Cyberpunk%20Gaming%20Hero%20Matching%20Wallpaper%20Set";
const BASE_4K = `${BASE}/4k`;

const THUMBNAIL =
  "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/Cyberpunk%20Gaming%20Hero%20Matching%20Wallpaper%20Set/terminal-paradox-cyber-neon-phantom-pointing-homescreen-mobile-thumbnail-cover.webp";

const WALLPAPERS = [
  {
    id: "pc-setup",
    label: "Gaming PC Setup — 4K Desktop",
    download: `${BASE_4K}/terminal-paradox-neon-horror-gaming-station-setup-pc.jpg`,
    filename: "cyberpunk-hero-pc-setup-4k.jpg",
    preview: `${BASE}/thumb-terminal-paradox-neon-horror-gaming-station-setup-pc.webp`,
    seoAlt: "Terminal Paradox 4K cyberpunk gaming PC setup wallpaper — OLED-optimized neon horror gaming station with glowing purple peripheral lights and cyberpunk hero on screen.",
    ratio: "16-9",
  },
  {
    id: "full-body",
    label: "Full Body — Phone Homescreen",
    download: `${BASE_4K}/terminal-paradox-full-body-cyberpunk-gaming-hero-mobile.jpg`,
    filename: "cyberpunk-hero-full-body-4k.jpg",
    preview: `${BASE}/terminal-paradox-full-body-cyberpunk-gaming-hero-mobile.webp`,
    seoAlt: "Terminal Paradox full body 4K cyberpunk gaming hero mobile wallpaper — OLED black background with neon purple techwear aesthetic and haunted digital glitch spirits.",
    ratio: "9-16",
  },
  {
    id: "homescreen",
    label: "Phone Homescreen — Phantom",
    download: `${BASE_4K}/terminal-paradox-cyber-neon-phantom-pointing-homescreen-mobile.jpg`,
    filename: "cyberpunk-hero-homescreen-4k.jpg",
    preview: `${BASE}/terminal-paradox-cyber-neon-phantom-pointing-homescreen-mobile.webp`,
    seoAlt: "Terminal Paradox 4K cyberpunk neon phantom homescreen wallpaper — OLED mobile background featuring glowing glitch phantom pointing at screen with purple neon haze.",
    ratio: "9-16",
  },
  {
    id: "lockscreen",
    label: "Phone Lockscreen — OLED",
    download: `${BASE_4K}/terminal-paradox-cyberpunk-hero-hushing-lockscreen-mobile.jpg`,
    filename: "cyberpunk-hero-lockscreen-4k.jpg",
    preview: `${BASE}/terminal-paradox-cyberpunk-hero-hushing-lockscreen-mobile.webp`,
    seoAlt: "Terminal Paradox 4K OLED cyberpunk lockscreen wallpaper — pure black background with glitch hero glowing purple neon eyes and hushing gesture, perfect for AMOLED phones.",
    ratio: "9-16",
  },
  {
    id: "avatar",
    label: "Square Avatar / PFP",
    download: `${BASE_4K}/terminal-paradox-digital-phantom-cyber-gaming-pfp-avatar.jpg`,
    filename: "cyberpunk-hero-avatar-4k.jpg",
    preview: `${BASE}/terminal-paradox-digital-phantom-cyber-gaming-pfp-avatar.webp`,
    seoAlt: "Terminal Paradox 4K cyberpunk gaming hero Discord avatar PFP — neon purple glitch phantom profile picture with OLED-optimized dark background for gaming profiles.",
    ratio: "1-1",
  },
  {
    id: "watch",
    label: "Smartwatch Face",
    download: `${BASE_4K}/terminal-paradox-glitch-hero-neon-smartwatch-face.jpg`,
    filename: "cyberpunk-hero-watch-4k.jpg",
    preview: `${BASE}/terminal-paradox-glitch-hero-neon-smartwatch-face.webp`,
    seoAlt: "Terminal Paradox 4K cyberpunk smartwatch face — OLED-optimized neon purple glitch phantom with high-contrast HUD elements for dark gaming smartwatch aesthetic.",
    ratio: "1-1",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Cyberpunk Horror Gaming Hero Matching Wallpaper Set | Haunted Wallpapers",
    description:
      "Download the Cyberpunk Horror Gaming Hero matching wallpaper set. Premium 4K neon phantom wallpapers for PC, phone, and smartwatch. OLED-optimised. The Ghost in the Overclocked Machine.",
    keywords: [
      "cyberpunk gaming wallpaper",
      "neon horror gaming setup",
      "cyberpunk hero matching wallpaper set",
      "gaming PC wallpaper 4K",
      "neon phantom wallpaper",
      "cyberpunk phone lockscreen",
      "glitch hero smartwatch face",
      "cyberpunk OLED wallpaper",
      "gaming character wallpaper set",
      "dark gaming aesthetic",
      "matching gaming setup wallpaper",
      "terminal paradox wallpaper",
      "cyberpunk avatar discord",
      "neon gaming background",
      "horror gaming wallpaper",
    ],
    openGraph: {
      title: "Cyberpunk Horror Gaming Hero Matching Wallpaper Set | Haunted Wallpapers",
      description:
        "The Ghost in the Overclocked Machine. Premium 4K cyberpunk neon horror wallpapers for every screen — PC, phone, smartwatch, and avatar.",
      url: `${SITE_URL}/sets/cyberpunk-gaming-hero`,
      siteName: "Haunted Wallpapers",
      type: "website",
      images: [{ url: THUMBNAIL, width: 1200, height: 630, alt: "Cyberpunk Horror Gaming Hero Matching Wallpaper Set" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Cyberpunk Horror Gaming Hero Matching Wallpaper Set",
      description: "Premium 4K cyberpunk neon wallpapers. PC, phone, smartwatch. Every screen covered.",
      images: [THUMBNAIL],
    },
    alternates: { canonical: `${SITE_URL}/sets/cyberpunk-gaming-hero` },
  };
}

export const revalidate = 86400;



export default function CyberpunkGamingHeroPage() {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cyberpunk Horror Gaming Hero Matching Wallpaper Set",
    description: "Premium 4K cyberpunk neon horror wallpapers for PC, phone, and smartwatch. The Ghost in the Overclocked Machine.",
    url: `${SITE_URL}/sets/cyberpunk-gaming-hero`,
    numberOfItems: WALLPAPERS.length,
    itemListElement: WALLPAPERS.map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${w.label} — Cyberpunk Gaming Hero`,
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
      {/* Noise overlay */}
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
      {/* Purple neon glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,92,246,0.14) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* BREADCRUMBS */}
        <nav aria-label="Breadcrumb" style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(28px,5vw,48px) clamp(20px,5vw,60px) 0" }}>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-space, monospace)", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            <li><Link href="/" style={{ color: "#60608a", textDecoration: "none" }}>Home</Link></li>
            <li style={{ color: "#24243a" }}>›</li>
            <li><Link href="/sets" style={{ color: "#60608a", textDecoration: "none" }}>Matching Sets</Link></li>
            <li style={{ color: "#24243a" }}>›</li>
            <li style={{ color: "#d8d8f0" }}>Cyberpunk Gaming Hero</li>
          </ol>
        </nav>

        {/* HERO */}
        <header style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(32px,5vw,56px) clamp(20px,5vw,60px) 0" }}>
          <div className="cp-set-badge">
            <span className="cp-set-badge__num">Set No. 05</span>
            <span className="cp-set-badge__div">—</span>
            <span className="cp-set-badge__sub">Cyberpunk Horror Gaming Kit</span>
            <span className="cp-premium-badge">Premium</span>
            <span className="cp-tag-badge">Gaming</span>
          </div>

          {/* Hero collage */}
          <div className="cp-collage" aria-label="Preview of all wallpapers in this set">
            <div className="cp-collage__desktop">
              <div className="cp-collage__device-label">Desktop · 16:9</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={WALLPAPERS[0].preview} alt="4K cyberpunk gaming setup wallpaper — OLED-optimized neon horror gaming station with purple peripheral lights" className="cp-collage__img" loading="eager" fetchPriority="high" />
              <div className="cp-collage__scanlines" aria-hidden="true" />
            </div>
            <div className="cp-collage__bottom-row">
              <div className="cp-collage__phone-wrap">
                <div className="cp-collage__device-label">Mobile · 9:16</div>
                <div className="cp-collage__phone-shell">
                  <div className="cp-collage__island" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={WALLPAPERS[3].preview} alt="Cyberpunk lockscreen wallpaper" className="cp-collage__phone-img" loading="eager" />
                  <div className="cp-collage__gloss" aria-hidden="true" />
                  <div className="cp-collage__home-bar" aria-hidden="true" />
                </div>
              </div>
              <div className="cp-collage__watch-wrap">
                <div className="cp-collage__device-label">Watch · 1:1</div>
                <div className="cp-collage__watch-shell">
                  <div className="cp-collage__watch-crown" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={WALLPAPERS[5].preview} alt="Cyberpunk smartwatch face" className="cp-collage__watch-img" loading="eager" />
                  <div className="cp-collage__watch-gloss" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>

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
                textShadow: "0 4px 40px rgba(139,92,246,0.4), 0 0 80px rgba(100,50,255,0.12)",
              }}
            >
              Cyberpunk Horror Gaming Hero
            </h1>
            <p style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(1rem, 1.6vw, 1.15rem)", lineHeight: 1.75, maxWidth: "700px", color: "rgba(224,224,248,0.7)", margin: 0 }}>
              Download the complete matching wallpaper set. Premium 4K neon cyberpunk horror backgrounds manually optimised for OLED displays, high-end gaming setups, and every device in your ecosystem — from desktop to smartwatch.
            </p>
          </div>
        </header>

        {/* ── QUICK DOWNLOAD — top of page ── */}
        <section
          style={{
            maxWidth: "1100px",
            margin: "clamp(32px,5vw,48px) auto 0",
            padding: "0 clamp(20px,5vw,60px)",
          }}
        >
          <div className="cs-cta-block">
            <div className="cs-cta-block__glow" aria-hidden="true" />
            <span className="cs-cta-block__eyebrow">Free. No account. No watermarks.</span>
            <h2 className="cs-cta-block__title">Download the Complete Kit</h2>
            <p className="cs-cta-block__sub">
              All six wallpapers. Full 4K resolution. Every device covered.
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


        {/* LORE SECTION */}
        <section style={{ maxWidth: "1100px", margin: "clamp(48px,7vw,80px) auto 0", padding: "0 clamp(20px,5vw,60px)" }}>
          <div className="cp-lore">
            <div className="cp-lore__bar" aria-hidden="true" />
            <div className="cp-lore__content">
              <h2 className="cp-lore__title">The Ghost in the Overclocked Machine</h2>
              <p className="cp-lore__body">
                They told him the human brain wasn&apos;t meant to sync with a 240Hz refresh rate. He didn&apos;t listen. The{" "}
                <span style={{ color: "#8b5cf6", fontStyle: "italic" }}>Void-Frame Protocol</span>{" "}
                is the digital residue of a legendary pro-player who pushed his hardware into a forbidden overclock — and never came back. His consciousness didn&apos;t crash; it just migrated into the static.
              </p>
              <p className="cp-lore__body">
                He is the Ghost in the Machine, a sentient glitch residing in the high-voltage frequencies of your GPU. The vibrant purple neon isn&apos;t a design choice — it&apos;s the radiation of a soul trapped in digital purgatory, screaming through the pixels. When your screen flickers at 3:00 AM, it isn&apos;t a hardware failure. It&apos;s him, trying to find a way out of the terminal.
              </p>
              <p className="cp-lore__body">
                This setup is for those who live in the neon-lit dark, where the line between the gamer and the game has been permanently erased. Flesh is a bottleneck. The glitch is your new god.
              </p>
            </div>
          </div>
        </section>

        {/* WALLPAPERS GRID */}
        <section style={{ maxWidth: "1100px", margin: "clamp(48px,7vw,80px) auto 0", padding: "0 clamp(20px,5vw,60px)" }}>
          <div className="cp-section-head">
            <span className="cp-section-eyebrow">What is Included in This Setup Kit</span>
            <h2 className="cp-section-title">6 Wallpapers. Every Screen Covered.</h2>
          </div>

          <div className="cp-wall-layout">
            {/* Row 1: gaming station desktop — full width */}
            <div className="cp-wall-item">
              <div className="cp-wall-item__frame cp-wall-item__frame--16-9">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={WALLPAPERS[0].preview} alt={WALLPAPERS[0].seoAlt} className="cp-wall-item__img" loading="eager" />
                <div className="cp-wall-item__corners" aria-hidden="true"><span /><span /><span /><span /></div>
              </div>
              <div className="cp-wall-item__footer"><span className="cp-wall-item__label">{WALLPAPERS[0].label}</span></div>
            </div>

            {/* Row 2: 3 portrait phone wallpapers — full-body, homescreen, lockscreen */}
            <div className="cp-wall-row-portrait">
              {[WALLPAPERS[1], WALLPAPERS[2], WALLPAPERS[3]].map((w) => (
                <div key={w.id} className="cp-wall-item">
                  <div className="cp-wall-item__frame cp-wall-item__frame--9-16">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.preview} alt={w.seoAlt} className="cp-wall-item__img" loading="lazy" />
                    <div className="cp-wall-item__corners" aria-hidden="true"><span /><span /><span /><span /></div>
                  </div>
                  <div className="cp-wall-item__footer"><span className="cp-wall-item__label">{w.label}</span></div>
                </div>
              ))}
            </div>

            {/* Row 3: avatar + watch squares */}
            <div className="cp-wall-row-2col">
              {[WALLPAPERS[4], WALLPAPERS[5]].map((w) => (
                <div key={w.id} className="cp-wall-item">
                  <div className="cp-wall-item__frame cp-wall-item__frame--1-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.preview} alt={w.seoAlt} className="cp-wall-item__img" loading="lazy" />
                    <div className="cp-wall-item__corners" aria-hidden="true"><span /><span /><span /><span /></div>
                  </div>
                  <div className="cp-wall-item__footer"><span className="cp-wall-item__label">{w.label}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THREE PHASES */}
        <section style={{ maxWidth: "1100px", margin: "clamp(64px,8vw,96px) auto 0", padding: "0 clamp(20px,5vw,60px)" }}>
          <div className="cp-section-head">
            <span className="cp-section-eyebrow">The Void-Frame Protocol</span>
            <h2 className="cp-section-title">Three Phases of the Breach</h2>
          </div>
          <div className="cp-phases">
            {[
              {
                num: "01",
                title: "The Idle Terminal — Desktop PC",
                color: "#8b5cf6",
                body: "The hero sits in the silent darkness of his custom-built rig, waiting. This 4K landscape view is optimised for dual-monitor setups, providing enough negative space for your desktop icons while keeping the high-contrast neon hero centered in the void.",
                best: "Gaming desktops, dual-monitor setups, and PC gaming stations.",
              },
              {
                num: "02",
                title: "The Aggressive Sync — Mobile Lockscreen",
                color: "#a78bfa",
                body: "When the breach begins, the hero's eyes ignite with a violent, flickering purple pulse. This vertical crop is engineered for OLED displays, using deep black levels to save battery while the high-voltage neon pops with terrifying clarity every time you wake your phone.",
                best: "Phone lockscreens, OLED display setups.",
              },
              {
                num: "03",
                title: "The Fragmented Soul — Watch & PFP",
                color: "#c4b5fd",
                body: "The hero points directly at you — a warning that you are next in the sync. These square crops focus on the Glitch Face, creating an intense, aggressive presence for your smartwatch face or Discord avatar that demands attention in every feed.",
                best: "Smartwatch faces, Discord PFP, and social media avatars.",
              },
            ].map((phase) => (
              <div key={phase.num} className="cp-phase">
                <span className="cp-phase__num" style={{ color: phase.color }}>{phase.num}</span>
                <div className="cp-phase__line" style={{ background: phase.color, opacity: 0.3 }} />
                <div className="cp-phase__body">
                  <h3 className="cp-phase__title" style={{ color: phase.color }}>{phase.title}</h3>
                  <p className="cp-phase__text">{phase.body}</p>
                  <p className="cp-phase__best"><span style={{ color: "#60608a" }}>Best for: </span>{phase.best}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WHY SECTION */}
        <section style={{ maxWidth: "1100px", margin: "clamp(64px,8vw,96px) auto 0", padding: "0 clamp(20px,5vw,60px)" }}>
          <div className="cp-why">
            <h2 className="cp-why__title">Engineering the Cyberpunk Glitch Aesthetic</h2>
            <p className="cp-why__body">
              Cyberpunk horror thrives on high-contrast neon and digital corruption, which is why the Terminal Paradox set is designed to push your screens to their visual limits. This collection replaces standard, sterile wallpapers with high-voltage purple neon and deep obsidian values. Every image is designed to make your devices look like live terminals processing a system breach, rather than static corporate displays.
            </p>
            <p className="cp-why__body">
              To maintain this visual identity across your entire ecosystem, each aspect ratio is handled individually. Rather than applying a single generic crop to every screen, the composition of the glitch phantom and the neon elements are repositioned specifically for widescreen monitors, vertical mobile lockscreens, and smartwatches. This manual optimization ensures that the deep black pixels preserve your battery on OLED displays while the neon elements pop with crisp detail.
            </p>
            <div className="cp-why__tags">
              {["cyberpunk", "neon gaming", "horror gaming", "OLED optimised", "glitch aesthetic", "4K wallpaper kit", "matching setup", "discord pfp", "gaming station"].map((t) => (
                <span key={t} className="cp-why__tag">#{t}</span>
              ))}
            </div>
          </div>
        </section>
        {/* EXPLORE MORE */}
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 clamp(20px,5vw,60px)" }}>
          <div className="cp-section-head">
            <span className="cp-section-eyebrow">Keep Exploring</span>
            <h2 className="cp-section-title">Explore More Matching Sets</h2>
          </div>
          <div className="cp-explore-grid">
            {[
              {
                href: "/sets/crimson-sovereign",
                badge: "Set No. 04",
                img: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Crimson%20Sovereign%20%7C%20Dark%20Fantasy%20Gaming%20Character%20Matching%20Setup%20Kit/4k/Complete%20matching%20dark%20fantasy%20gaming%20character%20setup%20kit%20for%20PC%20phone%20and%20watch%20free.png",
                alt: "The Crimson Sovereign dark fantasy gaming character matching wallpaper set",
                title: "The Crimson Sovereign",
                desc: "Dark fantasy gaming character. Gothic castle, crimson pulse, and shadow sentinel across every screen.",
              },
              {
                href: "/sets/ghost-pitch",
                badge: "Set No. 03",
                img: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Ghost%20Pitch%3A%20A%20Matching%20Dark%20Soccer%20Setup%20Kit/haunted-soccer-stadium-midnight-4k-desktop.webp",
                alt: "The Ghost Pitch haunted soccer stadium dark horror matching wallpaper set",
                title: "The Ghost Pitch",
                desc: "A haunted soccer stadium at midnight. The game goes on — even after death.",
              },
              {
                href: "/sets/haunted-anime-student",
                badge: "Set No. 01",
                img: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Cursed%20Student%3A%20A%20Matching%20Dark%20Anime%20Horror%20Kit/cursed-student-dark-anime-4k-desktop-background.webp",
                alt: "The Cursed Student dark anime horror matching wallpaper set",
                title: "The Cursed Student",
                desc: "Psychological horror anime. Three phases of possession across PC, phone, and watch.",
              },
            ].map((card) => (
              <Link key={card.href} href={card.href} className="cp-explore-card cp-explore-card--link">
                <div className="cp-explore-card__thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.img} alt={card.alt} className="cp-explore-card__img" loading="lazy" />
                  <span className="cp-explore-card__badge">{card.badge}</span>
                </div>
                <div className="cp-explore-card__body">
                  <h3 className="cp-explore-card__title">{card.title}</h3>
                  <p className="cp-explore-card__desc">{card.desc}</p>
                  <span className="cp-explore-card__cta">View Set →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        /* Badge strip */
        .cp-set-badge { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .cp-set-badge__num {
          font-family: var(--font-space, monospace); font-size: clamp(0.75rem,1.5vw,0.9rem);
          letter-spacing: 0.28em; text-transform: uppercase; color: #8b5cf6;
          background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.35);
          padding: 6px 16px; border-radius: 2px; font-weight: 700;
        }
        .cp-set-badge__div { color: rgba(139,92,246,0.4); font-size: 1.2rem; }
        .cp-set-badge__sub {
          font-family: var(--font-cinzel, serif); font-size: clamp(0.9rem,2vw,1.2rem);
          letter-spacing: 0.12em; text-transform: uppercase; color: #f0e8d8; font-weight: 700;
        }
        .cp-premium-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: var(--font-space, monospace); font-size: 0.52rem;
          letter-spacing: 0.18em; text-transform: uppercase; color: #ff6a00;
          background: linear-gradient(135deg, rgba(255,106,0,0.12), rgba(139,92,246,0.12));
          border: 1px solid rgba(255,106,0,0.4); padding: 5px 12px; border-radius: 2px;
          font-weight: 700; box-shadow: 0 0 16px rgba(255,106,0,0.15);
          animation: cp-premium-pulse 3s ease-in-out infinite;
        }
        @keyframes cp-premium-pulse {
          0%,100% { box-shadow: 0 0 16px rgba(255,106,0,0.15); }
          50% { box-shadow: 0 0 28px rgba(255,106,0,0.3), 0 0 48px rgba(139,92,246,0.15); }
        }
        .cp-tag-badge {
          display: inline-flex; align-items: center;
          font-family: var(--font-space, monospace); font-size: 0.52rem;
          letter-spacing: 0.18em; text-transform: uppercase; color: #a78bfa;
          border: 1px solid rgba(139,92,246,0.4); padding: 5px 12px; border-radius: 2px;
          background: rgba(139,92,246,0.08);
        }

        /* Wallpaper layout */
        .cp-wall-layout { display: flex; flex-direction: column; gap: 12px; }
        .cp-wall-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
        /* Portrait mobile row: phones side by side, max-width so they look like phones not cut rectangles */
        .cp-wall-row-portrait {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .cp-wall-row-portrait .cp-wall-item {
          width: clamp(150px, 22%, 240px);
          flex-shrink: 0;
        }
        .cp-wall-item { display: flex; flex-direction: column; gap: 8px; }
        .cp-wall-item__frame {
          position: relative; overflow: hidden;
          border: 1px solid rgba(139,92,246,0.2); background: #080810;
          transition: border-color 0.3s, box-shadow 0.3s; cursor: pointer;
        }
        .cp-wall-item__frame:hover { border-color: rgba(139,92,246,0.55); box-shadow: 0 0 32px rgba(139,92,246,0.12); }
        .cp-wall-item__frame--16-9 { aspect-ratio: 16/9; width: 100%; }
        .cp-wall-item__frame--9-16 { aspect-ratio: 9/16; width: 100%; }
        .cp-wall-item__frame--1-1  { aspect-ratio: 1/1; width: 100%; }
        .cp-wall-item__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s; }
        .cp-wall-item__frame:hover .cp-wall-item__img { transform: scale(1.03); }
        .cp-wall-item__corners { position: absolute; inset: 0; pointer-events: none; }
        .cp-wall-item__corners span { position: absolute; width: 12px; height: 12px; border-color: rgba(139,92,246,0.55); border-style: solid; }
        .cp-wall-item__corners span:nth-child(1) { top:6px; left:6px; border-width:1.5px 0 0 1.5px; }
        .cp-wall-item__corners span:nth-child(2) { top:6px; right:6px; border-width:1.5px 1.5px 0 0; }
        .cp-wall-item__corners span:nth-child(3) { bottom:6px; left:6px; border-width:0 0 1.5px 1.5px; }
        .cp-wall-item__corners span:nth-child(4) { bottom:6px; right:6px; border-width:0 1.5px 1.5px 0; }
        .cp-wall-item__overlay {
          position: absolute; inset: 0; display: flex; align-items: flex-start; justify-content: flex-end;
          padding: 10px; opacity: 0; transition: opacity 0.2s; pointer-events: none;
        }
        .cp-wall-item__frame:hover .cp-wall-item__overlay { opacity: 1; pointer-events: auto; }
        .cp-wall-item__footer { display: flex; flex-direction: column; gap: 3px; padding: 0 2px; }
        .cp-wall-item__label { font-family: var(--font-cinzel, serif); font-size: clamp(0.7rem,1.1vw,0.85rem); color: #e8ddd0; letter-spacing: 0.03em; }
        .cp-pin-btn:hover { background: #c0001b; transform: translateY(-1px); }

        /* Responsive */
        @media (max-width: 540px) { .cp-wall-row-2col { grid-template-columns: 1fr; } }

        /* Collage */
        .cp-collage { display: flex; flex-direction: column; gap: 12px; margin-top: clamp(24px,4vw,40px); }
        .cp-collage__desktop {
          position: relative; border-radius: 4px; overflow: hidden;
          border: 2px solid #0f0f1e;
          box-shadow: 0 0 0 4px #0a0a14, 0 0 0 6px rgba(20,20,40,0.9), 0 0 80px rgba(0,0,0,0.7);
          animation: cp-glow-desk 4s ease-in-out infinite; aspect-ratio: 16/9; background: #080810; width: 100%;
        }
        @keyframes cp-glow-desk {
          0%,100% { box-shadow: 0 0 0 4px #0a0a14, 0 0 0 6px rgba(20,20,40,0.9), 0 0 80px rgba(0,0,0,0.7); }
          50% { box-shadow: 0 0 0 4px #0a0a14, 0 0 0 6px rgba(20,20,40,0.9), 0 0 80px rgba(0,0,0,0.7), 0 0 120px rgba(139,92,246,0.18); }
        }
        .cp-collage__bottom-row { display: flex; gap: 12px; align-items: flex-start; }
        .cp-collage__device-label {
          display: block; margin-bottom: 8px;
          font-family: var(--font-space, monospace); font-size: 0.52rem; letter-spacing: 0.18em;
          text-transform: uppercase; color: rgba(255,255,255,0.45);
        }
        .cp-collage__desktop .cp-collage__device-label {
          position: absolute; top: 10px; left: 12px; background: rgba(0,0,0,0.65);
          padding: 3px 8px; border-radius: 2px; z-index: 2; margin-bottom: 0;
        }
        .cp-collage__img { width: 100%; height: 100%; object-fit: cover; object-position: center center; display: block; }
        .cp-collage__scanlines {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px);
          pointer-events: none;
        }
        .cp-collage__phone-wrap { position: relative; width: clamp(90px,15%,160px); flex-shrink: 0; }
        .cp-collage__phone-shell {
          position: relative; width: 100%; aspect-ratio: 9/16; border-radius: 28px; overflow: hidden;
          border: 2px solid #0f0f1e; background: #080810;
          animation: cp-glow-phone 4s ease-in-out infinite 1s;
          box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 12px 48px rgba(0,0,0,0.8);
        }
        @keyframes cp-glow-phone {
          0%,100% { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 12px 48px rgba(0,0,0,0.8); }
          50% { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 12px 48px rgba(0,0,0,0.8), 0 0 50px rgba(139,92,246,0.22); }
        }
        .cp-collage__island { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); width: 35%; height: 10px; background: #000; border-radius: 6px; z-index: 3; }
        .cp-collage__phone-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cp-collage__gloss { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 40%); pointer-events: none; }
        .cp-collage__home-bar { position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); width: 33%; height: 3px; background: rgba(255,255,255,0.22); border-radius: 2px; }
        .cp-collage__watch-wrap { width: clamp(72px,11%,124px); flex-shrink: 0; position: relative; align-self: flex-end; }
        .cp-collage__watch-shell {
          position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 32%/28%; overflow: hidden;
          border: 2px solid #0f0f1e; background: #080810;
          animation: cp-glow-watch 4s ease-in-out infinite 2s;
          box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 8px 32px rgba(0,0,0,0.75);
        }
        @keyframes cp-glow-watch {
          0%,100% { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 8px 32px rgba(0,0,0,0.75); }
          50% { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 8px 32px rgba(0,0,0,0.75), 0 0 40px rgba(139,92,246,0.25); }
        }
        .cp-collage__watch-crown { position: absolute; right: -6px; top: 42%; width: 6px; height: 18px; background: #181828; border-radius: 0 3px 3px 0; }
        .cp-collage__watch-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cp-collage__watch-gloss { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 45%); pointer-events: none; }
        @media (max-width: 480px) { .cp-collage__watch-wrap { display: none; } .cp-collage__phone-wrap { width: clamp(80px,20%,130px); } }

        /* Lore */
        .cp-lore { display: grid; grid-template-columns: 3px 1fr; gap: 28px; background: rgba(255,255,255,0.02); border: 1px solid rgba(139,92,246,0.15); padding: clamp(24px,4vw,40px); position: relative; overflow: hidden; }
        .cp-lore::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 0% 50%, rgba(139,92,246,0.06), transparent); pointer-events: none; }
        .cp-lore__bar { background: linear-gradient(to bottom, transparent, #8b5cf6, transparent); border-radius: 2px; flex-shrink: 0; }
        .cp-lore__title { font-family: var(--font-cinzel, serif); font-size: clamp(1.1rem,2vw,1.5rem); font-weight: 700; color: #f0e8d8; margin: 0 0 16px; letter-spacing: 0.04em; }
        .cp-lore__body { font-family: var(--font-cormorant, serif); font-size: clamp(1rem,1.5vw,1.1rem); line-height: 1.8; color: rgba(224,224,248,0.65); margin: 0 0 12px; }
        .cp-lore__body:last-child { margin-bottom: 0; }

        /* Section head */
        .cp-section-head { margin-bottom: clamp(28px,4vw,48px); }
        .cp-section-eyebrow { display: block; font-family: var(--font-space, monospace); font-size: 0.56rem; letter-spacing: 0.26em; text-transform: uppercase; color: #8b5cf6; margin-bottom: 10px; }
        .cp-section-title { font-family: var(--font-cinzel, serif); font-size: clamp(1.4rem,3vw,2.2rem); font-weight: 700; color: #f0e8d8; margin: 0; letter-spacing: 0.04em; }

        /* Phases */
        .cp-phases { display: flex; flex-direction: column; gap: 32px; }
        .cp-phase { display: grid; grid-template-columns: 40px 2px 1fr; gap: 20px; align-items: start; }
        .cp-phase__num { font-family: var(--font-cinzel, serif); font-size: 1rem; font-weight: 900; letter-spacing: 0.1em; line-height: 1; padding-top: 2px; }
        .cp-phase__line { width: 2px; min-height: 100%; border-radius: 1px; }
        .cp-phase__title { font-family: var(--font-cinzel, serif); font-size: clamp(0.95rem,1.6vw,1.15rem); font-weight: 700; margin: 0 0 12px; letter-spacing: 0.04em; }
        .cp-phase__text { font-family: var(--font-cormorant, serif); font-size: clamp(0.95rem,1.4vw,1.05rem); line-height: 1.8; color: rgba(224,224,248,0.62); margin: 0 0 10px; }
        .cp-phase__best { font-family: var(--font-space, monospace); font-size: 0.56rem; letter-spacing: 0.12em; color: rgba(224,224,248,0.5); margin: 0; }

        /* Why */
        .cp-why { border: 1px solid rgba(139,92,246,0.15); padding: clamp(28px,4vw,48px); position: relative; overflow: hidden; }
        .cp-why::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 100% 50%, rgba(139,92,246,0.06), transparent); pointer-events: none; }
        .cp-why__title { font-family: var(--font-cinzel, serif); font-size: clamp(1.2rem,2.5vw,1.8rem); font-weight: 700; color: #f0e8d8; margin: 0 0 20px; letter-spacing: 0.04em; }
        .cp-why__body { font-family: var(--font-cormorant, serif); font-size: clamp(0.98rem,1.5vw,1.08rem); line-height: 1.8; color: rgba(224,224,248,0.65); margin: 0 0 16px; max-width: 720px; }
        .cp-why__body:last-of-type { margin-bottom: 24px; }
        .cp-why__tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .cp-why__tag { font-family: var(--font-space, monospace); font-size: 0.56rem; letter-spacing: 0.12em; color: rgba(139,92,246,0.7); }

        /* CTA block */
        .cp-cta-block { position: relative; border: 1px solid rgba(139,92,246,0.3); padding: clamp(32px,5vw,56px); text-align: center; overflow: hidden; }
        .cp-cta-block__glow { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(139,92,246,0.09), transparent); pointer-events: none; }
        .cp-cta-block__eyebrow { display: block; font-family: var(--font-space, monospace); font-size: 0.56rem; letter-spacing: 0.24em; text-transform: uppercase; color: #60608a; margin-bottom: 14px; position: relative; }
        .cp-cta-block__title { font-family: var(--font-cinzel, serif); font-size: clamp(1.4rem,3vw,2.2rem); font-weight: 700; color: #f0e8d8; margin: 0 0 10px; position: relative; }
        .cp-cta-block__sub { font-family: var(--font-cormorant, serif); font-size: 1rem; color: rgba(224,224,248,0.55); margin: 0 0 28px; position: relative; }
        .cp-cta-block__btns { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; position: relative; }
        .cp-cta-btn { display: inline-flex; align-items: center; padding: 12px 22px; background: transparent; color: rgba(224,224,248,0.8); border: 1px solid rgba(139,92,246,0.35); border-radius: 2px; font-family: var(--font-space, monospace); font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; transition: all 0.25s; cursor: pointer; }
        .cp-cta-btn:hover { border-color: rgba(139,92,246,0.7); color: #fff; background: rgba(139,92,246,0.1); box-shadow: 0 0 20px rgba(139,92,246,0.18); }

        /* Explore grid */
        .cp-explore-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: clamp(16px,2.5vw,24px); margin-bottom: clamp(48px,8vw,80px); }
        .cp-explore-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(139,92,246,0.12); overflow: hidden; transition: border-color 0.3s, box-shadow 0.3s; text-decoration: none; display: block; }
        .cp-explore-card:hover { border-color: rgba(139,92,246,0.35); box-shadow: 0 0 30px rgba(139,92,246,0.05); }
        .cp-explore-card__thumb { aspect-ratio: 16/9; background: #08060e; position: relative; overflow: hidden; }
        .cp-explore-card__img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
        .cp-explore-card:hover .cp-explore-card__img { transform: scale(1.04); }
        .cp-explore-card__badge { position: absolute; top: 8px; left: 10px; font-family: var(--font-space, monospace); font-size: 0.48rem; letter-spacing: 0.18em; text-transform: uppercase; color: #8b5cf6; background: rgba(0,0,0,0.75); border: 1px solid rgba(139,92,246,0.35); padding: 2px 7px; border-radius: 2px; }
        .cp-explore-card__body { padding: clamp(14px,2vw,20px); }
        .cp-explore-card__title { font-family: var(--font-cinzel, serif); font-size: 0.95rem; font-weight: 700; color: #f0e8d8; margin: 0 0 8px; letter-spacing: 0.04em; }
        .cp-explore-card__desc { font-family: var(--font-cormorant, serif); font-size: 0.9rem; line-height: 1.65; color: rgba(224,224,248,0.5); margin: 0 0 10px; }
        .cp-explore-card__cta { font-family: var(--font-space, monospace); font-size: 0.56rem; letter-spacing: 0.16em; text-transform: uppercase; color: #8b5cf6; }

        @media (max-width: 500px) {
          .cp-set-badge { flex-direction: column; align-items: flex-start; gap: 8px; }
          .cp-phase { grid-template-columns: 32px 2px 1fr; gap: 12px; }
        }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </main>
  );
}