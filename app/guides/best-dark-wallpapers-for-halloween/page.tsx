import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hauntedwallpapers.com";

const HERO_IMAGE    = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/halloween-haunted-castle-lightning.webp";
const SKULL_IMAGE   = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/halloween-gothic-skull-pumpkins.webp";
const GRAVE_IMAGE   = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/halloween-graveyard-pumpkin-moon.webp";
const CATHEDRAL_IMG = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/halloween-gothic-cathedral-moonlight.webp";
const VINES_IMAGE   = "https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/halloween-dark-vines-glowing-ghosts.webp";

export const metadata: Metadata = {
  title: "Best Dark Wallpapers for Halloween 2025 | Haunted Wallpapers",
  description:
    "Discover the best dark and Halloween wallpapers for iPhone and Android. Haunted castles, gothic skulls, moonlit graveyards, glowing ghosts, and more — all free to download.",
  alternates: { canonical: `${SITE_URL}/guides/best-dark-wallpapers-for-halloween` },
  openGraph: {
    title: "Best Dark Wallpapers for Halloween 2025 | Haunted Wallpapers",
    description:
      "Free dark Halloween wallpapers for iPhone and Android. Gothic skulls, haunted castles, glowing ghosts, moonlit graveyards, and more.",
    url: `${SITE_URL}/guides/best-dark-wallpapers-for-halloween`,
    siteName: "Haunted Wallpapers",
    type: "article",
    images: [
      {
        url: HERO_IMAGE,
        width: 1200,
        height: 630,
        alt: "Haunted castle with lightning and bats — dark Halloween wallpaper",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best Dark Wallpapers for Halloween 2025",
  description:
    "A curated guide to the best dark Halloween wallpapers for iPhone and Android — haunted castles, gothic skulls, moonlit graveyards, glowing ghosts, and cathedral art.",
  image: HERO_IMAGE,
  datePublished: "2025-09-01T00:00:00Z",
  dateModified: "2025-10-01T00:00:00Z",
  author: { "@type": "Organization", name: "Haunted Wallpapers" },
  publisher: {
    "@type": "Organization",
    name: "Haunted Wallpapers",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/guides/best-dark-wallpapers-for-halloween` },
};

// ─── small reusable image block ──────────────────────────────────────────────
function BlogImage({ src, alt, caption, height = 380 }: { src: string; alt: string; caption: string; height?: number }) {
  return (
    <div style={{ margin: "32px 0", borderRadius: "4px", overflow: "hidden" }}>
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: `${height}px`, objectFit: "cover", display: "block" }}
        loading="lazy"
      />
      <p style={{
        fontSize: "0.7rem",
        color: "#6b6480",
        padding: "6px 0",
        fontFamily: "var(--font-space)",
        letterSpacing: "0.1em",
      }}>
        {caption}
      </p>
    </div>
  );
}

export default function HalloweenWallpapersGuide() {
  return (
    <main className="static-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="static-page-inner">

        {/* ── Hero ── */}
        <header className="static-page-header">
          <p className="static-page-label">Halloween Guide · 2025</p>
          <h1 className="static-page-title">
            Best Dark Wallpapers<br /><em>for Halloween</em>
          </h1>
          <p className="static-page-meta">
            Gothic skulls, haunted castles, moonlit graveyards, glowing spirits, and pure
            darkness — the ultimate collection of free Halloween wallpapers for iPhone and Android.
          </p>
        </header>

        {/* ── Hero image ── */}
        <div style={{ marginBottom: "12px", borderRadius: "4px", overflow: "hidden" }}>
          <img
            src={HERO_IMAGE}
            alt="Haunted gothic castle with lightning and bats — dark Halloween wallpaper"
            style={{ width: "100%", height: "460px", objectFit: "cover", display: "block" }}
            loading="eager"
          />
          <p style={{
            fontSize: "0.7rem",
            color: "#6b6480",
            padding: "6px 0",
            fontFamily: "var(--font-space)",
            letterSpacing: "0.1em",
          }}>
            A haunted castle splits the sky with lightning — the perfect lock-screen mood for Halloween
          </p>
        </div>

        {/* ── AdSense top ── */}
        <div style={{ marginBottom: "40px" }}>
          <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MAIN} width={728} height={90} />
        </div>

        <div className="static-page-body">

          {/* ── Intro ── */}
          <p style={{ marginBottom: "24px", lineHeight: "1.8" }}>
            Halloween is the one time of year when your phone lock screen can be genuinely
            terrifying — and people will think you have incredible taste. But finding high-quality
            dark wallpapers that actually look good on an OLED screen, that aren&apos;t
            watermarked to death, and that capture the real spirit of Halloween is harder than
            it sounds. We&apos;ve put together the five best categories of dark Halloween
            wallpapers, with our own original AI artwork for each one. Everything is free to download.
          </p>

          {/* ── Table of Contents ── */}
          <div style={{
            border: "1px solid #2a2535",
            padding: "24px",
            marginBottom: "48px",
            background: "rgba(192,0,26,0.04)",
          }}>
            <p style={{
              fontFamily: "var(--font-space)",
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#c0001a",
              marginBottom: "12px",
            }}>
              In This Guide
            </p>
            <ol style={{ paddingLeft: "20px", margin: 0, lineHeight: "2.2" }}>
              <li><a href="#haunted-castle"    style={{ color: "#c0a0ff", textDecoration: "none" }}>Haunted Castle &amp; Lightning</a></li>
              <li><a href="#gothic-skulls"     style={{ color: "#c0a0ff", textDecoration: "none" }}>Gothic Skull Wallpapers</a></li>
              <li><a href="#moonlit-graveyard" style={{ color: "#c0a0ff", textDecoration: "none" }}>Moonlit Graveyard</a></li>
              <li><a href="#gothic-cathedral"  style={{ color: "#c0a0ff", textDecoration: "none" }}>Gothic Cathedral at Night</a></li>
              <li><a href="#glowing-ghosts"    style={{ color: "#c0a0ff", textDecoration: "none" }}>Dark Vines &amp; Glowing Ghosts</a></li>
              <li><a href="#how-to-set"        style={{ color: "#c0a0ff", textDecoration: "none" }}>How to Set on iPhone &amp; Android</a></li>
            </ol>
          </div>

          {/* ════════════════════════════════════════════
              SECTION 1 — Haunted Castle
          ════════════════════════════════════════════ */}
          <section className="static-section" id="haunted-castle">
            <h2>1. Haunted Castle &amp; Lightning Wallpapers</h2>
            <p>
              Nothing sets the Halloween mood faster than a gothic castle silhouetted against
              a sky being torn apart by lightning. This is the wallpaper that makes someone
              pick up your phone and immediately ask where you got it. The drama lives in the
              contrast — the cold stone tower against the electric sky, the bats scattered by
              the crack of thunder, the sense that something ancient is waking up inside those walls.
            </p>

            <BlogImage
              src={HERO_IMAGE}
              alt="Gothic haunted castle with dramatic lightning and bats — Halloween wallpaper"
              caption="Gothic castle, lightning sky, and bats — original art from Haunted Wallpapers"
              height={420}
            />

            <p>
              On a modern iPhone or Samsung OLED display, the deep blacks in this image simply
              disappear into the screen, making the bright lightning feel like it&apos;s actually
              flashing. That&apos;s the magic of OLED wallpaper art — when the blacks are true
              black, not just dark grey, the image stops being a picture and starts being a window.
            </p>
            <p>
              This works beautifully as a lock screen because the focal point — the castle — sits
              in the centre of the frame, which is exactly where your notification text appears.
              The lightning frames it from above, and the dark foreground gives your clock room
              to breathe.
            </p>
            <p>
              <strong>Best for:</strong> iPhone lock screen, Samsung lock screen, OLED displays.
              Works at any resolution from 1080p to 4K.
            </p>
            <p>
              <Link href="/iphone" style={{ color: "#c0001a" }}>
                Browse iPhone Halloween Wallpapers →
              </Link>
            </p>
          </section>

          {/* ════════════════════════════════════════════
              SECTION 2 — Gothic Skulls
          ════════════════════════════════════════════ */}
          <section className="static-section" id="gothic-skulls">
            <h2>2. Gothic Skull Wallpapers</h2>
            <p>
              The skull has been a symbol of Halloween for centuries — but modern digital art
              has transformed it into something far beyond a costume-shop cliché. Ornate gothic
              skulls surrounded by pumpkins, candles, roses, and shadow take the most familiar
              Halloween image and make it feel genuinely eerie. This is the wallpaper for someone
              who celebrates Halloween properly, not just ironically.
            </p>

            <BlogImage
              src={SKULL_IMAGE}
              alt="Ornate gothic skull surrounded by pumpkins and glowing candles — Halloween wallpaper"
              caption="Baroque gothic skull with carved pumpkins and candlelight — original Haunted Wallpapers art"
              height={420}
            />

            <p>
              What separates a great skull wallpaper from a mediocre one is the detail in the
              surrounding environment. Here, the pumpkins aren&apos;t flat orange blobs — they
              glow from within with warm amber light, casting shadows across the skull that
              give the whole image a cinematic depth. The floating spirits in the background
              add a sense of movement, like you caught this scene just as something stirred.
            </p>
            <p>
              Skull wallpapers also work exceptionally well as tablet home screens. On a large
              display, the baroque detail — every crack in the bone, every curl of candle smoke
              — is visible in a way that&apos;s completely lost on a phone. If you have an iPad
              or Android tablet, this is the wallpaper to use.
            </p>
            <p>
              <strong>Best for:</strong> iPhone home screen, Android home screen, iPad and tablet,
              AMOLED displays. The dark background saves battery on every OLED device.
            </p>
            <p>
              <Link href="/collections" style={{ color: "#c0001a" }}>
                Browse Collections →
              </Link>
            </p>
          </section>

          {/* ── Mid AdSense ── */}
          <div style={{ margin: "40px 0" }}>
            <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} width={728} height={90} />
          </div>

          {/* ════════════════════════════════════════════
              SECTION 3 — Moonlit Graveyard
          ════════════════════════════════════════════ */}
          <section className="static-section" id="moonlit-graveyard">
            <h2>3. Moonlit Graveyard Wallpapers</h2>
            <p>
              Graveyards at night have a different energy to every other dark image. It&apos;s
              not just the associations — death, mystery, the unknown. It&apos;s the specific
              quality of moonlight on stone. The way a full moon turns a graveyard from
              frightening to hauntingly beautiful. A carved pumpkin burning at the foot of a
              tombstone somehow makes the whole scene more peaceful rather than more terrifying.
              That contradiction is what makes these wallpapers so compelling.
            </p>

            <BlogImage
              src={GRAVE_IMAGE}
              alt="Moonlit graveyard with jack-o-lantern and glowing full moon — Halloween wallpaper"
              caption="A moonlit Halloween graveyard — where peace and horror are one and the same"
              height={420}
            />

            <p>
              This image captures something that&apos;s hard to achieve in wallpaper art: mood
              without action. Nothing is jumping out at you. Nothing is threatening. It&apos;s
              simply beautiful in the most melancholy, Gothic way possible. The jack-o-lantern
              glows with warm light, the moon hangs perfectly framed, and the old stone crosses
              stand silent in the mist.
            </p>
            <p>
              For wallpaper purposes, this is the most versatile image in the collection. The
              composition works both vertically (phone portrait) and horizontally (PC desktop).
              The moon provides a natural focal point that sits above your clock or taskbar,
              and the bottom of the frame — where tombstones fade into shadow — gives room for
              app icons or a dock without cluttering the most important part of the image.
            </p>
            <p>
              <strong>Best for:</strong> PC desktop, iPhone lock screen, Android home screen,
              any display. This is the most adaptable wallpaper in this collection.
            </p>
            <p>
              <Link href="/pc" style={{ color: "#c0001a" }}>
                Browse PC Halloween Wallpapers →
              </Link>
            </p>
          </section>

          {/* ════════════════════════════════════════════
              SECTION 4 — Gothic Cathedral
          ════════════════════════════════════════════ */}
          <section className="static-section" id="gothic-cathedral">
            <h2>4. Gothic Cathedral at Night</h2>
            <p>
              Architecture horror works differently to creature or skeleton imagery. A gothic
              cathedral at midnight doesn&apos;t threaten you directly — instead it makes you
              feel the weight of centuries, the cold of stone that has never been warm, the
              silence of a building designed for awe and kept that way long after anyone
              stopped coming. Stained glass that glows at 3am raises an obvious question:
              who lit those candles inside?
            </p>

            <BlogImage
              src={CATHEDRAL_IMG}
              alt="Gothic cathedral with glowing stained glass windows at midnight — dark Halloween wallpaper"
              caption="A gothic cathedral bathed in moonlight — the wallpaper that asks questions you don't want answered"
              height={420}
            />

            <p>
              The stained glass windows in this image do something particularly clever: they
              provide the only warm light in an otherwise cold scene. That contrast — warmth
              behind old glass, coldness everywhere else — is what makes gothic architecture
              so compelling as a wallpaper subject. Your eye is drawn to those glowing windows,
              wondering what&apos;s inside, even though you know the building should be empty.
            </p>
            <p>
              This image is also one of the strongest AdSense-friendly images in this collection,
              if you&apos;re looking to monetise a dark art or wallpaper site. The subject matter
              is universally recognisable, the composition is editorial-quality, and there&apos;s
              nothing remotely problematic — just beautiful, dramatic architecture photography
              reimagined through AI art.
            </p>
            <p>
              <strong>Best for:</strong> PC widescreen desktop, iPad landscape, phone lock screen.
              Particularly striking on high-PPI screens where the stonework detail is visible.
            </p>
            <p>
              <Link href="/android" style={{ color: "#c0001a" }}>
                Browse Android Halloween Wallpapers →
              </Link>
            </p>
          </section>

          {/* ════════════════════════════════════════════
              SECTION 5 — Dark Vines & Ghosts
          ════════════════════════════════════════════ */}
          <section className="static-section" id="glowing-ghosts">
            <h2>5. Dark Vines &amp; Glowing Ghosts</h2>
            <p>
              The final image in this collection is the most otherworldly. Dark, reaching vines
              twisted through shadow, with small glowing spirits drifting between the branches —
              the kind of scene that belongs deep in a haunted forest at the edge of a village
              that everyone stopped visiting years ago. This is Halloween wallpaper art for
              people who take the aesthetic seriously.
            </p>

            <BlogImage
              src={VINES_IMAGE}
              alt="Dark tangled vines with glowing ghost spirits and skulls — gothic Halloween wallpaper"
              caption="Glowing spirits drift through dark vines — original Haunted Wallpapers art"
              height={420}
            />

            <p>
              What makes this image work as a wallpaper specifically — as opposed to just
              general dark art — is the distribution of light. The glowing ghosts and skulls
              are scattered across the frame rather than concentrated in one area. This means
              that wherever your app icons or widgets land on top of this image, there will
              be something glowing nearby, making the interface feel integrated with the art
              rather than just sitting on top of it.
            </p>
            <p>
              The dark vines also provide natural structure. On an Android home screen where
              icons are arranged in a grid, the branching pattern of the vines mirrors the grid
              structure without competing with it. It&apos;s one of those rare wallpapers that
              looks better with a full screen of app icons than it does on its own.
            </p>
            <p>
              <strong>Best for:</strong> Android home screen with icons, iPhone home screen,
              dark-theme app setups, AMOLED displays. The near-black background means almost
              zero battery impact on OLED devices.
            </p>
            <p>
              <Link href="/collections" style={{ color: "#c0001a" }}>
                Explore Full Collections →
              </Link>
            </p>
          </section>

          {/* ════════════════════════════════════════════
              SECTION 6 — How to Set
          ════════════════════════════════════════════ */}
          <section className="static-section" id="how-to-set">
            <h2>6. How to Set a Halloween Wallpaper</h2>
            <p>
              Once you have downloaded your wallpaper, setting it correctly takes about
              thirty seconds. The steps differ slightly between iPhone and Android.
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              margin: "24px 0",
            }}>
              {/* iPhone */}
              <div style={{ border: "1px solid #2a2535", padding: "20px" }}>
                <p style={{
                  fontFamily: "var(--font-space)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#c0001a",
                  marginBottom: "12px",
                }}>
                  iPhone
                </p>
                <ol style={{ paddingLeft: "18px", lineHeight: "2", margin: 0, fontSize: "0.9rem" }}>
                  <li>Download image to Photos</li>
                  <li>Open Settings → Wallpaper</li>
                  <li>Tap &quot;Add New Wallpaper&quot;</li>
                  <li>Select Photos</li>
                  <li>Choose your image</li>
                  <li>Tap &quot;Add&quot; to set both screens</li>
                </ol>
                <p style={{ marginTop: "12px" }}>
                  <Link href="/guides/how-to-set-wallpaper-iphone" style={{ color: "#c0001a", fontSize: "0.85rem" }}>
                    Full iPhone guide →
                  </Link>
                </p>
              </div>

              {/* Android */}
              <div style={{ border: "1px solid #2a2535", padding: "20px" }}>
                <p style={{
                  fontFamily: "var(--font-space)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#c0001a",
                  marginBottom: "12px",
                }}>
                  Android
                </p>
                <ol style={{ paddingLeft: "18px", lineHeight: "2", margin: 0, fontSize: "0.9rem" }}>
                  <li>Download image to Gallery</li>
                  <li>Long-press your home screen</li>
                  <li>Tap &quot;Wallpapers&quot;</li>
                  <li>Tap &quot;My photos&quot;</li>
                  <li>Select your image</li>
                  <li>Set for Lock or Home screen</li>
                </ol>
                <p style={{ marginTop: "12px" }}>
                  <Link href="/guides/how-to-set-wallpaper-android" style={{ color: "#c0001a", fontSize: "0.85rem" }}>
                    Full Android guide →
                  </Link>
                </p>
              </div>
            </div>

            <p>
              One tip worth knowing: on iPhone, always set your Halloween wallpaper as the
              <strong> Lock Screen</strong> first, then the Home Screen. The lock screen version
              lets you use the depth effect to make elements like the clock appear to float in
              front of the image — which, with a castle-and-lightning wallpaper, looks genuinely
              spectacular. On Android, if your launcher supports it, use a wallpaper scrolling
              effect to give the image a subtle parallax feel when you swipe between home screens.
            </p>
          </section>

          {/* ── Closing CTA ── */}
          <section className="static-section">
            <h2>Browse the Full Halloween Collection</h2>
            <p>
              Every wallpaper on Haunted Wallpapers is free to download at full resolution —
              no watermarks, no sign-up required, no strings attached. Browse by device to find
              images sized perfectly for your screen, or explore our Halloween-specific collections
              for the full range of dark seasonal art.
            </p>
            <p style={{ marginTop: "12px" }}>
              All five images featured in this guide — the haunted castle, gothic skull,
              moonlit graveyard, gothic cathedral, and glowing spirits — are available as
              free downloads. We publish new dark art every week, so check back as Halloween
              approaches for the freshest drops.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}>
              <Link href="/iphone" style={{
                display: "inline-block",
                padding: "12px 24px",
                border: "1px solid #c0001a",
                color: "#c0001a",
                textDecoration: "none",
                fontFamily: "var(--font-space)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}>
                iPhone Wallpapers
              </Link>
              <Link href="/android" style={{
                display: "inline-block",
                padding: "12px 24px",
                border: "1px solid #2a2535",
                color: "#f0ecff",
                textDecoration: "none",
                fontFamily: "var(--font-space)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}>
                Android Wallpapers
              </Link>
              <Link href="/pc" style={{
                display: "inline-block",
                padding: "12px 24px",
                border: "1px solid #2a2535",
                color: "#f0ecff",
                textDecoration: "none",
                fontFamily: "var(--font-space)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}>
                PC Wallpapers
              </Link>
            </div>
          </section>

        </div>{/* end static-page-body */}
      </div>

      {/* Footer ad */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 60px" }}>
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER} width={728} height={90} />
      </div>
    </main>
  );
}