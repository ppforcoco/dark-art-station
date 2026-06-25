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