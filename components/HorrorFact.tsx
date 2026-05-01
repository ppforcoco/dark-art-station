"use client";
import { useState, useEffect } from "react";

const FACTS = [
  "The average person walks past 36 people every day who have experienced sleep paralysis — where they wake up unable to move, certain something is in the room.",
  "Your brain continues processing sound for up to 7 minutes after your body shuts down. The last thing you hear might surprise you.",
  "Cats can detect changes in air pressure before storms. What else are they detecting that you cannot?",
  "The human eye can perceive a candle flame from 14 miles away in total darkness. Some people report seeing lights no one else can explain.",
  "There are more possible iterations of a chess game than atoms in the observable universe. Some patterns have never been seen before — and some never will be.",
  "Crows remember human faces for years. If you were rude to one, its entire family knows your face.",
  "The deep ocean covers 65% of the Earth's surface and 95% of it has never been explored. We know more about the surface of the moon.",
  "Identical twins do not have identical fingerprints. Something small and unpredictable shapes us all.",
  "The smell of old books — petrichor and vanilla — is caused by the slow chemical breakdown of the paper. Everything decays. Even stories.",
  "Mirror neurons in your brain fire the same way whether you experience something or simply watch someone else experience it. Observation is closer to participation than you think.",
  "Ball lightning — glowing orbs that drift silently through walls — has been documented by credible witnesses for centuries. Science still has no agreed explanation.",
  "The average adult makes 35,000 decisions every day. Most of them happen without your conscious awareness.",
  "Some deep-sea fish produce their own light through bioluminescence. In the darkest places, things still glow.",
  "Shadows technically have no mass, no temperature, and no physical properties — yet the brain treats them as solid objects in peripheral vision.",
  "Hypnagogia is the state between waking and sleep where the brain generates voices, faces, and full scenes from nothing. Artists have deliberately used it for centuries.",
  "Octopuses have three hearts, blue blood, and distributed intelligence — two-thirds of their neurons live in their arms, not their brain.",
  "The Baader-Meinhof phenomenon: once you notice something, you start seeing it everywhere. It never appeared more often. You just began looking.",
  "Trees in a forest share nutrients through underground fungal networks. They can recognize their own offspring and send them extra resources.",
  "The human body replaces most of its cells every 7-10 years. The person you were a decade ago shares almost no physical material with you now.",
  "Light from distant stars takes so long to reach us that when you look at the night sky, some of those lights no longer exist. You are watching echoes.",
  "Your ears never stop working. Even in deep sleep, sounds are processed and evaluated for threat. Something is always listening.",
  "Jellyfish have survived five mass extinction events. They have no brain, no heart, no bones — and they have outlasted almost everything else.",
  "The total weight of all ants on Earth roughly equals the total weight of all humans. They have been here much longer.",
  "Some species of coral can live for thousands of years. The oldest known living organism on Earth has been alive since before written language.",
  "Your heartbeat syncs with music you are listening to. External rhythms reshape internal ones without your permission.",
  "Infrasound — sound below human hearing — can cause unease, dread, and visual disturbances. Certain old buildings produce it naturally through their structure.",
  "The human brain generates enough electricity to power a small light bulb. Right now, something is running inside your skull.",
  "Mantis shrimp can see 16 types of color receptors compared to the human eye's three. The world they experience is beyond human imagination.",
  "Honeybees can recognize human faces and remember them. They use the same holistic processing technique as humans.",
  "Fog forms when the air temperature and dew point are within 2.5 degrees of each other. The world becomes something else with that small shift.",
  "The pause between the last beat of a song and the audience's applause is the moment of deepest collective silence. Some composers have written for that silence specifically.",
  "Glass is technically a super-cooled liquid, not a solid. Old windows are thicker at the bottom because they flow — imperceptibly, over centuries.",
  "Certain fungi can grow through concrete and steel given enough time. Patience is a kind of force.",
  "The phrase 'rule of thumb' has multiple disputed origins — none of them pleasant. Language carries history inside it without asking.",
  "Phantom limb syndrome allows people to feel pain, pressure, and temperature in limbs they no longer have. The mind insists on a body that is no longer there.",
  "The Turritopsis dohrnii jellyfish can revert to its juvenile state when stressed. It is technically capable of living forever.",
  "Sound travels faster through solids than through air. If you pressed your ear to the right surface, you would hear things moving far away.",
  "The blue whale's heartbeat can be detected from two miles away. Every living thing has a signal if you have the right instrument.",
  "Some species of bacteria can survive in conditions of extreme cold, heat, radiation, and pressure — environments that would instantly destroy most life.",
  "Your cornea has no blood supply and receives oxygen directly from the air. It is, technically, touching the atmosphere every moment you are awake.",
  "The oldest known melody is the Hurrian Hymn — inscribed on a clay tablet 3,400 years ago. Someone heard that tune once and decided to write it down.",
  "An average cloud weighs over a million pounds. They stay up not because they are light but because the air below them rises just fast enough.",
  "The mantis shrimp can punch with the force of a bullet. Its strike is so fast it creates a cavitation bubble that briefly reaches the temperature of the sun.",
  "Certain species of moths navigate by keeping the moon at a constant angle — a strategy that works perfectly until they encounter artificial light.",
  "The longest recorded echo lasted 75 seconds in an underground oil storage chamber in Scotland. A sound can outlive the moment that made it.",
  "Wombats produce cube-shaped droppings — the only known animal to do so. The universe still contains shapes we have not fully explained.",
  "Your body contains approximately 37 trillion cells and around 38 trillion microorganisms. You are already a community. You have never been alone.",
  "Time passes more slowly at higher altitudes due to gravitational time dilation. A clock on a mountain runs faster than a clock at sea level. Where you stand changes when you are.",
  "The Greenland shark reaches maturity at around 150 years old and can live for over 500 years. The oldest ones were already old when the printing press was invented.",
  "In complete silence, most people begin to hear their own nervous system — a faint high-pitched tone that has no external source. The sound of your own wiring.",
];

// Deterministic daily index — same fact all day, changes at midnight
function getDailyIndex(): number {
  const now = new Date();
  const dayNumber = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  return dayNumber % FACTS.length;
}

export default function HorrorFact() {
  const [factIdx, setFactIdx] = useState<number | null>(null);
  const [visible, setVisible]  = useState(true);

  useEffect(() => {
    setFactIdx(getDailyIndex());
  }, []);

  if (factIdx === null) return null;

  return (
    <section className="hf-section">
      <div className="hf-inner">
        <div className="hf-label-row">
          <span className="hf-dot" aria-hidden="true" />
          <span className="hf-label">TODAY&apos;S DARK FACT</span>
          <span className="hf-dot" aria-hidden="true" />
        </div>
        <h2 className="hf-heading">The World Is Stranger Than You Remember</h2>
        <blockquote className={`hf-quote${visible ? " hf-in" : " hf-out"}`}>
          &ldquo;{FACTS[factIdx]}&rdquo;
        </blockquote>
        <div className="hf-footer">
          <span className="hf-counter">Fact {factIdx + 1} of {FACTS.length} — changes daily at midnight</span>
        </div>
      </div>
    </section>
  );
}