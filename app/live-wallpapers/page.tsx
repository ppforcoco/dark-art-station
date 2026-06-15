"use client";
// app/live-wallpapers/page.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";

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

export default function LiveWallpapersPage() {
  const [items, setItems] = useState<WallpaperItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    loadMore(null);
    const savedSound = localStorage.getItem("lw-sound") === "1";
    setSoundEnabled(savedSound);
  }, []);

  async function loadMore(cur: string | null) {
    if (loading) return;
    setLoading(true);
    try {
      const url = cur
        ? `/api/live-wallpapers?cursor=${encodeURIComponent(cur)}`
        : "/api/live-wallpapers";
      const res = await fetch(url);
      const json = await res.json();
      setItems((prev) => [...prev, ...json.data]);
      setCursor(json.nextCursor);
    } catch {
      /* silently fail */
    }
    setLoading(false);
  }

  // IntersectionObserver: play/pause — recreated only when items change
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const idx = videoRefs.current.indexOf(video);
          if (entry.intersectionRatio >= 0.7) {
            setActiveIndex(idx);
            video.muted = !soundEnabled;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((v) => v && observerRef.current!.observe(v));
    return () => observerRef.current?.disconnect();
  }, [items]); // soundEnabled intentionally excluded to avoid re-registering on every toggle

  // Load more when near the end
  useEffect(() => {
    if (activeIndex >= items.length - 3 && cursor && !loading) {
      loadMore(cursor);
    }
  }, [activeIndex, cursor]);

  const toggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("lw-sound", next ? "1" : "0");
    const active = videoRefs.current[activeIndex];
    if (active) active.muted = !next;
  }, [soundEnabled, activeIndex]);

  const handleVideoClick = useCallback(
    (e: React.MouseEvent<HTMLVideoElement>) => {
      const v = e.currentTarget;
      if (v.paused) v.play().catch(() => {});
      else v.pause();
    },
    []
  );

  if (items.length === 0 && loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#0d0b14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8a809a",
          fontFamily: "monospace",
          fontSize: "0.85rem",
          letterSpacing: "0.1em",
        }}
      >
        Loading…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#0d0b14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8a809a",
          fontFamily: "monospace",
          fontSize: "0.85rem",
        }}
      >
        No live wallpapers yet. Check back soon.
      </div>
    );
  }

  return (
    /* Full-screen black stage */
    <div
      style={{
        height: "100dvh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sound toggle — fixed top-right of stage */}
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
        }}
      >
        {soundEnabled ? "🔊" : "🔇"}
      </button>

      {/*
        9:16 portrait column — centred on desktop, full-width on mobile.
        max-width keeps it phone-sized on wide screens.
      */}
      <div
        ref={containerRef}
        style={{
          width: "min(100vw, calc(100dvh * 9 / 16))",
          height: "100dvh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          /* hide scrollbar */
          scrollbarWidth: "none",
          position: "relative",
          borderRadius: "0",
          boxShadow: "0 0 60px rgba(0,0,0,0.9)",
        }}
        // hide webkit scrollbar via inline className workaround
        className="lw-scroll-container"
      >
        <style>{`.lw-scroll-container::-webkit-scrollbar{display:none}`}</style>

        {items.map((item, i) => (
          <div
            key={item.id}
            style={{
              height: "100dvh",
              scrollSnapAlign: "start",
              position: "relative",
              background: "#0d0b14",
              flexShrink: 0,
            }}
          >
            {/* Video — lazy load off-screen ones */}
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={item.videoUrl}
              poster={item.thumbnailUrl ?? undefined}
              loop
              muted
              playsInline
              preload={i === 0 ? "auto" : "none"}
              onClick={handleVideoClick}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                cursor: "pointer",
              }}
            />

            {/* Bottom gradient overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "80px 16px 24px",
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)",
                pointerEvents: "none",
              }}
            >
              <h2
                style={{
                  color: "#fff",
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  margin: "0 0 6px",
                  textShadow: "0 1px 6px rgba(0,0,0,0.9)",
                }}
              >
                {item.title}
              </h2>

              {item.hasSound && (
                <span
                  style={{
                    display: "inline-block",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "#fff",
                    fontFamily: "monospace",
                    fontSize: "0.55rem",
                    padding: "2px 7px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
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
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontFamily: "monospace",
                        fontSize: "0.6rem",
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right side actions */}
            <div
              style={{
                position: "absolute",
                right: "12px",
                bottom: "100px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                alignItems: "center",
              }}
            >
              {/* Download button */}
              <a
                href={item.videoUrl}
                download={`${item.slug}.mp4`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  color: "#fff",
                  textDecoration: "none",
                  fontFamily: "monospace",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "rgba(192,0,26,0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    boxShadow: "0 2px 12px rgba(192,0,26,0.5)",
                  }}
                >
                  ↓
                </div>
                <span
                  style={{
                    fontSize: "0.5rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Download
                </span>
              </a>
            </div>
          </div>
        ))}

        {/* Loading more */}
        {loading && items.length > 0 && (
          <div
            style={{
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8a809a",
              fontFamily: "monospace",
              fontSize: "0.7rem",
            }}
          >
            Loading…
          </div>
        )}
      </div>
    </div>
  );
}