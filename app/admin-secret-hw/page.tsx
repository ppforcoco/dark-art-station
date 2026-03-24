"use client";
import { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Analytics {
  totalDownloads: number;
  todayDownloads: number;
  weekDownloads: number;
  topWallpapers: { title: string; downloads: number }[];
  topCollections: { title: string; downloads: number }[];
  recentActivity: { time: string; title: string }[];
}

// ─── Password Gate ────────────────────────────────────────────────────────────
function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hw-admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        sessionStorage.setItem("hw-admin-auth", pw);
        onAuth();
      } else {
        setError("Wrong password.");
      }
    } catch {
      setError("Network error. Try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0c0b14",
      fontFamily: "monospace",
    }}>
      <div style={{
        border: "1px solid #2a2535",
        padding: "40px",
        width: "360px",
        textAlign: "center",
      }}>
        <p style={{ color: "#c0001a", fontSize: "0.7rem", letterSpacing: "0.2em", marginBottom: "8px" }}>
          HAUNTED WALLPAPERS
        </p>
        <h1 style={{ color: "#f0ecff", fontSize: "1.4rem", marginBottom: "32px", fontWeight: 400 }}>
          Admin Access
        </h1>
        <input
          type="password"
          placeholder="Enter password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{
            width: "100%",
            background: "transparent",
            border: "1px solid #2a2535",
            color: "#f0ecff",
            padding: "12px",
            fontSize: "1rem",
            marginBottom: "16px",
            fontFamily: "monospace",
            boxSizing: "border-box",
          }}
        />
        {error && <p style={{ color: "#c0001a", marginBottom: "12px", fontSize: "0.85rem" }}>{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            background: "#c0001a",
            color: "#fff",
            border: "none",
            padding: "12px",
            fontSize: "0.8rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </div>
    </div>
  );
}

// ─── Analytics Tab ───────────────────────────────────────────────────────────
function AnalyticsTab({ password }: { password: string }) {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hw-admin/analytics", {
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Could not load analytics.");
    }
    setLoading(false);
  }, [password]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p style={{ color: "#6b6480" }}>Loading analytics…</p>;
  if (error)   return <p style={{ color: "#c0001a" }}>{error}</p>;
  if (!data)   return null;

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Downloads", value: data.totalDownloads.toLocaleString() },
          { label: "This Week",       value: data.weekDownloads.toLocaleString() },
          { label: "Today",           value: data.todayDownloads.toLocaleString() },
        ].map((s) => (
          <div key={s.label} style={{ border: "1px solid #2a2535", padding: "20px", textAlign: "center" }}>
            <p style={{ color: "#6b6480", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>{s.label}</p>
            <p style={{ color: "#c0001a", fontSize: "2rem", fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top wallpapers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        <div>
          <p style={{ color: "#6b6480", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>
            Top Wallpapers
          </p>
          {data.topWallpapers.map((w, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1825", fontSize: "0.85rem" }}>
              <span style={{ color: "#f0ecff" }}>{w.title}</span>
              <span style={{ color: "#c0001a", fontWeight: 700 }}>{w.downloads}</span>
            </div>
          ))}
        </div>
        <div>
          <p style={{ color: "#6b6480", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>
            Top Collections
          </p>
          {data.topCollections.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1825", fontSize: "0.85rem" }}>
              <span style={{ color: "#f0ecff" }}>{c.title}</span>
              <span style={{ color: "#c0001a", fontWeight: 700 }}>{c.downloads}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <p style={{ color: "#6b6480", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>
          Recent Downloads
        </p>
        {data.recentActivity.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: "16px", padding: "8px 0", borderBottom: "1px solid #1a1825", fontSize: "0.8rem" }}>
            <span style={{ color: "#6b6480", flexShrink: 0 }}>{a.time}</span>
            <span style={{ color: "#f0ecff" }}>{a.title}</span>
          </div>
        ))}
      </div>

      <button
        onClick={load}
        style={{
          marginTop: "24px",
          background: "transparent",
          border: "1px solid #2a2535",
          color: "#8a8099",
          padding: "8px 20px",
          cursor: "pointer",
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
        }}
      >
        Refresh
      </button>

      {/* GA4 link */}
      <div style={{ marginTop: "32px", border: "1px solid #2a2535", padding: "20px" }}>
        <p style={{ color: "#6b6480", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>
          Google Analytics 4
        </p>
        <p style={{ color: "#8a8099", fontSize: "0.85rem", marginBottom: "12px" }}>
          For traffic, bounce rate, and country data — open GA4 directly.
        </p>
        <a
          href="https://analytics.google.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            background: "#c0001a",
            color: "#fff",
            padding: "10px 20px",
            textDecoration: "none",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Open GA4 Dashboard →
        </a>
      </div>
    </div>
  );
}

// ─── Blog Tab ─────────────────────────────────────────────────────────────────
function BlogTab({ password }: { password: string }) {
  const [title, setTitle]     = useState("");
  const [slug, setSlug]       = useState("");
  const [content, setContent] = useState("");
  const [label, setLabel]     = useState("Guide");
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState("");
  const [posts, setPosts]     = useState<{ slug: string; title: string; date: string }[]>([]);

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/hw-admin/blogs", {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        const json = await res.json();
        setPosts(json.posts ?? []);
      }
    } catch {}
  }, [password]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Auto-generate slug from title
  function handleTitleChange(val: string) {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  async function handlePublish() {
    if (!title || !slug || !content) {
      setMessage("Please fill in title, slug, and content.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/hw-admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ title, slug, content, label }),
      });
      if (res.ok) {
        setMessage(`✓ Published! Live at /blog/${slug}`);
        setTitle(""); setSlug(""); setContent(""); setLabel("Guide");
        loadPosts();
      } else {
        const err = await res.json();
        setMessage(err.error ?? "Failed to publish.");
      }
    } catch {
      setMessage("Network error.");
    }
    setSaving(false);
  }

  return (
    <div>
      <p style={{ color: "#8a8099", fontSize: "0.85rem", marginBottom: "24px" }}>
        Write blog posts here. They go live at <strong style={{ color: "#f0ecff" }}>/blog/[slug]</strong> immediately.
        Write in plain paragraphs — one blank line between paragraphs.
        Use "## Heading" for section headings.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Title</label>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Best Dark Wallpapers for Summer 2025"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>URL Slug (auto-filled)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="best-dark-wallpapers-summer-2025"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Label</label>
            <select
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {["Guide", "Halloween", "Tips", "Art", "Explainer", "News"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Content (plain text, ## for headings)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Write your blog post here...\n\n## First Section\nYour paragraph here.\n\n## Second Section\nAnother paragraph.`}
            rows={18}
            style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
          />
        </div>

        {message && (
          <p style={{
            color: message.startsWith("✓") ? "#4caf50" : "#c0001a",
            fontSize: "0.85rem",
            padding: "10px",
            border: `1px solid ${message.startsWith("✓") ? "#4caf50" : "#c0001a"}`,
          }}>
            {message}
          </p>
        )}

        <button
          onClick={handlePublish}
          disabled={saving}
          style={{
            background: "#c0001a",
            color: "#fff",
            border: "none",
            padding: "14px 28px",
            cursor: saving ? "not-allowed" : "pointer",
            fontSize: "0.8rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: saving ? 0.7 : 1,
            alignSelf: "flex-start",
          }}
        >
          {saving ? "Publishing…" : "Publish Blog Post"}
        </button>
      </div>

      {/* Existing posts */}
      {posts.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <p style={{ color: "#6b6480", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>
            Published Posts
          </p>
          {posts.map((p) => (
            <div key={p.slug} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1825" }}>
              <div>
                <span style={{ color: "#f0ecff", fontSize: "0.9rem" }}>{p.title}</span>
                <span style={{ color: "#6b6480", fontSize: "0.75rem", marginLeft: "12px" }}>{p.date}</span>
              </div>
              <a
                href={`/blog/${p.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#c0001a", fontSize: "0.75rem", textDecoration: "none" }}
              >
                View →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "1px solid #2a2535",
  color: "#f0ecff",
  padding: "10px 12px",
  fontSize: "0.9rem",
  fontFamily: "monospace",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#6b6480",
  fontSize: "0.6rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  marginBottom: "6px",
};

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed]   = useState(false);
  const [password, setPw]     = useState("");
  const [tab, setTab]         = useState<"analytics" | "blog">("analytics");

  useEffect(() => {
    const saved = sessionStorage.getItem("hw-admin-auth");
    if (saved) { setPw(saved); setAuthed(true); }
  }, []);

  function handleAuth() {
    const saved = sessionStorage.getItem("hw-admin-auth") ?? "";
    setPw(saved);
    setAuthed(true);
  }

  if (!authed) return <PasswordGate onAuth={handleAuth} />;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c0b14",
      fontFamily: "monospace",
      color: "#f0ecff",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #2a2535",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <span style={{ color: "#c0001a", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Haunted Wallpapers
          </span>
          <span style={{ color: "#6b6480", marginLeft: "12px", fontSize: "0.9rem" }}>Admin</span>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem("hw-admin-auth"); setAuthed(false); }}
          style={{ background: "transparent", border: "none", color: "#6b6480", cursor: "pointer", fontSize: "0.75rem" }}
        >
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #2a2535", padding: "0 32px", display: "flex", gap: "0" }}>
        {(["analytics", "blog"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: tab === t ? "2px solid #c0001a" : "2px solid transparent",
              color: tab === t ? "#f0ecff" : "#6b6480",
              padding: "14px 24px",
              cursor: "pointer",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {t === "analytics" ? "📊 Analytics" : "✍️ Blog Posts"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "32px", maxWidth: "1100px" }}>
        {tab === "analytics" && <AnalyticsTab password={password} />}
        {tab === "blog"      && <BlogTab password={password} />}
      </div>
    </div>
  );
}