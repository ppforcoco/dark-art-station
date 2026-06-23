"use client";

interface Props {
  url: string;
  title: string;
}

export default function AvatarShareBtn({ url, title }: Props) {
  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        // brief visual feedback via DOM (no state needed)
        const btn = document.activeElement as HTMLElement;
        const orig = btn?.textContent;
        if (btn && orig) { btn.textContent = "✓ Copied"; setTimeout(() => { btn.textContent = orig; }, 1500); }
      }
    } catch {}
  }

  return (
    <button
      onClick={handleShare}
      className="hw-avatar-card__btn hw-avatar-card__btn--share"
      aria-label="Share"
    >
      ↗ Share
    </button>
  );
}