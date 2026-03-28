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
  slug:          string;
  title:         string;
  label:         string;
  featuredImage?: string | null;
  createdAt:     string;
}

// ─── All labels ───────────────────────────────────────────────────────────────
const ALL_LABELS = [
  "Wallpaper Guides", "How-To & Tutorials", "Device Setup",
  "iPhone Wallpapers", "Android Wallpapers", "PC & Desktop Wallpapers",
  "Dark Aesthetics", "Gothic & Horror", "Dark Fantasy", "AMOLED Wallpapers",
  "Minimalist Dark", "Cyberpunk & Neon", "Halloween Special", "Seasonal Picks",
  "Top Lists", "New Releases", "Community Spotlights", "News & Updates",
  "Free Wallpapers", "HD Wallpapers", "Lock Screen Ideas",
  "16+ Mature Content",
];

// ─── Tag bank ─────────────────────────────────────────────────────────────────
const ALL_TAGS = [
  "dark", "gothic", "horror", "fantasy", "minimal", "amoled", "neon",
  "cyberpunk", "nature", "abstract", "skull", "moon", "forest", "city",
  "demon", "angel", "witch", "fire", "ice", "space", "ocean", "halloween",
  "anime", "street", "pattern", "texture", "portrait", "landscape",
  "skeleton", "smoke", "rose", "blood", "darkness", "void", "crimson",
  "black", "white", "aesthetic", "edgy", "rebel", "grunge", "punk", "metal",
  "vampire", "ghost", "reaper", "creepy", "mysterious", "shadow", "ethereal",
  "art", "illustration", "wallpaper", "phone", "lockscreen", "HD", "hd",
  "purple", "red", "green", "blue", "gold", "silver", "neon-green",
];

// ─── Blog ideas ───────────────────────────────────────────────────────────────
const BLOG_IDEAS = [
  { title: "Best Dark Wallpapers for iPhone 16 Pro (HD Free Download)",      label: "iPhone Wallpapers",        reason: "💰 High CPC — matches product search" },
  { title: "How to Set a Wallpaper on iPhone 16 Step by Step",               label: "How-To & Tutorials",      reason: "💰 Tutorial = long session, more ad views" },
  { title: "How to Set a Wallpaper on Android (All Phones 2026)",            label: "How-To & Tutorials",      reason: "💰 Evergreen traffic, high volume" },
  { title: "Best AMOLED Wallpapers for Battery Saving in 2026",              label: "AMOLED Wallpapers",        reason: "💰 Tech audience = high CPC" },
  { title: "Top 20 Dark Aesthetic Wallpapers That Go Viral on Pinterest",    label: "Dark Aesthetics",          reason: "📌 Pinterest traffic = repeat visitors" },
  { title: "Best HD Wallpapers for PC Desktop (Dark Theme)",                 label: "PC & Desktop Wallpapers",  reason: "💰 Desktop ads = higher CPM" },
  { title: "Gothic Wallpapers: 15 Free Downloads for Halloween 2026",        label: "Halloween Special",        reason: "🎃 Seasonal spike in October" },
  { title: "Dark Minimalist Wallpapers: Less Is More (Free HD)",             label: "Minimalist Dark",          reason: "📈 Minimalist = growing trend" },
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
  width: "100%", background: "transparent", border: "1px solid #d0cce0",
  color: "#1a1625", padding: "10px 12px", fontSize: "0.9rem",
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
  background: "#ffffff", border: "1px solid", padding: "3px 10px",
  cursor: "pointer", fontSize: "0.65rem", letterSpacing: "0.1em", fontFamily: "monospace",
};

// ─── 16+ Label Badge ──────────────────────────────────────────────────────────
function AdultBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  const isLg = size === "lg";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: isLg ? "6px" : "4px",
      background: "#c0001a",
      color: "#fff",
      fontFamily: "monospace",
      fontWeight: 900,
      fontSize: isLg ? "0.75rem" : "0.6rem",
      letterSpacing: isLg ? "0.08em" : "0.05em",
      padding: isLg ? "4px 12px" : "2px 7px",
      border: "1px solid #ff2040",
      textTransform: "uppercase",
    }}>
      ⚠ 16+
    </span>
  );
}

// ─── Claude Vision AI helper ─────────────────────────────────────────────────
async function fileToBase64(file: File): Promise<string> {
  const reader = new FileReader();
  return new Promise<string>((resolve, reject) => {
    reader.onload  = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function urlToBase64(url: string): Promise<{ data: string; mediaType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not fetch image from URL");
  const blob = await res.blob();
  const file = new File([blob], "image.jpg", { type: blob.type || "image/jpeg" });
  const data = await fileToBase64(file);
  return { data, mediaType: file.type };
}

interface ClaudeImageAnalysis {
  title: string;
  description: string;
  altText: string;
  tags: string[];
}

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL   = "claude-sonnet-4-6";

const ALL_TAG_LIST = [
  "dark","gothic","horror","fantasy","minimal","amoled","neon",
  "cyberpunk","nature","abstract","skull","moon","forest","city",
  "demon","angel","witch","fire","ice","space","ocean","halloween",
  "anime","street","pattern","texture","portrait","landscape",
];

async function analyzeImageWithClaude(
  base64: string,
  mediaType: string
): Promise<ClaudeImageAnalysis> {
  const prompt = `You are an SEO expert for "Haunted Wallpapers" — a dark gothic wallpaper website.

Analyze this wallpaper image and return a JSON object with exactly these fields:
{
  "title": "Compelling wallpaper title (4-8 words, descriptive, capitalize each word)",
  "description": "Detailed SEO description of this wallpaper (~200 words). Describe art style, mood, colors, atmosphere, what makes it unique. Write as flowing prose, not bullet points.",
  "altText": "Single alt text exactly 130-150 characters. Descriptive for SEO with dark/gothic keywords. NO period at end.",
  "tags": ["array", "of", "3-6", "relevant", "tags", "from", "the", "allowed", "list"]
}

Allowed tags (ONLY use from this list): ${ALL_TAG_LIST.join(", ")}

Rules:
- Title: no generic words like "wallpaper" or "background" — focus on the actual content
- Description: exactly ~200 words, flowing prose, SEO-rich
- AltText: MUST be 130-150 chars, check length carefully
- Tags: 3-6 tags only from the allowed list above

Return ONLY valid JSON, no markdown, no explanation.`;

  const res = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          { type: "text", text: prompt },
        ],
      }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Claude API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw  = data?.content?.[0]?.text?.trim() ?? "";
  if (!raw) throw new Error("Claude returned empty response. Try again.");

  try {
    const clean = raw.replace(/^```json\n?|```$/g, "").trim();
    return JSON.parse(clean) as ClaudeImageAnalysis;
  } catch {
    throw new Error("Claude response could not be parsed. Try again.");
  }
}

async function generateAltTextWithClaude(file: File): Promise<string> {
  const base64 = await fileToBase64(file);
  const result = await analyzeImageWithClaude(base64, file.type);
  return result.altText;
}

async function generateAltTextFromUrl(url: string): Promise<string> {
  const { data, mediaType } = await urlToBase64(url);
  const result = await analyzeImageWithClaude(data, mediaType);
  return result.altText;
}

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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f4fa", fontFamily: "monospace" }}>
      <div style={{ border: "1px solid #d0cce0", padding: "40px", width: "360px", textAlign: "center" }}>
        <p style={{ color: "#c0001a", fontSize: "0.7rem", letterSpacing: "0.2em", marginBottom: "8px" }}>HAUNTED WALLPAPERS</p>
        <h1 style={{ color: "#1a1625", fontSize: "1.4rem", marginBottom: "32px", fontWeight: 400 }}>Admin Access</h1>
        <input type="password" placeholder="Enter password" value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{ width: "100%", background: "#ffffff", border: "1px solid #d0cce0", color: "#1a1625", padding: "12px", fontSize: "1rem", marginBottom: "16px", fontFamily: "monospace", boxSizing: "border-box" }}
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
          <div key={s.label} style={{ border: "1px solid #d0cce0", padding: "20px", textAlign: "center" }}>
            <p style={eyebrowStyle}>{s.label}</p>
            <p style={{ color: "#c0001a", fontSize: "2rem", fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        <div>
          <p style={eyebrowStyle}>Top Wallpapers</p>
          {data.topWallpapers.map((w, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e8e4f0", fontSize: "0.85rem" }}>
              <span style={{ color: "#1a1625" }}>{w.title}</span>
              <span style={{ color: "#c0001a", fontWeight: 700 }}>{w.downloads}</span>
            </div>
          ))}
        </div>
        <div>
          <p style={eyebrowStyle}>Top Collections</p>
          {data.topCollections.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e8e4f0", fontSize: "0.85rem" }}>
              <span style={{ color: "#1a1625" }}>{c.title}</span>
              <span style={{ color: "#c0001a", fontWeight: 700 }}>{c.downloads}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <p style={eyebrowStyle}>Recent Downloads</p>
        {data.recentActivity.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: "16px", padding: "8px 0", borderBottom: "1px solid #e8e4f0", fontSize: "0.8rem" }}>
            <span style={{ color: "#6b6480", flexShrink: 0 }}>{a.time}</span>
            <span style={{ color: "#1a1625" }}>{a.title}</span>
          </div>
        ))}
      </div>

      <button onClick={load} style={{ background: "transparent", border: "1px solid #d0cce0", color: "#5a5070", padding: "8px 20px", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.1em", marginBottom: "32px" }}>
        ↻ Refresh
      </button>

      <div style={{ border: "1px solid #d0cce0", padding: "24px", marginBottom: "24px" }}>
        <p style={eyebrowStyle}>AdSense Approval Checklist</p>
        {ADSENSE_CHECKLIST.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", padding: "7px 0", borderBottom: "1px solid #e8e4f0", fontSize: "0.82rem" }}>
            <span style={{ color: item.done ? "#4caf50" : "#c0001a", flexShrink: 0 }}>{item.done ? "✅" : "☐"}</span>
            <span style={{ color: item.done ? "#a0e0a0" : "#c9c4dd" }}>{item.item}</span>
          </div>
        ))}
        <div style={{ marginTop: "16px", background: "#f8f8f8", padding: "12px 16px", borderLeft: "3px solid #c0001a", fontSize: "0.8rem", color: "#5a5070" }}>
          💡 <strong style={{ color: "#ffd080" }}>Pro tip:</strong> Publish 20 high-quality blog posts (800+ words) over 6–8 weeks before applying.
        </div>
      </div>

      <div style={{ border: "1px solid #d0cce0", padding: "20px" }}>
        <p style={eyebrowStyle}>Google Analytics 4</p>
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
  const [description, setDescription]     = useState("");
  const [deviceType, setDeviceType]       = useState<"IPHONE" | "ANDROID" | "PC" | "">("");
  const [selectedTags, setSelectedTags]   = useState<string[]>([]);
  const [customTags, setCustomTags]         = useState<string[]>([]);
  const [newTagInput, setNewTagInput]       = useState("");
  const [collectionId, setCollectionId]   = useState("");
  const [isAdult, setIsAdult]             = useState(false);
  const [descMode, setDescMode]           = useState<"html"|"preview">("html");
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

  async function handleGenerateAll() {
    if (!file) return;
    setGeneratingAlt(true);
    setMessage(null);
    try {
      const base64 = await fileToBase64(file);
      const result = await analyzeImageWithClaude(base64, file.type);
      if (result.title) { setTitle(result.title); setSlug(result.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }
      if (result.description) setDescription(result.description);
      if (result.altText) setAltText(result.altText);
      if (result.tags && result.tags.length) setSelectedTags(result.tags.filter(t => ALL_TAGS.includes(t)));
      setMessage({ type: "ok", text: "✓ Claude AI generated title, description, alt text & tags! Review and edit if needed." });
    } catch (err) {
      const msg = (err as Error).message;
      setMessage({ type: "err", text: `⚠ AI generation failed: ${msg} You can still fill in manually and upload.` });
    }
    setGeneratingAlt(false);
  }

  async function handleGenerateAlt() {
    if (!file) return;
    setGeneratingAlt(true);
    setMessage(null);
    try {
      const text = await generateAltTextWithClaude(file);
      setAltText(text);
      setMessage({ type: "ok", text: "✓ Alt text generated! Edit if needed, then upload." });
    } catch (err) {
      const msg = (err as Error).message;
      setMessage({ type: "err", text: `⚠ Alt text skipped: ${msg} You can still upload without it.` });
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
      form.append("description", description);
      form.append("tags", JSON.stringify(selectedTags));
      form.append("isAdult", String(isAdult));
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
        setFile(null); setPreview(""); setSlug(""); setTitle(""); setDescription("");
        setAltText(""); setDeviceType(""); setSelectedTags([]); setCollectionId(""); setIsAdult(false);
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
  const descWords = description.split(/\s+/).filter(Boolean).length;
  const descOk    = descWords >= 180 && descWords <= 220;
  const ext    = file?.name.split(".").pop() ?? "jpg";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      <div style={{ background: "#f8f8f8", border: "1px solid #c0001a", padding: "14px 18px", fontSize: "0.82rem" }}>
        <strong style={{ color: "#ffd080" }}>📤 Image Uploader</strong>
        <span style={{ color: "#5a5070", marginLeft: "8px" }}>
          Drop an image → fill in details → upload to R2 + save to DB in one click.
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
          border: `2px dashed ${dragging ? "#c0001a" : file ? "#4caf50" : "#d0cce0"}`,
          background: dragging ? "rgba(192,0,26,0.06)" : "#f8f8f8",
          padding: "40px 24px", textAlign: "center",
          cursor: "pointer", transition: "all 0.2s",
        }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />

        {preview ? (
          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap" }}>
            <img src={preview} alt="Preview" style={{ maxHeight: "200px", maxWidth: "180px", objectFit: "contain", border: "1px solid #d0cce0" }} />
            <div style={{ textAlign: "left" }}>
              <p style={{ color: "#4caf50", fontSize: "0.75rem", marginBottom: "6px" }}>✓ File ready</p>
              <p style={{ color: "#1a1625", fontSize: "0.85rem", marginBottom: "4px" }}>{file?.name}</p>
              <p style={{ color: "#6b6480", fontSize: "0.75rem" }}>{file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : ""}</p>
              <p style={{ color: "#6b6480", fontSize: "0.72rem", marginTop: "8px" }}>Click to replace</p>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🖼️</p>
            <p style={{ color: "#1a1625", fontSize: "0.95rem", marginBottom: "6px" }}>
              {dragging ? "Drop it!" : "Drag & drop your image here"}
            </p>
            <p style={{ color: "#6b6480", fontSize: "0.75rem" }}>or click to browse · JPG, PNG, WEBP · max 20 MB</p>
          </>
        )}
      </div>

      {file && (
        <>
          {/* AI Auto-Fill button */}
          <div style={{ background: "rgba(192,0,26,0.08)", border: "1px solid rgba(192,0,26,0.4)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <p style={{ color: "#ffd080", fontSize: "0.75rem", fontFamily: "monospace", marginBottom: "4px" }}>
                ✨ AI Auto-Fill (Claude Vision)
              </p>
              <p style={{ color: "#6b6480", fontSize: "0.68rem", fontFamily: "monospace" }}>
                Looks at your image and generates title, 200-word description, SEO alt text & tags automatically.
              </p>
            </div>
            <button type="button" onClick={handleGenerateAll} disabled={generatingAlt}
              style={{
                background: generatingAlt ? "#e8e4f0" : "#c0001a",
                border: "none", color: "#fff",
                padding: "10px 20px", cursor: generatingAlt ? "not-allowed" : "pointer",
                fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase",
                fontFamily: "monospace", whiteSpace: "nowrap", flexShrink: 0,
                opacity: generatingAlt ? 0.7 : 1, transition: "all 0.2s",
              }}>
              {generatingAlt ? "✨ Analysing with Claude…" : "✨ Generate All Fields"}
            </button>
          </div>

          {/* Title + Slug */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Image Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Dark Gothic Forest Wallpaper" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>URL Slug (auto-generated)</label>
              <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="dark-gothic-forest" style={inputStyle} />
            </div>
          </div>

          {/* Description — HTML Editor with Preview */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Description (SEO) — HTML{" "}
                <span style={{ color: descOk ? "#4caf50" : descWords > 0 ? "#ffd080" : "#6b6480" }}>
                  ({descWords} / 200 words{descOk ? " ✓" : " — aim for ~200 words"})
                </span>
              </label>
              <div style={{ display: "flex", gap: "4px" }}>
                <button type="button" onClick={() => setDescMode("html")}
                  style={{ background: descMode === "html" ? "#1a1625" : "transparent", border: "1px solid #d0cce0", color: descMode === "html" ? "#fff" : "#6b6480", padding: "3px 10px", cursor: "pointer", fontSize: "0.65rem", fontFamily: "monospace" }}>
                  HTML
                </button>
                <button type="button" onClick={() => setDescMode("preview")}
                  style={{ background: descMode === "preview" ? "#c0001a" : "transparent", border: "1px solid #d0cce0", color: descMode === "preview" ? "#fff" : "#6b6480", padding: "3px 10px", cursor: "pointer", fontSize: "0.65rem", fontFamily: "monospace" }}>
                  👁 Preview
                </button>
              </div>
            </div>

            {/* Quick format buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "4px" }}>
              {[
                { label: "<B>", wrap: ["<strong>", "</strong>"] },
                { label: "<I>", wrap: ["<em>", "</em>"] },
                { label: "<H2>", wrap: ["<h2>", "</h2>"] },
                { label: "<H3>", wrap: ["<h3 style='color:#c0001a'>", "</h3>"] },
                { label: "<P>", wrap: ["<p>", "</p>"] },
                { label: "<UL>", wrap: ["<ul>\n  <li>", "</li>\n</ul>"] },
                { label: "<SPAN red>", wrap: ["<span style='color:#c0001a'>", "</span>"] },
                { label: "<SPAN gold>", wrap: ["<span style='color:#c9a84c'>", "</span>"] },
                { label: "<BLOCKQUOTE>", wrap: ["<blockquote style='border-left:3px solid #c0001a;padding:8px 16px;margin:12px 0;font-style:italic;'>", "</blockquote>"] },
              ].map(({ label, wrap }) => {
                const descRef2 = document.getElementById("desc-textarea") as HTMLTextAreaElement | null;
                return (
                  <button key={label} type="button"
                    onClick={() => {
                      const el = document.getElementById("desc-textarea") as HTMLTextAreaElement | null;
                      if (!el) { setDescription(d => d + wrap[0] + wrap[1]); return; }
                      const start = el.selectionStart, end = el.selectionEnd;
                      const selected = description.slice(start, end);
                      const next = description.slice(0, start) + wrap[0] + selected + wrap[1] + description.slice(end);
                      setDescription(next);
                      setTimeout(() => { el.focus(); const pos = start + wrap[0].length + selected.length + wrap[1].length; el.setSelectionRange(pos, pos); }, 10);
                    }}
                    style={{ background: "#f0f0f0", border: "1px solid #d0cce0", color: "#7c3aed", padding: "3px 8px", cursor: "pointer", fontSize: "0.62rem", fontFamily: "monospace" }}>
                    {label}
                  </button>
                );
              })}
            </div>

            {descMode === "html" ? (
              <textarea
                id="desc-textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={"<h2>About This Wallpaper</h2>\n<p>Your description here...</p>"}
                rows={8}
                spellCheck={false}
                style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6", fontFamily: "monospace", fontSize: "0.8rem" }}
              />
            ) : (
              <div style={{
                minHeight: "200px", border: "1px solid #d0cce0", padding: "20px",
                background: "#08060f", lineHeight: "1.9", fontSize: "0.95rem", color: "#e8e4f8",
              }}
                dangerouslySetInnerHTML={{ __html: description || "<p style='color:#6b6480'>Nothing to preview yet…</p>" }}
              />
            )}
            <p style={{ color: "#6b6480", fontSize: "0.62rem", marginTop: "4px", fontFamily: "monospace" }}>
              ℹ HTML is saved and rendered on site. Use &lt;h2&gt;, &lt;strong&gt;, &lt;span style=&quot;color:#c0001a&quot;&gt; for bold headings and colors.
            </p>
          </div>

          {/* Alt Text */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Alt Text (SEO){" "}
                <span style={{ color: altOk ? "#4caf50" : altLen > 0 ? "#ffd080" : "#6b6480" }}>
                  ({altLen}/150 chars{altOk ? " ✓" : " — aim for 130–150"})
                </span>
              </label>
              <button type="button" onClick={handleGenerateAlt} disabled={generatingAlt}
                style={{
                  background: generatingAlt ? "#e8e4f0" : "rgba(192,0,26,0.10)",
                  border: "1px solid rgba(192,0,26,0.5)",
                  color: generatingAlt ? "#6b6480" : "#1a1625",
                  padding: "5px 14px", cursor: generatingAlt ? "not-allowed" : "pointer",
                  fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase",
                  fontFamily: "monospace", transition: "all 0.2s", whiteSpace: "nowrap",
                }}>
                {generatingAlt ? "✨ Analysing with Claude…" : "✨ AI Generate Alt Text (Claude)"}
              </button>
            </div>
            <input value={altText} onChange={e => setAltText(e.target.value)}
              placeholder="Dark gothic forest wallpaper with moonlit trees and misty shadows — free HD download"
              style={{ ...inputStyle, fontSize: "0.85rem" }} />
            <p style={{ color: "#6b6480", fontSize: "0.68rem", marginTop: "4px" }}>
              ℹ️ Powered by Claude AI (claude-sonnet). Alt text is optional — you can skip and upload without it.
            </p>
          </div>

          {/* 16+ mature themes toggle */}
          <div style={{
            border: `1px solid ${isAdult ? "#c0001a" : "#d0cce0"}`,
            padding: "14px 18px",
            background: isAdult ? "rgba(192,0,26,0.08)" : "transparent",
            transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <p style={{ ...eyebrowStyle, marginBottom: "4px" }}>
                  {isAdult ? <AdultBadge size="sm" /> : null}
                  {" "}16+ Adult / Mature Content
                </p>
                <p style={{ color: "#6b6480", fontSize: "0.72rem" }}>
                  Mark this image as mature themes. It will show the 16+ warning badge and require age confirmation before viewing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdult(!isAdult)}
                style={{
                  background: isAdult ? "#c0001a" : "transparent",
                  border: `1px solid ${isAdult ? "#c0001a" : "#d0cce0"}`,
                  color: isAdult ? "#fff" : "#6b6480",
                  padding: "8px 18px",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
              >
                {isAdult ? "✓ 16+ ON" : "Mark as 16+"}
              </button>
            </div>
          </div>

          {/* Device Type */}
          <div>
            <label style={labelStyle}>Device Type</label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {(["", "IPHONE", "ANDROID", "PC"] as const).map(d => (
                <button key={d} type="button" onClick={() => setDeviceType(d)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${deviceType === d ? "#c0001a" : "#d0cce0"}`,
                    color: deviceType === d ? "#1a1625" : "#6b6480",
                    padding: "8px 20px", cursor: "pointer",
                    fontSize: "0.7rem", letterSpacing: "0.1em",
                    textTransform: "uppercase", fontFamily: "monospace", transition: "all 0.15s",
                  }}>
                  {d === "" ? "Any" : d === "IPHONE" ? "📱 iPhone" : d === "ANDROID" ? "🤖 Android" : "🖥️ PC"}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>Tags ({selectedTags.length} selected)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {[...ALL_TAGS, ...customTags].map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  style={{
                    background: selectedTags.includes(tag) ? "rgba(192,0,26,0.2)" : "transparent",
                    border: `1px solid ${selectedTags.includes(tag) ? "#c0001a" : "#d0cce0"}`,
                    color: selectedTags.includes(tag) ? "#1a1625" : "#6b6480",
                    padding: "5px 12px", cursor: "pointer",
                    fontSize: "0.65rem", letterSpacing: "0.08em",
                    fontFamily: "monospace", transition: "all 0.15s",
                  }}>
                  {selectedTags.includes(tag) ? "✓ " : ""}{tag}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <input
                placeholder="Add custom tag…"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTagInput.trim()) {
                    const v = newTagInput.trim();
                    setCustomTags(prev => prev.includes(v) ? prev : [...prev, v]);
                    setSelectedTags(prev => prev.includes(v) ? prev : [...prev, v]);
                    setNewTagInput("");
                  }
                }}
                style={{ ...inputStyle, flex: 1, marginBottom: 0, fontSize: "0.75rem" }}
              />
              <button type="button" onClick={() => {
                if (!newTagInput.trim()) return;
                const v = newTagInput.trim();
                setCustomTags(prev => prev.includes(v) ? prev : [...prev, v]);
                setSelectedTags(prev => prev.includes(v) ? prev : [...prev, v]);
                setNewTagInput("");
              }} style={{ padding: "0 16px", background: "#c0001a", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                ADD TAG
              </button>
            </div>
          </div>

          {/* Collection ID */}
          <div>
            <label style={labelStyle}>Collection ID (optional)</label>
            <input value={collectionId} onChange={e => setCollectionId(e.target.value)}
              placeholder="Paste a Collection UUID to attach this image to a collection"
              style={{ ...inputStyle, fontSize: "0.82rem" }} />
            <p style={{ color: "#6b6480", fontSize: "0.65rem", marginTop: "4px" }}>
              Find it via: <code style={{ color: "#7c3aed" }}>npx prisma studio</code> → Collection table → copy the <code style={{ color: "#7c3aed" }}>id</code> field.
            </p>
          </div>

          {/* Upload Summary */}
          <div style={{ background: "#f0f0f0", border: "1px solid #d0cce0", padding: "14px 16px", fontSize: "0.8rem" }}>
            <p style={eyebrowStyle}>Upload Summary</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {[
                { label: "R2 thumbnail key", value: `thumbnails/${slug}/${slug}.${ext}` },
                { label: "R2 admin key",      value: `admin-wallpapers/${slug}/${slug}.${ext}` },
                { label: "Device",           value: deviceType || "Any" },
                { label: "Tags",             value: selectedTags.join(", ") || "none" },
                { label: "16+ Adult",        value: isAdult ? "⚠ YES" : "No" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", gap: "12px" }}>
                  <span style={{ color: "#6b6480", minWidth: "140px", flexShrink: 0 }}>{row.label}:</span>
                  <span style={{ color: row.label === "16+ Adult" && isAdult ? "#ff6b6b" : "#c9c4dd", wordBreak: "break-all" }}>{row.value}</span>
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
          <button type="button" onClick={handleUpload} disabled={uploading}
            style={{
              background: uploading ? "#e8e4f0" : "#c0001a",
              color: "#fff", border: "none",
              padding: "14px 32px", cursor: uploading ? "not-allowed" : "pointer",
              fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase",
              opacity: uploading ? 0.7 : 1, alignSelf: "flex-start",
              fontFamily: "monospace", transition: "background 0.2s",
            }}>
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
    { label: "CTA",   title: "Call to Action",  before: '<div style="background:#1a0a0a;border:1px solid #c0001a;padding:20px 24px;margin:32px 0;text-align:center;">\n<p style="color:#f0ecff;margin-bottom:12px;">Ready to download? Browse our free HD dark wallpapers.</p>\n<a href="/iphone" style="display:inline-block;background:#c0001a;color:#fff;padding:10px 24px;text-decoration:none;font-size:0.8rem;letter-spacing:0.1em;">Browse Wallpapers →</a>\n</div>', after: "" },
    { label: "16+",   title: "16+ Warning Banner", before: '<div style="display:flex;align-items:center;gap:12px;background:rgba(192,0,26,0.12);border:1px solid rgba(192,0,26,0.5);padding:14px 18px;margin:24px 0;">\n<span style="background:#c0001a;color:#fff;font-family:monospace;font-size:0.75rem;font-weight:900;padding:3px 10px;flex-shrink:0;">⚠ 16+</span>\n<p style="font-family:monospace;font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;color:#a89bc0;margin:0;">This content contains mature themes. intended for audiences 16 and over only.</p>\n</div>', after: "" },
    { label: "FAQ",   title: "FAQ Section",     before: '<div style="margin:32px 0;">\n<h3>Frequently Asked Questions</h3>\n<details style="border:1px solid #2a2535;padding:12px 16px;margin-bottom:8px;">\n<summary style="cursor:pointer;color:#f0ecff;">Your question here?</summary>\n<p style="margin-top:10px;color:#c9c4dd;">Your answer here.</p>\n</details>', after: "\n</div>" },
    { label: "AD",    title: "Ad Slot",         before: '<div style="margin:32px 0;text-align:center;background:#1a1825;padding:20px;color:#6b6480;font-size:0.75rem;">[ Ad Slot — AdSense will render here ]</div>', after: "" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "8px" }}>
      {tools.map((t) => (
        <button key={t.label} title={t.title} type="button" onClick={() => onInsert(t.before, t.after)}
          style={{
            background: t.label === "16+" ? "rgba(192,0,26,0.15)" : "#f0f0f0",
            border: t.label === "16+" ? "1px solid #c0001a" : "1px solid #d0cce0",
            color: t.label === "16+" ? "#ff8080" : "#c0a0ff",
            padding: "4px 10px", cursor: "pointer",
            fontSize: "0.7rem", fontFamily: "monospace",
            letterSpacing: "0.04em", borderRadius: "2px",
          }}>
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
      <div style={{ background: "#f8f8f8", border: "1px solid #c0001a", padding: "16px 20px", marginBottom: "24px", fontSize: "0.82rem" }}>
        <strong style={{ color: "#ffd080" }}>💡 AdSense Strategy:</strong>
        <span style={{ color: "#5a5070", marginLeft: "8px" }}>
          Write 2–3 posts per week. Focus on 💰 posts first — they drive the highest CPC.
        </span>
      </div>

      <div style={{ border: "1px solid #d0cce0", padding: "20px", marginBottom: "28px" }}>
        <p style={eyebrowStyle}>SEO Checklist for Every Post</p>
        {SEO_TIPS.map((tip, i) => (
          <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid #e8e4f0", fontSize: "0.82rem", color: "#5a5070" }}>{tip}</div>
        ))}
      </div>

      <p style={eyebrowStyle}>Ready-to-Write Blog Ideas ({BLOG_IDEAS.length})</p>

      {BLOG_IDEAS.map((idea, i) => (
        <div key={i} style={{ border: "1px solid #d0cce0", padding: "14px 16px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#1a1625", fontSize: "0.88rem", marginBottom: "4px" }}>{idea.title}</p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {idea.label === "16+ Mature Content" ? (
                <AdultBadge size="sm" />
              ) : (
                <span style={{ background: "#e8e4f0", border: "1px solid #d0cce0", color: "#7c3aed", padding: "2px 8px", fontSize: "0.65rem" }}>{idea.label}</span>
              )}
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
  const [customLabels, setCustomLabels] = useState<string[]>([]);
  const [newLabelInput, setNewLabelInput] = useState("");

  const [saving, setSaving]         = useState(false);
  const [message, setMessage]       = useState("");
  const [editorMode, setEditorMode] = useState<"html" | "preview">("html");
  const [posts, setPosts]           = useState<Post[]>([]);
  const [charCount, setCharCount]   = useState(0);
  const [wordCount, setWordCount]   = useState(0);
  const [lastSavedSlug, setLastSavedSlug] = useState("");

  const [altImageUrl, setAltImageUrl]     = useState("");
  const [altImageFile, setAltImageFile]   = useState<File | null>(null);
  const [generatedAlt, setGeneratedAlt]   = useState("");
  const [generatingAlt, setGeneratingAlt] = useState(false);
  const altFileRef                        = useRef<HTMLInputElement>(null);
  const textareaRef                       = useRef<HTMLTextAreaElement | null>(null);

  const isAdultLabel = label === "16+ Mature Content";

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
      let text: string;
      if (altImageFile) {
        text = await generateAltTextWithClaude(altImageFile);
      } else {
        text = await generateAltTextFromUrl(altImageUrl);
      }
      setGeneratedAlt(text);
    } catch (err) {
      setGeneratedAlt(`Error: ${(err as Error).message}`);
    }
    setGeneratingAlt(false);
  }

  const starterTemplate = `<p>Write your intro here — 2 to 3 sentences that hook the reader and include your main keyword naturally.</p>\n\n<h2>Why These Wallpapers Stand Out</h2>\n<p>Explain the topic in detail. What makes these wallpapers special? Who are they for?</p>\n\n<img src="https://assets.hauntedwallpapers.com/thumbnails/YOUR-IMAGE.jpeg" alt="Dark aesthetic wallpaper free download" style="width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:4px;margin:16px 0;" />\n\n<h2>How to Download and Set Your Wallpaper</h2>\n<p>Step by step instructions here.</p>\n\n<ol>\n  <li>Browse our <a href="/iphone">iPhone wallpapers</a> or <a href="/android">Android wallpapers</a></li>\n  <li>Tap the image you love to open it</li>\n  <li>Hit the red Download Free button</li>\n  <li>Set it from your Photos app</li>\n</ol>\n\n<h2>Top Picks from Our Collection</h2>\n<p>Highlight 3–5 specific wallpapers from your site here.</p>\n\n<div style="background:#1a0a0a;border:1px solid #c0001a;padding:20px 24px;margin:32px 0;text-align:center;">\n<p style="color:#f0ecff;margin-bottom:12px;">Ready to download? Browse our full free HD dark wallpaper collection.</p>\n<a href="/iphone" style="display:inline-block;background:#c0001a;color:#fff;padding:10px 24px;text-decoration:none;font-size:0.8rem;letter-spacing:0.1em;">Browse Wallpapers →</a>\n</div>\n\n<h2>Frequently Asked Questions</h2>\n<details style="border:1px solid #2a2535;padding:12px 16px;margin-bottom:8px;">\n<summary style="cursor:pointer;color:#f0ecff;">Are these wallpapers free?</summary>\n<p style="margin-top:10px;color:#c9c4dd;">Yes — every wallpaper on Haunted Wallpapers is completely free to download in HD resolution. No account required.</p>\n</details>`;

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
      <p style={{ color: "#5a5070", fontSize: "0.82rem", marginBottom: "16px" }}>
        Posts go live at <strong style={{ color: "#1a1625" }}>/blog/[slug]</strong> immediately. Aim for <strong style={{ color: "#7c3aed" }}>800+ words</strong> per post.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        <div>
          <label style={labelStyle}>Title <span style={{ color: titleOk ? "#4caf50" : titleLen > 0 ? "#ffd080" : "#6b6480" }}>({titleLen}/60 chars{titleOk ? " ✓" : ""})</span></label>
          <input value={title} onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Best Dark Wallpapers for iPhone 16 (Free HD Download)"
            style={inputStyle} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>URL Slug (auto-filled)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Label / Category</label>
            <select value={label} onChange={(e) => setLabel(e.target.value)}
              style={{
                ...inputStyle, cursor: "pointer",
                ...(isAdultLabel ? { borderColor: "#c0001a", color: "#ff6b6b" } : {}),
              }}>
              {[...ALL_LABELS, ...customLabels].map((l) => <option key={l} value={l}>{l}</option>)}
              <option value="__add_new__">+ Add new label…</option>
            </select>
            {label === "__add_new__" && (
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <input
                  autoFocus
                  placeholder="Type new label name…"
                  value={newLabelInput}
                  onChange={(e) => setNewLabelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newLabelInput.trim()) {
                      const v = newLabelInput.trim();
                      setCustomLabels(prev => [...prev, v]);
                      setLabel(v);
                      setNewLabelInput("");
                    }
                  }}
                  style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                />
                <button type="button" onClick={() => {
                  if (!newLabelInput.trim()) return;
                  const v = newLabelInput.trim();
                  setCustomLabels(prev => [...prev, v]);
                  setLabel(v);
                  setNewLabelInput("");
                }} style={{ padding: "0 16px", background: "#c0001a", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                  ADD
                </button>
              </div>
            )}

            {isAdultLabel && (
              <div style={{
                marginTop: "8px",
                background: "rgba(192,0,26,0.1)",
                border: "1px solid rgba(192,0,26,0.5)",
                padding: "10px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <AdultBadge size="lg" />
                  <span style={{ color: "#ff8080", fontSize: "0.7rem", fontFamily: "monospace", letterSpacing: "0.1em" }}>
                    Mature Content — Blog Post
                  </span>
                </div>
                <p style={{ color: "#5a5070", fontSize: "0.65rem", fontFamily: "monospace", letterSpacing: "0.06em", margin: 0, lineHeight: 1.6 }}>
                  This post will be labelled 16+ Mature Content across the site.
                </p>
              </div>
            )}
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
            placeholder="Download free HD dark wallpapers for iPhone. Gothic, horror, and dark fantasy art — no account needed."
            style={{ ...inputStyle, fontSize: "0.82rem" }} />
        </div>

        {/* AI Alt-Text Generator for Blog Images */}
        <div style={{ border: "1px solid #d0cce0", padding: "16px 18px", background: "#f0f0f0" }}>
          <p style={eyebrowStyle}>✨ AI Alt-Text Generator for Blog Images (Claude)</p>
          <p style={{ color: "#6b6480", fontSize: "0.75rem", marginBottom: "14px" }}>
            Upload or paste a URL for any image in your blog post. Claude Vision AI will write a perfect 130–150 char SEO alt tag.
          </p>

          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "12px" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={labelStyle}>Image URL (from R2 CDN or any public URL)</label>
              <input
                value={altImageUrl}
                onChange={e => { setAltImageUrl(e.target.value); setAltImageFile(null); }}
                placeholder="https://assets.hauntedwallpapers.com/thumbnails/..."
                style={{ ...inputStyle, fontSize: "0.8rem" }}
              />
            </div>
            <div style={{ color: "#6b6480", fontSize: "0.72rem", paddingBottom: "12px" }}>or</div>
            <div>
              <input ref={altFileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) { setAltImageFile(f); setAltImageUrl(""); } }} />
              <button type="button" onClick={() => altFileRef.current?.click()}
                style={{ background: "transparent", border: "1px solid #d0cce0", color: altImageFile ? "#4caf50" : "#8a8099", padding: "10px 16px", cursor: "pointer", fontSize: "0.7rem", fontFamily: "monospace" }}>
                {altImageFile ? `✓ ${altImageFile.name.slice(0, 22)}` : "Upload image file"}
              </button>
            </div>
          </div>

          <button type="button" onClick={handleGenerateBlogAlt}
            disabled={generatingAlt || (!altImageFile && !altImageUrl)}
            style={{
              background: generatingAlt ? "#e8e4f0" : "rgba(192,0,26,0.10)",
              border: "1px solid rgba(192,0,26,0.5)",
              color: generatingAlt ? "#6b6480" : "#1a1625",
              padding: "8px 20px",
              cursor: (generatingAlt || (!altImageFile && !altImageUrl)) ? "not-allowed" : "pointer",
              fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase",
              fontFamily: "monospace", marginBottom: "12px",
            }}>
            {generatingAlt ? "✨ Analysing image with Claude…" : "✨ Generate Alt Text with Claude"}
          </button>

          {generatedAlt && (
            <div style={{ background: "#f8f8f8", border: "1px solid #4caf50", padding: "12px 14px" }}>
              <p style={{ color: "#4caf50", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>
                Generated ({generatedAlt.length} chars)
              </p>
              <p style={{ color: "#1a1625", fontSize: "0.85rem", marginBottom: "10px" }}>{generatedAlt}</p>
              <button type="button" onClick={() => navigator.clipboard.writeText(generatedAlt)}
                style={{ background: "transparent", border: "1px solid #d0cce0", color: "#5a5070", padding: "4px 12px", cursor: "pointer", fontSize: "0.65rem", fontFamily: "monospace" }}>
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
              <button type="button" onClick={() => setEditorMode("html")} style={{ ...modeBtn, borderColor: editorMode === "html" ? "#c0001a" : "#d0cce0", color: editorMode === "html" ? "#1a1625" : "#6b6480" }}>HTML</button>
              <button type="button" onClick={() => setEditorMode("preview")} style={{ ...modeBtn, borderColor: editorMode === "preview" ? "#c0001a" : "#d0cce0", color: editorMode === "preview" ? "#1a1625" : "#6b6480" }}>Preview</button>
              {!content && (
                <button type="button" onClick={() => handleContentChange(starterTemplate)} style={{ ...modeBtn, borderColor: "#c0a0ff", color: "#7c3aed" }}>
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
              style={{ minHeight: "400px", border: "1px solid #d0cce0", padding: "20px", background: "#08060f", color: "#1a1625", lineHeight: "1.9", fontSize: "0.95rem" }}
              dangerouslySetInnerHTML={{ __html: content || "<p style='color:#6b6480'>Nothing to preview yet…</p>" }}
            />
          )}
        </div>

        {/* SEO quick-check */}
        {(title || content) && (
          <div style={{ border: "1px solid #d0cce0", padding: "14px 16px", background: "#f0f0f0" }}>
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

      {/* Published posts list */}
      {posts.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <p style={eyebrowStyle}>Published Posts ({posts.length})</p>
          {posts.map((p) => (
            <div key={p.slug} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #e8e4f0", gap: "12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ color: "#1a1625", fontSize: "0.88rem" }}>{p.title}</span>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px", alignItems: "center", flexWrap: "wrap" }}>
                  {p.label === "16+ Mature Content" ? (
                    <AdultBadge size="sm" />
                  ) : (
                    <span style={{ background: "#e8e4f0", border: "1px solid #d0cce0", color: "#7c3aed", padding: "1px 6px", fontSize: "0.6rem" }}>{p.label}</span>
                  )}
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

// ─── Manage 16+ Tab ───────────────────────────────────────────────────────────
const ADULT_IMAGES_TO_MARK = [
  { title: "Sweet Screams Hoodie",     device: "ANDROID", note: "Mark as 16+ Adult" },
  { title: "Skeletal King Defiance",   device: "ANDROID", note: "Mark as 16+ Adult" },
  { title: "Gangster Skull",           device: "PC",      note: "Mark as 16+ Adult" },
  { title: "Gangster Skeleton Smoking",device: "PC",      note: "Mark as 16+ Adult" },
  { title: "Thug Skeleton Smoking",    device: "PC",      note: "Mark as 16+ Adult" },
  { title: "Rebel Skeleton Smoking",   device: "PC",      note: "Mark as 16+ Adult" },
];

function Manage18Tab({ password }: { password: string }) {
  const [results, setResults]   = useState<Record<string, { status: string; msg: string }>>({});
  const [loading, setLoading]   = useState<Record<string, boolean>>({});
  const [allDone, setAllDone]   = useState(false);

  async function markAdult(title: string) {
    setLoading(prev => ({ ...prev, [title]: true }));
    try {
      const res = await fetch("/api/hw-admin/mark-adult", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ title }),
      });
      const json = await res.json();
      if (res.ok) {
        setResults(prev => ({ ...prev, [title]: { status: "ok", msg: `✓ Marked 16+ (${json.updated} image${json.updated !== 1 ? "s" : ""} updated)` } }));
      } else {
        setResults(prev => ({ ...prev, [title]: { status: "err", msg: json.error ?? "Failed" } }));
      }
    } catch {
      setResults(prev => ({ ...prev, [title]: { status: "err", msg: "Network error" } }));
    }
    setLoading(prev => ({ ...prev, [title]: false }));
  }

  async function markAll() {
    setAllDone(false);
    for (const item of ADULT_IMAGES_TO_MARK) {
      await markAdult(item.title);
      await new Promise(r => setTimeout(r, 300));
    }
    setAllDone(true);
  }

  const doneCount = Object.values(results).filter(r => r.status === "ok").length;

  return (
    <div>
      <div style={{ background: "rgba(192,0,26,0.08)", border: "1px solid rgba(192,0,26,0.5)", padding: "14px 18px", marginBottom: "24px" }}>
        <p style={{ color: "#ffd080", fontSize: "0.78rem", fontFamily: "monospace", marginBottom: "6px" }}>
          ⚠ 16+ Content Manager
        </p>
        <p style={{ color: "#5a5070", fontSize: "0.72rem", fontFamily: "monospace" }}>
          Mark images as 16+ mature themes. This searches by title (partial match) and sets <code style={{ color: "#7c3aed" }}>isAdult: true</code> in the database.
        </p>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <button onClick={markAll}
          style={{ background: "#c0001a", border: "none", color: "#fff", padding: "10px 24px", cursor: "pointer", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>
          ⚠ Mark All 6 as 16+
        </button>
        {doneCount > 0 && (
          <span style={{ color: "#4caf50", fontSize: "0.75rem", fontFamily: "monospace" }}>
            ✓ {doneCount} / {ADULT_IMAGES_TO_MARK.length} done
          </span>
        )}
        {allDone && (
          <span style={{ color: "#4caf50", fontSize: "0.75rem", fontFamily: "monospace" }}>
            ✓ All marked!
          </span>
        )}
      </div>

      <p style={eyebrowStyle}>Images to Mark ({ADULT_IMAGES_TO_MARK.length})</p>

      {ADULT_IMAGES_TO_MARK.map((item) => {
        const res = results[item.title];
        const isLoading = loading[item.title];
        return (
          <div key={item.title} style={{ border: `1px solid ${res?.status === "ok" ? "#4caf50" : res?.status === "err" ? "#c0001a" : "#d0cce0"}`, padding: "14px 16px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <p style={{ color: "#1a1625", fontSize: "0.9rem", marginBottom: "4px" }}>{item.title}</p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ background: "#e8e4f0", border: "1px solid #d0cce0", color: "#7c3aed", padding: "2px 8px", fontSize: "0.62rem", fontFamily: "monospace" }}>
                  {item.device}
                </span>
                <AdultBadge size="sm" />
                {res && (
                  <span style={{ color: res.status === "ok" ? "#4caf50" : "#ff8080", fontSize: "0.72rem", fontFamily: "monospace" }}>
                    {res.msg}
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => markAdult(item.title)} disabled={isLoading || res?.status === "ok"}
              style={{
                background: res?.status === "ok" ? "transparent" : isLoading ? "#e8e4f0" : "rgba(192,0,26,0.15)",
                border: `1px solid ${res?.status === "ok" ? "#4caf50" : "#c0001a"}`,
                color: res?.status === "ok" ? "#4caf50" : isLoading ? "#6b6480" : "#1a1625",
                padding: "7px 16px", cursor: (isLoading || res?.status === "ok") ? "not-allowed" : "pointer",
                fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase",
                fontFamily: "monospace", flexShrink: 0,
              }}>
              {res?.status === "ok" ? "✓ Done" : isLoading ? "Updating…" : "Mark 16+"}
            </button>
          </div>
        );
      })}

      <div style={{ marginTop: "32px", border: "1px solid #d0cce0", padding: "16px 18px", background: "#f0f0f0" }}>
        <p style={eyebrowStyle}>Mark Any Image by Title</p>
        <ManualMarkAdult password={password} />
      </div>
    </div>
  );
}

function ManualMarkAdult({ password }: { password: string }) {
  const [titleInput, setTitleInput] = useState("");
  const [result, setResult]         = useState<{ status: string; msg: string } | null>(null);
  const [loading, setLoading]       = useState(false);

  async function handle() {
    if (!titleInput.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/hw-admin/mark-adult", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ title: titleInput.trim() }),
      });
      const json = await res.json();
      if (res.ok) setResult({ status: "ok", msg: `✓ Marked 16+ (${json.updated} image${json.updated !== 1 ? "s" : ""} updated)` });
      else setResult({ status: "err", msg: json.error ?? "Failed" });
    } catch { setResult({ status: "err", msg: "Network error" }); }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: "200px" }}>
        <label style={labelStyle}>Search by title (partial match)</label>
        <input value={titleInput} onChange={e => setTitleInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handle()}
          placeholder="e.g. Skull King"
          style={inputStyle} />
      </div>
      <button onClick={handle} disabled={loading}
        style={{ background: "#c0001a", border: "none", color: "#fff", padding: "10px 18px", cursor: loading ? "not-allowed" : "pointer", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Updating…" : "Mark 16+"}
      </button>
      {result && (
        <span style={{ color: result.status === "ok" ? "#4caf50" : "#ff8080", fontSize: "0.78rem", fontFamily: "monospace" }}>
          {result.msg}
        </span>
      )}
    </div>
  );
}

// ─── Backdate Tab ─────────────────────────────────────────────────────────────
function BackdateTab({ password }: { password: string }) {
  const [posts, setPosts]     = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // date assignments — slug → ISO date string
  const [dates, setDates] = useState<Record<string, string>>({});

  // featured image editing — slug → url string
  const [thumbEditing, setThumbEditing] = useState<string | null>(null); // which slug is open
  const [thumbUrl, setThumbUrl]         = useState<string>("");
  const [thumbSaving, setThumbSaving]   = useState(false);

  async function handleSaveThumb(slug: string) {
    setThumbSaving(true);
    try {
      const res = await fetch("/api/hw-admin/blogs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ slug, featuredImage: thumbUrl.trim() || null }),
      });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.slug === slug ? { ...p, featuredImage: thumbUrl.trim() || null } : p));
        setMessage({ type: "ok", text: `✓ Thumbnail saved for "${slug}"` });
        setThumbEditing(null);
        setThumbUrl("");
      } else {
        const j = await res.json();
        setMessage({ type: "err", text: j.error ?? "Failed to save thumbnail." });
      }
    } catch {
      setMessage({ type: "err", text: "Network error." });
    }
    setThumbSaving(false);
  }

  // Suggested spread: March 10 → March 26, evenly spaced
  function suggestDates(slugList: string[]) {
    const start = new Date("2026-03-10T10:00:00Z");
    const end   = new Date("2026-03-26T18:00:00Z");
    const range = end.getTime() - start.getTime();
    const step  = slugList.length > 1 ? range / (slugList.length - 1) : 0;
    const map: Record<string, string> = {};
    slugList.forEach((slug, i) => {
      const d = new Date(start.getTime() + step * i);
      map[slug] = d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
    });
    return map;
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/hw-admin/blogs", { headers: { "x-admin-password": password } });
        if (res.ok) {
          const j = await res.json();
          const postList: Post[] = j.posts ?? [];
          setPosts(postList);
          // Pre-fill dates with suggested spread
          setDates(suggestDates(postList.map((p) => p.slug)));
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [password]);

  async function handleApplyAll() {
    setSaving(true); setMessage(null);
    const updates = posts.map((p) => ({
      slug: p.slug,
      createdAt: new Date(dates[p.slug] ?? p.createdAt).toISOString(),
    }));
    try {
      const res = await fetch("/api/hw-admin/blogs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ updates }),
      });
      const json = await res.json();
      if (res.ok || res.status === 207) {
        const failed = (json.results ?? []).filter((r: { ok: boolean }) => !r.ok);
        if (failed.length === 0) {
          setMessage({ type: "ok", text: `✓ All ${updates.length} posts backdated successfully!` });
        } else {
          setMessage({ type: "err", text: `⚠ ${failed.length} post(s) failed. Others updated.` });
        }
      } else {
        setMessage({ type: "err", text: json.error ?? "Failed to backdate." });
      }
    } catch {
      setMessage({ type: "err", text: "Network error." });
    }
    setSaving(false);
  }

  async function handleSingleDate(slug: string) {
    setSaving(true); setMessage(null);
    try {
      const res = await fetch("/api/hw-admin/blogs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ slug, createdAt: new Date(dates[slug]).toISOString() }),
      });
      const json = await res.json();
      if (res.ok) setMessage({ type: "ok", text: `✓ "${slug}" backdated.` });
      else setMessage({ type: "err", text: json.error ?? "Failed." });
    } catch {
      setMessage({ type: "err", text: "Network error." });
    }
    setSaving(false);
  }

  if (loading) return <p style={{ color: "#6b6480" }}>Loading posts…</p>;

  return (
    <div>
      <div style={{ background: "rgba(192,0,26,0.06)", border: "1px solid rgba(192,0,26,0.4)", padding: "14px 18px", marginBottom: "24px" }}>
        <p style={{ color: "#ffd080", fontSize: "0.78rem", fontFamily: "monospace", marginBottom: "6px" }}>
          📅 Backdate Blog Posts
        </p>
        <p style={{ color: "#5a5070", fontSize: "0.72rem", fontFamily: "monospace", lineHeight: 1.6 }}>
          Spread your posts over the last few weeks so they look like a natural publishing history.
          Dates are pre-filled with an even spread from <strong style={{ color: "#c9c4dd" }}>March 10</strong> to <strong style={{ color: "#c9c4dd" }}>March 26</strong>.
          Edit any date, then click <strong style={{ color: "#c9c4dd" }}>Apply All</strong> or update individually.
        </p>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: "#6b6480", fontSize: "0.85rem" }}>No blog posts found. Publish some posts first.</p>
      ) : (
        <>
          <div style={{ marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={handleApplyAll} disabled={saving}
              style={{ background: saving ? "#e8e4f0" : "#c0001a", border: "none", color: "#fff", padding: "10px 24px", cursor: saving ? "not-allowed" : "pointer", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : `📅 Apply All ${posts.length} Dates`}
            </button>
            <button onClick={() => setDates(suggestDates(posts.map(p => p.slug)))} disabled={saving}
              style={{ background: "transparent", border: "1px solid #d0cce0", color: "#6b6480", padding: "10px 18px", cursor: "pointer", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>
              ↺ Reset to Suggested
            </button>
          </div>

          {message && (
            <div style={{ padding: "10px 14px", border: `1px solid ${message.type === "ok" ? "#4caf50" : "#c0001a"}`, color: message.type === "ok" ? "#4caf50" : "#ffd080", fontSize: "0.82rem", marginBottom: "20px" }}>
              {message.text}
            </div>
          )}

          <p style={eyebrowStyle}>Posts ({posts.length}) — drag to adjust dates</p>

          {posts.map((p, i) => (
            <div key={p.slug} style={{ border: "1px solid #d0cce0", marginBottom: "8px", overflow: "hidden" }}>
              {/* ── Main row ── */}
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <span style={{ color: "#6b6480", fontSize: "0.65rem", fontFamily: "monospace", minWidth: "20px", flexShrink: 0 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Thumbnail preview */}
                <div style={{ width: "48px", height: "32px", flexShrink: 0, background: "#0f0c1a", border: "1px solid #d0cce0", overflow: "hidden", borderRadius: "2px" }}>
                  {p.featuredImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.featuredImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: "160px" }}>
                  <p style={{ color: "#1a1625", fontSize: "0.85rem", marginBottom: "4px" }}>{p.title}</p>
                  <p style={{ color: "#6b6480", fontSize: "0.65rem", fontFamily: "monospace" }}>
                    Current: {new Date(p.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
                  {/* Date picker */}
                  <input
                    type="datetime-local"
                    value={dates[p.slug] ?? ""}
                    onChange={e => setDates(prev => ({ ...prev, [p.slug]: e.target.value }))}
                    style={{ background: "#f8f8f8", border: "1px solid #d0cce0", color: "#1a1625", padding: "6px 10px", fontSize: "0.75rem", fontFamily: "monospace" }}
                  />
                  <button onClick={() => handleSingleDate(p.slug)} disabled={saving}
                    style={{ background: "transparent", border: "1px solid #c0001a", color: "#c0001a", padding: "6px 12px", cursor: saving ? "not-allowed" : "pointer", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace", flexShrink: 0 }}>
                    Save Date
                  </button>
                  {/* Thumbnail toggle */}
                  <button
                    onClick={() => {
                      if (thumbEditing === p.slug) { setThumbEditing(null); setThumbUrl(""); }
                      else { setThumbEditing(p.slug); setThumbUrl(p.featuredImage ?? ""); }
                    }}
                    style={{ background: thumbEditing === p.slug ? "#1a1625" : "transparent", border: "1px solid #6b6480", color: thumbEditing === p.slug ? "#f0ecff" : "#6b6480", padding: "6px 12px", cursor: "pointer", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace", flexShrink: 0 }}>
                    {p.featuredImage ? "✎ Thumb" : "+ Thumb"}
                  </button>
                </div>
              </div>

              {/* ── Thumbnail edit row — shown when expanded ── */}
              {thumbEditing === p.slug && (
                <div style={{ borderTop: "1px solid #d0cce0", padding: "12px 16px", background: "#faf9fc", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ color: "#6b6480", fontSize: "0.65rem", fontFamily: "monospace", flexShrink: 0 }}>THUMBNAIL URL</span>
                  <input
                    type="text"
                    value={thumbUrl}
                    onChange={e => setThumbUrl(e.target.value)}
                    placeholder="https://assets.hauntedwallpapers.com/thumbnails/your-image.jpeg"
                    style={{ flex: 1, minWidth: "260px", background: "#fff", border: "1px solid #d0cce0", color: "#1a1625", padding: "8px 12px", fontSize: "0.8rem", fontFamily: "monospace" }}
                  />
                  {/* Live preview */}
                  {thumbUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbUrl} alt="preview" style={{ height: "40px", width: "64px", objectFit: "cover", border: "1px solid #d0cce0", flexShrink: 0 }} />
                  )}
                  <button onClick={() => handleSaveThumb(p.slug)} disabled={thumbSaving}
                    style={{ background: "#c0001a", border: "none", color: "#fff", padding: "8px 16px", cursor: thumbSaving ? "not-allowed" : "pointer", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", flexShrink: 0, opacity: thumbSaving ? 0.6 : 1 }}>
                    {thumbSaving ? "Saving…" : "Save Thumbnail"}
                  </button>
                  {p.featuredImage && (
                    <button onClick={() => { setThumbUrl(""); handleSaveThumb(p.slug); }}
                      style={{ background: "transparent", border: "1px solid #c0001a", color: "#c0001a", padding: "8px 12px", cursor: "pointer", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace", flexShrink: 0 }}>
                      ✕ Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Published Images Tab ─────────────────────────────────────────────────────
const ALL_SEO_TAGS = [
  "dark","gothic","horror","fantasy","minimal","amoled","neon",
  "cyberpunk","nature","abstract","skull","moon","forest","city",
  "demon","angel","witch","fire","ice","space","ocean","halloween",
  "anime","street","pattern","texture","portrait","landscape",
  "skeleton","smoke","rose","blood","knife","darkness","void","crimson",
  "black","white","aesthetic","edgy","rebel","grunge","punk","metal",
  "vampire","ghost","reaper","creepy","mysterious","shadow","ethereal",
  "art","illustration","wallpaper","phone","lockscreen","HD","hd",
  "purple","red","green","blue","gold","silver","neon-green",
  "bones","claw","eye","bat","wolf","dragon","witch-hat","potion",
  "graveyard","cemetery","coffin","chains","thorns","runes","magic",
];

interface ImageRecord {
  id: string; slug: string; title: string; r2Key: string;
  description: string | null; tags: string[]; deviceType: string | null;
  isAdult: boolean; createdAt: string; viewCount: number;
  collection: { title: string } | null;
}

function PublishedImagesTab({ password }: { password: string }) {
  const [images,   setImages]   = useState<ImageRecord[]>([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [page,     setPage]     = useState(1);
  const [q,        setQ]        = useState("");
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState<ImageRecord | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg,      setMsg]      = useState<{ type: "ok"|"err"; text: string } | null>(null);

  // Edit form state
  const [eTitle,  setETitle]  = useState("");
  const [eDesc,   setEDesc]   = useState("");
  const [eTags,   setETags]   = useState<string[]>([]);
  const [eAdult,  setEAdult]  = useState(false);
  const [eDevice, setEDevice] = useState("");

  const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

  const load = useCallback(async (p = page, search = q) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hw-admin/images?page=${p}&q=${encodeURIComponent(search)}`, {
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setImages(data.images ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch { setMsg({ type: "err", text: "Could not load images." }); }
    setLoading(false);
  }, [password, page, q]);

  useEffect(() => { load(); }, [load]);

  function openEdit(img: ImageRecord) {
    setEditing(img);
    setETitle(img.title);
    setEDesc(img.description ?? "");
    setETags(img.tags.filter(t => t !== "16plus"));
    setEAdult(img.isAdult);
    setEDevice(img.deviceType ?? "");
    setMsg(null);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    const tags = eAdult ? [...eTags, "16plus"] : eTags;
    try {
      const res = await fetch(`/api/hw-admin/images/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ title: eTitle, description: eDesc, tags, isAdult: eAdult, deviceType: eDevice || null }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMsg({ type: "ok", text: `✓ Saved "${eTitle}"` });
      setEditing(null);
      load(page, q);
    } catch { setMsg({ type: "err", text: "Save failed." }); }
    setSaving(false);
  }

  async function handleDelete(img: ImageRecord) {
    if (!confirm(`Delete "${img.title}"?\n\nThis removes from R2 and database permanently.`)) return;
    setDeleting(img.id);
    try {
      const res = await fetch(`/api/hw-admin/images/${img.id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error("Delete failed");
      setMsg({ type: "ok", text: `✓ Deleted "${img.title}" from R2 + database.` });
      load(page, q);
    } catch { setMsg({ type: "err", text: "Delete failed." }); }
    setDeleting(null);
  }

  const thumbUrl = (r2Key: string) =>
    r2Base ? `${r2Base}/${r2Key}` : `/api/r2-proxy/${r2Key}`;

  return (
    <div>
      {/* Header */}
      <div style={{ background: "#f8f8f8", border: "1px solid #c0001a", padding: "14px 18px", fontSize: "0.82rem", marginBottom: "20px" }}>
        <strong style={{ color: "#ffd080" }}>📸 Published Images</strong>
        <span style={{ color: "#5a5070", marginLeft: "8px" }}>
          View, edit tags/description, or delete images. Delete removes from R2 CDN + database permanently.
        </span>
      </div>

      {msg && (
        <div style={{ padding: "10px 14px", border: `1px solid ${msg.type === "ok" ? "#4caf50" : "#c0001a"}`, color: msg.type === "ok" ? "#4caf50" : "#ffd080", fontSize: "0.82rem", marginBottom: "16px" }}>
          {msg.text}
          <button onClick={() => setMsg(null)} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "#6b6480", fontSize: "1rem" }}>×</button>
        </div>
      )}

      {/* Search + count */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1); }}
          onKeyDown={e => e.key === "Enter" && load(1, q)}
          placeholder="Search by title or slug…"
          style={{ ...inputStyle, maxWidth: "320px", flex: 1 }}
        />
        <button onClick={() => load(1, q)}
          style={{ background: "#c0001a", border: "none", color: "#fff", padding: "10px 20px", cursor: "pointer", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>
          Search
        </button>
        <span style={{ color: "#6b6480", fontSize: "0.72rem", marginLeft: "auto" }}>
          {total} image{total !== 1 ? "s" : ""} total
        </span>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }}>
          <div style={{ background: "#fff", border: "1px solid #d0cce0", width: "100%", maxWidth: "680px", padding: "28px", fontFamily: "monospace" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <p style={{ ...eyebrowStyle, marginBottom: 0 }}>✏️ Edit Image</p>
              <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6480", fontSize: "1.4rem", lineHeight: 1 }}>×</button>
            </div>

            {/* Thumbnail preview */}
            <div style={{ marginBottom: "16px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <img src={thumbUrl(editing.r2Key)} alt={editing.title}
                style={{ width: "80px", height: "120px", objectFit: "cover", border: "1px solid #d0cce0", flexShrink: 0 }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ ...labelStyle }}>Slug (read-only)</p>
                <p style={{ color: "#7c3aed", fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "8px" }}>{editing.slug}</p>
                <p style={{ ...labelStyle }}>R2 Key</p>
                <p style={{ color: "#6b6480", fontSize: "0.7rem", wordBreak: "break-all" }}>{editing.r2Key}</p>
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Title</label>
              <input value={eTitle} onChange={e => setETitle(e.target.value)} style={inputStyle} />
            </div>

            {/* Device Type */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Device Type</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["", "IPHONE", "ANDROID", "PC"].map(d => (
                  <button key={d} type="button" onClick={() => setEDevice(d)}
                    style={{ background: eDevice === d ? "#c0001a" : "#f0f0f0", border: `1px solid ${eDevice === d ? "#c0001a" : "#d0cce0"}`, color: eDevice === d ? "#fff" : "#5a5070", padding: "5px 14px", cursor: "pointer", fontSize: "0.7rem", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                    {d || "Any"}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Description (SEO — HTML supported)</label>
              <textarea value={eDesc} onChange={e => setEDesc(e.target.value)} rows={6}
                style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6", fontSize: "0.82rem" }} />
            </div>

            {/* SEO Tags */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>SEO Tags ({eTags.length} selected)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {ALL_SEO_TAGS.map(tag => (
                  <button key={tag} type="button"
                    onClick={() => setETags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                    style={{
                      background: eTags.includes(tag) ? "#c0001a" : "#f0f0f0",
                      border: `1px solid ${eTags.includes(tag) ? "#c0001a" : "#d0cce0"}`,
                      color: eTags.includes(tag) ? "#fff" : "#6b6480",
                      padding: "4px 12px", cursor: "pointer",
                      fontSize: "0.65rem", fontFamily: "monospace", letterSpacing: "0.06em",
                    }}>
                    {eTags.includes(tag) ? "✓ " : ""}{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 16+ */}
            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
              <button type="button" onClick={() => setEAdult(a => !a)}
                style={{ background: eAdult ? "#c0001a" : "#f0f0f0", border: `1px solid ${eAdult ? "#c0001a" : "#d0cce0"}`, color: eAdult ? "#fff" : "#6b6480", padding: "6px 16px", cursor: "pointer", fontSize: "0.7rem", fontFamily: "monospace" }}>
                {eAdult ? "⚠ 16+ ON" : "16+ OFF"}
              </button>
              <span style={{ color: "#6b6480", fontSize: "0.7rem" }}>Mark as adult/mature content</span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSave} disabled={saving}
                style={{ background: saving ? "#e8e4f0" : "#c0001a", border: "none", color: "#fff", padding: "10px 28px", cursor: saving ? "not-allowed" : "pointer", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "💾 Save Changes"}
              </button>
              <button onClick={() => setEditing(null)}
                style={{ background: "transparent", border: "1px solid #d0cce0", color: "#6b6480", padding: "10px 20px", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.1em", fontFamily: "monospace" }}>
                Cancel
              </button>
              <a href={`/shop/${editing.collection?.title ? `${editing.slug}` : `..`}/${editing.slug}`}
                target="_blank" rel="noopener noreferrer"
                style={{ marginLeft: "auto", background: "transparent", border: "1px solid #4caf50", color: "#4caf50", padding: "10px 16px", textDecoration: "none", fontSize: "0.7rem", letterSpacing: "0.08em", fontFamily: "monospace" }}>
                👁 View Live →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <p style={{ color: "#6b6480", textAlign: "center", padding: "40px" }}>Loading images…</p>
      ) : images.length === 0 ? (
        <p style={{ color: "#6b6480" }}>No images found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {images.map(img => (
            <div key={img.id} style={{ border: "1px solid #d0cce0", background: "#fafaf8", position: "relative" }}>
              {/* Thumbnail */}
              <div style={{ position: "relative", aspectRatio: "9/16", background: "#1a1625", overflow: "hidden" }}>
                <img
                  src={thumbUrl(img.r2Key)}
                  alt={img.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) parent.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#4a445a;font-size:0.7rem;font-family:monospace;padding:8px;text-align:center;">${img.slug}</div>`;
                  }}
                />
                {img.isAdult && (
                  <span style={{ position: "absolute", top: "6px", left: "6px", background: "#c0001a", color: "#fff", fontSize: "0.55rem", fontFamily: "monospace", fontWeight: 900, padding: "2px 6px" }}>16+</span>
                )}
                {img.deviceType && (
                  <span style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(0,0,0,0.7)", color: "#c9a84c", fontSize: "0.55rem", fontFamily: "monospace", padding: "2px 6px" }}>{img.deviceType}</span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "10px" }}>
                <p style={{ color: "#1a1625", fontSize: "0.75rem", fontWeight: 600, marginBottom: "4px", lineHeight: 1.3, wordBreak: "break-word" }}>{img.title}</p>
                <p style={{ color: "#6b6480", fontSize: "0.6rem", fontFamily: "monospace", marginBottom: "6px", wordBreak: "break-all" }}>{img.slug}</p>

                {/* Tags */}
                {img.tags.filter(t => t !== "16plus").length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginBottom: "8px" }}>
                    {img.tags.filter(t => t !== "16plus").slice(0, 5).map(t => (
                      <span key={t} style={{ background: "#e8e4f0", color: "#7c3aed", fontSize: "0.55rem", padding: "1px 6px", fontFamily: "monospace" }}>#{t}</span>
                    ))}
                    {img.tags.filter(t => t !== "16plus").length > 5 && (
                      <span style={{ color: "#6b6480", fontSize: "0.55rem" }}>+{img.tags.filter(t => t !== "16plus").length - 5}</span>
                    )}
                  </div>
                )}

                {/* Views */}
                <p style={{ color: "#6b6480", fontSize: "0.6rem", marginBottom: "8px" }}>👁 {img.viewCount} views</p>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => openEdit(img)}
                    style={{ flex: 1, background: "#f0f0f0", border: "1px solid #d0cce0", color: "#1a1625", padding: "6px", cursor: "pointer", fontSize: "0.65rem", fontFamily: "monospace" }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(img)} disabled={deleting === img.id}
                    style={{ flex: 1, background: deleting === img.id ? "#e8e4f0" : "rgba(192,0,26,0.08)", border: "1px solid rgba(192,0,26,0.4)", color: "#c0001a", padding: "6px", cursor: deleting === img.id ? "not-allowed" : "pointer", fontSize: "0.65rem", fontFamily: "monospace" }}>
                    {deleting === img.id ? "…" : "🗑 Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => { const p = Math.max(1, page - 1); setPage(p); load(p, q); }} disabled={page <= 1}
            style={{ background: "transparent", border: "1px solid #d0cce0", color: "#6b6480", padding: "8px 16px", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.4 : 1, fontSize: "0.75rem", fontFamily: "monospace" }}>
            ← Prev
          </button>
          <span style={{ color: "#6b6480", fontSize: "0.75rem", fontFamily: "monospace" }}>
            Page {page} / {pages}
          </span>
          <button onClick={() => { const p = Math.min(pages, page + 1); setPage(p); load(p, q); }} disabled={page >= pages}
            style={{ background: "transparent", border: "1px solid #d0cce0", color: "#6b6480", padding: "8px 16px", cursor: page >= pages ? "not-allowed" : "pointer", opacity: page >= pages ? 0.4 : 1, fontSize: "0.75rem", fontFamily: "monospace" }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Client ────────────────────────────────────────────────────────
type Tab = "analytics" | "upload" | "published" | "blog" | "ideas" | "manage18" | "backdate";

export default function AdminClient() {
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
    { key: "analytics",  label: "📊 Analytics"   },
    { key: "upload",     label: "📤 Upload Image" },
    { key: "published",  label: "📸 Published"    },
    { key: "blog",       label: "✍️ Blog Posts"   },
    { key: "ideas",      label: "💡 Blog Ideas"   },
    { key: "manage18",   label: "⚠ 16+ Manage"   },
    { key: "backdate",   label: "📅 Backdate"     },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "monospace", color: "#1a1625" }}>
      <div style={{ borderBottom: "1px solid #d0cce0", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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

      <div style={{ borderBottom: "1px solid #d0cce0", padding: "0 32px", display: "flex", overflowX: "auto" }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: "transparent", border: "none",
            borderBottom: tab === key ? "2px solid #c0001a" : "2px solid transparent",
            color: tab === key ? "#1a1625" : "#6b6480",
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
        {tab === "published" && <PublishedImagesTab password={password} />}
        {tab === "blog"      && (
          <BlogTab
            password={password}
            prefillTitle={prefillTitle}
            prefillLabel={prefillLabel}
            onPrefillUsed={() => { setPrefillTitle(""); setPrefillLabel(""); }}
          />
        )}
        {tab === "ideas" && <BlogIdeasTab onUseIdea={handleUseIdea} />}
        {tab === "manage18" && <Manage18Tab password={password} />}
        {tab === "backdate" && <BackdateTab password={password} />}
      </div>
    </div>
  );
}