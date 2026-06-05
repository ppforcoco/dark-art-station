// app/sets/ghost-pitch/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

const BASE =
  "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Ghost%20Pitch%3A%20A%20Matching%20Dark%20Soccer%20Setup%20Kit";
const BASE_4K = `${BASE}/4k`;

const WALLPAPERS = [
  {
    id: "desktop",
    label: "Ultra HD Desktop",
    ratio: "16:9",
    preview: `${BASE}/haunted-soccer-stadium-midnight-4k-desktop.webp`,
    download: `${BASE_4K}/haunted-soccer-stadium-midnight-4k-desktop.jpg`,
    filename: "ghost-pitch-desktop-4k.jpg",
    phase: "Phase 1 — The Midnight Kick-Off",
    phaseColor: "#e87c1e",
    seoAlt: "Haunted soccer stadium at midnight with foggy floodlights 4K desktop wallpaper",
  },
  {
    id: "striker",
    label: "Mobile Lockscreen",
    ratio: "9:16",
    preview: `${BASE}/ghost-soccer-player-striker-dark-aesthetic-iphone.webp`,
    download: `${BASE_4K}/ghost-soccer-player-striker-dark-aesthetic-iphone.jpg`,
    filename: "ghost-pitch-striker-4k.jpg",
    phase: "Phase 2 — The Spectral Striker",
    phaseColor: "#c45a0a",
    seoAlt: "Ghost soccer player with purple smoke trail dark aesthetic wallpaper for iPhone",
  },
  {
    id: "ball",
    label: "Dark Home Screen",
    ratio: "9:16",
    preview: `${BASE}/flaming-soccer-ball-demon-eyes-phone-wallpaper.webp`,
    download: `${BASE_4K}/flaming-soccer-ball-demon-eyes-phone-wallpaper.jpg`,
    filename: "ghost-pitch-ball-4k.jpg",
    phase: "Phase 2 — The Spectral Striker",
    phaseColor: "#c45a0a",
    seoAlt: "Flaming soccer ball with demon eyes dark horror sports wallpaper for mobile",
  },
  {
    id: "keeper",
    label: "Smartwatch Face",
    ratio: "1:1",
    preview: `${BASE}/creepy-goalkeeper-glowing-eyes-smartwatch-wallpaper.webp`,
    download: `${BASE_4K}/creepy-goalkeeper-glowing-eyes-smartwatch-wallpaper.jpg`,
    filename: "ghost-pitch-keeper-4k.jpg",
    phase: "Phase 3 — The Keeper's Curse",
    phaseColor: "#ff6a00",
    seoAlt: "Creepy soccer goalkeeper with glowing eyes smartwatch face for Apple Watch",
  },
  {
    id: "avatar",
    label: "Profile Picture",
    ratio: "1:1",
    preview: `${BASE}/dark-soccer-aesthetic-profile-picture-square-hd.webp`,
    download: `${BASE_4K}/dark-soccer-aesthetic-profile-picture-square-hd.jpg`,
    filename: "ghost-pitch-avatar-4k.jpg",
    phase: "Phase 3 — The Keeper's Curse",
    phaseColor: "#ff6a00",
    seoAlt: "Dark soccer aesthetic profile picture square for Discord and sports fans",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Ghost Pitch Matching Dark Soccer Wallpaper Set | PC, Phone, Watch | Haunted Wallpapers",
    description:
      "Download the Ghost Pitch matching soccer wallpaper set. 4K dark athletic backgrounds for iPhone, PC, and Smartwatch. The ultimate horror aesthetic for football fans.",
    keywords: [
      "dark soccer wallpaper",
      "horror football wallpaper",
      "ghost pitch wallpaper set",
      "matching soccer wallpaper kit",
      "haunted stadium wallpaper",
      "dark sports aesthetic",
      "soccer smartwatch wallpaper",
      "dark football desktop background",
      "horror sports wallpaper 4K",
      "soccer horror aesthetic setup",
      "ghost soccer player wallpaper",
      "dark football lockscreen",
      "haunted soccer stadium 4K",
      "football wallpaper phone and watch",
      "dark athletic wallpaper set",
    ],
    openGraph: {
      title: "The Ghost Pitch — Matching Dark Soccer Horror Kit | Haunted Wallpapers",
      description:
        "Download the Ghost Pitch matching soccer wallpaper set. 4K dark athletic backgrounds for iPhone, PC, and Smartwatch. Free 4K downloads.",
      url: `${SITE_URL}/sets/ghost-pitch`,
      siteName: "Haunted Wallpapers",
      type: "website",
      images: [
        {
          url: `${BASE}/haunted-soccer-stadium-midnight-4k-desktop.webp`,
          width: 1200,
          height: 630,
          alt: "The Ghost Pitch — Dark Soccer Horror Matching Wallpaper Set",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "The Ghost Pitch — Matching Dark Soccer Horror Kit | Haunted Wallpapers",
      description:
        "Download the Ghost Pitch matching soccer wallpaper set. Dark athletic horror for iPhone, PC, and Smartwatch.",
      images: [`${BASE}/haunted-soccer-stadium-midnight-4k-desktop.webp`],
    },
    alternates: { canonical: `${SITE_URL}/sets/ghost-pitch` },
  };
}

export const revalidate = 86400;



export default function GhostPitchPage() {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The Ghost Pitch — Matching Dark Soccer Horror Kit",
    description: "A dark soccer horror matching wallpaper set for PC, phone, and smartwatch. Five high-resolution 4K downloads.",
    url: `${SITE_URL}/sets/ghost-pitch`,
    numberOfItems: WALLPAPERS.length,
    itemListElement: WALLPAPERS.map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${w.label} — Ghost Pitch`,
      image: w.preview,
      url: w.download,
    })),
  });

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary, #0d0d14)", color: "var(--text-primary, #e0e0f8)", position: "relative", overflow: "hidden" }}>

      {/* Atmospheric noise */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", backgroundSize: "200px 200px", pointerEvents: "none", zIndex: 0, opacity: 0.4 }} />

      {/* Ember radial glow */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,124,30,0.09) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── BREADCRUMBS ── */}
        <nav aria-label="Breadcrumb" style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(28px,5vw,48px) clamp(20px,5vw,60px) 0" }}>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-space, monospace)", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            <li><Link href="/" style={{ color: "#60608a", textDecoration: "none" }}>Home</Link></li>
            <li style={{ color: "#24243a" }}>›</li>
            <li><Link href="/sets" style={{ color: "#60608a", textDecoration: "none" }}>Matching Sets</Link></li>
            <li style={{ color: "#24243a" }}>›</li>
            <li style={{ color: "#d8d8f0" }}>Ghost Pitch</li>
          </ol>
        </nav>

        {/* ── HERO ── */}
        <header style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(32px,5vw,56px) clamp(20px,5vw,60px) 0" }}>
          <div className="gp-set-badge">
            <span className="gp-set-badge__num">Set No. 03</span>
            <span className="gp-set-badge__div">—</span>
            <span className="gp-set-badge__sub">Matching Dark Soccer Setup Kit</span>
          </div>

          {/* Hero collage */}
          <div className="gp-collage" aria-label="Preview of all wallpapers in this set">
            <div className="gp-collage__desktop">
              <div className="gp-collage__device-label">Desktop · 16:9</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={WALLPAPERS[0].preview} alt="Haunted soccer stadium midnight 4K desktop background" className="gp-collage__img" loading="eager" />
              <div className="gp-collage__scanlines" aria-hidden="true" />
            </div>
            <div className="gp-collage__bottom-row">
              <div className="gp-collage__phone-wrap">
                <div className="gp-collage__device-label">Mobile · 9:16</div>
                <div className="gp-collage__phone-shell">
                  <div className="gp-collage__island" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={WALLPAPERS[1].preview} alt="Ghost soccer player striker dark aesthetic iPhone wallpaper" className="gp-collage__phone-img" loading="eager" />
                  <div className="gp-collage__gloss" aria-hidden="true" />
                  <div className="gp-collage__home-bar" aria-hidden="true" />
                </div>
              </div>
              <div className="gp-collage__watch-wrap">
                <div className="gp-collage__device-label">Watch · 1:1</div>
                <div className="gp-collage__watch-shell">
                  <div className="gp-collage__watch-crown" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={WALLPAPERS[3].preview} alt="Creepy goalkeeper glowing eyes smartwatch wallpaper for Apple Watch" className="gp-collage__watch-img" loading="eager" />
                  <div className="gp-collage__watch-gloss" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>

          {/* Title block */}
          <div style={{ marginTop: "clamp(28px,4vw,48px)" }}>
            <h1 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: "clamp(2rem, 5vw, 3.8rem)", fontWeight: 900, lineHeight: 1.0, margin: "0 0 8px", letterSpacing: "0.04em", color: "#f0e8d8", textShadow: "0 4px 40px rgba(232,124,30,0.25)" }}>
              The Ghost Pitch
            </h1>
            <p style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#e87c1e", margin: "0 0 20px" }}>
              A Matching Dark Soccer Setup Kit
            </p>
            <p style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(1rem, 1.6vw, 1.15rem)", lineHeight: 1.75, maxWidth: "700px", color: "rgba(224,224,248,0.7)", margin: 0 }}>
              Download the complete Ghost Pitch matching wallpaper set. 4K dark athletic backgrounds for iPhone, PC, and Smartwatch — the ultimate horror aesthetic for football fans who refuse to leave the field.
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
              All five wallpapers. Full 4K resolution. Every device covered.
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


        {/* ── LORE ── */}
        <section style={{ maxWidth: "1100px", margin: "clamp(48px,7vw,80px) auto 0", padding: "0 clamp(20px,5vw,60px)" }}>
          <div className="gp-lore">
            <div className="gp-lore__bar" aria-hidden="true" />
            <div className="gp-lore__content">
              <h2 className="gp-lore__title">The Game That Never Ends</h2>
              <p className="gp-lore__body">
                Legend says that deep within the abandoned stadiums of the old world, the floodlights occasionally flicker to life at 3:00 AM. There is no crowd, no referee, and no cheering. There is only the{" "}
                <span style={{ color: "#e87c1e", fontStyle: "italic" }}>"Ghost Pitch."</span>
              </p>
              <p className="gp-lore__body">
                It is a game played by those who loved the sport so much they refused to leave the field, even after death.
              </p>
            </div>
          </div>
        </section>

        {/* ── WALLPAPERS GRID ── */}
        <section style={{ maxWidth: "1100px", margin: "clamp(48px,7vw,80px) auto 0", padding: "0 clamp(20px,5vw,60px)" }}>
          <div className="gp-section-head">
            <span className="gp-section-eyebrow">What is Included in This Setup Kit</span>
            <h2 className="gp-section-title">5 Wallpapers. Every Screen Covered.</h2>
          </div>

          <div className="gp-wall-layout">

            {/* Row 1: Desktop 16:9 */}
            <div className="gp-wall-item gp-wall-item--desktop">
              <div className="gp-wall-item__frame gp-wall-item__frame--16-9">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={WALLPAPERS[0].preview} alt={WALLPAPERS[0].seoAlt} className="gp-wall-item__img" loading="eager" />
                <div className="gp-wall-item__corners" aria-hidden="true"><span /><span /><span /><span /></div>
                <span className="gp-wall-item__ratio-badge">{WALLPAPERS[0].ratio}</span>
              </div>
              <div className="gp-wall-item__footer">
                <span className="gp-wall-item__phase" style={{ color: WALLPAPERS[0].phaseColor, borderColor: `${WALLPAPERS[0].phaseColor}44` }}>{WALLPAPERS[0].phase}</span>
                <span className="gp-wall-item__label">{WALLPAPERS[0].label}</span>
              <a href="#download-kit" className="sets-dl-hint">↓ Download 4K</a></div>
            </div>

            {/* Row 2: two 9:16 + square stack */}
            <div className="gp-wall-row2">

              {/* Mobile lockscreen */}
              <div className="gp-wall-item">
                <div className="gp-wall-item__frame gp-wall-item__frame--9-16">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={WALLPAPERS[1].preview} alt={WALLPAPERS[1].seoAlt} className="gp-wall-item__img" loading="lazy" />
                  <div className="gp-wall-item__corners" aria-hidden="true"><span /><span /><span /><span /></div>
                  <span className="gp-wall-item__ratio-badge">{WALLPAPERS[1].ratio}</span>
                </div>
                <div className="gp-wall-item__footer">
                  <span className="gp-wall-item__phase" style={{ color: WALLPAPERS[1].phaseColor, borderColor: `${WALLPAPERS[1].phaseColor}44` }}>{WALLPAPERS[1].phase}</span>
                  <span className="gp-wall-item__label">{WALLPAPERS[1].label}</span>
                <a href="#download-kit" className="sets-dl-hint">↓ Download 4K</a></div>
              </div>

              {/* Ball homescreen */}
              <div className="gp-wall-item">
                <div className="gp-wall-item__frame gp-wall-item__frame--9-16">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={WALLPAPERS[2].preview} alt={WALLPAPERS[2].seoAlt} className="gp-wall-item__img" loading="lazy" />
                  <div className="gp-wall-item__corners" aria-hidden="true"><span /><span /><span /><span /></div>
                  <span className="gp-wall-item__ratio-badge">{WALLPAPERS[2].ratio}</span>
                </div>
                <div className="gp-wall-item__footer">
                  <span className="gp-wall-item__phase" style={{ color: WALLPAPERS[2].phaseColor, borderColor: `${WALLPAPERS[2].phaseColor}44` }}>{WALLPAPERS[2].phase}</span>
                  <span className="gp-wall-item__label">{WALLPAPERS[2].label}</span>
                <a href="#download-kit" className="sets-dl-hint">↓ Download 4K</a></div>
              </div>

              {/* Squares: keeper + avatar */}
              <div className="gp-wall-squares">
                <div className="gp-wall-item">
                  <div className="gp-wall-item__frame gp-wall-item__frame--1-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={WALLPAPERS[3].preview} alt={WALLPAPERS[3].seoAlt} className="gp-wall-item__img" loading="lazy" />
                    <div className="gp-wall-item__corners" aria-hidden="true"><span /><span /><span /><span /></div>
                    <span className="gp-wall-item__ratio-badge">{WALLPAPERS[3].ratio}</span>
                  </div>
                  <div className="gp-wall-item__footer">
                    <span className="gp-wall-item__phase" style={{ color: WALLPAPERS[3].phaseColor, borderColor: `${WALLPAPERS[3].phaseColor}44` }}>{WALLPAPERS[3].phase}</span>
                    <span className="gp-wall-item__label">{WALLPAPERS[3].label}</span>
                  <a href="#download-kit" className="sets-dl-hint">↓ Download 4K</a></div>
                </div>
                <div className="gp-wall-item">
                  <div className="gp-wall-item__frame gp-wall-item__frame--1-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={WALLPAPERS[4].preview} alt={WALLPAPERS[4].seoAlt} className="gp-wall-item__img" loading="lazy" />
                    <div className="gp-wall-item__corners" aria-hidden="true"><span /><span /><span /><span /></div>
                    <span className="gp-wall-item__ratio-badge">{WALLPAPERS[4].ratio}</span>
                  </div>
                  <div className="gp-wall-item__footer">
                    <span className="gp-wall-item__phase" style={{ color: WALLPAPERS[4].phaseColor, borderColor: `${WALLPAPERS[4].phaseColor}44` }}>{WALLPAPERS[4].phase}</span>
                    <span className="gp-wall-item__label">{WALLPAPERS[4].label}</span>
                  <a href="#download-kit" className="sets-dl-hint">↓ Download 4K</a></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── THREE PHASES ── */}
        <section style={{ maxWidth: "1100px", margin: "clamp(64px,8vw,96px) auto 0", padding: "0 clamp(20px,5vw,60px)" }}>
          <div className="gp-section-head">
            <span className="gp-section-eyebrow">The Haunting Arc</span>
            <h2 className="gp-section-title">Three Phases of the Pitch</h2>
          </div>
          <div className="gp-phases">
            {[
              {
                num: "01",
                title: "Phase 1: The Midnight Kick-Off",
                color: "#e87c1e",
                body: "The stadium stands empty, covered in a thick, unnatural mist. The grass is cold, and the air smells of old leather and ozone. This wide-angle set captures the vast, lonely atmosphere of the haunted stadium.",
                best: "4K Gaming PC backgrounds and minimalist desktop setups.",
              },
              {
                num: "02",
                title: "Phase 2: The Spectral Striker",
                color: "#c45a0a",
                body: "Out of the fog, a figure emerges. A player in a tattered jersey, moving with a speed no human could match. Behind them, a trail of purple smoke and embers follows the ball. This vertical set is optimized for the iPhone 15 and Pro Max and features deep blacks for OLED power-saving.",
                best: "High-action mobile lock screens.",
              },
              {
                num: "03",
                title: "Phase 3: The Keeper's Curse",
                color: "#ff6a00",
                body: "If you look too closely at the goal, you'll see them — the glowing eyes of the keeper who hasn't missed a save in a century. This square collection is engineered for the small, high-contrast screens of Apple Watch and Galaxy Watch.",
                best: "Smartwatch faces, Discord avatars, and home screen icons.",
              },
            ].map((phase) => (
              <div key={phase.num} className="gp-phase">
                <span className="gp-phase__num" style={{ color: phase.color }}>{phase.num}</span>
                <div className="gp-phase__line" style={{ background: phase.color, opacity: 0.3 }} />
                <div className="gp-phase__body">
                  <h3 className="gp-phase__title" style={{ color: phase.color }}>{phase.title}</h3>
                  <p className="gp-phase__text">{phase.body}</p>
                  <p className="gp-phase__best"><span style={{ color: "#60608a" }}>Best for: </span>{phase.best}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY MATCHING SETS ── */}
        <section style={{ maxWidth: "1100px", margin: "clamp(64px,8vw,96px) auto 0", padding: "0 clamp(20px,5vw,60px)" }}>
          <div className="gp-why">
            <h2 className="gp-why__title">Why Matching Sets Matter</h2>
            <p className="gp-why__body">
              Your digital aesthetic should be as relentless as a striker who never stops running. Whether you are checking your watch before the final whistle, glancing at your phone at half-time, or commanding your PC setup from the dugout, the Ghost Pitch follows you. This collection is built for football fans who live in the dark hours — for anyone who believes the beautiful game never truly ends.
            </p>
            <p className="gp-why__body">
              Season after season, the lights flicker on at 3 AM. Let your screens remind everyone — and yourself — that the pitch is always calling.
            </p>
            <div className="gp-why__tags">
              {["dark sports aesthetic", "horror football", "ghost pitch", "dark soccer wallpaper", "haunted stadium", "football horror", "dark athletic setup"].map((t) => (
                <span key={t} className="gp-why__tag">#{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── DOWNLOAD CTA ── */}
        <section id="download-kit" style={{ maxWidth: "1100px", margin: "clamp(48px,7vw,80px) auto clamp(64px,10vw,120px)", padding: "0 clamp(20px,5vw,60px)" }}>
          <div className="gp-cta-block">
            <div className="gp-cta-block__glow" aria-hidden="true" />
            <span className="gp-cta-block__eyebrow">Free. No account. No watermarks.</span>
            <h2 className="gp-cta-block__title">Download the Complete Kit</h2>
            <p className="gp-cta-block__sub">All five wallpapers. Full 4K resolution. Every device covered.</p>
            <div className="gp-cta-block__btns">
              {WALLPAPERS.map((w) => (
                <a key={w.id} href={w.download} download={w.filename} className="gp-cta-btn">
                  {w.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── EXPLORE MORE ── */}
        <section style={{ maxWidth: "1100px", margin: "clamp(48px,7vw,80px) auto 0", padding: "0 clamp(20px,5vw,60px)" }}>
          <div className="gp-section-head">
            <span className="gp-section-eyebrow">Keep Exploring</span>
            <h2 className="gp-section-title">Explore More Matching Sets</h2>
          </div>
          <div className="gp-explore-grid">
            <Link href="/sets/haunted-anime-student" className="gp-explore-card gp-explore-card--link">
              <div className="gp-explore-card__thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Cursed%20Student%3A%20A%20Matching%20Dark%20Anime%20Horror%20Kit/cursed-student-dark-anime-4k-desktop-background.webp" alt="The Cursed Student matching dark anime horror wallpaper set" className="gp-explore-card__img" loading="lazy" />
                <span className="gp-explore-card__badge">Set No. 01</span>
              </div>
              <div className="gp-explore-card__body">
                <h3 className="gp-explore-card__title">The Cursed Student</h3>
                <p className="gp-explore-card__desc">Psychological horror anime aesthetic. Three phases of possession across every screen.</p>
                <span className="gp-explore-card__cta">View Set →</span>
              </div>
            </Link>
            <Link href="/sets/whispering-woods" className="gp-explore-card gp-explore-card--link">
              <div className="gp-explore-card__thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Whispering%20Woods%3A%20A%20Matching%20Dark%20Nature%20Setup%20Kit/whispering-woods-foggy-horror-forest-4k-deskto.webp" alt="The Whispering Woods matching dark nature horror wallpaper set" className="gp-explore-card__img" loading="lazy" />
                <span className="gp-explore-card__badge">Set No. 02</span>
              </div>
              <div className="gp-explore-card__body">
                <h3 className="gp-explore-card__title">The Whispering Woods</h3>
                <p className="gp-explore-card__desc">Dark nature horror. The forest watches. Five 4K wallpapers for every device.</p>
                <span className="gp-explore-card__cta">View Set →</span>
              </div>
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        /* ── EMBER THEME OVERRIDES ── */
        .gp-wall-item__frame { position: relative; overflow: hidden; border: 1px solid rgba(232,124,30,0.2); background: #080810; transition: border-color 0.3s ease, box-shadow 0.3s ease; cursor: pointer; }
        .gp-wall-item__frame:hover { border-color: rgba(232,124,30,0.55); box-shadow: 0 0 32px rgba(232,124,30,0.12); }
        .gp-wall-item__frame--16-9 { aspect-ratio: 16 / 9; width: 100%; }
        .gp-wall-item__frame--9-16 { aspect-ratio: 9 / 16; width: 100%; }
        .gp-wall-item__frame--1-1  { aspect-ratio: 1 / 1;  width: 100%; }
        .gp-wall-item__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
        .gp-wall-item__frame:hover .gp-wall-item__img { transform: scale(1.03); }
        .gp-wall-item__corners { position: absolute; inset: 0; pointer-events: none; }
        .gp-wall-item__corners span { position: absolute; width: 12px; height: 12px; border-color: rgba(232,124,30,0.55); border-style: solid; }
        .gp-wall-item__corners span:nth-child(1) { top: 6px; left: 6px; border-width: 1.5px 0 0 1.5px; }
        .gp-wall-item__corners span:nth-child(2) { top: 6px; right: 6px; border-width: 1.5px 1.5px 0 0; }
        .gp-wall-item__corners span:nth-child(3) { bottom: 6px; left: 6px; border-width: 0 0 1.5px 1.5px; }
        .gp-wall-item__corners span:nth-child(4) { bottom: 6px; right: 6px; border-width: 0 1.5px 1.5px 0; }
        .gp-wall-item__ratio-badge { position: absolute; bottom: 7px; right: 8px; font-family: var(--font-space, monospace); font-size: 0.48rem; letter-spacing: 0.14em; color: rgba(255,255,255,0.5); background: rgba(0,0,0,0.65); padding: 2px 6px; border-radius: 2px; pointer-events: none; }
        .gp-wall-item__overlay { position: absolute; inset: 0; display: flex; align-items: flex-start; justify-content: flex-end; padding: 10px; opacity: 0; transition: opacity 0.2s ease; pointer-events: none; }
        .gp-wall-item__frame:hover .gp-wall-item__overlay { opacity: 1; pointer-events: auto; }
        .gp-wall-item { display: flex; flex-direction: column; gap: 8px; }
        .gp-wall-item__footer { display: flex; flex-direction: column; gap: 3px; padding: 0 2px; }
        .gp-wall-item__phase { font-family: var(--font-space, monospace); font-size: 0.46rem; letter-spacing: 0.18em; text-transform: uppercase; border: 1px solid; padding: 2px 7px; display: inline-block; width: fit-content; background: rgba(0,0,0,0.2); }
        .gp-wall-item__label { font-family: var(--font-cinzel, serif); font-size: clamp(0.7rem, 1.1vw, 0.85rem); color: #e8ddd0; letter-spacing: 0.03em; }
        .gp-wall-layout { display: flex; flex-direction: column; gap: 12px; }
        .gp-wall-row2 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; align-items: start; }
        .gp-wall-squares { display: flex; flex-direction: column; gap: 12px; }
        .gp-pin-btn:hover { background: #c0001b; transform: translateY(-1px); }

        /* Collage */
        .gp-collage { display: flex; flex-direction: column; gap: 12px; margin-top: clamp(24px,4vw,40px); }
        .gp-collage__desktop { position: relative; border-radius: 4px; overflow: hidden; border: 2px solid #0f0f1e; box-shadow: 0 0 0 4px #0a0a14, 0 0 0 6px rgba(20,20,10,0.9), 0 0 80px rgba(0,0,0,0.7); animation: gp-glow-desk 4s ease-in-out infinite; aspect-ratio: 16/9; background: #080810; width: 100%; }
        @keyframes gp-glow-desk { 0%,100% { box-shadow: 0 0 0 4px #0a0a14, 0 0 0 6px rgba(20,20,10,0.9), 0 0 80px rgba(0,0,0,0.7); } 50% { box-shadow: 0 0 0 4px #0a0a14, 0 0 0 6px rgba(20,20,10,0.9), 0 0 80px rgba(0,0,0,0.7), 0 0 100px rgba(40,20,0,0.25); } }
        .gp-collage__bottom-row { display: flex; gap: 12px; align-items: flex-start; }
        .gp-collage__device-label { position: relative; top: auto; left: auto; display: block; margin-bottom: 8px; background: none; padding: 0; font-family: var(--font-space, monospace); font-size: 0.52rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.45); }
        .gp-collage__desktop .gp-collage__device-label { position: absolute; top: 10px; left: 12px; background: rgba(0,0,0,0.65); padding: 3px 8px; border-radius: 2px; z-index: 2; margin-bottom: 0; }
        .gp-collage__img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .gp-collage__scanlines { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px); pointer-events: none; }
        .gp-collage__phone-wrap { position: relative; width: clamp(90px, 15%, 160px); flex-shrink: 0; }
        .gp-collage__phone-shell { position: relative; width: 100%; aspect-ratio: 9/16; border-radius: 28px; overflow: hidden; border: 2px solid #0f0f1e; background: #080810; animation: gp-glow-phone 4s ease-in-out infinite 1s; box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,10,0.9), 0 12px 48px rgba(0,0,0,0.8); }
        @keyframes gp-glow-phone { 0%,100% { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,10,0.9), 0 12px 48px rgba(0,0,0,0.8); } 50% { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,10,0.9), 0 12px 48px rgba(0,0,0,0.8), 0 0 50px rgba(40,20,0,0.2); } }
        .gp-collage__island { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); width: 35%; height: 10px; background: #000; border-radius: 6px; z-index: 3; }
        .gp-collage__phone-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .gp-collage__gloss { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 40%); pointer-events: none; }
        .gp-collage__home-bar { position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); width: 33%; height: 3px; background: rgba(255,255,255,0.22); border-radius: 2px; }
        .gp-collage__watch-wrap { width: clamp(72px, 11%, 124px); flex-shrink: 0; position: relative; align-self: flex-end; }
        .gp-collage__watch-shell { position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 32% / 28%; overflow: hidden; border: 2px solid #0f0f1e; background: #080810; animation: gp-glow-watch 4s ease-in-out infinite 2s; box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,10,0.9), 0 8px 32px rgba(0,0,0,0.75); }
        @keyframes gp-glow-watch { 0%,100% { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,10,0.9), 0 8px 32px rgba(0,0,0,0.75); } 50% { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,10,0.9), 0 8px 32px rgba(0,0,0,0.75), 0 0 40px rgba(40,20,0,0.2); } }
        .gp-collage__watch-crown { position: absolute; right: -6px; top: 42%; width: 6px; height: 18px; background: #181818; border-radius: 0 3px 3px 0; }
        .gp-collage__watch-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .gp-collage__watch-gloss { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 45%); pointer-events: none; }
        @media (max-width: 480px) { .gp-collage__watch-wrap { display: none; } .gp-collage__phone-wrap { width: clamp(80px, 20%, 130px); } }

        /* Lore */
        .gp-lore { display: grid; grid-template-columns: 3px 1fr; gap: 28px; background: rgba(255,255,255,0.02); border: 1px solid rgba(232,124,30,0.15); padding: clamp(24px,4vw,40px); position: relative; overflow: hidden; }
        .gp-lore::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 0% 50%, rgba(60,30,0,0.07), transparent); pointer-events: none; }
        .gp-lore__bar { background: linear-gradient(to bottom, transparent, #e87c1e, transparent); border-radius: 2px; flex-shrink: 0; }
        .gp-lore__title { font-family: var(--font-cinzel, serif); font-size: clamp(1.1rem,2vw,1.5rem); font-weight: 700; color: #f0e8d8; margin: 0 0 16px; letter-spacing: 0.04em; }
        .gp-lore__body { font-family: var(--font-cormorant, serif); font-size: clamp(1rem,1.5vw,1.1rem); line-height: 1.8; color: rgba(224,224,248,0.65); margin: 0 0 12px; }
        .gp-lore__body:last-child { margin-bottom: 0; }

        /* Section head */
        .gp-section-head { margin-bottom: clamp(28px,4vw,48px); }
        .gp-section-eyebrow { display: block; font-family: var(--font-space, monospace); font-size: 0.56rem; letter-spacing: 0.26em; text-transform: uppercase; color: #e87c1e; margin-bottom: 10px; }
        .gp-section-title { font-family: var(--font-cinzel, serif); font-size: clamp(1.4rem,3vw,2.2rem); font-weight: 700; color: #f0e8d8; margin: 0; letter-spacing: 0.04em; }

        /* Phases */
        .gp-phases { display: flex; flex-direction: column; gap: 32px; }
        .gp-phase { display: grid; grid-template-columns: 40px 2px 1fr; gap: 20px; align-items: start; }
        .gp-phase__num { font-family: var(--font-cinzel, serif); font-size: 1rem; font-weight: 900; letter-spacing: 0.1em; line-height: 1; padding-top: 2px; }
        .gp-phase__line { width: 2px; min-height: 100%; border-radius: 1px; }
        .gp-phase__title { font-family: var(--font-cinzel, serif); font-size: clamp(0.95rem,1.6vw,1.15rem); font-weight: 700; margin: 0 0 12px; letter-spacing: 0.04em; }
        .gp-phase__text { font-family: var(--font-cormorant, serif); font-size: clamp(0.95rem,1.4vw,1.05rem); line-height: 1.8; color: rgba(224,224,248,0.62); margin: 0 0 10px; }
        .gp-phase__best { font-family: var(--font-space, monospace); font-size: 0.56rem; letter-spacing: 0.12em; color: rgba(224,224,248,0.5); margin: 0; }

        /* Why */
        .gp-why { border: 1px solid rgba(232,124,30,0.15); padding: clamp(28px,4vw,48px); position: relative; overflow: hidden; }
        .gp-why::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 100% 50%, rgba(60,30,0,0.06), transparent); pointer-events: none; }
        .gp-why__title { font-family: var(--font-cinzel, serif); font-size: clamp(1.2rem,2.5vw,1.8rem); font-weight: 700; color: #f0e8d8; margin: 0 0 20px; letter-spacing: 0.04em; }
        .gp-why__body { font-family: var(--font-cormorant, serif); font-size: clamp(0.98rem,1.5vw,1.08rem); line-height: 1.8; color: rgba(224,224,248,0.65); margin: 0 0 16px; max-width: 720px; }
        .gp-why__body:last-of-type { margin-bottom: 24px; }
        .gp-why__tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .gp-why__tag { font-family: var(--font-space, monospace); font-size: 0.56rem; letter-spacing: 0.12em; color: rgba(232,124,30,0.7); }

        /* CTA — ember */
        .gp-cta-block { position: relative; border: 1px solid rgba(232,124,30,0.35); padding: clamp(32px,5vw,56px); text-align: center; overflow: hidden; }
        .gp-cta-block__glow { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(232,124,30,0.08), transparent); pointer-events: none; }
        .gp-cta-block__eyebrow { display: block; font-family: var(--font-space, monospace); font-size: 0.56rem; letter-spacing: 0.24em; text-transform: uppercase; color: #60608a; margin-bottom: 14px; position: relative; }
        .gp-cta-block__title { font-family: var(--font-cinzel, serif); font-size: clamp(1.4rem,3vw,2.2rem); font-weight: 700; color: #f0e8d8; margin: 0 0 10px; position: relative; }
        .gp-cta-block__sub { font-family: var(--font-cormorant, serif); font-size: 1rem; color: rgba(224,224,248,0.55); margin: 0 0 28px; position: relative; }
        .gp-cta-block__btns { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; position: relative; }
        .gp-cta-btn { display: inline-flex; align-items: center; padding: 12px 22px; background: transparent; color: rgba(224,224,248,0.8); border: 1px solid rgba(232,124,30,0.35); border-radius: 2px; font-family: var(--font-space, monospace); font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; transition: all 0.25s ease; cursor: pointer; }
        .gp-cta-btn:hover { border-color: rgba(232,124,30,0.75); color: #fff; background: rgba(232,124,30,0.1); box-shadow: 0 0 20px rgba(232,124,30,0.2); }

        /* Explore */
        .gp-explore-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: clamp(16px,2.5vw,24px); }
        .gp-explore-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(232,124,30,0.12); overflow: hidden; transition: border-color 0.3s, box-shadow 0.3s; text-decoration: none; display: block; color: inherit; }
        .gp-explore-card--link:hover { border-color: rgba(232,124,30,0.35); box-shadow: 0 0 30px rgba(60,30,0,0.08); }
        .gp-explore-card__thumb { position: relative; aspect-ratio: 16/9; overflow: hidden; background: #08060e; }
        .gp-explore-card__img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
        .gp-explore-card--link:hover .gp-explore-card__img { transform: scale(1.03); }
        .gp-explore-card__badge { position: absolute; top: 8px; left: 10px; font-family: var(--font-space, monospace); font-size: 0.48rem; letter-spacing: 0.18em; text-transform: uppercase; color: #f0e8d8; background: rgba(0,0,0,0.75); border: 1px solid rgba(232,124,30,0.35); padding: 2px 7px; border-radius: 2px; }
        .gp-explore-card__body { padding: clamp(14px,2vw,20px); }
        .gp-explore-card__title { font-family: var(--font-cinzel, serif); font-size: 0.95rem; font-weight: 700; color: #f0e8d8; margin: 0 0 8px; letter-spacing: 0.04em; }
        .gp-explore-card__desc { font-family: var(--font-cormorant, serif); font-size: 0.9rem; line-height: 1.65; color: rgba(224,224,248,0.5); margin: 0 0 10px; }
        .gp-explore-card__cta { font-family: var(--font-space, monospace); font-size: 0.56rem; letter-spacing: 0.16em; text-transform: uppercase; color: #e87c1e; }

        /* Set badge */
        .gp-set-badge { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .gp-set-badge__num { font-family: var(--font-space, monospace); font-size: clamp(0.75rem, 1.5vw, 0.9rem); letter-spacing: 0.28em; text-transform: uppercase; color: #e87c1e; background: rgba(232,124,30,0.08); border: 1px solid rgba(232,124,30,0.35); padding: 6px 16px; border-radius: 2px; font-weight: 700; }
        .gp-set-badge__div { color: rgba(232,124,30,0.4); font-size: 1.2rem; }
        .gp-set-badge__sub { font-family: var(--font-cinzel, serif); font-size: clamp(0.9rem, 2vw, 1.2rem); letter-spacing: 0.12em; text-transform: uppercase; color: #f0e8d8; font-weight: 700; }

        /* Responsive */
        @media (max-width: 700px) {
          .gp-wall-row2 { grid-template-columns: 1fr 1fr; }
          .gp-wall-squares { grid-column: 1 / -1; flex-direction: row; gap: 12px; }
          .gp-wall-squares .gp-wall-item { flex: 1; }
        }
        @media (max-width: 440px) {
          .gp-wall-row2 { grid-template-columns: 1fr; }
          .gp-wall-squares { flex-direction: row; }
        }
        @media (max-width: 500px) {
          .gp-set-badge { flex-direction: column; align-items: flex-start; gap: 8px; }
          .gp-phase { grid-template-columns: 32px 2px 1fr; gap: 12px; }
        }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </main>
  );
}