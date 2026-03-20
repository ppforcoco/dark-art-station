'use client';

import { useState, useEffect } from "react";

const QUOTES = [
  { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
  { text: "I am not afraid of the dark. I am afraid of what lives in it.", author: "Unknown" },
  { text: "The night is darkest just before the dawn.", author: "Thomas Fuller" },
  { text: "The darkness is where I learned to shine.", author: "Haunted Lore" },
  { text: "There is a crack in everything — that is how the light gets in.", author: "Leonard Cohen" },
  { text: "The wound is the place where the light enters you.", author: "Rumi" },
  { text: "Stars can't shine without darkness.", author: "D.H. Sidebottom" },
  { text: "I like the night. Without the dark, we'd never see the stars.", author: "Stephenie Meyer" },
  { text: "We are all made of stardust and shadow.", author: "Haunted Lore" },
  { text: "Monsters are real, and ghosts are real too. They live inside us.", author: "Stephen King" },
  { text: "Fear cuts deeper than swords.", author: "George R.R. Martin" },
  { text: "Death is not the greatest loss in life.", author: "Norman Cousins" },
  { text: "We accept the darkness we think we deserve.", author: "Haunted Lore" },
  { text: "To die would be an awfully big adventure.", author: "J.M. Barrie" },
  { text: "I am the darkness that walks in the dark and fears nothing.", author: "Haunted Lore" },
  { text: "Beware, for I am fearless, and therefore powerful.", author: "Mary Shelley" },
  { text: "Hell is empty and all the devils are here.", author: "Shakespeare" },
  { text: "We are the granddaughters of the witches you couldn't burn.", author: "Unknown" },
  { text: "Something wicked this way comes.", author: "Shakespeare" },
  { text: "I have loved the stars too fondly to be fearful of the night.", author: "Sarah Williams" },
  { text: "Do not go gentle into that good night.", author: "Dylan Thomas" },
  { text: "The mind is its own place — it can make a heaven of hell, a hell of heaven.", author: "John Milton" },
  { text: "The oldest and strongest fear of mankind is fear of the unknown.", author: "H.P. Lovecraft" },
  { text: "The darkest souls are not those who choose to live in shadows.", author: "Haunted Lore" },
  { text: "In the middle of difficulty lies opportunity — and dread.", author: "Haunted Lore" },
];

const DQB_HEIGHT = 36;

function getDailyQuote() {
  const today = new Date().toISOString().slice(0, 10);
  const seed = today.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return QUOTES[seed % QUOTES.length];
}

export default function DarkQuoteBar() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const key = `hw-quote-dismissed-${new Date().toISOString().slice(0, 10)}`;
      if (localStorage.getItem(key)) {
        setDismissed(true);
        return;
      }
    } catch {}
    setQuote(getDailyQuote());
    // Tell layout we have an extra bar
    document.documentElement.style.setProperty("--dqb-h", `${DQB_HEIGHT}px`);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    document.documentElement.style.setProperty("--dqb-h", "0px");
    try {
      const key = `hw-quote-dismissed-${new Date().toISOString().slice(0, 10)}`;
      localStorage.setItem(key, "1");
    } catch {}
  };

  if (dismissed || !quote) return null;

  return (
    <div className="dark-quote-bar">
      <span className="dqb-glyph">✦</span>
      <div className="dqb-content">
        <span className="dqb-label">DARK QUOTE OF THE DAY</span>
        <span className="dqb-text">&ldquo;{quote.text}&rdquo;</span>
        <span className="dqb-author">— {quote.author}</span>
      </div>
      <button className="dqb-close" onClick={dismiss} aria-label="Dismiss">✕</button>
    </div>
  );
}
  { text: "Death is not the greatest loss in life. The greatest loss is what dies inside us while we live.", author: "Norman Cousins" },
  { text: "We accept the darkness we think we deserve.", author: "Haunted Lore" },
  { text: "In the middle of difficulty lies opportunity — and dread.", author: "Haunted Lore" },
  { text: "The night is young and so are we — though neither of us will admit it.", author: "Unknown" },
  { text: "To die would be an awfully big adventure.", author: "J.M. Barrie" },
  { text: "I am the darkness that walks in the dark and fears nothing.", author: "Haunted Lore" },
  { text: "Beware, for I am fearless, and therefore powerful.", author: "Mary Shelley" },
  { text: "Hell is empty and all the devils are here.", author: "Shakespeare" },
  { text: "The oldest and strongest emotion of mankind is fear, and the oldest and strongest kind of fear is fear of the unknown.", author: "H.P. Lovecraft" },
  { text: "We are the granddaughters of the witches you couldn't burn.", author: "Unknown" },
  { text: "The darkest souls are not those who choose to live in the shadows — but those who force others to.", author: "Haunted Lore" },
  { text: "Something wicked this way comes.", author: "Shakespeare" },
  { text: "I have loved the stars too fondly to be fearful of the night.", author: "Sarah Williams" },
  { text: "Do not go gentle into that good night.", author: "Dylan Thomas" },
  { text: "The mind is its own place and in itself can make a heaven of hell, a hell of heaven.", author: "John Milton" },
  { text: "I'm not afraid of death. It's the stake one puts up in order to play the game of life.", author: "Jean Giraudoux" },
];

function getDailyQuote() {
  const today = new Date().toISOString().slice(0, 10);
  const seed = today.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return QUOTES[seed % QUOTES.length];
}

export default function DarkQuoteBar() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const key = `hw-quote-dismissed-${new Date().toISOString().slice(0, 10)}`;
      if (localStorage.getItem(key)) { setDismissed(true); return; }
    } catch {}
    setQuote(getDailyQuote());
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => {
      setDismissed(true);
      try {
        const key = `hw-quote-dismissed-${new Date().toISOString().slice(0, 10)}`;
        localStorage.setItem(key, "1");
      } catch {}
    }, 400);
  };

  if (dismissed || !quote) return null;

  return (
    <div
      className="dark-quote-bar"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <span className="dqb-glyph">✦</span>
      <div className="dqb-content">
        <span className="dqb-label">DARK QUOTE OF THE DAY</span>
        <span className="dqb-text">&ldquo;{quote.text}&rdquo;</span>
        <span className="dqb-author">— {quote.author}</span>
      </div>
      <button
        className="dqb-close"
        onClick={dismiss}
        aria-label="Dismiss quote"
      >
        ✕
      </button>
    </div>
  );
}