import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-black text-2xl tracking-tighter text-white hover:text-red-600 transition-colors uppercase">
          FREEMIUM<span className="text-red-700">WALLPAPERS</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-bold text-zinc-400 tracking-widest">
          <Link href="/" className="hover:text-white transition uppercase">Gallery</Link>
          <div className="bg-red-900/20 text-red-500 border border-red-900/50 px-3 py-1 rounded-full text-[10px] uppercase font-black">
            Free Downloads
          </div>
        </nav>
      </div>
    </header>
  );
}