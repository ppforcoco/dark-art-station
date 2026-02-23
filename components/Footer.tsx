import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#2a2535] pt-20 pb-10 px-6 md:px-[60px]">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 md:gap-[60px] mb-[60px]">
        {/* Brand */}
        <div>
          <Link href="/" className="font-display text-[1rem] tracking-[0.1em] text-[#c9a84c] mb-5 inline-block">
            VOID<span className="text-[#c0001a]">CANVAS</span>
          </Link>
          <p className="font-body italic text-[0.95rem] text-[#4a445a] leading-[1.7] max-w-[280px]">
            Premium dark art for the damned, the divine, and everyone gloriously in between. Digital wallpapers, prints, and occult designs.
          </p>
        </div>

        {/* Collections */}
        <div>
          <h4 className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-[#8a8099] mb-5">Collections</h4>
          <ul className="space-y-[10px]">
            {["Dark Goddesses", "Devils & Demons", "Tarot Cards", "Skeletons", "Dark Humor", "Free Downloads"].map((item) => (
              <li key={item}>
                <Link href="/shop" className="font-body italic text-[0.95rem] text-[#4a445a] hover:text-[#d4cde8] transition-colors">{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Vault */}
        <div>
          <h4 className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-[#8a8099] mb-5">The Vault</h4>
          <ul className="space-y-[10px]">
            {["About", "Licensing", "Bundle Deals", "Custom Orders", "Affiliates"].map((item) => (
              <li key={item}>
                <Link href="#" className="font-body italic text-[0.95rem] text-[#4a445a] hover:text-[#d4cde8] transition-colors">{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-[#8a8099] mb-5">Support</h4>
          <ul className="space-y-[10px]">
            {["How to Download", "Refund Policy", "Contact", "FAQ", "Privacy Policy"].map((item) => (
              <li key={item}>
                <Link href="#" className="font-body italic text-[0.95rem] text-[#4a445a] hover:text-[#d4cde8] transition-colors">{item}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-10 border-t border-[#2a2535]">
        <span className="font-mono text-[0.6rem] tracking-[0.1em] text-[#4a445a]">
          © 2025 VoidCanvas. All rights reserved. Souls collected daily.
        </span>
        <div className="flex gap-5">
          {["Instagram", "Pinterest", "TikTok", "ArtStation"].map((s) => (
            <Link key={s} href="#" className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-[#4a445a] hover:text-[#c0001a] transition-colors">{s}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}