const ITEMS = [
  "Tarot Cards",
  "Skulls & Skeletons",
  "Dark Fantasy",
  "Dark Aesthetics",
  "Dark Humor",
  "Patterns & Textures",
  "Gothic Art",
  "Horror",
  "Incognito Mode",
  "Bone Street",
];

export default function MarqueeTicker() {
  const repeated = [...ITEMS, ...ITEMS];
  return (
    <div
      className="marquee-section"
      style={{ overflow: "hidden", width: "100%", maxWidth: "100%", position: "relative" }}
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