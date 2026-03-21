'use client';

import { useState, useCallback, useRef } from "react";

const WHISPERS = [
  "Don't look behind you.",
  "You've been here for a while…",
  "It knows your name now.",
  "The last visitor never left.",
  "Something moved in the dark.",
  "You are not alone on this page.",
  "Close the tab. While you still can.",
  "Did you hear that?",
  "It's been watching since you arrived.",
  "The darkness remembers your face.",
  "You keep coming back. It notices.",
  "Check the corner of your screen.",
  "The walls are closer than they were.",
  "Your shadow just blinked.",
  "Don't scroll down.",
  "It followed you here from the last page.",
  "You opened something you can't close.",
  "The abyss has your IP address.",
  "Three taps and it wakes.",
  "Some doors shouldn't be opened.",
  "It appreciates your taste in wallpapers.",
  "You're still here. Good.",
];

let lastIndex = -1;

function getWhisper(): string {
  let idx: number;
  do { idx = Math.floor(Math.random() * WHISPERS.length); } while (idx === lastIndex);
  lastIndex = idx;
  return WHISPERS[idx];
}

export default function WhisperFooter() {
  const [text, setText] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setText(getWhisper());
    // Auto-dismiss after 4 seconds
    timerRef.current = setTimeout(() => setText(null), 4000);
  }, []);

  return (
    <>
      <button
        type="button"
        className="whisper-trigger"
        onClick={trigger}
        aria-label="Whisper from the void"
        title="Tap if you dare"
      >
        ✦
      </button>

      {text && (
        <div
          key={text}
          className="whisper-popup"
          role="status"
          aria-live="polite"
        >
          <span style={{ color: "var(--blood, #c0001a)", marginRight: "8px", fontSize: "0.7rem" }}>✦</span>
          {text}
        </div>
      )}
    </>
  );
}