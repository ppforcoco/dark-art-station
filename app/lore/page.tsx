import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Origins | Haunted Wallpapers — The Story Behind the Dark Art",
  description: "The origin of Haunted Wallpapers — dark fantasy art born from the abyss.",
};

export default function OriginsPage() {
  return (
    <main className="static-page origins-page">
      <div className="origins-hero">
        <span className="section-eyebrow">Our Story</span>
        <h1 className="origins-title">Born from the<br /><span className="t-red">Abyss</span></h1>
        <p className="origins-sub">Where dark art finds its home.</p>
      </div>
      <div className="origins-body">
        <div className="origins-block">
          <span className="origins-num">01</span>
          <div>
            <h2 className="origins-h2">How It Started</h2>
            <p className="origins-p">Haunted Wallpapers grew out of a simple obsession — the feeling that most wallpapers were too polished, too clean, too <em>safe</em>. We wanted screens that felt alive with something darker. Art that belonged to those who hang skulls where others hang flowers, who find power in shadows, and beauty in the macabre.</p>
            <p className="origins-p">What started as a personal collection became something much bigger: a full dark art studio generating hundreds of original pieces across tarot, skeletons, gothic fantasy, demons, and arcane imagery — built specifically for your screen.</p>
          </div>
        </div>
        <div className="origins-block">
          <span className="origins-num">02</span>
          <div>
            <h2 className="origins-h2">The Art</h2>
            <p className="origins-p">Every image on Haunted Wallpapers is AI-generated and hand-curated. We run hundreds of generations to find the pieces that truly hit — the ones that feel like they were pulled from a forgotten comic or a fever dream at 3am. The ones that make your lock screen feel like a portal.</p>
            <p className="origins-p">We don&apos;t ship filler. Every collection is themed, cohesive, and built to look stunning on your specific device — iPhone, Android, or widescreen PC.</p>
          </div>
        </div>
        <div className="origins-block">
          <span className="origins-num">03</span>
          <div>
            <h2 className="origins-h2">Free, Always</h2>
            <p className="origins-p">All wallpapers are free to download — no account, no paywall, no catch. We earn through ads that keep the lights on. That&apos;s the deal. Download, use, share — just don&apos;t resell.</p>
          </div>
        </div>
        <div className="origins-block">
          <span className="origins-num">04</span>
          <div>
            <h2 className="origins-h2">What&apos;s Next</h2>
            <p className="origins-p">New collections drop regularly, seasonal events go deep, and the archive grows darker every week. Follow us on Pinterest and Instagram to catch new drops first.</p>
            <div className="origins-links">
              <Link href="/collections" className="btn-primary"><span>Browse Collections</span></Link>
              <Link href="/free" className="btn-secondary">Free Downloads</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}