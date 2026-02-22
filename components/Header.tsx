import Link from "next/link";

export default function Header() {
  return (
    <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-6 flex items-center justify-between border-b border-crimson/20 bg-void/85 backdrop-blur-xl">
      <Link href="/" className="font-display text-xl tracking-widest text-gold hover:text-white transition-colors">
        VOID<span className="text-crimson">CANVAS</span>
      </Link>
      
      <ul className="hidden md:flex items-center gap-10 list-none">
        <li><Link href="/shop" className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition">Grimoire</Link></li>
        <li><Link href="/free" className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition text-crimson">Free Souls</Link></li>
        <li><Link href="/lore" className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition">Lore</Link></li>
      </ul>

      <div>
        <button className="border border-crimson px-6 py-2 font-mono text-[10px] uppercase tracking-widest hover:bg-crimson transition-all">
          Cart (0)
        </button>
      </div>
    </nav>
  );
}