interface AdSlotProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function AdSlot({ width = 728, height = 90, className = "" }: AdSlotProps) {
  return (
    <div className={`bg-[#0a0a0a] border-y border-[rgba(139,0,0,0.4)] px-6 md:px-[60px] py-4 flex items-center justify-between gap-5 ${className}`}>
      <span className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-[#4a445a] shrink-0">Sponsored</span>

      {/* Ad content area */}
      <div className="flex-1 flex items-center justify-center border-x border-[#2a2535] px-10 py-2 gap-10">
        {/* Replace this div's content with actual Google AdSense tag */}
        <div
          className="flex items-center justify-center"
          style={{ minWidth: Math.min(width, 728), height }}
        >
          <span className="font-body italic text-[1.1rem] text-[#c9a84c] opacity-40 text-center hidden md:block">
            [ Google Ad Unit — {width}×{height} leaderboard slot ]
          </span>
          <span className="font-body italic text-[1rem] text-[#c9a84c] opacity-40 text-center block md:hidden">
            [ Google Ad Unit — 320×50 ]
          </span>
        </div>
      </div>

      <span className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-[#4a445a] shrink-0">Advertisement</span>
    </div>
  );
}