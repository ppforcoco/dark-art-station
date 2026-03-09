// SkeletonCard.tsx
// Dark shimmer placeholder shown while wallpaper cards are loading.
// Drop-in replacement for ProductCard during suspense/loading states.
// Usage:  <SkeletonCard />  or  Array.from({length:8}).map((_,i)=><SkeletonCard key={i}/>)

export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      {/* aspect ratio + shimmer are handled by ::before / ::after in globals.css */}
      <div className="skeleton-info">
        <div className="skeleton-line skeleton-line-short" />
        <div className="skeleton-line skeleton-line-long" />
      </div>
    </div>
  );
}