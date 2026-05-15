// app/sets/haunted-anime-student/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

const BASE =
  "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Cursed%20Student%3A%20A%20Matching%20Dark%20Anime%20Horror%20Kit";
const BASE_4K = `${BASE}/4k`;

const WALLPAPERS = [
  {
    id: "desktop",
    label: "Ultra HD Desktop",
    ratio: "16:9",
    ratioClass: "ratio-16-9",
    description:
      "Negative space flanks the figure so desktop icons never obscure the face. The classroom void bleeds to the edges — full atmospheric immersion at any resolution.",
    preview: `${BASE}/cursed-student-dark-anime-4k-desktop-background.webp`,
    download: `${BASE_4K}/cursed-student-dark-anime-4k-desktop-background.jpg`,
    filename: "cursed-student-desktop-4k.jpg",
    phase: "Phase 1 — The Hollow Stare",
    phaseColor: "#8888aa",
    best: "Clean minimal desktop setups",
    seoAlt: "Dark anime cursed student 4K desktop wallpaper for gaming PC background haunted school aesthetic",
  },
  {
    id: "mobile",
    label: "Vertical Mobile Lockscreen",
    ratio: "9:16",
    ratioClass: "ratio-9-16",
    description:
      "Portrait-optimised crop that pushes the face to the upper third — every time you wake your phone, the Hollow Student is waiting. High-detail eyes pop on AMOLED and Super Retina XDR alike.",
    preview: `${BASE}/cursed-student-dark-anime-horror-wallpaper-mobile.webp`,
    download: `${BASE_4K}/cursed-student-dark-anime-horror-wallpaper-mobile.jpg`,
    filename: "cursed-student-mobile-4k.jpg",
    phase: "Phase 2 — The Crimson Awakening",
    phaseColor: "#c0001a",
    best: "iPhone lockscreen, Android lockscreen, AMOLED",
    seoAlt: "Haunted anime boy with hollow grey eyes aesthetic phone wallpaper for iPhone and Android 4K",
  },
  {
    id: "avatar",
    label: "Profile Picture",
    ratio: "1:1",
    ratioClass: "ratio-1-1",
    description:
      "A tight square crop centred on the hollow gaze. Works as a profile picture across any platform — Discord, Twitter, Instagram — without losing the character's menace.",
    preview: `${BASE}/dark-horror-anime-boy-profile-picture-square.webp`,
    download: `${BASE_4K}/dark-horror-anime-boy-profile-picture-square.jpg`,
    filename: "cursed-student-avatar-4k.jpg",
    phase: "Phase 1 — The Hollow Stare",
    phaseColor: "#8888aa",
    best: "Profile picture, Discord, home screen icon",
    seoAlt: "Gothic anime boy horror aesthetic square PFP for Discord and social media haunted wallpaper collection",
  },
  {
    id: "smartwatch",
    label: "Smartwatch Face",
    ratio: "1:1",
    ratioClass: "ratio-1-1",
    description:
      "A high-contrast square engineered for the small canvas of Apple Watch and Galaxy Watch faces. The blood-red pupils glow against the obsidian background — visible even at a glance.",
    preview: `${BASE}/haunted-anime-boy-red-eyes-smartwatch-wallpaper.webp`,
    download: `${BASE_4K}/haunted-anime-boy-red-eyes-smartwatch-wallpaper.jpg`,
    filename: "cursed-student-smartwatch-4k.jpg",
    phase: "Phase 2 — The Crimson Awakening",
    phaseColor: "#c0001a",
    best: "Apple Watch, Galaxy Watch, OLED watch faces",
    seoAlt: "Creepy anime boy glowing red eyes smartwatch wallpaper and 4K horror aesthetic profile picture",
  },
  {
    id: "homescreen",
    label: "Dark Home Screen",
    ratio: "9:16",
    ratioClass: "ratio-9-16",
    description:
      "The final phase — demonic rage, sharpened teeth, total possession. Designed for home screen use where the beast is always visible behind your apps. Maximum psychological impact.",
    preview: `${BASE}/scary-anime-demon-boy-teeth-iphone-wallpaper.webp`,
    download: `${BASE_4K}/scary-anime-demon-boy-teeth-iphone-wallpaper.jpg`,
    filename: "cursed-student-homescreen-4k.jpg",
    phase: "Phase 3 — The Breaking Point",
    phaseColor: "#ff2200",
    best: "iPhone home screen, gaming setup, dark mode",
    seoAlt: "Scary horror anime demon boy with sharp teeth iPhone lock screen wallpaper 4K dark aesthetic",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:
      "Cursed Student Matching Dark Anime Wallpaper Set | PC, Phone, Watch | Haunted Wallpapers",
    description:
      "Download the Cursed Student matching wallpaper set. A psychological horror anime aesthetic for PC, phone, and smartwatch. High-resolution 4K dark anime backgrounds with a terrifying transformation story.",
    keywords: [
      "cursed student wallpaper",
      "dark anime wallpaper set",
      "matching wallpaper kit",
      "psychological horror anime",
      "dark academia wallpaper",
      "anime horror wallpaper 4K",
      "smartwatch dark wallpaper",
      "dark shonen manga aesthetic",
      "gothic anime wallpaper",
      "horror aesthetic setup",
      "anime desktop background",
      "dark anime lockscreen",
      "cursed student dark academia",
      "anime wallpaper phone and watch",
      "4K dark anime background",
    ],
    openGraph: {
      title: "Cursed Student — Matching Dark Anime Horror Kit | Haunted Wallpapers",
      description:
        "Download the Cursed Student matching wallpaper set. Psychological horror anime aesthetic for PC, phone, and smartwatch. Free 4K downloads.",
      url: `${SITE_URL}/sets/haunted-anime-student`,
      siteName: "Haunted Wallpapers",
      type: "website",
      images: [
        {
          url: `${BASE}/cursed-student-dark-anime-4k-desktop-background.webp`,
          width: 1200,
          height: 630,
          alt: "Cursed Student — Dark Anime Horror Matching Wallpaper Set",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Cursed Student — Matching Dark Anime Horror Kit | Haunted Wallpapers",
      description:
        "Download the Cursed Student matching wallpaper set. Psychological horror anime aesthetic for PC, phone, and smartwatch.",
      images: [`${BASE}/cursed-student-dark-anime-4k-desktop-background.webp`],
    },
    alternates: { canonical: `${SITE_URL}/sets/haunted-anime-student` },
  };
}

export const revalidate = 86400;

export default function CursedStudentPage() {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cursed Student — Matching Dark Anime Horror Kit",
    description:
      "A psychological horror anime matching wallpaper set for PC, phone, and smartwatch. Five high-resolution 4K downloads.",
    url: `${SITE_URL}/sets/haunted-anime-student`,
    numberOfItems: WALLPAPERS.length,
    itemListElement: WALLPAPERS.map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${w.label} — Cursed Student`,
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

      {/* Red radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(192,0,26,0.08) 0%, transparent 65%)",
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
              <Link href="/" style={{ color: "#60608a", textDecoration: "none" }}>
                Home
              </Link>
            </li>
            <li style={{ color: "#24243a" }}>›</li>
            <li>
              <Link href="/sets" style={{ color: "#60608a", textDecoration: "none" }}>
                Matching Sets
              </Link>
            </li>
            <li style={{ color: "#24243a" }}>›</li>
            <li style={{ color: "#d8d8f0" }}>Cursed Student</li>
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
            <span className="cs-set-badge__num">Set No. 01</span>
            <span className="cs-set-badge__div">—</span>
            <span className="cs-set-badge__sub">Matching Dark Anime Horror Kit</span>
          </div>

          {/* Collage thumbnail */}
          <div className="cs-collage" aria-label="Preview of all wallpapers in this set">
            {/* Desktop — 16:9 */}
            <div className="cs-collage__desktop">
              <div className="cs-collage__device-label">Desktop 16:9</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={WALLPAPERS[0].preview}
                alt="Cursed Student dark anime 4K desktop background"
                className="cs-collage__img"
                loading="eager"
              />
              <div className="cs-collage__scanlines" aria-hidden="true" />
            </div>

            {/* Phone column */}
            <div className="cs-collage__phones">
              <div className="cs-collage__phone-wrap">
                <div className="cs-collage__device-label">Mobile 9:16</div>
                <div className="cs-collage__phone-shell">
                  <div className="cs-collage__island" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={WALLPAPERS[1].preview}
                    alt="Cursed Student dark anime mobile lockscreen wallpaper"
                    className="cs-collage__phone-img"
                    loading="eager"
                  />
                  <div className="cs-collage__gloss" aria-hidden="true" />
                  <div className="cs-collage__home-bar" aria-hidden="true" />
                </div>
              </div>

              {/* Watch */}
              <div className="cs-collage__watch-wrap">
                <div className="cs-collage__device-label">Watch 1:1</div>
                <div className="cs-collage__watch-shell">
                  <div className="cs-collage__watch-crown" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={WALLPAPERS[3].preview}
                    alt="Haunted anime boy red eyes smartwatch wallpaper"
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
                textShadow: "0 4px 40px rgba(192,0,26,0.2)",
              }}
            >
              The Cursed Student: A Matching Dark Anime Horror Kit
            </h1>
            <p
              style={{
                fontFamily: "var(--font-space, monospace)",
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#c0001a",
                margin: "0 0 20px",
              }}
            >
              A Matching Dark Anime Horror Kit
            </p>

            {/* Meta description */}
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
              Download the complete Cursed Student matching wallpaper set. A psychological horror
              anime aesthetic crafted for PC, phone, and smartwatch — high-resolution 4K dark anime
              backgrounds that tell a terrifying transformation story across every screen you own.
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
              <h2 className="cs-lore__title">The Midnight Classroom</h2>
              <p className="cs-lore__body">
                Every school has its legends, but at St. Jude Academy, the legend has a face. They
                call him the{" "}
                <span style={{ color: "#c0001a", fontStyle: "italic" }}>"Hollow Student."</span>
              </p>
              <p className="cs-lore__body">
                He does not appear in the hallways or the cafeteria. He only manifests at exactly
                12:00 AM in the back row of Classroom 404. It is said that he was a brilliant
                student who became so obsessed with his studies that he forgot to eat, sleep, or
                even breathe. Now he is a permanent shadow, trapped in a loop of silent
                observation.
              </p>
            </div>
          </div>
        </section>

        {/* ── WALLPAPERS ── */}
        <section
          style={{
            maxWidth: "1100px",
            margin: "clamp(48px,7vw,80px) auto 0",
            padding: "0 clamp(20px,5vw,60px)",
          }}
        >
          <div className="cs-section-head">
            <span className="cs-section-eyebrow">What is Included in This Setup Kit</span>
            <h2 className="cs-section-title">5 Wallpapers. Every Screen Covered.</h2>
          </div>

          <div className="cs-grid">
            {WALLPAPERS.map((w, i) => (
              <article key={w.id} className="cs-card">
                {/* Phase badge */}
                <span
                  className="cs-card__phase"
                  style={{ color: w.phaseColor, borderColor: `${w.phaseColor}44` }}
                >
                  {w.phase}
                </span>

                {/* Image */}
                <div className={`cs-card__frame ${w.ratioClass}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={w.preview}
                    alt={w.seoAlt}
                    className="cs-card__img"
                    loading={i < 2 ? "eager" : "lazy"}
                  />
                  <div className="cs-card__corners" aria-hidden="true">
                    <span /><span /><span /><span />
                  </div>
                  <span className="cs-card__ratio-badge">{w.ratio}</span>
                </div>

                {/* Info */}
                <div className="cs-card__body">
                  <h3 className="cs-card__label">{w.label}</h3>
                  <p className="cs-card__desc">{w.description}</p>
                  <p className="cs-card__best">
                    <span style={{ color: "#60608a" }}>Best for: </span>
                    {w.best}
                  </p>

                  {/* Pinterest Pin button */}
                  <a
                    href={`https://pinterest.com/pin/create/button/?url=https://hauntedwallpapers.com/sets/haunted-anime-student&media=${encodeURIComponent(w.preview)}&description=${encodeURIComponent(w.seoAlt)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cs-pin-btn"
                    aria-label="Pin to Pinterest"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
                    Save
                  </a>
                  <a
                    href={w.download}
                    download={w.filename}
                    className="cs-btn cs-btn--full"
                  >
                    ↓ Download 4K Free
                  </a>
                </div>
              </article>
            ))}
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
            <span className="cs-section-eyebrow">The Possession Arc</span>
            <h2 className="cs-section-title">Three Phases of the Curse</h2>
          </div>

          <div className="cs-phases">
            {[
              {
                num: "01",
                title: "Phase 1: The Hollow Stare",
                color: "#8888aa",
                body: "In his first form he is almost human. His eyes are empty, reflecting the void of a soul long forgotten. This version represents the Quiet Horror — the feeling that you are being watched by something that is not quite there.",
                best: "Clean, minimal desktop setups and phone lock screens.",
              },
              {
                num: "02",
                title: "Phase 2: The Crimson Awakening",
                color: "#c0001a",
                body: "Stare into his eyes long enough and the Hollow begins to fill. A deep blood-red glow ignites within his pupils — the moment the curse activates. The air grows cold. The silence is replaced by a low, vibrating hum. He is no longer just a memory; he is a hunter.",
                best: "Smartwatch faces and high-contrast OLED phone screens.",
              },
              {
                num: "03",
                title: "Phase 3: The Breaking Point",
                color: "#ff2200",
                body: "The final stage of the curse is the Possession. The student's humanity vanishes completely. His face contorts with a primal, demonic rage — rows of sharpened teeth that were never meant for a human mouth. This is the last thing his victims see before the lights in Classroom 404 go out forever.",
                best: "Aggressive gaming setups and dark mode enthusiasts.",
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
            <h2 className="cs-why__title">Why Matching Sets Matter</h2>
            <p className="cs-why__body">
              Your digital aesthetic should be consistent. Whether you are checking your watch for
              the time, answering a text, or working at your desk, the Cursed Student follows you.
              This collection is designed for fans of Psychological Horror, Dark Shonen Manga, and
              the Gothic Anime aesthetic — for anyone who believes that every glance at a screen
              should feel intentional.
            </p>
            <p className="cs-why__body">
              Academia season brings pressure. Let your screens remind everyone — and yourself —
              that you are not afraid of what lives in Classroom 404.
            </p>

            <div className="cs-why__tags">
              {[
                "dark academia",
                "psychological horror",
                "gothic anime",
                "dark shonen manga",
                "horror aesthetic",
                "academia season",
                "dark aesthetic setup",
              ].map((t) => (
                <span key={t} className="cs-why__tag">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── DOWNLOAD ALL CTA ── */}
        <section
          style={{
            maxWidth: "1100px",
            margin: "clamp(48px,7vw,80px) auto clamp(64px,10vw,120px)",
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

        {/* ── EXPLORE MORE ── */}
        <section style={{ maxWidth: "1100px", margin: "clamp(48px,7vw,80px) auto 0", padding: "0 clamp(20px,5vw,60px)" }}>
          <div className="cs-section-head">
            <span className="cs-section-eyebrow">Keep Exploring</span>
            <h2 className="cs-section-title">Explore More Matching Sets</h2>
          </div>
          <div className="cs-explore-grid">
            {[
              { title: "Dark Forest", desc: "Coming Soon — Primeval horror for the nature-obsessed.", emoji: "🌲" },
              { title: "Goth Witch", desc: "Coming Soon — A moonlit coven aesthetic across every screen.", emoji: "🕯️" },
              { title: "Void Entity", desc: "Coming Soon — Cosmic horror. The darkness between the stars.", emoji: "🌌" },
            ].map((set, i) => (
              <div key={i} className="cs-explore-card">
                <div className="cs-explore-card__thumb">
                  <span className="cs-explore-card__emoji">{set.emoji}</span>
                  <div className="cs-explore-card__coming">Coming Soon</div>
                </div>
                <div className="cs-explore-card__body">
                  <h3 className="cs-explore-card__title">{set.title}</h3>
                  <p className="cs-explore-card__desc">{set.desc}</p>
                </div>
              </div>
            ))}
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
        /* ── Eyebrow ── */
        .cs-eyebrow {
          display: block;
          font-family: var(--font-space, monospace);
          font-size: 0.58rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #c0001a;
          margin-bottom: 20px;
        }

        /* ── COLLAGE ── */
        .cs-collage {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
          margin-top: clamp(24px,4vw,40px);
          align-items: start;
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
        }
        @keyframes cs-glow-desk {
          0%,100% { box-shadow: 0 0 0 4px #0a0a14, 0 0 0 6px rgba(20,20,40,0.9), 0 0 80px rgba(0,0,0,0.7); }
          50%      { box-shadow: 0 0 0 4px #0a0a14, 0 0 0 6px rgba(20,20,40,0.9), 0 0 80px rgba(0,0,0,0.7), 0 0 100px rgba(10,0,40,0.2); }
        }
        .cs-collage__device-label {
          position: absolute;
          top: 10px;
          left: 12px;
          font-family: var(--font-space, monospace);
          font-size: 0.52rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          background: rgba(0,0,0,0.65);
          padding: 3px 8px;
          border-radius: 2px;
          z-index: 2;
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
        .cs-collage__phones {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }
        .cs-collage__phone-wrap {
          position: relative;
          width: 100%;
          max-width: 220px;
        }
        .cs-collage__phone-wrap .cs-collage__device-label {
          position: relative;
          top: auto; left: auto;
          display: block;
          margin-bottom: 8px;
          background: none;
          padding: 0;
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
          50%      { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 12px 48px rgba(0,0,0,0.8), 0 0 50px rgba(10,0,40,0.2); }
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
          width: 100%;
          max-width: 160px;
          position: relative;
        }
        .cs-collage__watch-wrap .cs-collage__device-label {
          position: relative;
          top: auto; left: auto;
          display: block;
          margin-bottom: 8px;
          background: none;
          padding: 0;
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
          50%      { box-shadow: 0 0 0 3px #0a0a14, 0 0 0 5px rgba(20,20,40,0.9), 0 8px 32px rgba(0,0,0,0.75), 0 0 40px rgba(10,0,40,0.18); }
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

        @media (max-width: 700px) {
          .cs-collage {
            grid-template-columns: 1fr;
          }
          .cs-collage__phones {
            flex-direction: row;
            justify-content: center;
            align-items: flex-start;
          }
          .cs-collage__phone-wrap { max-width: 48%; }
          .cs-collage__watch-wrap { max-width: 40%; }
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
          background: radial-gradient(ellipse 60% 80% at 0% 50%, rgba(192,0,26,0.04), transparent);
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

        /* ── Cards grid ── */
        .cs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: clamp(20px,3vw,32px);
        }

        /* ── Card ── */
        .cs-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(192,0,26,0.15);
          padding: clamp(16px,2.5vw,24px);
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .cs-card:hover {
          border-color: rgba(192,0,26,0.4);
          box-shadow: 0 0 40px rgba(192,0,26,0.06);
        }
        .cs-card__phase {
          font-family: var(--font-space, monospace);
          font-size: 0.52rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          border: 1px solid;
          padding: 4px 10px;
          display: inline-block;
          width: fit-content;
          background: rgba(0,0,0,0.3);
        }

        /* ── Ratio frames ── */
        .cs-card__frame {
          position: relative;
          overflow: hidden;
          border-radius: 2px;
          width: 100%;
          background: #080810;
        }
        .ratio-16-9 { aspect-ratio: 16/9; }
        .ratio-9-16 { aspect-ratio: 9/16; }
        .ratio-1-1  { aspect-ratio: 1/1; }

        .cs-card__img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .cs-card:hover .cs-card__img { transform: scale(1.03); }

        .cs-card__corners {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .cs-card__corners span {
          position: absolute;
          width: 14px; height: 14px;
          border-color: rgba(192,0,26,0.6);
          border-style: solid;
        }
        .cs-card__corners span:nth-child(1) { top: 7px; left: 7px; border-width: 1.5px 0 0 1.5px; }
        .cs-card__corners span:nth-child(2) { top: 7px; right: 7px; border-width: 1.5px 1.5px 0 0; }
        .cs-card__corners span:nth-child(3) { bottom: 7px; left: 7px; border-width: 0 0 1.5px 1.5px; }
        .cs-card__corners span:nth-child(4) { bottom: 7px; right: 7px; border-width: 0 1.5px 1.5px 0; }

        .cs-card__ratio-badge {
          position: absolute;
          bottom: 9px; right: 10px;
          font-family: var(--font-space, monospace);
          font-size: 0.52rem;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.55);
          background: rgba(0,0,0,0.7);
          padding: 3px 7px;
          border-radius: 2px;
        }

        .cs-card__body { display: flex; flex-direction: column; gap: 10px; }
        .cs-card__label {
          font-family: var(--font-cinzel, serif);
          font-size: 0.95rem;
          font-weight: 700;
          color: #f0e8d8;
          margin: 0;
          letter-spacing: 0.04em;
        }
        .cs-card__desc {
          font-family: var(--font-cormorant, serif);
          font-size: 0.95rem;
          line-height: 1.7;
          color: rgba(224,224,248,0.6);
          margin: 0;
        }
        .cs-card__best {
          font-family: var(--font-space, monospace);
          font-size: 0.56rem;
          letter-spacing: 0.12em;
          margin: 0;
          color: rgba(224,224,248,0.55);
        }

        /* ── Download button ── */
        .cs-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 20px;
          background: #c0001a;
          color: #fff;
          border: 1px solid #c0001a;
          border-radius: 2px;
          font-family: var(--font-space, monospace);
          font-size: 0.65rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .cs-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }
        .cs-btn:hover::before { transform: translateX(100%); }
        .cs-btn:hover {
          background: #a0001a;
          box-shadow: 0 0 24px rgba(192,0,26,0.45);
          transform: translateY(-1px);
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
          background: radial-gradient(ellipse 70% 60% at 100% 50%, rgba(192,0,26,0.04), transparent);
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
          background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(192,0,26,0.08), transparent);
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

        @media (max-width: 600px) {
          .cs-grid { grid-template-columns: 1fr; }
          .ratio-9-16 { max-height: none; }
          .ratio-1-1  { max-height: none; }
          .cs-phase { grid-template-columns: 32px 2px 1fr; gap: 12px; }
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

        /* ── Pinterest Pin button ── */
        .cs-pin-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: #e60023;
          color: #fff;
          border: none;
          border-radius: 2px;
          font-family: var(--font-space, monospace);
          font-size: 0.58rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
          align-self: flex-start;
          margin-bottom: 4px;
        }
        .cs-pin-btn:hover { background: #c0001b; transform: translateY(-1px); }

        /* ── Full-width Red Download button ── */
        .cs-btn--full {
          width: 100%;
          padding: 14px 20px;
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          font-weight: 700;
          box-shadow: 0 0 28px rgba(192,0,26,0.4), 0 4px 16px rgba(0,0,0,0.5);
        }
        .cs-btn--full:hover {
          box-shadow: 0 0 40px rgba(192,0,26,0.65), 0 4px 20px rgba(0,0,0,0.6);
        }

        /* ── Explore More Grid ── */
        .cs-explore-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: clamp(16px,2.5vw,24px);
        }
        .cs-explore-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(192,0,26,0.12);
          overflow: hidden;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .cs-explore-card:hover {
          border-color: rgba(192,0,26,0.35);
          box-shadow: 0 0 30px rgba(192,0,26,0.05);
        }
        .cs-explore-card__thumb {
          aspect-ratio: 16/9;
          background: #08060e;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
        }
        .cs-explore-card__emoji { font-size: 2.5rem; }
        .cs-explore-card__coming {
          font-family: var(--font-space, monospace);
          font-size: 0.52rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(192,0,26,0.6);
          border: 1px solid rgba(192,0,26,0.25);
          padding: 3px 8px;
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
          margin: 0;
        }

        @media (max-width: 500px) {
          .cs-set-badge { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    </main>
  );
}