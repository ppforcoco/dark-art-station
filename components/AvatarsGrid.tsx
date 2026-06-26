"use client";
// components/AvatarsGrid.tsx
//
// Renders the /avatars grid with two pill tabs at the top — "Avatars" and
// "Matching Avatars" — so people can switch between single PFPs and
// matching-pair PFPs without leaving the page. Same data, same page, just
// a client-side filter (no navigation, no reload).

import { useState } from "react";
import AvatarShareBtn from "@/components/AvatarShareBtn";
import MatchingAvatarCard from "@/components/MatchingAvatarCard";

interface AvatarItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  src: string;
  tags: string[];
}

type GalleryEntry =
  | { kind: "single"; item: AvatarItem }
  | { kind: "pair"; groupId: string; title: string; description: string | null; frames: { id: string; src: string; label: string }[] };

interface AvatarsGridProps {
  entries: GalleryEntry[];
}

export default function AvatarsGrid({ entries }: AvatarsGridProps) {
  const singles = entries.filter((e) => e.kind === "single");
  const pairs   = entries.filter((e) => e.kind === "pair");

  const [tab, setTab] = useState<"singles" | "pairs">("singles");
  const visible = tab === "singles" ? singles : pairs;

  return (
    <>
      {/* ── Tabs ── */}
      <div className="hw-av-tabs" role="tablist" aria-label="Avatar type">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "singles"}
          className={`hw-av-tab${tab === "singles" ? " hw-av-tab--active" : ""}`}
          onClick={() => setTab("singles")}
        >
          Avatars <span className="hw-av-tab-count">{singles.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "pairs"}
          className={`hw-av-tab${tab === "pairs" ? " hw-av-tab--active" : ""}`}
          onClick={() => setTab("pairs")}
        >
          💞 Matching Avatars <span className="hw-av-tab-count">{pairs.length}</span>
        </button>
      </div>

      {/* ── Count line ── */}
      <p className="hw-avatars-count">
        — {visible.length} {tab === "singles" ? "avatar" : "matching pair"}{visible.length !== 1 ? "s" : ""} ready to use
      </p>

      {/* ── Matching pairs tagline ── */}
      {tab === "pairs" && pairs.length > 0 && (
        <div className="hw-pairs-tagline">
          <p className="hw-pairs-tagline__main">One for you. One for them. Both haunted.</p>
          <p className="hw-pairs-tagline__sub">Download both. Set one each. No explanation needed.</p>
          <p className="hw-pairs-tagline__whisper">Never meant to be separated.</p>
        </div>
      )}

      {/* ── Grid (or empty state for this tab) ── */}
      {visible.length === 0 ? (
        <div className="hw-avatars-empty">
          <div className="hw-avatars-empty__sigil">✦ ☽ ✦</div>
          <h2 className="hw-avatars-empty__title">
            {tab === "singles" ? "No single avatars yet" : "No matching pairs yet"}
          </h2>
          <p className="hw-avatars-empty__sub">
            {tab === "singles"
              ? "Check the Matching Avatars tab, or check back soon."
              : "These drop occasionally — check the Avatars tab in the meantime."}
          </p>
        </div>
      ) : (
        <div className="hw-avatars-grid">
          {visible.map((entry, i) => {
            if (entry.kind === "pair") {
              return (
                <MatchingAvatarCard
                  key={entry.groupId}
                  title={entry.title}
                  description={entry.description}
                  frames={entry.frames}
                />
              );
            }

            const avatar = entry.item;
            return (
              <article key={avatar.id} className="hw-avatar-card">
                {/* 1:1 square image */}
                <div className="hw-avatar-card__img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatar.src}
                    alt={`${avatar.title} — dark Discord avatar`}
                    className="hw-avatar-card__img"
                    loading={i < 8 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                  />
                </div>

                {/* Card body */}
                <div className="hw-avatar-card__body">
                  <h2 className="hw-avatar-card__title">{avatar.title}</h2>

                  <div className="hw-avatar-card__actions">
                    <a
                      href={`/api/download/image/${avatar.id}`}
                      className="hw-avatar-card__btn hw-avatar-card__btn--dl"
                      aria-label={`Download ${avatar.title}`}
                    >
                      ↓ Download
                    </a>
                    <AvatarShareBtn url={avatar.src} title={avatar.title} />
                  </div>

                  {avatar.description && (
                    <div
                      className="hw-avatar-card__desc"
                      dangerouslySetInnerHTML={{ __html: avatar.description }}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── SEO Description — changes based on active tab ── */}
      <div style={{ maxWidth: "780px", margin: "60px 0 20px", padding: "0 clamp(0px,2vw,20px)" }}>

        {/* Singles SEO */}
        {tab === "singles" && (
          <>
            <div style={{ borderLeft: "3px solid rgba(192,0,26,0.4)", paddingLeft: "24px", marginBottom: "40px" }}>
              <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(192,0,26,0.6)", marginBottom: "20px" }}>About This Collection</p>
              <p style={{ fontFamily: "var(--font-cinzel,serif)", fontSize: "1.2rem", color: "rgba(232,228,220,0.9)", marginBottom: "16px", lineHeight: 1.4 }}>Every Face Has a Shadow.</p>
              <p style={{ color: "rgba(232,228,220,0.75)", fontSize: "0.92rem", lineHeight: 1.9, marginBottom: "14px" }}>The haunted town does not just live on your screen. It lives in the faces you choose to wear. Every avatar in this collection is a fragment of that place — a reflection pulled from the fog, a silhouette that lingers a second too long.</p>
              <p style={{ color: "rgba(232,228,220,0.75)", fontSize: "0.92rem", lineHeight: 1.9, marginBottom: "14px" }}>This is where the dark self lives. The version that walks the empty streets. The one that stares back from the glass. The collection holds faces for the quiet ones, the lonely ones, the ones who find beauty in the cold.</p>
              <p style={{ color: "rgba(232,228,220,0.75)", fontSize: "0.92rem", lineHeight: 1.9, marginBottom: "14px" }}>The colors are drained. The edges are rough. Every avatar carries the grain of something old, something worn, something left out in the dark too long. They are the sound of static made visual.</p>
              <p style={{ color: "rgba(232,228,220,0.75)", fontSize: "0.92rem", lineHeight: 1.9, fontStyle: "italic" }}>Choose your face. Let the haunted town wear it with you.</p>
              <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.58rem", letterSpacing: "0.12em", color: "rgba(232,228,220,0.22)", marginTop: "24px" }}>dark avatar · gothic pfp · haunted profile picture · aesthetic avatar · dark fantasy avatar · horror pfp · matching avatars</p>
            </div>
          </>
        )}

        {/* Pairs SEO */}
        {tab === "pairs" && (
          <>
            <div style={{ borderLeft: "3px solid rgba(236,72,153,0.4)", paddingLeft: "24px", marginBottom: "40px" }}>
              <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(236,72,153,0.6)", marginBottom: "20px" }}>About Matching Avatars</p>
              <p style={{ fontFamily: "var(--font-cinzel,serif)", fontSize: "1.2rem", color: "rgba(232,228,220,0.9)", marginBottom: "16px", lineHeight: 1.4 }}>Two Shadows, One Static.</p>
              <p style={{ color: "rgba(232,228,220,0.75)", fontSize: "0.92rem", lineHeight: 1.9, marginBottom: "14px" }}>Some faces belong together. Some silences are shared. The haunted town does not call to everyone — but when it calls to two, the echo is different. It lingers. It repeats. It becomes something that belongs to both.</p>
              <p style={{ color: "rgba(232,228,220,0.75)", fontSize: "0.92rem", lineHeight: 1.9, marginBottom: "14px" }}>The matching avatars are built for that echo. For the ones who walk the empty streets side by side. For the ones who stare into the dark and find each other there. The faces are halves of a whole — pieces that fit together even when apart.</p>
              <p style={{ color: "rgba(232,228,220,0.75)", fontSize: "0.92rem", lineHeight: 1.9, marginBottom: "14px" }}>The tones are muted. The edges blur into each other. There is a rawness to them, a sense that they were pulled from the same fog, the same static, the same forgotten corner of the haunted town. They whisper together.</p>
              <p style={{ color: "rgba(232,228,220,0.75)", fontSize: "0.92rem", lineHeight: 1.9, fontStyle: "italic" }}>Find the set that matches your shadow. Let the haunted town hold both.</p>
              <p style={{ fontFamily: "var(--font-space,monospace)", fontSize: "0.58rem", letterSpacing: "0.12em", color: "rgba(232,228,220,0.22)", marginTop: "24px" }}>matching avatars · couple pfps · matching profile pictures · dark couple avatars · aesthetic matching pfp · haunted matching icons · dark matching icons</p>
            </div>
          </>
        )}

      </div>

      <style>{`
        .hw-av-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .hw-av-tab {
          font-family: var(--font-space, monospace);
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(232, 228, 220, 0.65);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 10px 20px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.18s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .hw-av-tab--active {
          color: #fff;
          background: rgba(192, 0, 26, 0.18);
          border-color: rgba(192, 0, 26, 0.7);
        }
        .hw-av-tab:hover:not(.hw-av-tab--active) {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.07);
        }
        .hw-av-tab-count {
          font-size: 0.65rem;
          color: inherit;
          opacity: 0.7;
          background: rgba(255, 255, 255, 0.08);
          padding: 1px 7px;
          border-radius: 999px;
        }
        .hw-pairs-tagline {
          margin: 0 0 28px;
          padding: 16px 20px;
          border-left: 2px solid rgba(236, 72, 153, 0.5);
          background: rgba(236, 72, 153, 0.04);
        }
        .hw-pairs-tagline__main {
          font-family: var(--font-cinzel, serif);
          font-size: 1rem;
          color: rgba(232, 228, 220, 0.92);
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }
        .hw-pairs-tagline__sub {
          font-family: var(--font-space, monospace);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(232, 228, 220, 0.45);
          margin-bottom: 6px;
        }
        .hw-pairs-tagline__whisper {
          font-family: var(--font-cormorant, serif);
          font-size: 0.82rem;
          font-style: italic;
          color: rgba(236, 72, 153, 0.6);
          letter-spacing: 0.06em;
        }
      `}</style>
    </>
  );
}