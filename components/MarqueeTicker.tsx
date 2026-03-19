// components/MarqueeTicker.tsx
// FIX: The marquee strip (animate-marquee) is intentionally wider than the
// viewport — that's how scrolling text works. But without overflow:hidden on
// the wrapper, the browser measures the full strip width as the page width
// and zooms out on mobile to fit it. The fix is purely in the wrapper style.

const ITEMS = [
  "Dark Fantasy","Occult Art","Tarot Decks","Death Aesthetics",
  "Gothic Goddesses","Dark Humor","Demon Art","Void Witches",
  "Arcane Relics","Blood Rites",
];

export default function MarqueeTicker() {
  const repeated = [...ITEMS, ...ITEMS];
  return (
    <div
      className="marquee-section"
      style={{
        overflow: "hidden",      // ← THE FIX: contains the wide strip
        width: "100%",
        maxWidth: "100%",
        position: "relative",
      }}
    >
      <div className="animate-marquee">
        {repeated.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}<span className="marquee-dot">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}