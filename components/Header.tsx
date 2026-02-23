import Link from "next/link";

const NAV_LINKS = [
  { label: "Grimoire",    href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Free Souls",  href: "/free" },
  { label: "The Ritual",  href: "/ritual" },
  { label: "Lore",        href: "/lore" },
];

export default function Header() {
  return (
    <nav className="fixed top-0 w-full z-50 px-6 md:px-[60px] py-6 flex items-center justify-between border-b border-[rgba(139,0,0,0.2)] bg-[rgba(7,7,16,0.85)] backdrop-blur-[20px]">
      {/* Logo */}
      <Link
        href="/"
        className="font-display text-[1.1rem] tracking-[0.1em] text-gold hover:text-[#f0ecff] transition-colors no-underline"
      >
        VOID<span className="text-blood">CANVAS</span>
      </Link>

      {/* Nav Links */}
      <ul className="hidden md:flex items-center gap-10 list-none">
        {NAV_LINKS.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-ghost hover:text-[#f0ecff] transition-colors no-underline"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Cart */}
      <div className="flex items-center gap-5">
        <button className="bg-transparent border border-blood text-pale font-mono text-[0.7rem] tracking-[0.12em] uppercase px-6 py-[10px] hover:bg-blood hover:text-[#f0ecff] transition-all">
          Cart (0)
        </button>
      </div>
    </nav>
  );
}