// components/icons/DeviceIcons.tsx
//
// Device glyphs styled to match MustacheCodeIcon: a small handlebar-mustache
// flourish worked into each shape, pure vector, single-color (currentColor)
// so they hold up across the light/dark theme toggle. Used in place of the
// 📱 🤖 🖥 emoji throughout the site for a consistent, brand-native icon set.

interface DeviceIconProps {
  size?: number;
  className?: string;
}

export function IphoneIcon({ size = 16, className }: DeviceIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="14" y="4" width="20" height="34" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <line x1="20" y1="32" x2="28" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M17,20 C17,15 21,12 24,15 C25.5,16.5 27,18 28.5,18 C30,18 31.5,16.5 33,15 C36,12 40,15 40,20"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function AndroidIcon({ size = 16, className }: DeviceIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="14" y="6" width="20" height="34" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <line x1="14" y1="32" x2="34" y2="32" stroke="currentColor" strokeWidth="2" />
      <path d="M18,10 C18,7 20,5 24,7 C25,7.6 26,8 26,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function PcIcon({ size = 16, className }: DeviceIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect x="6" y="8" width="36" height="22" rx="2" stroke="currentColor" strokeWidth="2.5" />
      <line x1="24" y1="30" x2="24" y2="36" stroke="currentColor" strokeWidth="2.5" />
      <line x1="16" y1="40" x2="32" y2="40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M13,15 C13,12 16,10 19,12.5 C20,13.5 21,14.5 22,14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}