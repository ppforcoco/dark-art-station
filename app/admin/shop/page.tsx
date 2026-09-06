// app/admin/shop/page.tsx — Admin panel for print-on-demand shop products
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export const dynamic = "force-dynamic";

const CATEGORY_PRESETS: Record<string, { variantLabel: string; variants: string[] }> = {
  "Phone Case": { variantLabel: "Phone Model", variants: ["iPhone 14", "iPhone 15", "iPhone 16", "Galaxy S23", "Galaxy S24"] },
  "T-Shirt":    { variantLabel: "Size",        variants: ["S", "M", "L", "XL", "XXL"] },
};

interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  variantLabel: string;
  variants: string[];
  price: number;
  compareAtPrice: number | null;
  descriptionHtml: string;
  thumbnailKey: string;
  galleryKeys: string[];
  badge: string | null;
  featured: boolean;
  isPublished: boolean;
}

const C = { bg: "#0d0b14", surface: "#13111e", border: "#2a2535", red: "#c0001a", gold: "#c9a84c", textPri: "#e8e4f8", textSec: "#8a809a", textMut: "#4a445a", green: "#4caf50", white: "#ffffff" };
const inp: React.CSSProperties = { width: "100%", background: "#0a0812", border: `1px solid ${C.border}`, color: C.textPri, padding: "10px 12px", fontSize: "0.875rem", fontFamily: "monospace", boxSizing: "border-box", outline: "none" };
const lbl: React.CSSProperties = { display: "block", color: C.textMut, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" };

function Btn({ children, onClick, disabled, variant = "primary", style }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: "primary" | "ghost" | "danger" | "success"; style?: React.CSSProperties }) {
  const base: React.CSSProperties = { border: "none", cursor: disabled ? "not-allowed" : "pointer", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", padding: "10px 20px", opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap" };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: C.red, color: C.white },
    ghost:   { background: "transparent", color: C.textSec, border: `1px solid ${C.border}` },
    danger:  { background: "rgba(192,0,26,0.15)", color: C.red, border: `1px solid ${C.red}` },
    success: { background: "rgba(76,175,80,0.15)", color: C.green, border: `1px solid ${C.green}` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "24px", ...style }}>{children}</div>;
}
function Msg({ msg }: { msg: { type: "ok" | "err"; text: string } | null }) {
  if (!msg) return null;
  return <div style={{ padding: "10px 14px", marginBottom: "16px", border: `1px solid ${msg.type === "ok" ? C.green : C.red}`, color: msg.type === "ok" ? C.green : "#ffd080", fontSize: "0.82rem", background: msg.type === "ok" ? "rgba(76,175,80,0.08)" : "rgba(192,0,26,0.08)" }}>{msg.text}</div>;
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Login Gate ─────────────────────────────────────────────────────────────
function LoginGate({ onAuth }: { onAuth: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/hw-admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      if (res.ok) { sessionStorage.setItem("hw-admin-auth", pw); onAuth(pw); }
      else setError("Wrong password.");
    } catch { setError("Network error."); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: "monospace" }}>
      <div style={{ border: `1px solid ${C.border}`, padding: "48px", width: "360px", textAlign: "center", background: C.surface }}>
        <p style={{ color: C.red, fontSize: "0.65rem", letterSpacing: "0.25em", marginBottom: "8px" }}>HAUNTED WALLPAPERS</p>
        <h1 style={{ color: C.textPri, fontSize: "1.4rem", marginBottom: "32px", fontWeight: 300 }}>Shop Admin</h1>
        <input type="password" placeholder="Enter password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ ...inp, marginBottom: "16px", fontSize: "1rem", padding: "12px" }} />
        {error && <p style={{ color: C.red, marginBottom: "12px", fontSize: "0.85rem" }}>{error}</p>}
        <Btn onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "12px" }}>{loading ? "Checking…" : "Enter"}</Btn>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminShopPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("hw-admin-auth");
    if (saved) setPassword(saved);
    setCheckedSession(true);
  }, []);

  if (!checkedSession) return null;
  if (!password) return <LoginGate onAuth={setPassword} />;
  return <ShopAdmin password={password} />;
}

function ShopAdmin({ password }: { password: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [editing, setEditing] = useState<Product | null>(null); // null = "new product" form

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hw-admin/shop", { headers: { "x-admin-password": password } });
      const j = await res.json();
      setProducts(j.products ?? []);
    } catch { setMsg({ type: "err", text: "Failed to load products." }); }
    setLoading(false);
  }, [password]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(p: Product) {
    if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    try {
      await fetch("/api/hw-admin/shop", { method: "DELETE", headers: { "Content-Type": "application/json", "x-admin-password": password }, body: JSON.stringify({ slug: p.slug }) });
      setMsg({ type: "ok", text: `✓ Deleted "${p.name}"` });
      load();
    } catch { setMsg({ type: "err", text: "Delete failed." }); }
  }

  async function handleTogglePublish(p: Product) {
    try {
      const res = await fetch("/api/hw-admin/shop", { method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-password": password }, body: JSON.stringify({ slug: p.slug, isPublished: !p.isPublished }) });
      if (res.ok) {
        setMsg({ type: "ok", text: !p.isPublished ? `✓ "${p.name}" is now LIVE on /shop` : `✓ "${p.name}" unpublished` });
        setProducts(prev => prev.map(x => x.slug === p.slug ? { ...x, isPublished: !p.isPublished } : x));
      }
    } catch { setMsg({ type: "err", text: "Toggle failed." }); }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.textPri, fontFamily: "monospace", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <p style={{ color: C.red, fontSize: "0.6rem", letterSpacing: "0.25em", marginBottom: "6px" }}>HAUNTED WALLPAPERS</p>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 300, marginBottom: "24px" }}>Shop Products</h1>

        <Msg msg={msg} />

        <ProductForm
          key={editing?.id ?? "new"}
          password={password}
          existing={editing}
          onSaved={() => { setEditing(null); load(); }}
          onCancelEdit={() => setEditing(null)}
          setMsg={setMsg}
        />

        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "0.9rem", color: C.textSec, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
            All Products {loading ? "" : `(${products.length})`}
          </h2>

          {loading ? (
            <p style={{ color: C.textMut }}>Loading…</p>
          ) : products.length === 0 ? (
            <p style={{ color: C.textMut }}>No products yet — create your first one above.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {products.map(p => (
                <Card key={p.id} style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <strong>{p.name}</strong>
                        <span style={{ fontSize: "0.65rem", color: C.textMut }}>/{p.slug}</span>
                        {p.isPublished
                          ? <span style={{ fontSize: "0.6rem", color: C.green, border: `1px solid ${C.green}`, padding: "1px 6px" }}>LIVE</span>
                          : <span style={{ fontSize: "0.6rem", color: C.textMut, border: `1px solid ${C.border}`, padding: "1px 6px" }}>DRAFT</span>}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: C.textSec }}>
                        {p.category} · ${p.price.toFixed(2)} · {p.variants.length} {p.variantLabel.toLowerCase()} option(s) · {p.thumbnailKey ? "✓ thumbnail" : "⚠ no thumbnail"} · {p.galleryKeys.length} gallery image(s)
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <Btn variant="ghost" onClick={() => setEditing(p)}>Edit</Btn>
                      <Btn variant={p.isPublished ? "ghost" : "success"} onClick={() => handleTogglePublish(p)}>
                        {p.isPublished ? "Unpublish" : "Publish"}
                      </Btn>
                      <Btn variant="danger" onClick={() => handleDelete(p)}>Delete</Btn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create / Edit Form ────────────────────────────────────────────────────────
function ProductForm({
  password, existing, onSaved, onCancelEdit, setMsg,
}: {
  password: string;
  existing: Product | null;
  onSaved: () => void;
  onCancelEdit: () => void;
  setMsg: (m: { type: "ok" | "err"; text: string } | null) => void;
}) {
  const [name, setName] = useState(existing?.name ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!existing);
  const [category, setCategory] = useState(existing?.category ?? "Phone Case");
  const [variantLabel, setVariantLabel] = useState(existing?.variantLabel ?? CATEGORY_PRESETS["Phone Case"].variantLabel);
  const [variantsText, setVariantsText] = useState((existing?.variants ?? CATEGORY_PRESETS["Phone Case"].variants).join(", "));
  const [price, setPrice] = useState(existing ? String(existing.price) : "29.99");
  const [compareAtPrice, setCompareAtPrice] = useState(existing?.compareAtPrice ? String(existing.compareAtPrice) : "");
  const [descriptionHtml, setDescriptionHtml] = useState(existing?.descriptionHtml ?? "");
  const [badge, setBadge] = useState(existing?.badge ?? "");
  const [featured, setFeatured] = useState(existing?.featured ?? false);
  const [saving, setSaving] = useState(false);

  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!existing;

  function handleCategoryChange(val: string) {
    setCategory(val);
    if (!isEdit && CATEGORY_PRESETS[val]) {
      setVariantLabel(CATEGORY_PRESETS[val].variantLabel);
      setVariantsText(CATEGORY_PRESETS[val].variants.join(", "));
    }
  }

  async function handleSave() {
    if (!name.trim() || !slug.trim() || !category.trim() || !price) {
      setMsg({ type: "err", text: "Name, slug, category and price are required." });
      return;
    }
    setSaving(true);
    const variants = variantsText.split(",").map(v => v.trim()).filter(Boolean);
    const payloadBase = {
      name, category, variantLabel, variants,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      descriptionHtml, badge: badge || null, featured,
    };
    const payload = isEdit
      ? { slug: existing!.slug, newSlug: slug, ...payloadBase }
      : { slug, ...payloadBase };
    try {
      const res = await fetch("/api/hw-admin/shop", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (res.ok) {
        setMsg({ type: "ok", text: `✓ ${isEdit ? "Updated" : "Created"} "${name}". Now upload a 9:16 thumbnail below.` });
        if (!isEdit) {
          // Keep the form open on the newly created product so images can be attached immediately
          onSaved();
        } else {
          onSaved();
        }
      } else {
        setMsg({ type: "err", text: j.error ?? "Save failed." });
      }
    } catch { setMsg({ type: "err", text: "Network error." }); }
    setSaving(false);
  }

  async function handleUploadThumb() {
    if (!thumbFile || !existing) return;
    setUploadingThumb(true);
    try {
      const form = new FormData();
      form.append("file", thumbFile);
      form.append("slug", existing.slug);
      form.append("kind", "thumbnail");
      const res = await fetch("/api/hw-admin/shop/upload", { method: "POST", headers: { "x-admin-password": password }, body: form });
      const j = await res.json();
      if (res.ok) { setMsg({ type: "ok", text: "✓ Thumbnail uploaded." }); onSaved(); }
      else setMsg({ type: "err", text: j.error ?? "Upload failed." });
    } catch { setMsg({ type: "err", text: "Network error." }); }
    setUploadingThumb(false);
  }

  async function handleUploadGallery() {
    if (!galleryFile || !existing) return;
    setUploadingGallery(true);
    try {
      const form = new FormData();
      form.append("file", galleryFile);
      form.append("slug", existing.slug);
      form.append("kind", "gallery");
      const res = await fetch("/api/hw-admin/shop/upload", { method: "POST", headers: { "x-admin-password": password }, body: form });
      const j = await res.json();
      if (res.ok) { setMsg({ type: "ok", text: "✓ Gallery image added." }); onSaved(); }
      else setMsg({ type: "err", text: j.error ?? "Upload failed." });
    } catch { setMsg({ type: "err", text: "Network error." }); }
    setUploadingGallery(false);
  }

  return (
    <Card>
      <h2 style={{ fontSize: "0.9rem", marginBottom: "18px" }}>
        {isEdit ? `Editing "${existing!.name}"` : "New Product"}
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label style={lbl}>Name</label>
          <input
            style={inp} value={name}
            onChange={e => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }}
            placeholder="Forever Defiant Case"
          />
        </div>
        <div>
          <label style={lbl}>Slug (URL: /shop/...)</label>
          <input style={inp} value={slug} onChange={e => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} placeholder="forever-defiant-case" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label style={lbl}>Content Type</label>
          <input style={inp} list="category-presets" value={category} onChange={e => handleCategoryChange(e.target.value)} placeholder="Phone Case" />
          <datalist id="category-presets">
            {Object.keys(CATEGORY_PRESETS).map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label style={lbl}>Badge (optional)</label>
          <select style={inp} value={badge} onChange={e => setBadge(e.target.value)}>
            <option value="">None</option>
            <option value="New">New</option>
            <option value="Hot">Hot</option>
            <option value="Sale">Sale</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label style={lbl}>Variant Label</label>
          <input style={inp} value={variantLabel} onChange={e => setVariantLabel(e.target.value)} placeholder="Phone Model" />
        </div>
        <div>
          <label style={lbl}>Variant Options (comma-separated)</label>
          <input style={inp} value={variantsText} onChange={e => setVariantsText(e.target.value)} placeholder="iPhone 14, iPhone 15, iPhone 16" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label style={lbl}>Price ($)</label>
          <input style={inp} type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="29.99" />
        </div>
        <div>
          <label style={lbl}>Compare-at Price ($, optional)</label>
          <input style={inp} type="number" step="0.01" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} placeholder="39.99" />
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={lbl}>Description (HTML)</label>
        <textarea
          style={{ ...inp, minHeight: "140px", resize: "vertical", fontFamily: "monospace" }}
          value={descriptionHtml}
          onChange={e => setDescriptionHtml(e.target.value)}
          placeholder="<p>Hand-finished dark art, printed on a premium impact-resistant case.</p>"
        />
        <p style={{ fontSize: "0.65rem", color: C.textMut, marginTop: "6px" }}>
          Basic tags only (p, strong, em, ul/li, h3, a, img). Scripts are stripped automatically.
        </p>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "0.8rem", color: C.textSec, cursor: "pointer" }}>
        <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
        Feature this product at the top of /shop
      </label>

      <div style={{ display: "flex", gap: "10px" }}>
        <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}</Btn>
        {isEdit && <Btn variant="ghost" onClick={onCancelEdit}>Cancel</Btn>}
      </div>

      {isEdit && (
        <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: "0.75rem", color: C.textSec, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>Images</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={lbl}>Thumbnail (9:16 — required, main product image)</label>
              {existing!.thumbnailKey && (
                <p style={{ fontSize: "0.7rem", color: C.green, marginBottom: "8px" }}>✓ Thumbnail already set — uploading a new one replaces it.</p>
              )}
              <input ref={thumbInputRef} type="file" accept="image/*" onChange={e => setThumbFile(e.target.files?.[0] ?? null)} style={{ marginBottom: "8px", fontSize: "0.75rem" }} />
              <Btn variant="ghost" onClick={handleUploadThumb} disabled={!thumbFile || uploadingThumb}>{uploadingThumb ? "Uploading…" : "Upload Thumbnail"}</Btn>
            </div>
            <div>
              <label style={lbl}>Gallery Image (9:16 — extra angles/mockups)</label>
              <p style={{ fontSize: "0.7rem", color: C.textMut, marginBottom: "8px" }}>{existing!.galleryKeys.length} uploaded so far.</p>
              <input ref={galleryInputRef} type="file" accept="image/*" onChange={e => setGalleryFile(e.target.files?.[0] ?? null)} style={{ marginBottom: "8px", fontSize: "0.75rem" }} />
              <Btn variant="ghost" onClick={handleUploadGallery} disabled={!galleryFile || uploadingGallery}>{uploadingGallery ? "Uploading…" : "Add Gallery Image"}</Btn>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}