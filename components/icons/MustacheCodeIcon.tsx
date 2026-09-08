// components/icons/MustacheCodeIcon.tsx
//
// Brand mark: a dapper handlebar mustache sitting over a `</>` code glyph.
// Pure vector, single-color (currentColor) so it inherits whatever text
// color the nav / theme is using — no hardcoded fills, so it holds up
// across the light/dark theme toggle.

interface MustacheCodeIconProps {
  size?: number;
  className?: string;
}

export default function MustacheCodeIcon({ size = 24, className }: MustacheCodeIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Handlebar mustache */}
      <path
        d="M8,22
           C8,12 22,7 32,12
           C38,15 44,18 50,18
           C56,18 62,15 68,12
           C78,7 92,12 92,22
           C92,27 82,25 76,20
           C70,25 60,22 50,21
           C40,22 30,25 24,20
           C18,25 8,27 8,22 Z"
        fill="currentColor"
      />
      {/* </> — the "coding" part */}
      <path
        d="M38,32 L30,38 L38,44 M62,32 L70,38 L62,44 M54,30 L46,46"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}