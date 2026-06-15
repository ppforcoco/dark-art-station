"use client";
// app/live-wallpapers/[slug]/page.tsx  ← PLAYER
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface WallpaperItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  hasSound: boolean;
  tags: string[];
  viewCount: number;
  createdAt: string;
}

export default function LiveWallpaperPlayerPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [items, setItems] = useState<WallpaperItem[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingStates, setPlayingStates] = useState<boolean[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const activeIndexRef = useRef(0);
  const itemsLenRef = useRef(0);
  const soundRef = useRef(false);

  // Lock page scroll while player is open
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const ph = html.style.overflow, pb = body.style.overflow,
      bh = body.style.height, hh = html.style.height;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.height = "100%";
    html.style.height = "100%";
    return () => {
      html.style.overflow = ph;
      body.style.overflow = pb;
      body.style.height = bh;
      html.style.height = hh;
    };
  }, []);

  // Initial load — start from the clicked slug
  useEffect(() => {
    if (!slug) return;
    const savedSound = localStorage.getItem("lw-sound") === "1";
    setSoundEnabled(savedSound);
    soundRef.current = savedSound;
    try {
      const saved = JSON.parse(localStorage.getItem("lw-favorites") || "[]");
      setFavorites(new Set(saved));
    } catch {}
    loadFromSlug(slug);
  }, [slug]);

  async function loadFromSlug(startSlug: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/live-wallpapers?slug=${encodeURIComponent(startSlug)}`
      );
      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const json = await res.json();
      setItems(json.data);
      setPlayingStates(json.data.map(() => true));
      setCursor(json.nextCursor);
    } catch {}
    setLoading(false);
  }

  async function loadMore(cur: string) {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/live-wallpapers?cursor=${encodeURIComponent(cur)}`
      );
      const json = await res.json();
      setItems((prev) => [...prev, ...json.data]);
      setPlayingStates((prev) => [...prev, ...json.data.map(() => true)]);
      setCursor(json.nextCursor);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { itemsLenRef.current = items.length; }, [items]);

  // Intersection observer — play/pause on scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const idx = videoRefs.current.indexOf(video);
          if (entry.intersectionRatio >= 0.7) {
            setActiveIndex(idx);
            video.muted = !soundRef.current;
            video.play().catch(() => {});
            setPlayingStates((prev) => {
              const n = [...prev]; n[idx] = true; return n;
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );
    videoRefs.current.forEach((v) => v && observerRef.current!.observe(v));
    return () => observerRef.current?.disconnect();
  }, [items]);

  // Auto-load more when near the end
  useEffect(() => {
    if (activeIndex >= items.length - 3 && cursor && !loading) {
      loadMore(cursor);
    }
  }, [activeIndex, cursor]);

  const toggleSound = useCallback(() => {
    const next = !soundRef.current;
    soundRef.current = next;
    setSoundEnabled(next);
    localStorage.setItem("lw-sound", next ? "1" : "0");
    const active = videoRefs.current[activeIndexRef.current];
    if (active) active.muted = !next;
  }, []);

  const togglePlayPause = useCallback((idx: number) => {
    const v = videoRefs.current[idx];
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlayingStates((prev) => { const n = [...prev]; n[idx] = true; return n; });
    } else {
      v.pause();
      setPlayingStates((prev) => { const n = [...prev]; n[idx] = false; return n; });
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("lw-favorites", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const scrollTo = useCallback((idx: number) => {
    const container = containerRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(idx, container.children.length - 1));
    const child = container.children[clamped] as HTMLElement;
    if (child) child.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Mouse wheel → one-step swipe
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let locked = false;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (locked || Math.abs(e.deltaY) < 4) return;
      locked = true;
      const idx = activeIndexRef.current;
      const len = itemsLenRef.current;
      if (e.deltaY > 0) { if (idx < len - 1) scrollTo(idx + 1); }
      else              { if (idx > 0)        scrollTo(idx - 1); }
      setTimeout(() => { locked = false; }, 550);
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [scrollTo]);

  // ── Loading / error states ───────────────────────────────────────────────

  const baseCenter: React.CSSProperties = {
    minHeight: "100dvh",
    background: "#0d0b14",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    alignItems: "center",
    justifyContent: "center",
    color: "#8a809a",
    fontFamily: "monospace",
    fontSize: "0.85rem",
    textAlign: "center",
    padding: "0 20px",
  };

  if (items.length === 0 && loading) {
    return <div style={baseCenter}>Loading…</div>;
  }

  if (notFound) {
    return (
      <div style={baseCenter}>
        <div>This wallpaper could not be found.</div>
        <Link
          href="/live-wallpapers"
          style={{
            color: "#e8e4f8",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "4px",
            padding: "10px 22px",
            textDecoration: "none",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          ← Back to gallery
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={baseCenter}>
        <div>No live wallpapers yet. Check back soon.</div>
        <Link
          href="/live-wallpapers"
          style={{
            color: "#e8e4f8",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "4px",
            padding: "10px 22px",
            textDecoration: "none",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          ← Back to gallery
        </Link>
      </div>
    );
  }

  // ── Player ───────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        height: "100dvh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        inset: 0,
        overflow: "hidden",
      }}
    >
      {/* Back to gallery */}
      <Link
        href="/live-wallpapers"
        style={{
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 300,
          background: "rgba(13,11,20,0.75)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#e8e4f8",
          borderRadius: "20px",
          height: "38px",
          padding: "0 14px",
          fontSize: "0.6rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          textDecoration: "none",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        ← Gallery
      </Link>

      {/* Sound toggle */}
      <button
        onClick={toggleSound}
        title={soundEnabled ? "Mute" : "Unmute"}
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          zIndex: 300,
          background: "rgba(13,11,20,0.75)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#e8e4f8",
          borderRadius: "50%",
          width: "38px",
          height: "38px",
          cursor: "pointer",
          fontSize: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        {soundEnabled ? "🔊" : "🔇"}
      </button>

      {/* Swipe hint */}
      {activeIndex === 0 && items.length > 1 && (
        <div
          onClick={() => scrollTo(1)}
          style={{
            position: "fixed",
            bottom: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            cursor: "pointer",
          }}
        >
          <style>{`
            @keyframes lwbounce {
              0%,100% { transform: translateY(0); }
              50%      { transform: translateY(-6px); }
            }
            .lw-bounce { animation: lwbounce 1.6s infinite; }
            .lw-scroll::-webkit-scrollbar { display: none; }
          `}</style>
          <div
            className="lw-bounce"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}
          >
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.2rem" }}>↑</span>
            <span style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.1em" }}>
              SWIPE UP
            </span>
          </div>
        </div>
      )}

      {/* 9:16 scroll column */}
      <div
        ref={containerRef}
        className="lw-scroll"
        style={{
          width: "min(100vw, calc(100dvh * 9 / 16))",
          height: "100dvh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          position: "relative",
        }}
      >
        {items.map((item, i) => {
          const isPlaying = playingStates[i] !== false;
          const isFav = favorites.has(item.id);
          const isExpanded = expandedDesc === item.id;
          const desc = item.description ?? "";

          return (
            <div
              key={item.id}
              style={{
                height: "100dvh",
                scrollSnapAlign: "start",
                position: "relative",
                background: "#0d0b14",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {/* Video */}
              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                src={item.videoUrl}
                poster={item.thumbnailUrl ?? undefined}
                loop
                muted
                playsInline
                preload={i === 0 ? "auto" : "none"}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />

              {/* Tap to play/pause */}
              <div
                onClick={() => togglePlayPause(i)}
                style={{ position: "absolute", inset: 0, cursor: "pointer", zIndex: 1 }}
              />

              {/* Paused indicator */}
              {!isPlaying && (
                <div
                  style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%,-50%)", zIndex: 10,
                    pointerEvents: "none",
                    background: "rgba(0,0,0,0.55)", borderRadius: "50%",
                    width: "64px", height: "64px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.8rem",
                  }}
                >
                  ▶
                </div>
              )}

              {/* Bottom info */}
              <div
                style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  padding: "90px 16px 20px",
                  background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
                  zIndex: 2, pointerEvents: "none",
                }}
              >
                <h2
                  style={{
                    color: "#fff", fontFamily: "monospace", fontSize: "0.9rem",
                    fontWeight: 700, margin: "0 0 5px",
                    textShadow: "0 1px 6px rgba(0,0,0,0.9)",
                  }}
                >
                  {item.title}
                </h2>

                {desc.length > 0 && (
                  <div style={{ pointerEvents: "all" }}>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.7)", fontFamily: "monospace",
                        fontSize: "0.67rem", lineHeight: 1.55,
                        margin: "0 0 6px", maxWidth: "78%",
                      }}
                    >
                      {isExpanded || desc.length <= 80 ? desc : desc.slice(0, 80) + "…"}
                      {desc.length > 80 && (
                        <span
                          onClick={() => setExpandedDesc(isExpanded ? null : item.id)}
                          style={{ color: "#c0001a", cursor: "pointer", marginLeft: "4px", fontWeight: 700 }}
                        >
                          {isExpanded ? " less" : " more"}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {item.hasSound && (
                  <span
                    style={{
                      display: "inline-block",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      color: "#fff", fontFamily: "monospace",
                      fontSize: "0.52rem", padding: "2px 7px",
                      letterSpacing: "0.12em", textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    🎵 has sound — tap 🔊
                  </span>
                )}

                {item.tags.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {item.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace", fontSize: "0.58rem" }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right action buttons */}
              <div
                style={{
                  position: "absolute", right: "12px", bottom: "90px",
                  zIndex: 5, display: "flex", flexDirection: "column",
                  gap: "14px", alignItems: "center",
                }}
              >
                <ActionBtn
                  label={isPlaying ? "Pause" : "Play"}
                  icon={isPlaying ? "⏸" : "▶"}
                  bg="rgba(255,255,255,0.15)"
                  onClick={() => togglePlayPause(i)}
                />
                <ActionBtn
                  label={isFav ? "Saved" : "Save"}
                  icon={isFav ? "❤️" : "🤍"}
                  bg={isFav ? "rgba(192,0,26,0.85)" : "rgba(255,255,255,0.12)"}
                  onClick={() => toggleFavorite(item.id)}
                />
                <a
                  href={item.videoUrl}
                  download={`${item.slug}.mp4`}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: "4px", color: "#fff", textDecoration: "none", fontFamily: "monospace",
                  }}
                >
                  <div
                    style={{
                      width: "42px", height: "42px", borderRadius: "50%",
                      background: "rgba(192,0,26,0.9)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.1rem",
                      boxShadow: "0 2px 12px rgba(192,0,26,0.45)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    ↓
                  </div>
                  <span style={{ fontSize: "0.48rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Download
                  </span>
                </a>
              </div>

              {/* Prev / Next arrows */}
              {i > 0 && (
                <button
                  onClick={() => scrollTo(i - 1)}
                  style={{
                    position: "absolute", top: "68px", left: "50%",
                    transform: "translateX(-50%)", zIndex: 5,
                    background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff", borderRadius: "50%", width: "30px", height: "30px",
                    cursor: "pointer", fontSize: "0.75rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  ↑
                </button>
              )}
              {i < items.length - 1 && (
                <button
                  onClick={() => scrollTo(i + 1)}
                  style={{
                    position: "absolute", bottom: "14px", left: "50%",
                    transform: "translateX(-50%)", zIndex: 5,
                    background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff", borderRadius: "50%", width: "30px", height: "30px",
                    cursor: "pointer", fontSize: "0.75rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  ↓
                </button>
              )}

              {/* Progress dots */}
              <div
                style={{
                  position: "absolute", right: "3px", top: "50%",
                  transform: "translateY(-50%)", zIndex: 5,
                  display: "flex", flexDirection: "column", gap: "4px",
                }}
              >
                {items
                  .slice(Math.max(0, activeIndex - 2), activeIndex + 4)
                  .map((_, dotOffset) => {
                    const dotIdx = Math.max(0, activeIndex - 2) + dotOffset;
                    return (
                      <div
                        key={dotIdx}
                        onClick={() => scrollTo(dotIdx)}
                        style={{
                          width: "3px",
                          height: dotIdx === activeIndex ? "16px" : "5px",
                          borderRadius: "2px",
                          background: dotIdx === activeIndex
                            ? "#fff"
                            : "rgba(255,255,255,0.28)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      />
                    );
                  })}
              </div>
            </div>
          );
        })}

        {loading && items.length > 0 && (
          <div
            style={{
              height: "60px", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#8a809a",
              fontFamily: "monospace", fontSize: "0.7rem",
            }}
          >
            Loading…
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  label, icon, bg, onClick,
}: {
  label: string; icon: string; bg: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "4px", background: "none", border: "none",
        cursor: "pointer", color: "#fff", fontFamily: "monospace", padding: 0,
      }}
    >
      <div
        style={{
          width: "42px", height: "42px", borderRadius: "50%", background: bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1rem", border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {icon}
      </div>
      <span style={{ fontSize: "0.48rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>
        {label}
      </span>
    </button>
  );
}