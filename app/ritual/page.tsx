import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "The Ritual | Haunted Wallpapers",
  description: "How to use Haunted Wallpapers art — guides, rituals, and installation instructions for your dark digital sanctum.",
};

export default function RitualPage() {
  return (
    <>
      <Header />
      <main style={{ backgroundColor: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 60px" }}>
        <div style={{ maxWidth: "640px", textAlign: "center" }}>
          <span className="section-eyebrow">The Practice</span>
          <h1 className="section-title" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", margin: "16px 0 24px" }}>
            The Ritual
          </h1>
          <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "1.2rem", color: "#8a8099", lineHeight: "1.8", marginBottom: "16px" }}>
            Setting the wallpaper is just the beginning.
          </p>
          <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "1rem", color: "#4a445a", lineHeight: "1.8", marginBottom: "40px" }}>
            This space will become your guide to building a dark digital sanctum —
            from wallpaper setups, to dual-monitor configurations, to curating your
            own collection. The full grimoire of instructions is being prepared.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/shop" className="btn-primary"><span>Browse Collections</span></Link>
            <Link href="/free" className="btn-secondary">Free Downloads</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}