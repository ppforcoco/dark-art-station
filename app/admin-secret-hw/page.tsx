"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Analytics {
  totalDownloads: number;
  todayDownloads: number;
  weekDownloads:  number;
  topWallpapers:   { title: string; downloads: number }[];
  topCollections:  { title: string; downloads: number }[];
  recentActivity:  { time: string; title: string }[];
}

interface Post {
  slug:      string;
  title:     string;
  label:     string;
  createdAt: string;
}

// ─── All labels ───────────────────────────────────────────────────────────────
const ALL_LABELS = [
  "Wallpaper Guides", "How-To & Tutorials", "Device Setup",
  "iPhone Wallpapers", "Android Wallpapers", "PC & Desktop Wallpapers",
  "Dark Aesthetics", "Gothic & Horror", "Dark Fantasy", "AMOLED Wallpapers",
  "Minimalist Dark", "Cyberpunk & Neon", "Halloween Special", "Seasonal Picks",
  "Top Lists", "New Releases", "Community Spotlights", "News & Updates",
  "Free Wallpapers", "4K Wallpapers", "Lock Screen Ideas",
];

// ─── Tag bank ─────────────────────────────────────────────────────────────────
const ALL_TAGS = [
  "dark", "gothic", "horror", "fantasy", "minimal", "amoled", "neon",
  "cyberpunk", "nature", "abstract", "skull", "moon", "forest", "city",
  "demon", "angel", "witch", "fire", "ice", "space", "ocean", "halloween",
  "anime", "street", "pattern", "texture", "portrait", "landscape",
];

// ─── Blog ideas ───────────────────────────────────────────────────────────────
const BLOG_IDEAS = [
  { title: "Best Dark Wallpapers for iPhone 16 Pro (4K Free Download)",      label: "iPhone Wallpapers",        reason: "💰 High CPC — matches product search" },
  { title: "How to Set a Wallpaper on iPhone 16 Step by Step",               label: "How-To & Tutorials",      reason: "💰 Tutorial = long session, more ad views" },
  { title: "How to Set a Wallpaper on Android (All Phones 2026)",            label: "How-To & Tutorials",      reason: "💰 Evergreen traffic, high volume" },
  { title: "Best AMOLED Wallpapers for Battery Saving in 2026",              label: "AMOLED Wallpapers",        reason: "💰 Tech audience = high CPC" },
  { title: "Top 20 Dark Aesthetic Wallpapers That Go Viral on Pinterest",    label: "Dark Aesthetics",          reason: "📌 Pinterest traffic = repeat visitors" },
  { title: "Best 4K Wallpapers for PC Desktop (Dark Theme)",                 label: "PC & Desktop Wallpapers",  reason: "💰 Desktop ads = higher CPM" },
  { title: "Gothic Wallpapers: 15 Free Downloads for Halloween 2026",        label: "Halloween Special",        reason: "🎃 Seasonal spike in October" },
  { title: "Dark Minimalist Wallpapers: Less Is More (Free 4K)",             label: "Minimalist Dark",          reason: "📈 Minimalist = growing trend" },
  { title: "What is an AMOLED Display? Why Your Wallpaper Matters",          label: "AMOLED Wallpapers",        reason: "💰 Explainer = long time on page" },
  { title: "Cyberpunk Wallpapers 2026: Best Neon Dark Backgrounds",          label: "Cyberpunk & Neon",         reason: "🔥 Trend content = social shares" },
  { title: "Best Dark Wallpapers for Lock Screen (iPhone & Android)",        label: "Lock Screen Ideas",        reason: "💰 High intent, specific keyword" },
  { title: "How to Make Your Own AI Wallpaper (Free Tools 2026)",            label: "How-To & Tutorials",      reason: "💡 AI content = very shareable" },
  { title: "Dark Fantasy Art Wallpapers: Free Collections Ranked",           label: "Dark Fantasy",             reason: "📈 Collection pages = lower bounce" },
  { title: "Best Horror Wallpapers for Halloween Season",                    label: "Gothic & Horror",          reason: "🎃 Seasonal + evergreen" },
  { title: "How to Use Dark Wallpapers to Boost Focus & Productivity",       label: "Dark Aesthetics",          reason: "💼 Unusual angle = low competition" },
];

const SEO_TIPS = [
  "✅ Title should be 50–60 chars with main keyword first",
  "✅ Meta description: 140–155 chars, include a call to action",
  "✅ Add at least 1 H2 for every 200 words of content",
  "✅ Target 800–1200 words per post for AdSense approval",
  "✅ Include the keyword in the URL slug (auto-filled from title)",
  "✅ Link to 2–3 of your other wallpaper pages in each post",
  "✅ Add alt text to every image with descriptive keywords",
  "✅ End every post with a CTA: 'Browse our free dark wallpapers'",
];

const ADSENSE_CHECKLIST = [
  { done: true,  item: "Original content — no copy-paste or AI spam" },
  { done: true,  item: "Privacy Policy page live" },
  { done: true,  item: "About page live" },
  { done: true,  item: "Contact page live" },
  { done: false, item: "At least 15–20 blog posts published (800+ words each)" },
  { done: false, item: "Consistent posting — 2–3 posts per week minimum" },
  { done: false, item: "Site is at least 3–6 months old with traffic history" },
  { done: false, item: "No broken links, 404s, or console errors" },
  { done: false, item: "Mobile responsive on all pages" },
  { done: false, item: "Google Search Console verified + sitemap submitted" },
  { done: false, item: "No misleading navigation or hidden text" },
  { done: false, item: "Clear site purpose — wallpaper downloads, clearly stated" },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", background: "transparent", border: "1px solid #2a2535",
  color: "#f0ecff", padding: "10px 12px", fontSize: "0.9rem",
  fontFamily: "monospace", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", color: "#6b6480", fontSize: "0.6rem",
  letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px",
};
const eyebrowStyle: React.CSSProperties = {
  color: "#6b6480", fontSize: "0.6rem", letterSpacing: "0.2em",
  textTransform: "uppercase", marginBottom: "12px",
};
const modeBtn: React.CSSProperties = {
  background: "transparent", border: "1px solid", padding: "3px 10px",
  cursor: "pointer", fontSize: "0.65rem", letterSpacing: "0.1em", fontFamily: "monospace",
};

// ─── Password Gate ────────────────────────────────────────────────────────────
function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw]           = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/hw-admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) { sessionStorage.setItem("hw-admin-auth", pw); onAuth(); }
      else setError("Wrong password.");
    } catch { setError("Network error. Try again."); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0b14", fontFamily: "monospace" }}>
      <div style={{ border: "1px solid #2a2535", padding: "40px", width: "360px", textAlign: "center" }}>
        <p style={{ color: "#c0001a", fontSize: "0.7rem", letterSpacing: "0.2em", marginBottom: "8px" }}>HAUNTED WALLPAPERS</p>
        <h1 style={{ color: "#f0ecff", fontSize: "1.4rem", marginBottom: "32px", fontWeight: 400 }}>Admin Access</h1>
        <input type="password" placeholder="Enter password" value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{ width: "100%", background: "transparent", border: "1px solid #2a2535", color: "#f0ecff", padding: "12px", fontSize: "1rem", marginBottom: "16px", fontFamily: "monospace", boxSizing: "border-box" }}
        />
        {error && <p style={{ color: "#c0001a", marginBottom: "12px", fontSize: "0.85rem" }}>{error}</p>}
        <button onClick={handleLogin} disabled={loading}
          style={{ width: "100%", background: "#c0001a", color: "#fff", border: "none", padding: "12px", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Checking…" : "Enter"}
        </button>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ password }: { password: string }) {
  const [data, setData]       = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hw-admin/analytics", { headers: { "x-admin-password": password } });
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch { setError("Could not load analytics."); }
    setLoading(false);
  }, [password]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p style={{ color: "#6b6480" }}>Loading analytics…</p>;
  if (error)   return <p style={{ color: "#c0001a" }}>{error}</p>;
  if (!data)   return null;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Downloads", value: data.totalDownloads.toLocaleString() },
          { label: "This Week",       value: data.weekDownloads.toLocaleString() },
          { label: "Today",           value: data.todayDownloads.toLocaleString() },
        ].map((s) => (
          <div key={s.label} style={{ border: "1px solid #2a2535", padding: "20px", textAlign: "center" }}>
            <p style={eyebrowStyle}>{s.label}</p>
            <p style={{ color: "#c0001a", fontSize: "2rem", fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        <div>
          <p style={eyebrowStyle}>Top Wallpapers</p>
          {data.topWallpapers.map((w, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1825", fontSize: "0.85rem" }}>
              <span style={{ color: "#f0ecff" }}>{w.title}</span>
              <span style={{ color: "#c0001a", fontWeight: 700 }}>{w.downloads}</span>
            </div>
          ))}
        </div>
        <div>
          <p style={eyebrowStyle}>Top Collections</p>
          {data.topCollections.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1825", fontSize: "0.85rem" }}>
              <span style={{ color: "#f0ecff" }}>{c.title}</span>
              <span style={{ color: "#c0001a", fontWeight: 700 }}>{c.downloads}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <p style={eyebrowStyle}>Recent Downloads</p>
        {data.recentActivity.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: "16px", padding: "8px 0", borderBottom: "1px solid #1a1825", fontSize: "0.8rem" }}>
            <span style={{ color: "#6b6480", flexShrink: 0 }}>{a.time}</span>
            <span style={{ color: "#f0ecff" }}>{a.title}</span>
          </div>
        ))}
      </div>

      <button onClick={load} style={{ background: "transparent", border: "1px solid #2a2535", color: "#8a8099", padding: "8px 20px", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.1em", marginBottom: "32px" }}>
        ↻ Refresh
      </button>

      <div style={{ border: "1px solid #2a2535", padding: "24px", marginBottom: "24px" }}>
        <p style={eyebrowStyle}>AdSense Approval Checklist</p>
        <p style={{ color: "#6b6480", fontSize: "0.78rem", marginBottom: "16px" }}>
          Tick these off before applying.
        </p>
        {ADSENSE_CHECKLIST.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", padding: "7px 0", borderBottom: "1px solid #1a1825", fontSize: "0.82rem" }}>
            <span style={{ color: item.done ? "#4caf50" : "#c0001a", flexShrink: 0 }}>{item.done ? "✅" : "☐"}</span>
            <span style={{ color: item.done ? "#a0e0a0" : "#c9c4dd" }}>{item.item}</span>
          </div>
        ))}
        <div style={{ marginTop: "16px", background: "#0e0c18", padding: "12px 16px", borderLeft: "3px solid #c0001a", fontSize: "0.8rem", color: "#8a8099" }}>
          💡 <strong style={{ color: "#ffd080" }}>Pro tip:</strong> Publish 20 high-quality blog posts (800+ words) over 6–8 weeks before applying.
        </div>
      </div>

      <div style={{ border: "1px solid #2a2535", padding: "20px" }}>
        <p style={eyebrowStyle}>Google Analytics 4</p>
        <p style={{ color: "#8a8099", fontSize: "0.85rem", marginBottom: "12px" }}>For traffic, bounce rate, and country breakdown.</p>
        <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", background: "#c0001a", color: "#fff", padding: "10px 20px", textDecoration: "none", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Open GA4 Dashboard →
        </a>
      </div>
    </div>
  );
}

// ─── Image Uploader Tab ───────────────────────────────────────────────────────
function ImageUploaderTab({ password }: { password: string }) {
  const [file, setFile]                   = useState<File | null>(null);
  const [preview, setPreview]             = useState<string>("");
  const [dragging, setDragging]           = useState(false);
  const [slug, setSlug]                   = useState("");
  const [title, setTitle]                 = useState("");
  const [altText, setAltText]             = useState("");
  const [deviceType, setDeviceType]       = useState<"IPHONE" | "ANDROID" | "PC" | "">("");
  const [selectedTags, setSelectedTags]   = useState<string[]>([]);
  const [collectionId, setCollectionId]   = useState("");
  const [uploading, setUploading]         = useState(false);
  const [generatingAlt, setGeneratingAlt] = useState(false);
  const [message, setMessage]             = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [uploadedUrl, setUploadedUrl]     = useState("");
  const dropRef                           = useRef<HTMLDivElement>(null);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  function slugify(name: string) {
    return name
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleFileSelect(f: File) {
    setFile(f);
    const autoSlug = slugify(f.name);
    setSlug(autoSlug);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
    const url = URL.createObjectURL(f);
    setPreview(url);
    setMessage(null);
    setUploadedUrl("");
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFileSelect(f);
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  async function handleGenerateAlt() {
    if (!file) return;
    setGeneratingAlt(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload  = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          system: "You are an SEO expert for a dark wallpaper website called Haunted Wallpapers. Generate a single alt text description for the image. It must be: exactly 130–150 characters, descriptive for SEO, include relevant dark/gothic keywords naturally, describe what is actually in the image, end without a period. Reply with ONLY the alt text, nothing else.",
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: base64 } },
              { type: "text",  text: "Write the alt text for this wallpaper image." },
            ],
          }],
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const generated = data.content?.[0]?.text?.trim() ?? "";
      if (generated) setAltText(generated);
    } catch {
      setMessage({ type: "err", text: "Could not generate alt text. Check your Anthropic API key." });
    }
    setGeneratingAlt(false);
  }

  async function handleUpload() {
    if (!file || !slug || !title) {
      setMessage({ type: "err", text: "File, slug, and title are required." });
      return;
    }
    setUploading(true); setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      form.append("title", title);
      form.append("altText", altText);
      form.append("tags", JSON.stringify(selectedTags));
      if (deviceType) form.append("deviceType", deviceType);
      if (collectionId.trim()) form.append("collectionId", collectionId.trim());

      const res = await fetch("/api/hw-admin/upload-image", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: form,
      });

      const json = await res.json();
      if (res.ok) {
        setUploadedUrl(json.url);
        setMessage({ type: "ok", text: `✓ Uploaded! Slug: ${json.slug}` });
        setFile(null); setPreview(""); setSlug(""); setTitle("");
        setAltText(""); setDeviceType(""); setSelectedTags([]); setCollectionId("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMessage({ type: "err", text: json.error ?? "Upload failed." });
      }
    } catch {
      setMessage({ type: "err", text: "Network error during upload." });
    }
    setUploading(false);
  }

  const altLen = altText.length;
  const altOk  = altLen >= 130 && altLen <= 150;
  const ext    = file?.name.split(".").pop() ?? "jpg";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      <div style={{ background: "#0e0c18", border: "1px solid #c0001a", padding: "14px 18px", fontSize: "0.82rem" }}>
        <strong style={{ color: "#ffd080" }}>📤 Image Uploader</strong>
        <span style={{ color: "#8a8099", marginLeft: "8px" }}>
          Drop an image → fill in details → upload to R2 + save to DB in one click. No manifest.json editing needed.
        </span>
      </div>

      {/* Drop Zone */}
      <div
        ref={dropRef}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "#c0001a" : file ? "#4caf50" : "#2a2535"}`,
          background: dragging ? "rgba(192,0,26,0.06)" : "#0a0812",
          padding: "40px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
        />

        {preview ? (
          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap" }}>
            <img src={preview} alt="Preview" style={{ maxHeight: "200px", maxWidth: "180px", objectFit: "contain", border: "1px solid #2a2535" }} />
            <div style={{ textAlign: "left" }}>
              <p style={{ color: "#4caf50", fontSize: "0.75rem", marginBottom: "6px" }}>✓ File ready</p>
              <p style={{ color: "#f0ecff", fontSize: "0.85rem", marginBottom: "4px" }}>{file?.name}</p>
              <p style={{ color: "#6b6480", fontSize: "0.75rem" }}>{file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : ""}</p>
              <p style={{ color: "#6b6480", fontSize: "0.72rem", marginTop: "8px" }}>Click to replace</p>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🖼️</p>
            <p style={{ color: "#f0ecff", fontSize: "0.95rem", marginBottom: "6px" }}>
              {dragging ? "Drop it!" : "Drag & drop your image here"}
            </p>
            <p style={{ color: "#6b6480", fontSize: "0.75rem" }}>or click to browse · JPG, PNG, WEBP · max 20 MB</p>
          </>
        )}
      </div>

      {file && (
        <>
          {/* Title + Slug */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Image Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Dark Gothic Forest Wallpaper"
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>URL Slug (auto-generated)</label>
              <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="dark-gothic-forest"
                style={inputStyle} />
            </div>
          </div>

          {/* Alt Text + AI button */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Alt Text (SEO){" "}
                <span style={{ color: altOk ? "#4caf50" : altLen > 0 ? "#ffd080" : "#6b6480" }}>
                  ({altLen}/150 chars{altOk ? " ✓" : " — aim for 130–150"})
                </span>
              </label>
              <button
                type="button"
                onClick={handleGenerateAlt}
                disabled={generatingAlt}
                style={{
                  background: generatingAlt ? "#1a1825" : "rgba(192,0,26,0.15)",
                  border: "1px solid rgba(192,0,26,0.5)",
                  color: generatingAlt ? "#6b6480" : "#f0ecff",
                  padding: "5px 14px",
                  cursor: generatingAlt ? "not-allowed" : "pointer",
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {generatingAlt ? "✨ Generating…" : "✨ AI Generate Alt Text"}
              </button>
            </div>
            <input
              value={altText}
              onChange={e => setAltText(e.target.value)}
              placeholder="Dark gothic forest wallpaper with moonlit trees and misty shadows — free 4K download"
              style={{ ...inputStyle, fontSize: "0.85rem" }}
            />
            <p style={{ color: "#6b6480", fontSize: "0.68rem", marginTop: "4px" }}>
              ℹ️ Click &quot;AI Generate Alt Text&quot; — Claude analyses your image and writes a perfect SEO alt tag automatically.
            </p>
          </div>

          {/* Device Type */}
          <div>
            <label style={labelStyle}>Device Type</label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {(["", "IPHONE", "ANDROID", "PC"] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDeviceType(d)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${deviceType === d ? "#c0001a" : "#2a2535"}`,
                    color: deviceType === d ? "#f0ecff" : "#6b6480",
                    padding: "8px 20px",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontFamily: "monospace",
                    transition: "all 0.15s",
                  }}
                >
                  {d === "" ? "Any" : d === "IPHONE" ? "📱 iPhone" : d === "ANDROID" ? "🤖 Android" : "🖥️ PC"}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>Tags ({selectedTags.length} selected)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    background: selectedTags.includes(tag) ? "rgba(192,0,26,0.2)" : "transparent",
                    border: `1px solid ${selectedTags.includes(tag) ? "#c0001a" : "#2a2535"}`,
                    color: selectedTags.includes(tag) ? "#f0ecff" : "#6b6480",
                    padding: "5px 12px",
                    cursor: "pointer",
                    fontSize: "0.65rem",
                    letterSpacing: "0.08em",
                    fontFamily: "monospace",
                    transition: "all 0.15s",
                  }}
                >
                  {selectedTags.includes(tag) ? "✓ " : ""}{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Collection ID */}
          <div>
            <label style={labelStyle}>Collection ID (optional)</label>
            <input
              value={collectionId}
              onChange={e => setCollectionId(e.target.value)}
              placeholder="Paste a Collection UUID to attach this image to a collection"
              style={{ ...inputStyle, fontSize: "0.82rem" }}
            />
          </div>

          {/* Upload Summary */}
          <div style={{ background: "#0a0812", border: "1px solid #2a2535", padding: "14px 16px", fontSize: "0.8rem" }}>
            <p style={eyebrowStyle}>Upload Summary</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {[
                { label: "R2 thumbnail key", value: `thumbnails/${slug}/${slug}.${ext}` },
                { label: "R2 high-res key",  value: `high-res/${slug}/${slug}.${ext}` },
                { label: "Device",           value: deviceType || "Any" },
                { label: "Tags",             value: selectedTags.join(", ") || "none" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", gap: "12px" }}>
                  <span style={{ color: "#6b6480", minWidth: "140px", flexShrink: 0 }}>{row.label}:</span>
                  <span style={{ color: "#c9c4dd", wordBreak: "break-all" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div style={{ padding: "12px 16px", border: `1px solid ${message.type === "ok" ? "#4caf50" : "#c0001a"}`, color: message.type === "ok" ? "#4caf50" : "#ffd080", fontSize: "0.85rem" }}>
              {message.text}
              {message.type === "ok" && uploadedUrl && (
                <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#4caf50", marginLeft: "12px" }}>
                  View on CDN →
                </a>
              )}
            </div>
          )}

          {/* Upload Button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            style={{
              background: uploading ? "#1a1825" : "#c0001a",
              color: "#fff",
              border: "none",
              padding: "14px 32px",
              cursor: uploading ? "not-allowed" : "pointer",
              fontSize: "0.8rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              opacity: uploading ? 0.7 : 1,
              alignSelf: "flex-start",
              fontFamily: "monospace",
              transition: "background 0.2s",
            }}
          >
            {uploading ? "Uploading to R2…" : "↑ Upload to R2 & Save to DB"}
          </button>
        </>
      )}
    </div>
  );
}

// ─── HTML Toolbar ─────────────────────────────────────────────────────────────
function HtmlToolbar({ onInsert }: { onInsert: (b: string, a: string) => void }) {
  const tools = [
    { label: "B",     title: "Bold",           before: "<strong>",  after: "</strong>" },
    { label: "I",     title: "Italic",          before: "<em>",      after: "</em>" },
    { label: "H2",    title: "Section Heading", before: "<h2>",      after: "</h2>" },
    { label: "H3",    title: "Sub-heading",     before: "<h3>",      after: "</h3>" },
    { label: "P",     title: "Paragraph",       before: "<p>",       after: "</p>" },
    { label: "🔗",    title: "Link",            before: '<a href="URL">', after: "</a>" },
    { label: "IMG",   title: "Image",           before: '<img src="YOUR-R2-URL.webp" alt="Describe image for SEO" style="width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:4px;margin:16px 0;" />', after: "" },
    { label: "UL",    title: "Bullet List",     before: "<ul>\n  <li>", after: "</li>\n</ul>" },
    { label: "OL",    title: "Numbered List",   before: "<ol>\n  <li>", after: "</li>\n</ol>" },
    { label: "HR",    title: "Divider",         before: '<hr style="border-color:#2a2535;margin:32px 0;" />', after: "" },
    { label: "QUOTE", title: "Blockquote",      before: '<blockquote style="border-left:3px solid #c0001a;margin:24px 0;padding:12px 20px;color:#c9c4dd;font-style:italic;">', after: "</blockquote>" },
    { label: "TABLE", title: "Table",           before: '<table style="width:100%;border-collapse:collapse;margin:24px 0;">\n<tr><th style="border:1px solid #2a2535;padding:10px;">Header 1</th><th style="border:1px solid #2a2535;padding:10px;">Header 2</th></tr>\n<tr><td style="border:1px solid #2a2535;padding:10px;">Cell 1</td><td style="border:1px solid #2a2535;padding:10px;">Cell 2</td></tr>', after: "\n</table>" },
    { label: "CTA",   title: "Call to Action",  before: '<div style="background:#1a0a0a;border:1px solid #c0001a;padding:20px 24px;margin:32px 0;text-align:center;">\n<p style="color:#f0ecff;margin-bottom:12px;">Ready to download? Browse our free 4K dark wallpapers.</p>\n<a href="/iphone" style="display:inline-block;background:#c0001a;color:#fff;padding:10px 24px;text-decoration:none;font-size:0.8rem;letter-spacing:0.1em;">Browse Wallpapers →</a>\n</div>', after: "" },
    { label: "FAQ",   title: "FAQ Section",     before: '<div style="margin:32px 0;">\n<h3>Frequently Asked Questions</h3>\n<details style="border:1px solid #2a2535;padding:12px 16px;margin-bottom:8px;">\n<summary style="cursor:pointer;color:#f0ecff;">Your question here?</summary>\n<p style="margin-top:10px;color:#c9c4dd;">Your answer here.</p>\n</details>', after: "\n</div>" },
    { label: "AD",    title: "Ad Slot",         before: '<div style="margin:32px 0;text-align:center;background:#1a1825;padding:20px;color:#6b6480;font-size:0.75rem;">[ Ad Slot — AdSense will render here ]</div>', after: "" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "8px" }}>
      {tools.map((t) => (
        <button key={t.label} title={t.title} type="button" onClick={() => onInsert(t.before, t.after)}
          style={{ background: "#1a1825", border: "1px solid #2a2535", color: "#c0a0ff", padding: "4px 10px", cursor: "pointer", fontSize: "0.7rem", fontFamily: "monospace", letterSpacing: "0.04em", borderRadius: "2px" }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Blog Ideas Tab ───────────────────────────────────────────────────────────
function BlogIdeasTab({ onUseIdea }: { onUseIdea: (title: string, label: string) => void }) {
  return (
    <div>
      <div style={{ background: "#0e0c18", border: "1px solid #c0001a", padding: "16px 20px", marginBottom: "24px", fontSize: "0.82rem" }}>
        <strong style={{ color: "#ffd080" }}>💡 AdSense Strategy:</strong>
        <span style={{ color: "#8a8099", marginLeft: "8px" }}>
          Write 2–3 posts per week. Focus on 💰 posts first — they drive the highest CPC.
        </span>
      </div>

      <div style={{ border: "1px solid #2a2535", padding: "20px", marginBottom: "28px" }}>
        <p style={eyebrowStyle}>SEO Checklist for Every Post</p>
        {SEO_TIPS.map((tip, i) => (
          <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid #1a1825", fontSize: "0.82rem", color: "#c9c4dd" }}>{tip}</div>
        ))}
      </div>

      <p style={eyebrowStyle}>Ready-to-Write Blog Ideas ({BLOG_IDEAS.length})</p>
      <p style={{ color: "#6b6480", fontSize: "0.78rem", marginBottom: "16px" }}>Click &quot;Use This&quot; to load it directly into the blog editor.</p>

      {BLOG_IDEAS.map((idea, i) => (
        <div key={i} style={{ border: "1px solid #2a2535", padding: "14px 16px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#f0ecff", fontSize: "0.88rem", marginBottom: "4px" }}>{idea.title}</p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ background: "#1a1825", border: "1px solid #2a2535", color: "#c0a0ff", padding: "2px 8px", fontSize: "0.65rem", letterSpacing: "0.08em" }}>{idea.label}</span>
              <span style={{ color: "#6b6480", fontSize: "0.72rem" }}>{idea.reason}</span>
            </div>
          </div>
          <button onClick={() => onUseIdea(idea.title, idea.label)}
            style={{ background: "#c0001a", border: "none", color: "#fff", padding: "7px 16px", cursor: "pointer", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0 }}>
            Use This →
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Blog Tab ─────────────────────────────────────────────────────────────────
function BlogTab({ password, prefillTitle, prefillLabel, onPrefillUsed }:
  { password: string; prefillTitle: string; prefillLabel: string; onPrefillUsed: () => void }) {

  const [title, setTitle]           = useState("");
  const [slug, setSlug]             = useState("");
  const [content, setContent]       = useState("");
  const [metaDesc, setMetaDesc]     = useState("");
  const [label, setLabel]           = useState("Wallpaper Guides");
  const [saving, setSaving]         = useState(false);
  const [message, setMessage]       = useState("");
  const [editorMode, setEditorMode] = useState<"html" | "preview">("html");
  const [posts, setPosts]           = useState<Post[]>([]);
  const [charCount, setCharCount]   = useState(0);
  const [wordCount, setWordCount]   = useState(0);
  const [lastSavedSlug, setLastSavedSlug] = useState("");

  // AI alt-text for blog images
  const [altImageUrl, setAltImageUrl]     = useState("");
  const [altImageFile, setAltImageFile]   = useState<File | null>(null);
  const [generatedAlt, setGeneratedAlt]   = useState("");
  const [generatingAlt, setGeneratingAlt] = useState(false);
  const altFileRef                        = useRef<HTMLInputElement>(null);
  const textareaRef                       = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (prefillTitle) {
      setTitle(prefillTitle);
      setSlug(prefillTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
      setLabel(prefillLabel);
      onPrefillUsed();
    }
  }, [prefillTitle, prefillLabel, onPrefillUsed]);

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/hw-admin/blogs", { headers: { "x-admin-password": password } });
      if (res.ok) { const j = await res.json(); setPosts(j.posts ?? []); }
    } catch {}
  }, [password]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  function handleTitleChange(val: string) {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  function handleContentChange(val: string) {
    setContent(val);
    const stripped = val.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    setCharCount(stripped.length);
    setWordCount(stripped ? stripped.split(" ").filter(Boolean).length : 0);
  }

  function handleInsert(before: string, after: string) {
    const el = textareaRef.current;
    if (!el) { setContent((c) => c + before + after); return; }
    const start = el.selectionStart, end = el.selectionEnd;
    const selected = content.slice(start, end);
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    handleContentChange(next);
    setTimeout(() => {
      el.focus();
      const pos = start + before.length + selected.length + after.length;
      el.setSelectionRange(pos, pos);
    }, 10);
  }

  async function handleGenerateBlogAlt() {
    if (!altImageFile && !altImageUrl) return;
    setGeneratingAlt(true); setGeneratedAlt("");
    try {
      let imagePayload: object;
      if (altImageFile) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload  = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(altImageFile);
        });
        imagePayload = { type: "base64", media_type: altImageFile.type, data: base64 };
      } else {
        imagePayload = { type: "url", url: altImageUrl };
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          system: "You are an SEO expert for a dark wallpaper website called Haunted Wallpapers. Generate a single alt text description for the image. It must be: exactly 130–150 characters, descriptive for SEO, include relevant dark/gothic keywords naturally, describe what is actually in the image, end without a period. Reply with ONLY the alt text, nothing else.",
          messages: [{
            role: "user",
            content: [
              { type: "image", source: imagePayload },
              { type: "text",  text: "Write the SEO alt text for this wallpaper." },
            ],
          }],
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setGeneratedAlt(data.content?.[0]?.text?.trim() ?? "Error — no text returned.");
    } catch {
      setGeneratedAlt("Error — check Anthropic API key in environment.");
    }
    setGeneratingAlt(false);
  }

  const starterTemplate = `<p>Write your intro here — 2 to 3 sentences that hook the reader and include your main keyword naturally.</p>\n\n<h2>Why These Wallpapers Stand Out</h2>\n<p>Explain the topic in detail. What makes these wallpapers special? Who are they for?</p>\n\n<img src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/YOUR-IMAGE.webp" alt="Dark aesthetic wallpaper free download" style="width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:4px;margin:16px 0;" />\n\n<h2>How to Download and Set Your Wallpaper</h2>\n<p>Step by step instructions here. Link to your wallpaper pages.</p>\n\n<ol>\n  <li>Browse our <a href="/iphone">iPhone wallpapers</a> or <a href="/android">Android wallpapers</a></li>\n  <li>Tap the image you love to open it</li>\n  <li>Hit the red Download Free button</li>\n  <li>Set it from your Photos app</li>\n</ol>\n\n<h2>Top Picks from Our Collection</h2>\n<p>Highlight 3–5 specific wallpapers from your site here. Internal links boost SEO.</p>\n\n<div style="background:#1a0a0a;border:1px solid #c0001a;padding:20px 24px;margin:32px 0;text-align:center;">\n<p style="color:#f0ecff;margin-bottom:12px;">Ready to download? Browse our full free 4K dark wallpaper collection.</p>\n<a href="/iphone" style="display:inline-block;background:#c0001a;color:#fff;padding:10px 24px;text-decoration:none;font-size:0.8rem;letter-spacing:0.1em;">Browse Wallpapers →</a>\n</div>\n\n<h2>Frequently Asked Questions</h2>\n<details style="border:1px solid #2a2535;padding:12px 16px;margin-bottom:8px;">\n<summary style="cursor:pointer;color:#f0ecff;">Are these wallpapers free?</summary>\n<p style="margin-top:10px;color:#c9c4dd;">Yes — every wallpaper on Haunted Wallpapers is completely free to download in 4K resolution. No account required.</p>\n</details>\n<details style="border:1px solid #2a2535;padding:12px 16px;margin-bottom:8px;">\n<summary style="cursor:pointer;color:#f0ecff;">What resolution are your wallpapers?</summary>\n<p style="margin-top:10px;color:#c9c4dd;">All wallpapers are available in 4K resolution, optimised for iPhone, Android, and PC screens.</p>\n</details>`;

  async function handlePublish() {
    if (!title || !slug || !content) { setMessage("Please fill in title, slug, and content."); return; }
    if (wordCount < 200) { setMessage("⚠️ Post is too short (" + wordCount + " words). Aim for 800+ words for AdSense."); return; }
    setSaving(true); setMessage("");
    try {
      const res = await fetch("/api/hw-admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ title, slug, content, label }),
      });
      if (res.ok) {
        setLastSavedSlug(slug);
        setMessage(`✓ Published! Live at /blog/${slug}`);
        setTitle(""); setSlug(""); setContent(""); setMetaDesc(""); setLabel("Wallpaper Guides");
        setCharCount(0); setWordCount(0);
        loadPosts();
      } else {
        const err = await res.json();
        setMessage(err.error ?? "Failed to publish.");
      }
    } catch { setMessage("Network error."); }
    setSaving(false);
  }

  async function handleDelete(s: string) {
    if (!confirm(`Delete "${s}"?`)) return;
    await fetch("/api/hw-admin/blogs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ slug: s }),
    });
    loadPosts();
  }

  const metaDescLen = metaDesc.length;
  const metaDescOk  = metaDescLen >= 140 && metaDescLen <= 155;
  const titleLen    = title.length;
  const titleOk     = titleLen >= 50 && titleLen <= 60;
  const wordCountOk = wordCount >= 800;

  return (
    <div>
      <p style={{ color: "#8a8099", fontSize: "0.82rem", marginBottom: "16px" }}>
        Posts go live at <strong style={{ color: "#f0ecff" }}>/blog/[slug]</strong> immediately. Aim for <strong style={{ color: "#c0a0ff" }}>800+ words</strong> per post.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        <div>
          <label style={labelStyle}>Title <span style={{ color: titleOk ? "#4caf50" : titleLen > 0 ? "#ffd080" : "#6b6480" }}>({titleLen}/60 chars{titleOk ? " ✓" : ""})</span></label>
          <input value={title} onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Best Dark Wallpapers for iPhone 16 (Free 4K Download)"
            style={inputStyle} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>URL Slug (auto-filled)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Label / Category</label>
            <select value={label} onChange={(e) => setLabel(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {ALL_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>
            Meta Description (SEO){" "}
            <span style={{ color: metaDescOk ? "#4caf50" : metaDescLen > 0 ? "#ffd080" : "#6b6480" }}>
              ({metaDescLen}/155 chars{metaDescOk ? " ✓" : " — aim for 140–155"})
            </span>
          </label>
          <input value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)}
            placeholder="Download free 4K dark wallpapers for iPhone. Gothic, horror, and dark fantasy art — no account needed."
            style={{ ...inputStyle, fontSize: "0.82rem" }} />
        </div>

        {/* ── AI Alt-Text Generator for Blog Images ── */}
        <div style={{ border: "1px solid #2a2535", padding: "16px 18px", background: "#0a0812" }}>
          <p style={eyebrowStyle}>✨ AI Alt-Text Generator for Blog Images</p>
          <p style={{ color: "#6b6480", fontSize: "0.75rem", marginBottom: "14px" }}>
            Upload or paste a URL for any image in your blog post. Claude will write a perfect 130–150 char SEO alt tag.
          </p>

          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "12px" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={labelStyle}>Image URL (from R2 CDN or any public URL)</label>
              <input
                value={altImageUrl}
                onChange={e => { setAltImageUrl(e.target.value); setAltImageFile(null); }}
                placeholder="https://pub-....r2.dev/thumbnails/..."
                style={{ ...inputStyle, fontSize: "0.8rem" }}
              />
            </div>
            <div style={{ color: "#6b6480", fontSize: "0.72rem", paddingBottom: "12px" }}>or</div>
            <div>
              <input ref={altFileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) { setAltImageFile(f); setAltImageUrl(""); } }} />
              <button type="button" onClick={() => altFileRef.current?.click()}
                style={{ background: "transparent", border: "1px solid #2a2535", color: altImageFile ? "#4caf50" : "#8a8099", padding: "10px 16px", cursor: "pointer", fontSize: "0.7rem", fontFamily: "monospace" }}>
                {altImageFile ? `✓ ${altImageFile.name.slice(0, 22)}` : "Upload image file"}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateBlogAlt}
            disabled={generatingAlt || (!altImageFile && !altImageUrl)}
            style={{
              background: generatingAlt ? "#1a1825" : "rgba(192,0,26,0.15)",
              border: "1px solid rgba(192,0,26,0.5)",
              color: generatingAlt ? "#6b6480" : "#f0ecff",
              padding: "8px 20px",
              cursor: (generatingAlt || (!altImageFile && !altImageUrl)) ? "not-allowed" : "pointer",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: "monospace",
              marginBottom: "12px",
            }}
          >
            {generatingAlt ? "✨ Analysing image…" : "✨ Generate Alt Text with AI"}
          </button>

          {generatedAlt && (
            <div style={{ background: "#0e0c18", border: "1px solid #4caf50", padding: "12px 14px" }}>
              <p style={{ color: "#4caf50", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>
                Generated ({generatedAlt.length} chars)
              </p>
              <p style={{ color: "#f0ecff", fontSize: "0.85rem", marginBottom: "10px" }}>{generatedAlt}</p>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(generatedAlt)}
                style={{ background: "transparent", border: "1px solid #2a2535", color: "#8a8099", padding: "4px 12px", cursor: "pointer", fontSize: "0.65rem", fontFamily: "monospace" }}
              >
                Copy to clipboard
              </button>
            </div>
          )}
        </div>

        {/* Content editor */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <label style={labelStyle}>
              Content (HTML){" "}
              <span style={{ color: wordCountOk ? "#4caf50" : wordCount > 0 ? "#ffd080" : "#6b6480" }}>
                — {wordCount} words{wordCountOk ? " ✓ Good for AdSense" : wordCount > 0 ? " (aim for 800+)" : ""}
              </span>
            </label>
            <div style={{ display: "flex", gap: "4px" }}>
              <button type="button" onClick={() => setEditorMode("html")} style={{ ...modeBtn, borderColor: editorMode === "html" ? "#c0001a" : "#2a2535", color: editorMode === "html" ? "#f0ecff" : "#6b6480" }}>HTML</button>
              <button type="button" onClick={() => setEditorMode("preview")} style={{ ...modeBtn, borderColor: editorMode === "preview" ? "#c0001a" : "#2a2535", color: editorMode === "preview" ? "#f0ecff" : "#6b6480" }}>Preview</button>
              {!content && (
                <button type="button" onClick={() => handleContentChange(starterTemplate)} style={{ ...modeBtn, borderColor: "#c0a0ff", color: "#c0a0ff" }}>
                  Insert Template
                </button>
              )}
            </div>
          </div>

          {editorMode === "html" ? (
            <>
              <HtmlToolbar onInsert={handleInsert} />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder={`<p>Your intro paragraph here.</p>\n\n<h2>Section Heading</h2>\n<p>Your content here.</p>`}
                rows={24}
                style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6", fontFamily: "monospace", fontSize: "0.8rem" }}
              />
            </>
          ) : (
            <div
              style={{ minHeight: "400px", border: "1px solid #2a2535", padding: "20px", background: "#08060f", color: "#f0ecff", lineHeight: "1.9", fontSize: "0.95rem" }}
              dangerouslySetInnerHTML={{ __html: content || "<p style='color:#6b6480'>Nothing to preview yet…</p>" }}
            />
          )}
        </div>

        {/* SEO quick-check */}
        {(title || content) && (
          <div style={{ border: "1px solid #2a2535", padding: "14px 16px", background: "#0a0812" }}>
            <p style={eyebrowStyle}>SEO Quick Check</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
              {[
                { ok: titleOk,                    label: `Title length (${titleLen} chars)` },
                { ok: metaDescOk,                 label: `Meta desc (${metaDescLen} chars)` },
                { ok: wordCountOk,                label: `Word count (${wordCount})` },
                { ok: content.includes("<h2>"),   label: "Has H2 heading" },
                { ok: content.includes("<img"),   label: "Has image" },
                { ok: content.includes('href="/'), label: "Internal links" },
                { ok: content.includes("alt="),   label: "Image alt text" },
              ].map((check, i) => (
                <span key={i} style={{ fontSize: "0.72rem", padding: "3px 8px", border: `1px solid ${check.ok ? "#4caf50" : "#3a2535"}`, color: check.ok ? "#4caf50" : "#6b6480", borderRadius: "2px" }}>
                  {check.ok ? "✓" : "○"} {check.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {message && (
          <p style={{ color: message.startsWith("✓") ? "#4caf50" : "#ffd080", fontSize: "0.85rem", padding: "10px", border: `1px solid ${message.startsWith("✓") ? "#4caf50" : "#c0001a"}` }}>
            {message}
            {message.startsWith("✓") && (
              <a href={`/blog/${lastSavedSlug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#4caf50", marginLeft: "12px" }}>
                View post →
              </a>
            )}
          </p>
        )}

        <button onClick={handlePublish} disabled={saving}
          style={{ background: "#c0001a", color: "#fff", border: "none", padding: "14px 28px", cursor: saving ? "not-allowed" : "pointer", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", opacity: saving ? 0.7 : 1, alignSelf: "flex-start" }}>
          {saving ? "Publishing…" : "Publish Blog Post"}
        </button>
      </div>

      {posts.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <p style={eyebrowStyle}>Published Posts ({posts.length})</p>
          {posts.map((p) => (
            <div key={p.slug} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1825", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ color: "#f0ecff", fontSize: "0.88rem" }}>{p.title}</span>
                <div style={{ display: "flex", gap: "8px", marginTop: "3px", alignItems: "center" }}>
                  <span style={{ background: "#1a1825", border: "1px solid #2a2535", color: "#c0a0ff", padding: "1px 6px", fontSize: "0.6rem" }}>{p.label}</span>
                  <span style={{ color: "#6b6480", fontSize: "0.72rem" }}>
                    {new Date(p.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexShrink: 0 }}>
                <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#c0001a", fontSize: "0.75rem", textDecoration: "none" }}>View →</a>
                <button onClick={() => handleDelete(p.slug)}
                  style={{ background: "transparent", border: "1px solid #3a2535", color: "#6b6480", cursor: "pointer", fontSize: "0.7rem", padding: "2px 8px" }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
type Tab = "analytics" | "upload" | "blog" | "ideas";

export default function AdminPage() {
  const [authed, setAuthed]             = useState(false);
  const [password, setPw]               = useState("");
  const [tab, setTab]                   = useState<Tab>("analytics");
  const [prefillTitle, setPrefillTitle] = useState("");
  const [prefillLabel, setPrefillLabel] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("hw-admin-auth");
    if (saved) { setPw(saved); setAuthed(true); }
  }, []);

  function handleAuth() {
    const saved = sessionStorage.getItem("hw-admin-auth") ?? "";
    setPw(saved); setAuthed(true);
  }

  function handleUseIdea(title: string, label: string) {
    setPrefillTitle(title);
    setPrefillLabel(label);
    setTab("blog");
  }

  if (!authed) return <PasswordGate onAuth={handleAuth} />;

  const TABS: { key: Tab; label: string }[] = [
    { key: "analytics", label: "📊 Analytics"   },
    { key: "upload",    label: "📤 Upload Image" },
    { key: "blog",      label: "✍️ Blog Posts"   },
    { key: "ideas",     label: "💡 Blog Ideas"   },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0c0b14", fontFamily: "monospace", color: "#f0ecff" }}>
      <div style={{ borderBottom: "1px solid #2a2535", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ color: "#c0001a", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Haunted Wallpapers</span>
          <span style={{ color: "#6b6480", marginLeft: "12px", fontSize: "0.9rem" }}>Admin</span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <a href="/blog" target="_blank" rel="noopener noreferrer" style={{ color: "#6b6480", fontSize: "0.72rem", textDecoration: "none" }}>View Blog →</a>
          <button onClick={() => { sessionStorage.removeItem("hw-admin-auth"); setAuthed(false); }}
            style={{ background: "transparent", border: "none", color: "#6b6480", cursor: "pointer", fontSize: "0.75rem" }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ borderBottom: "1px solid #2a2535", padding: "0 32px", display: "flex", overflowX: "auto" }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: "transparent", border: "none",
            borderBottom: tab === key ? "2px solid #c0001a" : "2px solid transparent",
            color: tab === key ? "#f0ecff" : "#6b6480",
            padding: "14px 24px", cursor: "pointer",
            fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "32px", maxWidth: "1100px" }}>
        {tab === "analytics" && <AnalyticsTab password={password} />}
        {tab === "upload"    && <ImageUploaderTab password={password} />}
        {tab === "blog"      && (
          <BlogTab
            password={password}
            prefillTitle={prefillTitle}
            prefillLabel={prefillLabel}
            onPrefillUsed={() => { setPrefillTitle(""); setPrefillLabel(""); }}
          />
        )}
        {tab === "ideas" && <BlogIdeasTab onUseIdea={handleUseIdea} />}
      </div>
    </div>
  );
}