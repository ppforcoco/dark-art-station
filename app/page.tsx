import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import MarqueeTicker from "@/components/MarqueeTicker";
import AdSlot from "@/components/AdSlot";
import NewsletterForm from "@/components/NewsletterForm";
import Link from "next/link";

// ── Data ────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Dark Goddesses", count: "84", icon: "🌙", tag: "Featured", featured: true, bgClass: "cat-bg-goddess" },
  { name: "Devils & Demons", count: "62", icon: "🔱", tag: "Dark", bgClass: "cat-bg-demon" },
  { name: "Tarot Cards", count: "78", icon: "🃏", tag: "Mystical", bgClass: "cat-bg-tarot" },
  { name: "Skeletons", count: "55", icon: "💀", tag: "Popular", bgClass: "cat-bg-skeleton" },
  { name: "Dark Humor", count: "41", icon: "😈", tag: "Viral", bgClass: "cat-bg-humor" },
];

const PRODUCTS = [
  { name: "Hecate, Queen of Crossroads", category: "Goddess",     price: 4.99, badge: "New"  as const, icon: "🌙", bgClass: "p-bg-1" },
  { name: "Baphomet Rising",             category: "Demon",       price: 6.99, badge: "Hot"  as const, icon: "🔱", bgClass: "p-bg-2" },
  { name: "The Hanged Man — Inverted",   category: "Tarot",       price: 0,    badge: "Free" as const, isFree: true, icon: "🃏", bgClass: "p-bg-3" },
  { name: "Monday Skeleton Pack",        category: "Dark Humor",  price: 3.99, icon: "💀", bgClass: "p-bg-4" },
  { name: "Void Witch Series Vol.1",     category: "Dark Fantasy",price: 9.99, badge: "Hot"  as const, icon: "🌑", bgClass: "p-bg-5" },
  { name: "Dark Arnie — Terminator Dreams", category: "Arnold",   price: 5.99, icon: "⚡", bgClass: "p-bg-6" },
  { name: "Blood Moon Cathedral",        category: "Gothic",      price: 4.99, badge: "New"  as const, icon: "🦇", bgClass: "p-bg-7" },
  { name: "Leviathan's Tide — Freebie",  category: "Occult",      price: 0,    badge: "Free" as const, isFree: true, icon: "🌊", bgClass: "p-bg-8" },
];

// ── Page ────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <Header />

      {/* ═══════════════════════════════════════════ HERO */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">

        {/* Left */}
        <div className="flex flex-col justify-center px-6 md:px-[60px] pt-[140px] pb-20">

          <div className="fade-up-1 flex items-center gap-4 mb-8">
            <div className="w-10 h-px bg-blood" />
            <span className="font-mono text-[0.7rem] tracking-[0.25em] uppercase text-blood">Dark Digital Sanctum</span>
          </div>

          <h1 className="fade-up-2 font-display leading-[1.05] text-[#f0ecff] mb-2"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
            Art Born<br />
            From <span className="text-blood">The</span><br />
            <span className="text-gold italic">Abyss</span>
          </h1>

          <p className="fade-up-3 font-body italic text-[1.15rem] text-ghost leading-[1.7] mt-8 mb-12 max-w-[420px]">
            Premium dark fantasy wallpapers, tarot art, and occult designs for those who dwell beyond the veil.
            Crafted for the damned and the divine alike.
          </p>

          <div className="fade-up-4 flex flex-wrap gap-5">
            <Link
              href="/shop"
              className="btn-primary bg-blood text-[#f0ecff] font-mono text-[0.75rem] tracking-[0.15em] uppercase px-9 py-4 inline-flex items-center gap-2 no-underline"
            >
              <span>Enter the Grimoire</span>
            </Link>
            <Link
              href="/free"
              className="bg-transparent text-pale font-mono text-[0.75rem] tracking-[0.15em] uppercase px-9 py-4 border border-smoke hover:border-pale hover:text-[#f0ecff] transition-all inline-flex items-center no-underline"
            >
              Free Downloads
            </Link>
          </div>

          <div className="fade-up-5 flex gap-10 mt-[60px] pt-10 border-t border-ash">
            <div>
              <span className="font-display text-[1.8rem] text-gold block">500+</span>
              <span className="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-smoke mt-1 block">Dark Artworks</span>
            </div>
            <div>
              <span className="font-display text-[1.8rem] text-gold block">12K</span>
              <span className="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-smoke mt-1 block">Souls Collected</span>
            </div>
            <div>
              <span className="font-display text-[1.8rem] text-gold block">Free</span>
              <span className="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-smoke mt-1 block">Shipping (Digital)</span>
            </div>
          </div>
        </div>

        {/* Right — Hero Mosaic */}
        <div className="hidden lg:block relative overflow-hidden border-l border-[rgba(139,0,0,0.2)]">
          {/* Vertical blood divider */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-[60%] bg-gradient-to-b from-transparent via-blood to-transparent z-10" />

          <div className="grid grid-cols-2 h-full" style={{ gridTemplateRows: "1fr 1fr 1fr", gap: "2px" }}>
            {/* Tile 1 — spans 2 rows */}
            <div className="row-span-2 relative overflow-hidden group flex items-end p-5"
                 style={{ background: "linear-gradient(135deg,#1a0820 0%,#3d0a3a 30%,#0e0820 60%,#1a0010 100%)" }}>
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                   style={{ background: "linear-gradient(135deg,#1a0820,#3d0a3a,#0e0820,#1a0010)" }} />
              <span className="absolute inset-0 flex items-center justify-center text-[5rem] opacity-[0.15]">🌙</span>
              <span className="relative z-10 font-mono text-[0.65rem] tracking-[0.2em] uppercase text-gold opacity-0 group-hover:opacity-100 transition-opacity">Goddesses</span>
            </div>

            {/* Tile 2 */}
            <div className="relative overflow-hidden group flex items-end p-5"
                 style={{ background: "linear-gradient(225deg,#0a1a08,#1a3a0a,#0e1408)" }}>
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                   style={{ background: "linear-gradient(225deg,#0a1a08,#1a3a0a,#0e1408)" }} />
              <span className="absolute inset-0 flex items-center justify-center text-[5rem] opacity-[0.15]">🔱</span>
              <span className="relative z-10 font-mono text-[0.65rem] tracking-[0.2em] uppercase text-gold opacity-0 group-hover:opacity-100 transition-opacity">Devils</span>
            </div>

            {/* Tile 3 */}
            <div className="relative overflow-hidden group flex items-end p-5"
                 style={{ background: "linear-gradient(45deg,#200a0a,#4a0a0a,#1a0808)" }}>
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                   style={{ background: "linear-gradient(45deg,#200a0a,#4a0a0a,#1a0808)" }} />
              <span className="absolute inset-0 flex items-center justify-center text-[5rem] opacity-[0.15]">💀</span>
              <span className="relative z-10 font-mono text-[0.65rem] tracking-[0.2em] uppercase text-gold opacity-0 group-hover:opacity-100 transition-opacity">Skeletons</span>
            </div>

            {/* Tile 4 — spans 2 cols */}
            <div className="col-span-2 relative overflow-hidden group flex items-end p-5"
                 style={{ background: "linear-gradient(180deg,#08081a,#0a0a3a,#080820)" }}>
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                   style={{ background: "linear-gradient(180deg,#08081a,#0a0a3a,#080820)" }} />
              <span className="absolute inset-0 flex items-center justify-center text-[5rem] opacity-[0.15]">🃏</span>
              <span className="relative z-10 font-mono text-[0.65rem] tracking-[0.2em] uppercase text-gold opacity-0 group-hover:opacity-100 transition-opacity">Tarot Cards</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ MARQUEE */}
      <MarqueeTicker />

      {/* ═══════════════════════════════════════════ CATEGORIES */}
      <section className="px-6 md:px-[60px] py-[120px]">
        <div className="flex items-end justify-between mb-[60px]">
          <div>
            <span className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-blood mb-3 block">
              Browse the Darkness
            </span>
            <h2 className="font-display text-[#f0ecff] leading-[1.1]"
                style={{ fontSize: "clamp(1.8rem, 3vw, 3rem)" }}>
              Choose Your<br />Obsession
            </h2>
          </div>
          <Link href="/shop" className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-ghost hover:text-[#f0ecff] border-b border-smoke hover:border-[#f0ecff] pb-1 transition-all no-underline">
            View All Collections →
          </Link>
        </div>

        {/* Grid: col 1 spans 2 rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px]"
             style={{ gridAutoRows: "minmax(280px, auto)" }}>
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.name} {...cat} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ AD SLOT */}
      <AdSlot />

      {/* ═══════════════════════════════════════════ PRODUCTS */}
      <section className="px-6 md:px-[60px] py-[120px] bg-deep">
        <div className="flex items-end justify-between mb-[60px]">
          <div>
            <span className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-blood mb-3 block">
              Freshly Summoned
            </span>
            <h2 className="font-display text-[#f0ecff] leading-[1.1]"
                style={{ fontSize: "clamp(1.8rem, 3vw, 3rem)" }}>
              Latest<br />Arrivals
            </h2>
          </div>
          <Link href="/shop" className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-ghost hover:text-[#f0ecff] border-b border-smoke hover:border-[#f0ecff] pb-1 transition-all no-underline">
            Browse All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.name} {...p} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════ MANIFESTO */}
      <section className="px-6 md:px-[60px] py-[140px] border-t border-ash grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-20 items-center">
        {/* Vertical label */}
        <div className="hidden md:flex items-center justify-start">
          <span
            className="font-mono text-[0.65rem] tracking-[0.3em] uppercase text-blood"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            Our Creed
          </span>
        </div>

        {/* Body */}
        <div>
          <h2
            className="font-display text-[#f0ecff] leading-[1.4] mb-8"
            style={{ fontSize: "clamp(1.8rem, 2.5vw, 2.8rem)" }}
          >
            Art that lives in the{" "}
            <span className="text-gold italic">beautiful dark</span> — for those
            who see beauty where others see shadow.
          </h2>
          <p className="font-body italic text-[1.05rem] text-ghost leading-[1.9] max-w-[600px] mb-10">
            We create for the unconventional. The ones who hang skulls where others hang flowers. Who find divinity in
            demons, humor in death, and power in the occult. Every wallpaper is a window into a world most dare not
            enter.
          </p>
          <Link
            href="/lore"
            className="btn-primary bg-blood text-[#f0ecff] font-mono text-[0.75rem] tracking-[0.15em] uppercase px-9 py-4 inline-flex items-center gap-2 no-underline"
          >
            <span>Read Our Story</span>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ NEWSLETTER */}
      <div className="bg-[#0a0a0a] relative overflow-hidden px-6 md:px-[60px] py-[100px] text-center">
        {/* Red glow */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(139,0,0,0.15), transparent 70%)" }} />

        <h2
          className="font-display text-[#f0ecff] mb-4 relative"
          style={{ fontSize: "clamp(2rem, 3.5vw, 3.5rem)" }}
        >
          Join the Dark Congregation
        </h2>
        <p className="font-body italic text-[1.1rem] text-ghost mb-12 relative">
          New arrivals, free downloads, and cursed deals — delivered to your crypt.
        </p>

        <NewsletterForm />
      </div>

      <Footer />
    </>
  );
}