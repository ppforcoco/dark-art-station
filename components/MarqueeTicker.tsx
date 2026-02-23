const ITEMS = [
  "Dark Fantasy","Occult Art","Tarot Decks","Death Aesthetics",
  "Gothic Goddesses","Dark Humor","Demon Art","Void Witches",
  "Arcane Relics","Blood Rites",
];

export default function MarqueeTicker() {
  const repeated = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-section">
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