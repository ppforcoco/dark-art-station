// app/sets/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

export const metadata: Metadata = {
  title: "Matching Wallpaper Sets | Phone, Watch & Desktop Bundles | Haunted Wallpapers",
  description:
    "Complete matching wallpaper kits for every screen. One dark aesthetic across your phone lock screen, home screen, smartwatch face, and desktop background. Free 4K downloads.",
  keywords: [
    "matching wallpaper set", "phone and watch wallpaper", "dark aesthetic kit",
    "cohesive wallpaper bundle", "smartwatch wallpaper", "desktop phone matching wallpaper",
    "dark anime wallpaper set", "horror aesthetic setup",
  ],
  openGraph: {
    title: "Matching Wallpaper Sets | Haunted Wallpapers",
    description:
      "Complete matching wallpaper kits — phone, watch, desktop and avatar. One dark aesthetic across every screen.",
    url: `${SITE_URL}/sets`,
    siteName: "Haunted Wallpapers",
    type: "website",
    images: [
      {
        url: "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Cursed%20Student%3A%20A%20Matching%20Dark%20Anime%20Horror%20Kit/cursed-student-dark-anime-4k-desktop-background.webp",
        width: 1200,
        height: 630,
        alt: "Matching Dark Anime Wallpaper Set — Haunted Wallpapers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Matching Wallpaper Sets | Haunted Wallpapers",
    description:
      "Complete matching wallpaper kits — phone, watch, desktop and avatar. One dark aesthetic across every screen.",
    images: [
      "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Cursed%20Student%3A%20A%20Matching%20Dark%20Anime%20Horror%20Kit/cursed-student-dark-anime-4k-desktop-background.webp",
    ],
  },
  alternates: { canonical: `${SITE_URL}/sets` },
};

export const revalidate = 3600;

const SETS = [
  {
    slug: "haunted-anime-student",
    title: "The Cursed Student",
    subtitle: "A Matching Dark Anime Horror Kit",
    description:
      "A psychological horror anime aesthetic built for PC, phone, and smartwatch. Three phases of possession — quiet horror, crimson awakening, and full demonic break — unified across every screen you own.",
    thumbnail:
      "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Cursed%20Student%3A%20A%20Matching%20Dark%20Anime%20Horror%20Kit/cursed-student-dark-anime-4k-desktop-background.webp",
    tags: ["dark anime", "psychological horror", "academia", "matching set"],
    count: 5,
    devices: ["Desktop", "Mobile", "Smartwatch", "Avatar"],
    accentColor: "192,0,26",
  },
  {
    slug: "whispering-woods",
    title: "The Whispering Woods",
    subtitle: "A Matching Dark Nature Horror Kit",
    description:
      "A terrifying three-phase story of a forest that never sleeps — and the predator that watches from within it. Deep blacks and high-contrast fog designed specifically to save battery on OLED screens. Covers PC, phone, smartwatch, and avatar.",
    thumbnail:
      "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Whispering%20Woods%3A%20A%20Matching%20Dark%20Nature%20Setup%20Kit/whispering-woods-foggy-horror-forest-4k-deskto.webp",
    tags: ["dark nature", "forest horror", "gothic aesthetic", "matching set"],
    count: 5,
    devices: ["Desktop", "Mobile", "Smartwatch", "Avatar"],
    accentColor: "74,138,58",
  },
  {
    slug: "ghost-pitch",
    title: "The Ghost Pitch",
    subtitle: "A Matching Dark Soccer Setup Kit",
    description:
      "Legend says the floodlights flicker on at 3:00 AM in the abandoned stadiums of the old world. No crowd. No referee. Just the Ghost Pitch — a game played by those who refused to leave the field, even after death.",
    thumbnail:
      "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Ghost%20Pitch%3A%20A%20Matching%20Dark%20Soccer%20Setup%20Kit/haunted-soccer-stadium-midnight-4k-desktop.webp",
    tags: ["dark sports", "horror football", "haunted stadium", "matching set"],
    count: 5,
    devices: ["Desktop", "Mobile", "Smartwatch", "Avatar"],
    accentColor: "232,124,30",
    premium: false,
  },
  {
    slug: "crimson-sovereign",
    title: "The Crimson Sovereign",
    subtitle: "Dark Fantasy Gaming Character Matching Setup Kit",
    description:
      "In the highest peaks of our digital town stands the Crimson Fortress — a structure built from obsidian that hums with dark energy. The Sovereign orchestrates the movements of the night. Eight premium 4K wallpapers manually optimised for OLED displays and high-end gaming setups.",
    thumbnail:
      "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/sets/The%20Crimson%20Sovereign%20%7C%20Dark%20Fantasy%20Gaming%20Character%20Matching%20Setup%20Kit/4k/Complete%20matching%20dark%20fantasy%20gaming%20character%20setup%20kit%20for%20PC%20phone%20and%20watch%20free.png",
    tags: ["dark fantasy", "gaming character", "gothic aesthetic", "OLED optimised"],
    count: 8,
    devices: ["Desktop", "Mobile", "Smartwatch", "Avatar", "PFP"],
    accentColor: "192,0,26",
    premium: true,
  },
];

export default function SetsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary, #0d0d14)",
        color: "var(--text-primary, #e0e0f8)",
      }}
    >
      {/* Header */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "clamp(48px,8vw,96px) clamp(20px,5vw,60px) clamp(32px,5vw,56px)",
        }}
      >
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-space, monospace)",
            fontSize: "0.6rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#c0001a",
            marginBottom: "16px",
          }}
        >
          Full Digital Identity
        </span>
        <h1
          style={{
            fontFamily: "var(--font-cinzel, serif)",
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            margin: "0 0 20px",
            letterSpacing: "0.04em",
            color: "#f0e8d8",
          }}
        >
          Matching Wallpaper Sets
        </h1>
        <p
          style={{
            fontFamily: "var(--font-cormorant, serif)",
            fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
            lineHeight: 1.7,
            maxWidth: "580px",
            color: "rgba(224,224,248,0.7)",
            margin: 0,
          }}
        >
          One aesthetic. Every screen. Each kit is optimised for your phone lock screen, home
          screen, smartwatch face, desktop background, and profile picture — so your digital
          identity moves with you.
        </p>
      </section>

      {/* Grid — 3 columns on desktop, stacks on mobile */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 clamp(20px,5vw,60px) clamp(64px,10vw,120px)",
        }}
      >
        <div className="sets-grid">
          {SETS.map((set, idx) => (
            <Link
              key={set.slug}
              href={`/sets/${set.slug}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <article className="set-card" style={{ "--accent": set.accentColor } as React.CSSProperties}>
                {/* Thumbnail */}
                <div className="set-card__thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={set.thumbnail} alt={set.title} className="set-card__img" />
                  <div className="set-card__overlay" />
                  <div className="set-card__corner set-card__corner--tl" />
                  <div className="set-card__corner set-card__corner--br" />
                  <span className="set-card__count">{set.count} wallpapers</span>
                  {(set as { premium?: boolean }).premium && (
                    <span className="set-card__premium">⚡ Premium</span>
                  )}
                </div>

                {/* Info */}
                <div className="set-card__body">
                  <span className="set-card__eyebrow">Set No. {String(idx + 1).padStart(2, "0")}</span>
                  <h2 className="set-card__title">{set.title}</h2>
                  <p className="set-card__sub">{set.subtitle}</p>
                  <p className="set-card__desc">{set.description}</p>

                  {/* Device badges */}
                  <div className="set-card__devices">
                    {set.devices.map((d) => (
                      <span key={d} className="set-card__device-badge">{d}</span>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="set-card__tags">
                    {set.tags.map((t) => (
                      <span key={t} className="set-card__tag">#{t}</span>
                    ))}
                  </div>

                  <span className="set-card__cta">View Full Kit →</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        /* ── 3-column grid ── */
        .sets-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(16px, 2.5vw, 28px);
        }
        @media (max-width: 900px) {
          .sets-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 540px) {
          .sets-grid { grid-template-columns: 1fr; }
        }

        /* ── Card ── */
        .set-card {
          display: flex;
          flex-direction: column;
          background: linear-gradient(160deg, rgba(255,255,255,0.03) 0%, transparent 60%);
          border: 1px solid rgba(var(--accent, 192,0,26), 0.2);
          overflow: hidden;
          position: relative;
          transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
          cursor: pointer;
          height: 100%;
        }
        .set-card:hover {
          border-color: rgba(var(--accent, 192,0,26), 0.55);
          box-shadow: 0 0 48px rgba(var(--accent, 192,0,26), 0.1);
          transform: translateY(-3px);
        }

        /* Thumbnail */
        .set-card__thumb {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
          flex-shrink: 0;
        }
        .set-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s ease;
        }
        .set-card:hover .set-card__img { transform: scale(1.04); }
        .set-card__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(var(--accent, 192,0,26), 0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .set-card__corner {
          position: absolute;
          width: 14px; height: 14px;
          border-color: rgba(var(--accent, 192,0,26), 0.6);
          border-style: solid;
        }
        .set-card__corner--tl { top: 8px; left: 8px; border-width: 1.5px 0 0 1.5px; }
        .set-card__corner--br { bottom: 8px; right: 8px; border-width: 0 1.5px 1.5px 0; }
        .set-card__count {
          position: absolute;
          bottom: 10px; left: 12px;
          font-family: var(--font-space, monospace);
          font-size: 0.52rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.75);
          background: rgba(0,0,0,0.65);
          padding: 3px 8px;
          border-radius: 2px;
        }
        .set-card__premium {
          position: absolute;
          top: 10px; right: 10px;
          font-family: var(--font-space, monospace);
          font-size: 0.5rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #ff6a00;
          background: linear-gradient(135deg, rgba(255,106,0,0.15) 0%, rgba(192,0,26,0.15) 100%);
          border: 1px solid rgba(255,106,0,0.45);
          padding: 3px 9px;
          border-radius: 2px;
          font-weight: 700;
          box-shadow: 0 0 14px rgba(255,106,0,0.18);
          animation: sets-premium-glow 3s ease-in-out infinite;
        }
        @keyframes sets-premium-glow {
          0%,100% { box-shadow: 0 0 14px rgba(255,106,0,0.18); }
          50% { box-shadow: 0 0 24px rgba(255,106,0,0.36), 0 0 40px rgba(192,0,26,0.14); }
        }

        /* Body */
        .set-card__body {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: clamp(16px,2.5vw,24px);
          flex: 1;
        }
        .set-card__eyebrow {
          font-family: var(--font-space, monospace);
          font-size: 0.52rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgb(var(--accent, 192,0,26));
        }
        .set-card__title {
          font-family: var(--font-cinzel, serif);
          font-size: clamp(1.05rem, 1.8vw, 1.35rem);
          font-weight: 700;
          color: #f0e8d8;
          margin: 0;
          line-height: 1.15;
          letter-spacing: 0.04em;
        }
        .set-card__sub {
          font-family: var(--font-space, monospace);
          font-size: 0.58rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(var(--accent, 192,0,26), 0.85);
          margin: 0;
        }
        .set-card__desc {
          font-family: var(--font-cormorant, serif);
          font-size: 0.95rem;
          line-height: 1.65;
          color: rgba(224,224,248,0.62);
          margin: 0;
          flex: 1;
        }
        .set-card__devices {
          display: flex; flex-wrap: wrap; gap: 6px;
        }
        .set-card__device-badge {
          font-family: var(--font-space, monospace);
          font-size: 0.5rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(var(--accent, 192,0,26), 0.9);
          border: 1px solid rgba(var(--accent, 192,0,26), 0.3);
          padding: 3px 8px;
          background: rgba(var(--accent, 192,0,26), 0.06);
          border-radius: 2px;
        }
        .set-card__tags {
          display: flex; flex-wrap: wrap; gap: 5px;
        }
        .set-card__tag {
          font-family: var(--font-space, monospace);
          font-size: 0.5rem;
          letter-spacing: 0.1em;
          color: rgba(224,224,248,0.3);
        }
        .set-card__cta {
          display: inline-block;
          font-family: var(--font-space, monospace);
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgb(var(--accent, 192,0,26));
          margin-top: 4px;
          transition: letter-spacing 0.2s ease;
        }
        .set-card:hover .set-card__cta { letter-spacing: 0.22em; }
      `}</style>
    </main>
  );
}