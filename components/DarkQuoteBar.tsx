'use client';

import { useState, useEffect, useRef } from "react";

const QUOTES = [
  { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
  { text: "I am not afraid of the dark. I am afraid of what lives in it.", author: "Unknown" },
  { text: "The night is darkest just before the dawn.", author: "Thomas Fuller" },
  { text: "The darkness is where I learned to shine.", author: "Haunted Lore" },
  { text: "There is a crack in everything — that is how the light gets in.", author: "Leonard Cohen" },
  { text: "The wound is the place where the light enters you.", author: "Rumi" },
  { text: "Stars cannot shine without darkness.", author: "D.H. Sidebottom" },
  { text: "Without the dark, we would never see the stars.", author: "Stephenie Meyer" },
  { text: "We are all made of stardust and shadow.", author: "Haunted Lore" },
  { text: "Monsters are real. They live inside us.", author: "Stephen King" },
  { text: "Fear cuts deeper than swords.", author: "George R.R. Martin" },
  { text: "We accept the darkness we think we deserve.", author: "Haunted Lore" },
  { text: "To die would be an awfully big adventure.", author: "J.M. Barrie" },
  { text: "I am the darkness that walks in the dark and fears nothing.", author: "Haunted Lore" },
  { text: "Beware, for I am fearless, and therefore powerful.", author: "Mary Shelley" },
  { text: "Hell is empty and all the devils are here.", author: "Shakespeare" },
  { text: "The oldest and strongest fear of mankind is fear of the unknown.", author: "H.P. Lovecraft" },
  { text: "Something wicked this way comes.", author: "Shakespeare" },
  { text: "I have loved the stars too fondly to be fearful of the night.", author: "Sarah Williams" },
  { text: "Do not go gentle into that good night.", author: "Dylan Thomas" },
  { text: "The darkest souls are not those who choose to live in shadows.", author: "Haunted Lore" },
  { text: "In the middle of difficulty lies opportunity — and dread.", author: "Haunted Lore" },
  { text: "Death is only the beginning.", author: "Haunted Lore" },
  { text: "The void stares back.", author: "Haunted Lore" },
  { text: "You are not alone in the dark. You never were.", author: "Haunted Lore" },
];

function getDailyQuote() {
  const today = new Date().toISOString().slice(0, 10);
  const seed = today.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return QUOTES[seed % QUOTES.length];
}

function setDqbHeight(h: number) {
  document.documentElement.style.setProperty("--dqb-h", `${h}px`);
  const hbH = parseInt(
    document.documentElement.style.getPropertyValue("--topbar-h") || "0", 10
  ) || 0;
  document.documentElement.style.setProperty("--topbar-total", `${hbH + h}px`);
}

export default function DarkQuoteBar() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuote(getDailyQuote());
  }, []);

  // After quote renders, measure actual height and set CSS var
  useEffect(() => {
    if (!quote || dismissed) return;
    const measure = () => {
      const h = barRef.current?.getBoundingClientRect().height ?? 36;
      setDqbHeight(h);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [quote, dismissed]);

  const dismiss = () => {
    setDismissed(true);
    setDqbHeight(0);
  };

  if (dismissed || !quote) return null;

  return (
    <div className="dark-quote-bar" ref={barRef}>
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

import { useState, useEffect } from "react";

const QUOTES = [
  { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
  { text: "I am not afraid of the dark. I am afraid of what lives in it.", author: "Unknown" },
  { text: "The night is darkest just before the dawn.", author: "Thomas Fuller" },
  { text: "The darkness is where I learned to shine.", author: "Haunted Lore" },
  { text: "There is a crack in everything — that is how the light gets in.", author: "Leonard Cohen" },
  { text: "The wound is the place where the light enters you.", author: "Rumi" },
  { text: "Stars cannot shine without darkness.", author: "D.H. Sidebottom" },
  { text: "Without the dark, we would never see the stars.", author: "Stephenie Meyer" },
  { text: "We are all made of stardust and shadow.", author: "Haunted Lore" },
  { text: "Monsters are real. They live inside us.", author: "Stephen King" },
  { text: "Fear cuts deeper than swords.", author: "George R.R. Martin" },
  { text: "We accept the darkness we think we deserve.", author: "Haunted Lore" },
  { text: "To die would be an awfully big adventure.", author: "J.M. Barrie" },
  { text: "I am the darkness that walks in the dark and fears nothing.", author: "Haunted Lore" },
  { text: "Beware, for I am fearless, and therefore powerful.", author: "Mary Shelley" },
  { text: "Hell is empty and all the devils are here.", author: "Shakespeare" },
  { text: "The oldest and strongest fear of mankind is fear of the unknown.", author: "H.P. Lovecraft" },
  { text: "Something wicked this way comes.", author: "Shakespeare" },
  { text: "I have loved the stars too fondly to be fearful of the night.", author: "Sarah Williams" },
  { text: "Do not go gentle into that good night.", author: "Dylan Thomas" },
  { text: "The darkest souls are not those who choose to live in shadows.", author: "Haunted Lore" },
  { text: "In the middle of difficulty lies opportunity — and dread.", author: "Haunted Lore" },
  { text: "Death is only the beginning.", author: "Haunted Lore" },
  { text: "The void stares back.", author: "Haunted Lore" },
  { text: "You are not alone in the dark. You never were.", author: "Haunted Lore" },
];

const BAR_H = 36;

function getDailyQuote() {
  const today = new Date().toISOString().slice(0, 10);
  const seed = today.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return QUOTES[seed % QUOTES.length];
}

function setDqbHeight(h: number) {
  document.documentElement.style.setProperty("--dqb-h", `${h}px`);
  // Recalculate topbar-total = halloween bar + quote bar
  const hbH = parseInt(
    document.documentElement.style.getPropertyValue("--topbar-h") || "36", 10
  ) || 36;
  document.documentElement.style.setProperty("--topbar-total", `${hbH + h}px`);
}

export default function DarkQuoteBar() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `hw-quote-dismissed-${today}`;
    try {
      if (localStorage.getItem(key)) {
        setDismissed(true);
        return;
      }
    } catch {}
    setQuote(getDailyQuote());
    setDqbHeight(BAR_H);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    setDqbHeight(0);
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