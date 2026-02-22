import Header from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Header />
      
      {/* HERO SECTION */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
        <div className="flex flex-col justify-center px-6 md:px-20 pt-32 pb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-px bg-blood"></div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood">Dark Digital Sanctum</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl leading-none text-white mb-4">
            Art Born<br />From <span className="text-blood">The</span><br />
            <span className="text-gold italic">Abyss</span>
          </h1>
          
          <p className="font-body text-xl italic text-zinc-500 mb-12 max-w-sm">
            Premium dark fantasy wallpapers and occult designs for those who dwell beyond the veil.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/shop" className="bg-blood text-white font-mono text-xs uppercase tracking-widest px-10 py-5 hover:bg-red-600 transition-all">
              Enter the Grimoire
            </Link>
            <Link href="/free" className="border border-zinc-800 text-zinc-400 font-mono text-xs uppercase tracking-widest px-10 py-5 hover:border-white hover:text-white transition-all">
              Free Downloads
            </Link>
          </div>

          <div className="flex gap-12 mt-16 pt-10 border-t border-zinc-900">
            <div>
              <span className="font-display text-3xl text-gold block">500+</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Artworks</span>
            </div>
            <div>
              <span className="font-display text-3xl text-gold block">12K</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Souls Collected</span>
            </div>
          </div>
        </div>

        {/* HERO RIGHT MOSAIC */}
        <div className="hidden lg:grid grid-cols-2 grid-rows-3 h-full border-l border-crimson/20">
           <div className="row-span-2 bg-zinc-900/50 flex items-end p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 to-void opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
              <span className="relative z-10 font-mono text-[10px] uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity">Goddesses</span>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-10">🌙</span>
           </div>
           <div className="bg-zinc-800/50 flex items-end p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-void opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
              <span className="relative z-10 font-mono text-[10px] uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity">Devils</span>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-10">🔱</span>
           </div>
           <div className="bg-zinc-900/50 flex items-end p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-void opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
              <span className="relative z-10 font-mono text-[10px] uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity">Skeletons</span>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-10">💀</span>
           </div>
           <div className="col-span-2 bg-zinc-800/50 flex items-end p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/10 to-void opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
              <span className="relative z-10 font-mono text-[10px] uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity">Tarot Cards</span>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-10">🃏</span>
           </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-crimson/30 bg-black py-4 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-700">
           DARK FANTASY ✦ OCCULT ART ✦ TAROT DECKS ✦ DEATH AESTHETICS ✦ GOTHIC GODDESSES ✦ DARK HUMOR ✦ DEMON ART ✦&nbsp;
        </div>
        <div className="animate-marquee inline-block font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-700">
           DARK FANTASY ✦ OCCULT ART ✦ TAROT DECKS ✦ DEATH AESTHETICS ✦ GOTHIC GODDESSES ✦ DARK HUMOR ✦ DEMON ART ✦&nbsp;
        </div>
      </div>

      {/* CATEGORIES SECTION */}
      <section className="px-6 md:px-20 py-32">
        <div className="flex justify-between items-end mb-16">
          <div>
            <span className="font-mono text-[10px] text-blood uppercase tracking-widest mb-4 block">Browse the Darkness</span>
            <h2 className="font-display text-4xl text-white">Choose Your<br/>Obsession</h2>
          </div>
          <Link href="/shop" className="font-mono text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest border-b border-zinc-800 pb-2 transition-all">
            View All Collections →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          <CategoryCard name="Dark Goddesses" count="84" icon="🌙" featured />
          <CategoryCard name="Devils & Demons" count="62" icon="🔱" />
          <CategoryCard name="Tarot Cards" count="78" icon="🃏" />
        </div>
      </section>
    </>
  );
}

function CategoryCard({ name, count, icon, featured = false }: any) {
  return (
    <div className={`relative overflow-hidden group aspect-[4/5] bg-zinc-900 border border-white/5 p-10 flex flex-col justify-end ${featured ? 'md:row-span-2 md:aspect-auto' : ''}`}>
       <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent z-10"></div>
       <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">{icon}</span>
       <div className="relative z-20">
          <span className="inline-block border border-blood/40 text-blood font-mono text-[8px] uppercase px-2 py-1 mb-4">Collection</span>
          <h3 className="font-display text-xl text-white mb-2">{name}</h3>
          <p className="font-mono text-[10px] text-zinc-600">{count} Wallpapers</p>
       </div>
    </div>
  )
}