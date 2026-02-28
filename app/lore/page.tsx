import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Lore | Haunted Wallpapers",
  description: "The story behind Haunted Wallpapers — dark fantasy art born from the abyss.",
};

export default function LorePage() {
  return (
    <>
      <Header />
      <main style={{ backgroundColor: "#050505", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 60px" }}>
        <div style={{ maxWidth: "640px", textAlign: "center" }}>
          <span className="section-eyebrow">Origins</span>
          <h1 className="section-title" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", margin: "16px 0 24px" }}>
            The Lore
          </h1>
          <p style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "1.2rem", color: "#8a8099", lineHeight: "1.8", marginBottom: "40px" }}>
            Every piece of dark art has a story older than the canvas it was painted on.
            Ours is being written in ink blacker than the void itself.
            <br /><br />
            Return soon — the full origin awaits.
          </p>
          <Link href="/shop" className="btn-primary"><span>Enter the Grimoire</span></Link>
        </div>
      </main>
      <Footer />
    </>
  );
}