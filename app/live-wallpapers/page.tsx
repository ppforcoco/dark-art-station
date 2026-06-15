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

  // Load initial batch
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

  // IntersectionObserver: play/pause as videos enter/leave viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
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

    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => observer.disconnect();
  }, [items, soundEnabled]);

  // Load more when near the end
  useEffect(() => {
    if (activeIndex >= items.length - 3 && cursor && !loading) {
      loadMore(cursor);
    }
  }, [activeIndex]);

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
      if (v.paused) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
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
    <div
      ref={containerRef}
      style={{
        height: "100dvh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        background: "#000",
        position: "relative",
      }}
    >
      {/* Sound toggle — fixed top-right */}
      <button
        onClick={toggleSound}
        title={soundEnabled ? "Mute" : "Unmute"}
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          zIndex: 200,
          background: "rgba(13,11,20,0.7)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#e8e4f8",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          cursor: "pointer",
          fontSize: "1.1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        {soundEnabled ? "🔊" : "🔇"}
      </button>

      {items.map((item, i) => (
        <div
          key={item.id}
          style={{
            height: "100dvh",
            scrollSnapAlign: "start",
            position: "relative",
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Video */}
          <video
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={item.videoUrl}
            poster={item.thumbnailUrl ?? undefined}
            loop
            muted
            playsInline
            onClick={handleVideoClick}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              cursor: "pointer",
            }}
          />

          {/* Bottom overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "80px 20px 32px",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
              pointerEvents: "none",
            }}
          >
            <h2
              style={{
                color: "#fff",
                fontFamily: "monospace",
                fontSize: "1rem",
                fontWeight: 600,
                margin: "0 0 8px",
                textShadow: "0 1px 6px rgba(0,0,0,0.8)",
              }}
            >
              {item.title}
            </h2>

            {item.hasSound && (
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontFamily: "monospace",
                  fontSize: "0.6rem",
                  padding: "2px 8px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
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
                      color: "rgba(255,255,255,0.55)",
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right side action buttons */}
          <div
            style={{
              position: "absolute",
              right: "16px",
              bottom: "120px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              alignItems: "center",
            }}
          >
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
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "rgba(192,0,26,0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                }}
              >
                ↓
              </div>
              <span style={{ fontSize: "0.55rem", letterSpacing: "0.08em" }}>
                Save
              </span>
            </a>
          </div>
        </div>
      ))}

      {/* Loading more indicator */}
      {loading && items.length > 0 && (
        <div
          style={{
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8a809a",
            fontFamily: "monospace",
            fontSize: "0.75rem",
          }}
        >
          Loading…
        </div>
      )}
    </div>
  );
}