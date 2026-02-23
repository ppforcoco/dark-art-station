const ITEMS = [
  "Dark Fantasy",
  "Occult Art",
  "Tarot Decks",
  "Death Aesthetics",
  "Gothic Goddesses",
  "Dark Humor",
  "Demon Art",
  "Void Witches",
  "Arcane Relics",
  "Blood Rites",
];

export default function MarqueeTicker() {
  const repeated = [...ITEMS, ...ITEMS]; // duplicate for seamless loop

  return (
    <div className="border-y border-[rgba(139,0,0,0.3)] bg-[#0a0a0a] py-4 overflow-hidden whitespace-nowrap">
      <div className="animate-marquee inline-block">
        {repeated.map((item, i) => (
          <span key={i} className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-[#4a445a] inline-flex items-center gap-5 mr-[60px]">
            {item}
            <span className="text-[#c0001a] text-[0.5rem]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}