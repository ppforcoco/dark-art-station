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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        <div>
          <p style={{ color: "#6b6480", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>Top Wallpapers</p>
          {data.topWallpapers.map((w, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1825", fontSize: "0.85rem" }}>
              <span style={{ color: "#f0ecff" }}>{w.title}</span>
              <span style={{ color: "#c0001a", fontWeight: 700 }}>{w.downloads}</span>
            </div>
          ))}
        </div>
        <div>
          <p style={{ color: "#6b6480", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>Top Collections</p>
          {data.topCollections.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1825", fontSize: "0.85rem" }}>
              <span style={{ color: "#f0ecff" }}>{c.title}</span>
              <span style={{ color: "#c0001a", fontWeight: 700 }}>{c.downloads}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p style={{ color: "#6b6480", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>Recent Downloads</p>
        {data.recentActivity.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: "16px", padding: "8px 0", borderBottom: "1px solid #1a1825", fontSize: "0.8rem" }}>
            <span style={{ color: "#6b6480", flexShrink: 0 }}>{a.time}</span>
            <span style={{ color: "#f0ecff" }}>{a.title}</span>
          </div>
        ))}
      </div>

      <button onClick={load} style={{ marginTop: "24px", background: "transparent", border: "1px solid #2a2535", color: "#8a8099", padding: "8px 20px", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
        Refresh
      </button>

      <div style={{ marginTop: "32px", border: "1px solid #2a2535", padding: "20px" }}>
        <p style={{ color: "#6b6480", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>Google Analytics 4</p>
        <p style={{ color: "#8a8099", fontSize: "0.85rem", marginBottom: "12px" }}>For traffic, bounce rate, and country data — open GA4 directly.</p>
        <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "#c0001a", color: "#fff", padding: "10px 20px", textDecoration: "none", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Open GA4 Dashboard →
        </a>
      </div>
    </div>
  );
}

// ─── HTML Toolbar ─────────────────────────────────────────────────────────────
function HtmlToolbar({ onInsert }: { onInsert: (before: string, after: string) => void }) {
  const tools = [
    { label: "B",      title: "Bold",           before: "<strong>",  after: "</strong>" },
    { label: "I",      title: "Italic",          before: "<em>",      after: "</em>" },
    { label: "H2",     title: "Section Heading", before: "<h2>",      after: "</h2>" },
    { label: "H3",     title: "Sub-heading",     before: "<h3>",      after: "</h3>" },
    { label: "P",      title: "Paragraph",       before: "<p>",       after: "</p>" },
    { label: "🔗",     title: "Link",            before: '<a href="URL">', after: "</a>" },
    { label: "IMG",    title: "Image",           before: '<img src="YOUR-R2-URL.webp" alt="Description" style="width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:4px;margin:16px 0;" />', after: "" },
    { label: "UL",     title: "Bullet List",     before: "<ul>\n  <li>", after: "</li>\n</ul>" },
    { label: "OL",     title: "Numbered List",   before: "<ol>\n  <li>", after: "</li>\n</ol>" },
    { label: "HR",     title: "Divider Line",    before: "<hr style=\"border-color:#2a2535;margin:32px 0;\" />", after: "" },
    { label: "AD",     title: "Ad Slot (mid)",   before: '<div style="margin:32px 0;text-align:center;background:#1a1825;padding:20px;color:#6b6480;font-size:0.75rem;">[ Ad Slot — AdSense will render here ]</div>', after: "" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
      {tools.map((t) => (
        <button
          key={t.label}
          title={t.title}
          type="button"
          onClick={() => onInsert(t.before, t.after)}
          style={{
            background: "#1a1825",
            border: "1px solid #2a2535",
            color: "#c0a0ff",
            padding: "4px 10px",
            cursor: "pointer",
            fontSize: "0.72rem",
            fontFamily: "monospace",
            letterSpacing: "0.05em",
            borderRadius: "2px",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Blog Tab ─────────────────────────────────────────────────────────────────
function BlogTab({ password }: { password: string }) {
  const [title, setTitle]         = useState("");
  const [slug, setSlug]           = useState("");
  const [content, setContent]     = useState("");
  const [label, setLabel]         = useState("Guide");
  const [saving, setSaving]       = useState(false);
  const [message, setMessage]     = useState("");
  const [editorMode, setEditorMode] = useState<"html" | "preview">("html");
  const [posts, setPosts]         = useState<{ slug: string; title: string; createdAt: string }[]>([]);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

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

  function handleTitleChange(val: string) {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  // Insert HTML at cursor position in textarea
  function handleInsert(before: string, after: string) {
    if (!textareaRef) {
      setContent((c) => c + before + after);
      return;
    }
    const start = textareaRef.selectionStart;
    const end   = textareaRef.selectionEnd;
    const selected = content.slice(start, end);
    const newContent = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(newContent);
    setTimeout(() => {
      textareaRef.focus();
      const newPos = start + before.length + selected.length + after.length;
      textareaRef.setSelectionRange(newPos, newPos);
    }, 10);
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

  async function handleDelete(s: string) {
    if (!confirm(`Delete "${s}"?`)) return;
    await fetch("/api/hw-admin/blogs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ slug: s }),
    });
    loadPosts();
  }

  const starterTemplate = `<p>Your intro paragraph here. Write 2–3 sentences to hook the reader.</p>

<h2>First Section Title</h2>
<p>Your section content here. Keep writing — the more detail the better for AdSense.</p>

<img src="https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/YOUR-IMAGE.webp" alt="Describe the image" style="width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:4px;margin:16px 0;" />

<h2>Second Section Title</h2>
<p>More content here. Aim for at least 600 words total.</p>

<h2>Conclusion</h2>
<p>Wrap it up. Tell them where to find wallpapers on your site.</p>`;

  return (
    <div>
      <p style={{ color: "#8a8099", fontSize: "0.85rem", marginBottom: "8px" }}>
        Write blog posts here. They go live at <strong style={{ color: "#f0ecff" }}>/blog/[slug]</strong> immediately after publishing.
        Use the toolbar to add HTML formatting, headings, and images.
      </p>

      {/* Quick image guide */}
      <div style={{ background: "#0e0c18", border: "1px solid #2a2535", padding: "14px 16px", marginBottom: "24px", fontSize: "0.78rem", color: "#8a8099" }}>
        <strong style={{ color: "#c0a0ff" }}>📸 To add an image:</strong>{" "}
        Upload your AI image to Cloudflare R2 → copy its URL → click <strong style={{ color: "#c0a0ff" }}>IMG</strong> button above → replace <code style={{ color: "#ffd080" }}>YOUR-R2-URL.webp</code> with your URL.
        Images use <strong style={{ color: "#c0a0ff" }}>9:16 portrait ratio</strong> automatically.
      </div>

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

        {/* Editor with toolbar */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <label style={labelStyle}>Content (HTML)</label>
            <div style={{ display: "flex", gap: "4px" }}>
              <button type="button" onClick={() => setEditorMode("html")} style={{ ...modeBtn, borderColor: editorMode === "html" ? "#c0001a" : "#2a2535", color: editorMode === "html" ? "#f0ecff" : "#6b6480" }}>HTML</button>
              <button type="button" onClick={() => setEditorMode("preview")} style={{ ...modeBtn, borderColor: editorMode === "preview" ? "#c0001a" : "#2a2535", color: editorMode === "preview" ? "#f0ecff" : "#6b6480" }}>Preview</button>
              {!content && (
                <button type="button" onClick={() => setContent(starterTemplate)} style={{ ...modeBtn, borderColor: "#c0a0ff", color: "#c0a0ff" }}>
                  Insert Template
                </button>
              )}
            </div>
          </div>

          {editorMode === "html" ? (
            <>
              <HtmlToolbar onInsert={handleInsert} />
              <textarea
                ref={(el) => setTextareaRef(el)}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`<p>Your intro paragraph here.</p>\n\n<h2>Section Heading</h2>\n<p>Your content here.</p>\n\n<img src="https://your-r2-url.webp" alt="description" style="width:100%;aspect-ratio:9/16;object-fit:cover;margin:16px 0;" />`}
                rows={22}
                style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6", fontFamily: "monospace", fontSize: "0.82rem" }}
              />
            </>
          ) : (
            <div
              style={{
                minHeight: "400px",
                border: "1px solid #2a2535",
                padding: "20px",
                background: "#08060f",
                color: "#f0ecff",
                lineHeight: "1.8",
                fontSize: "0.95rem",
              }}
              dangerouslySetInnerHTML={{ __html: content || "<p style='color:#6b6480'>Nothing to preview yet…</p>" }}
            />
          )}
        </div>

        {message && (
          <p style={{
            color: message.startsWith("✓") ? "#4caf50" : "#c0001a",
            fontSize: "0.85rem",
            padding: "10px",
            border: `1px solid ${message.startsWith("✓") ? "#4caf50" : "#c0001a"}`,
          }}>
            {message}
            {message.startsWith("✓") && (
              <a href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#4caf50", marginLeft: "12px" }}>
                View post →
              </a>
            )}
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
            Published Posts ({posts.length})
          </p>
          {posts.map((p) => (
            <div key={p.slug} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1825" }}>
              <div>
                <span style={{ color: "#f0ecff", fontSize: "0.9rem" }}>{p.title}</span>
                <span style={{ color: "#6b6480", fontSize: "0.75rem", marginLeft: "12px" }}>
                  {new Date(p.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#c0001a", fontSize: "0.75rem", textDecoration: "none" }}>
                  View →
                </a>
                <button
                  onClick={() => handleDelete(p.slug)}
                  style={{ background: "transparent", border: "1px solid #3a2535", color: "#6b6480", cursor: "pointer", fontSize: "0.7rem", padding: "2px 8px" }}
                >
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

const modeBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid",
  padding: "3px 10px",
  cursor: "pointer",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
  fontFamily: "monospace",
};

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPw]   = useState("");
  const [tab, setTab]       = useState<"analytics" | "blog">("analytics");

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
    <div style={{ minHeight: "100vh", background: "#0c0b14", fontFamily: "monospace", color: "#f0ecff" }}>
      <div style={{ borderBottom: "1px solid #2a2535", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ color: "#c0001a", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Haunted Wallpapers</span>
          <span style={{ color: "#6b6480", marginLeft: "12px", fontSize: "0.9rem" }}>Admin</span>
        </div>
        <button onClick={() => { sessionStorage.removeItem("hw-admin-auth"); setAuthed(false); }} style={{ background: "transparent", border: "none", color: "#6b6480", cursor: "pointer", fontSize: "0.75rem" }}>
          Sign out
        </button>
      </div>

      <div style={{ borderBottom: "1px solid #2a2535", padding: "0 32px", display: "flex" }}>
        {(["analytics", "blog"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "transparent", border: "none",
            borderBottom: tab === t ? "2px solid #c0001a" : "2px solid transparent",
            color: tab === t ? "#f0ecff" : "#6b6480",
            padding: "14px 24px", cursor: "pointer",
            fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            {t === "analytics" ? "📊 Analytics" : "✍️ Blog Posts"}
          </button>
        ))}
      </div>

      <div style={{ padding: "32px", maxWidth: "1100px" }}>
        {tab === "analytics" && <AnalyticsTab password={password} />}
        {tab === "blog"      && <BlogTab password={password} />}
      </div>
    </div>
  );
}