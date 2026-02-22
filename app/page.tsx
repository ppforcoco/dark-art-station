import Header from "@/components/Header";
import Link from "next/link"; // ADD THIS LINE

export default function Home() {
  return (
    <>
      <Header />
      
      {/* HERO SECTION */}
      <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 pt-24 overflow-hidden">
        <div className="flex flex-col justify-center px-6 md:px-16 py-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-[1px] bg-crimson"></div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson">Dark Digital Sanctum</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl leading-tight mb-4 text-white">
            Art Born <br /> 
            From <span className="text-crimson italic">The</span> <br />
            <span className="text-gold italic">Abyss</span>
          </h1>
          
          <p className="font-body text-xl italic text-zinc-500 max-w-md mb-12 leading-relaxed">
            Premium dark fantasy wallpapers, tarot art, and occult designs for those who dwell beyond the veil.
          </p>
          
          <div className="flex flex-wrap gap-6">
            <Link href="/shop" className="bg-crimson text-white font-mono text-[10px] uppercase tracking-[0.2em] px-10 py-5 hover:bg-red-600 transition-all">
              Enter the Grimoire
            </Link>
            <Link href="/free" className="border border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-[0.2em] px-10 py-5 hover:border-white hover:text-white transition-all">
              Free Downloads
            </Link>
          </div>

          <div className="mt-16 pt-8 border-t border-zinc-900 flex gap-12">
            <div>
              <span className="font-display text-2xl text-gold block">500+</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">Artworks</span>
            </div>
            <div>
              <span className="font-display text-2xl text-gold block">Infinite</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">Darkness</span>
            </div>
          </div>
        </div>

        {/* MOSAIC PREVIEW (Right side) */}
        <div className="hidden lg:grid grid-cols-2 grid-rows-3 gap-1 p-4 bg-zinc-900/20">
          <div className="row-span-2 bg-zinc-900 flex items-center justify-center text-4xl grayscale hover:grayscale-0 transition-all cursor-pointer border border-white/5">🌙</div>
          <div className="bg-zinc-800 flex items-center justify-center text-4xl grayscale hover:grayscale-0 transition-all cursor-pointer border border-white/5">🔱</div>
          <div className="bg-zinc-800 flex items-center justify-center text-4xl grayscale hover:grayscale-0 transition-all cursor-pointer border border-white/5">💀</div>
          <div className="col-span-2 bg-zinc-900 flex items-center justify-center text-4xl grayscale hover:grayscale-0 transition-all cursor-pointer border border-white/5">🃏</div>
        </div>
      </section>

      {/* MARQUEE TICKER */}
      <div className="py-6 border-y border-crimson/30 bg-black overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee font-mono text-[10px] uppercase tracking-[0.5em] text-zinc-700">
          DARK FANTASY ✦ OCCULT ART ✦ TAROT DECKS ✦ GOTHIC GODDESSES ✦ DARK HUMOR ✦ DEMON ART ✦ 4K WALLPAPERS ✦&nbsp;
        </div>
        <div className="inline-block animate-marquee font-mono text-[10px] uppercase tracking-[0.5em] text-zinc-700">
          DARK FANTASY ✦ OCCULT ART ✦ TAROT DECKS ✦ GOTHIC GODDESSES ✦ DARK HUMOR ✦ DEMON ART ✦ 4K WALLPAPERS ✦&nbsp;
        </div>
      </div>
    </>
  );
}