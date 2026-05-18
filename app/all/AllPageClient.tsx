"use client";
// app/all/AllPageClient.tsx — infinite scroll client for /all page

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { WallpaperItem } from "./page";

const BATCH = 48;
const R2_BASE = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

function r2Url(r2Key: string) {
  if (!r2Key) return "";
  if (r2Key.startsWith("http")) return r2Key;
  return `${R2_BASE}/${r2Key}`;
}

type DeviceTab = "mobile" | "desktop";

interface ApiImage {
  id: string;
  slug: string;
  title: string;
  r2Key: string;
  deviceType: string | null;
  tags: string[];
}

function apiToItem(img: ApiImage): WallpaperItem {
  return {
    id: img.id,
    slug: img.slug,
    title: img.title,
    src: r2Url(img.r2Key),
    deviceType: (img.deviceType ?? "IPHONE") as WallpaperItem["deviceType"],
    tags: img.tags,
    aspectRatio: img.deviceType === "PC" ? "16/9" : "9/16",
  };
}

interface Props {
  initialMobile: WallpaperItem[];
  initialDesktop: WallpaperItem[];
  totalMobile: number;
  totalDesktop: number;
}

export default function AllPageClient({
  initialMobile,
  initialDesktop,
  totalMobile,
  totalDesktop,
}: Props) {
  const [tab, setTab] = useState<DeviceTab>("mobile");

  const [mobileItems, setMobileItems] = useState<WallpaperItem[]>(initialMobile);
  const [iphonePage, setIphonePage] = useState(2);
  const [androidPage, setAndroidPage] = useState(2);
  const [iphoneDone, setIphoneDone] = useState(false);
  const [androidDone, setAndroidDone] = useState(false);
  const [mobileLoading, setMobileLoading] = useState(false);
  const mobileExhausted = iphoneDone && androidDone;

  const [desktopItems, setDesktopItems] = useState<WallpaperItem[]>(initialDesktop);
  const [desktopPage, setDesktopPage] = useState(2);
  const [desktopLoading, setDesktopLoading] = useState(false);
  const desktopExhausted = desktopItems.length >= totalDesktop;

  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (tab === "mobile") {
      if (mobileLoading || mobileExhausted) return;
      setMobileLoading(true);
      try {
        const half = Math.ceil(BATCH / 2);
        const fetches: Promise<Response>[] = [];
        if (!iphoneDone) fetches.push(fetch(`/api/wallpapers-public?device=IPHONE&page=${iphonePage}&limit=${half}`));
        if (!androidDone) fetches.push(fetch(`/api/wallpapers-public?device=ANDROID&page=${androidPage}&limit=${half}`));
        const responses = await Promise.all(fetches);
        const jsons = await Promise.all(responses.map(r => r.json()));
        let idx = 0;
        let iphoneImgs: ApiImage[] = [];
        let androidImgs: ApiImage[] = [];
        if (!iphoneDone) { iphoneImgs = jsons[idx]?.images ?? []; if (iphoneImgs.length < half) setIphoneDone(true); else setIphonePage(p => p + 1); idx++; }
        if (!androidDone) { androidImgs = jsons[idx]?.images ?? []; if (androidImgs.length < half) setAndroidDone(true); else setAndroidPage(p => p + 1); }
        const combined: ApiImage[] = [...iphoneImgs, ...androidImgs].filter(img => !img.tags.includes("badge-premium"));
        if (combined.length) setMobileItems((prev) => [...prev, ...combined.map(apiToItem)]);
      } catch (e) {
        console.error("Load more mobile failed", e);
      } finally {
        setMobileLoading(false);
      }
    } else {
      if (desktopLoading || desktopExhausted) return;
      setDesktopLoading(true);
      try {
        const res = await fetch(`/api/wallpapers-public?device=PC&page=${desktopPage}&limit=${BATCH}`);
        const data = await res.json();
        if (data.images?.length) {
          const filtered: WallpaperItem[] = (data.images as ApiImage[])
            .filter((img) => !img.tags.includes("badge-premium"))
            .map(apiToItem);
          setDesktopItems((prev) => [...prev, ...filtered]);
          setDesktopPage((p) => p + 1);
        }
      } catch (e) {
        console.error("Load more desktop failed", e);
      } finally {
        setDesktopLoading(false);
      }
    }
  }, [tab, mobileLoading, mobileExhausted, iphonePage, androidPage, iphoneDone, androidDone, desktopLoading, desktopExhausted, desktopPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const items = tab === "mobile" ? mobileItems : desktopItems;
  const loading = tab === "mobile" ? mobileLoading : desktopLoading;
  const exhausted = tab === "mobile" ? mobileExhausted : desktopExhausted;
  const total = tab === "mobile" ? totalMobile : totalDesktop;

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary, #07050f)", color: "var(--text-primary, #e0e0f8)" }}>

      <section style={{ padding: "clamp(40px,6vw,72px) clamp(16px,5vw,72px) 0", maxWidth: "1280px", margin: "0 auto" }}>
        <span style={{
          display: "block",
          fontFamily: "var(--font-space, monospace)",
          fontSize: "0.6rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "#c0001a",
          marginBottom: "12px",
        }}>The Endless</span>

        <h1 style={{
          fontFamily: "var(--font-cinzel, serif)",
          fontSize: "clamp(2rem,5vw,3.5rem)",
          fontWeight: 700,
          color: "#f0e8d8",
          margin: "0 0 16px",
          letterSpacing: "0.03em",
          lineHeight: 1.1,
        }}>All Wallpapers</h1>

        <p style={{
          fontFamily: "var(--font-cormorant, serif)",
          fontSize: "clamp(1rem,1.8vw,1.15rem)",
          lineHeight: 1.7,
          color: "rgba(224,224,248,0.55)",
          margin: "0 0 32px",
          maxWidth: "560px",
        }}>Every dark wallpaper we have ever made. Free. No sign-up. Updated daily.</p>

        <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
          {(["mobile", "desktop"] as DeviceTab[]).map((t) => {
            const active = tab === t;
            const count = t === "mobile" ? totalMobile : totalDesktop;
            const label = t === "mobile" ? "📱 Mobile" : "🖥 Desktop";
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                fontFamily: "var(--font-space, monospace)",
                fontSize: "0.62rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                padding: "10px 20px",
                border: active ? "1px solid rgba(192,0,26,0.8)" : "1px solid rgba(255,255,255,0.1)",
                background: active ? "rgba(192,0,26,0.12)" : "rgba(255,255,255,0.03)",
                color: active ? "#fff" : "rgba(224,224,248,0.55)",
                boxShadow: active ? "0 0 20px rgba(192,0,26,0.2)" : "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                {label}
                <span style={{
                  fontSize: "0.52rem",
                  color: active ? "rgba(255,255,255,0.5)" : "rgba(224,224,248,0.3)",
                  letterSpacing: "0.1em",
                }}>{count.toLocaleString()}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section style={{ padding: "0 clamp(16px,5vw,72px) clamp(40px,6vw,72px)", maxWidth: "1280px", margin: "0 auto" }}>
        {tab === "mobile" ? (
          <div className="hw-all-mobile-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(6px,1.2vw,14px)" }}>
            {items.map((img, idx) => <MobileCard key={img.id} img={img} priority={idx < 12} />)}
          </div>
        ) : (
          <div className="hw-all-desktop-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "clamp(8px,1.5vw,16px)" }}>
            {items.map((img, idx) => <DesktopCard key={img.id} img={img} priority={idx < 6} />)}
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", gap: "8px" }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                display: "inline-block", width: "6px", height: "6px",
                borderRadius: "50%", background: "#c0001a",
                animation: `hwDotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        )}

        {exhausted && !loading && (
          <p style={{
            textAlign: "center",
            fontFamily: "var(--font-space, monospace)",
            fontSize: "0.58rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(224,224,248,0.2)",
            padding: "40px 0",
          }}>✦ &nbsp; You have reached the end &nbsp; ✦</p>
        )}
      </section>

      {/* ── The Endless description ── */}
      <section style={{
        borderTop: "1px solid rgba(192,0,26,0.15)",
        padding: "clamp(48px,7vw,96px) clamp(16px,5vw,72px)",
        background: "#060310",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(192,0,26,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "680px", margin: "0 auto", position: "relative" }}>
          <span style={{
            display: "block",
            fontFamily: "var(--font-space, monospace)",
            fontSize: "0.55rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#c0001a",
            marginBottom: "24px",
          }}>✦ &nbsp; You are still here &nbsp; ✦</span>

          <div style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "clamp(1.05rem,1.8vw,1.25rem)", lineHeight: 1.9, color: "rgba(224,224,248,0.55)", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <p style={{ margin: 0 }}>You have entered a place where the dark never ends.</p>
            <p style={{ margin: 0 }}>Scroll once. The shadows notice. Scroll twice. Something watches from the corner of the screen. Keep going — there is no bottom here. Only wallpaper after wallpaper. Skeleton crews. Haunted halls. Faces in the static. All on black. All watching. All waiting.</p>
            <p style={{ margin: 0 }}>Thousands of cursed images live in this void. Cartoon horrors. Minimal dread. No text. No escape. Just pure black backgrounds and things that should not be seen.</p>
            <p style={{ margin: 0 }}>You can stop scrolling anytime. But can you?</p>
            <p style={{ margin: 0, fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(192,0,26,0.7)" }}>
              Updated daily. New nightmares added while you sleep.
            </p>
            <p style={{ margin: 0, fontFamily: "var(--font-cinzel, serif)", fontSize: "clamp(1.1rem,2vw,1.4rem)", color: "#f0e8d8", letterSpacing: "0.05em" }}>
              Welcome to the endless.
            </p>
          </div>
        </div>
      </section>

      {/* Sentinel — fires only after user scrolls past description */}
      <div ref={sentinelRef} style={{ height: "1px" }} />

      <style>{`
        @media (min-width: 640px)  { .hw-all-mobile-grid  { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (min-width: 1024px) { .hw-all-mobile-grid  { grid-template-columns: repeat(6, 1fr) !important; } }
        @media (min-width: 768px)  { .hw-all-desktop-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        .hw-wall-card:hover .hw-wall-card-img { transform: scale(1.05); }
        .hw-wall-card:hover { border-color: rgba(255,255,255,0.18) !important; box-shadow: 0 8px 32px rgba(0,0,0,0.6); }
        @keyframes hwDotPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); box-shadow: 0 0 8px rgba(192,0,26,0.6); }
        }
      `}</style>
    </main>
  );
}

function MobileCard({ img, priority }: { img: WallpaperItem; priority: boolean }) {
  const href = `/${img.deviceType === "IPHONE" ? "iphone" : "android"}/${img.slug}`;
  const isNew = img.tags.includes("badge-new");
  return (
    <Link href={href} className="hw-wall-card" style={{ position: "relative", display: "block", aspectRatio: "9/16", overflow: "hidden", borderRadius: "6px", background: "#0e0d1a", border: "1px solid rgba(255,255,255,0.06)", transition: "border-color 0.25s, box-shadow 0.25s" }}>
      <Image src={img.src} alt={img.title} fill unoptimized className="hw-wall-card-img" sizes="(max-width:640px) 33vw, (max-width:1024px) 25vw, 17vw" priority={priority} loading={priority ? "eager" : "lazy"} style={{ objectFit: "cover", transition: "transform 0.5s ease" }} />
      {isNew && <span style={{ position: "absolute", top: 6, left: 6, fontFamily: "var(--font-space, monospace)", fontSize: "0.48rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", background: "#4caf50", padding: "2px 5px", borderRadius: "2px", zIndex: 10 }}>NEW</span>}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 40%)", pointerEvents: "none" }} />
    </Link>
  );
}

function DesktopCard({ img, priority }: { img: WallpaperItem; priority: boolean }) {
  const isNew = img.tags.includes("badge-new");
  return (
    <Link href={`/pc/${img.slug}`} className="hw-wall-card" style={{ position: "relative", display: "block", aspectRatio: "16/9", overflow: "hidden", borderRadius: "6px", background: "#0e0d1a", border: "1px solid rgba(255,255,255,0.06)", transition: "border-color 0.25s, box-shadow 0.25s" }}>
      <Image src={img.src} alt={img.title} fill unoptimized className="hw-wall-card-img" sizes="(max-width:768px) 50vw, 33vw" priority={priority} loading={priority ? "eager" : "lazy"} style={{ objectFit: "cover", transition: "transform 0.5s ease" }} />
      {isNew && <span style={{ position: "absolute", top: 8, left: 8, fontFamily: "var(--font-space, monospace)", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", background: "#4caf50", padding: "2px 6px", borderRadius: "2px", zIndex: 10 }}>NEW</span>}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)", pointerEvents: "none" }} />
    </Link>
  );
}