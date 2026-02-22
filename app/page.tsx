import Header from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 text-white uppercase italic">
            Embrace the <span className="text-red-700">Darkness</span>
          </h1>
          <p className="text-xl text-zinc-500 mb-10 tracking-wide max-w-2xl mx-auto font-light">
            High-resolution AI art collections for the wicked. Goddesses, Tarot, Devils, and Fantasy.
          </p>
          <div className="flex justify-center gap-4">
            <div className="h-px w-20 bg-red-900 self-center"></div>
            <span className="text-red-700 font-bold uppercase tracking-[0.3em] text-sm">Vault Open</span>
            <div className="h-px w-20 bg-red-900 self-center"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[1, 2, 3].map((i) => (
             <div key={i} className="aspect-[2/3] bg-zinc-900 border border-zinc-800 rounded-sm flex flex-col items-center justify-center group cursor-pointer hover:border-red-900 transition-all overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                <span className="relative z-10 text-zinc-800 font-bold text-4xl group-hover:text-red-900/40 transition-colors uppercase tracking-tighter italic text-center px-4">Art Station</span>
                <span className="relative z-10 text-zinc-600 text-[10px] mt-4 group-hover:text-red-700 uppercase tracking-[0.4em] font-bold">Summoning Soon</span>
             </div>
           ))}
        </div>
      </main>
      <footer className="py-10 border-t border-zinc-900 text-center">
        <p className="text-zinc-700 text-[10px] tracking-[0.5em] uppercase italic font-bold">
          © 2025 Freemium Wallpapers - AI Powered Evil
        </p>
      </footer>
    </>
  );
}