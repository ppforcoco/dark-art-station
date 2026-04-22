// app/admin/districts/page.tsx — Admin panel for the 6 Haunted Town Districts
// Each district is locked to its own tag. Images tagged here appear in
// "Choose Your Obsession" on the home page.

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── The 6 fixed districts — mirrors app/page.tsx ────────────────────────────
const DISTRICTS = [
  {
    id: "classic",
    tag: "classic-district",
    label: "The Classic District",
    emoji: "🏚️",
    desc: "Old houses, vintage portraits, Victorian furniture & traditional dark elegance.",
    accent: "#8B6914",
  },
  {
    id: "city",
    tag: "city-center",
    label: "The City Center",
    emoji: "🌆",
    desc: "Rainy streets, dark skyscrapers, neon signs & back alleys.",
    accent: "#1a6ecf",
  },
  {
    id: "bone",
    tag: "bone-street",
    label: "Bone Street",
    emoji: "💀",
    desc: "Skulls, skeletons & anatomical art.",
    accent: "#c0c0c0",
  },
  {
    id: "nature",
    tag: "nature-trail",
    label: "The Nature Trail",
    emoji: "🌲",
    desc: "Dark forests, fog-covered mountains, dead trees & winter landscapes.",
    accent: "#2d6a4f",
  },
  {
    id: "minimal",
    tag: "minimalist-row",
    label: "Minimalist Row",
    emoji: "◼",
    desc: "Simple silhouettes, solid black (AMOLED) backgrounds & thin lines.",
    accent: "#555555",
  },
  {
    id: "character",
    tag: "character-ward",
    label: "The Character Ward",
    emoji: "🎭",
    desc: "Hooded figures, masks, shadow people & dark armor illustrations.",
    accent: "#7b2d8b",
  },
] as const;

type District = (typeof DISTRICTS)[number];

interface DistrictImage {
  id: string;
  title: string | null;
  slug: string;
  r2Key: string;
  tags: string[];
  createdAt: string;
  thumbnailUrl: string;
}

interface DistrictData {
  districtId: string;
  images: DistrictImage[];
  total: number;
}

// ── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminDistrictsPage() {
  const [activeDistrict, setActiveDistrict] = useState<District>(DISTRICTS[0]);
  const [districtData, setDistrictData] = useState<Record<string, DistrictData>>({});
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [removeLoading, setRemoveLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch images for a district
  const fetchDistrict = useCallback(async (district: District) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/districts?tag=${encodeURIComponent(district.tag)}&limit=50`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data: DistrictData = await res.json();
      setDistrictData((prev) => ({ ...prev, [district.id]: data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistrict(activeDistrict);
    setSelectedImages(new Set());
  }, [activeDistrict, fetchDistrict]);

  // Handle file upload — uploads image and auto-tags it with the district tag
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadStatus("Uploading...");
    setUploadError(null);

    const form = new FormData();
    Array.from(files).forEach((f) => form.append("files", f));
    form.append("tags", activeDistrict.tag);
    form.append("districtId", activeDistrict.id);

    try {
      const res = await fetch("/api/admin/districts/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Upload failed");
      }
      const result = await res.json();
      setUploadStatus(`✓ Uploaded ${result.count} image${result.count !== 1 ? "s" : ""}`);
      await fetchDistrict(activeDistrict);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadError(message);
      setUploadStatus(null);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setUploadStatus(null), 4000);
    }
  };

  // Toggle image selection
  const toggleSelect = (id: string) => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Remove selected images from this district (untag them)
  const handleRemoveFromDistrict = async () => {
    if (selectedImages.size === 0) return;
    if (!confirm(`Remove ${selectedImages.size} image(s) from ${activeDistrict.label}?`)) return;
    setRemoveLoading(true);
    try {
      const res = await fetch("/api/admin/districts/untag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageIds: Array.from(selectedImages),
          tag: activeDistrict.tag,
        }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      setSelectedImages(new Set());
      await fetchDistrict(activeDistrict);
    } catch (err) {
      console.error(err);
    } finally {
      setRemoveLoading(false);
    }
  };

  const currentData = districtData[activeDistrict.id];
  const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

  return (
    <div className="dt-admin-districts">
      {/* ── Page header ── */}
      <div className="dt-admin-districts__header">
        <div>
          <h1 className="dt-admin-districts__title">District World Manager</h1>
          <p className="dt-admin-districts__sub">
            Upload images into a district — they automatically get tagged and appear in
            "Choose Your Obsession" on the home page.
          </p>
        </div>
        <a href="/admin" className="dt-admin-btn dt-admin-btn--ghost">← Back to Admin</a>
      </div>

      <div className="dt-admin-districts__layout">

        {/* ── LEFT SIDEBAR: District selector ── */}
        <aside className="dt-admin-districts__sidebar">
          <h2 className="dt-admin-districts__sidebar-title">The 6 Districts</h2>
          {DISTRICTS.map((d) => {
            const data = districtData[d.id];
            const isActive = d.id === activeDistrict.id;
            return (
              <button
                key={d.id}
                onClick={() => setActiveDistrict(d)}
                className={`dt-admin-district-tab ${isActive ? "dt-admin-district-tab--active" : ""}`}
                style={{ "--tab-accent": d.accent } as React.CSSProperties}
              >
                <span className="dt-admin-district-tab__emoji">{d.emoji}</span>
                <span className="dt-admin-district-tab__info">
                  <span className="dt-admin-district-tab__label">{d.label}</span>
                  <span className="dt-admin-district-tab__tag">#{d.tag}</span>
                </span>
                <span className="dt-admin-district-tab__count">
                  {data ? data.total : "–"}
                </span>
              </button>
            );
          })}
        </aside>

        {/* ── MAIN PANEL ── */}
        <main className="dt-admin-districts__main">

          {/* District title bar */}
          <div
            className="dt-admin-district-panel__head"
            style={{ "--panel-accent": activeDistrict.accent } as React.CSSProperties}
          >
            <div className="dt-admin-district-panel__title-row">
              <span className="dt-admin-district-panel__emoji">{activeDistrict.emoji}</span>
              <div>
                <h2 className="dt-admin-district-panel__title">{activeDistrict.label}</h2>
                <p className="dt-admin-district-panel__desc">{activeDistrict.desc}</p>
              </div>
            </div>
            <div className="dt-admin-district-panel__meta">
              <code className="dt-admin-district-panel__tag">tag: {activeDistrict.tag}</code>
              <span className="dt-admin-district-panel__total">
                {currentData ? `${currentData.total} images` : "Loading..."}
              </span>
            </div>
          </div>

          {/* Upload zone */}
          <div className="dt-admin-upload-zone">
            <div className="dt-admin-upload-zone__inner">
              <span className="dt-admin-upload-zone__icon">📁</span>
              <div className="dt-admin-upload-zone__text">
                <strong>Drop images here</strong> or click to browse
                <br />
                <small>PNG, JPEG, WEBP · Max 20MB per file · Auto-tagged as <code>{activeDistrict.tag}</code></small>
              </div>
              <label className="dt-admin-btn dt-admin-btn--primary" htmlFor="district-upload">
                Choose Files
              </label>
              <input
                id="district-upload"
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleUpload}
                style={{ display: "none" }}
              />
            </div>
            {uploadStatus && (
              <p className="dt-admin-upload-zone__status dt-admin-upload-zone__status--ok">
                {uploadStatus}
              </p>
            )}
            {uploadError && (
              <p className="dt-admin-upload-zone__status dt-admin-upload-zone__status--err">
                ✗ {uploadError}
              </p>
            )}
          </div>

          {/* Action toolbar */}
          {selectedImages.size > 0 && (
            <div className="dt-admin-action-bar">
              <span>{selectedImages.size} selected</span>
              <button
                className="dt-admin-btn dt-admin-btn--danger"
                onClick={handleRemoveFromDistrict}
                disabled={removeLoading}
              >
                {removeLoading ? "Removing..." : `Remove from ${activeDistrict.label}`}
              </button>
              <button
                className="dt-admin-btn dt-admin-btn--ghost"
                onClick={() => setSelectedImages(new Set())}
              >
                Deselect all
              </button>
            </div>
          )}

          {/* Image grid / thumbnails */}
          {loading ? (
            <div className="dt-admin-loading">
              <span className="dt-admin-loading__spinner" />
              Loading district images…
            </div>
          ) : currentData && currentData.images.length > 0 ? (
            <div className="dt-admin-img-grid">
              {currentData.images.map((img) => {
                const selected = selectedImages.has(img.id);
                const thumb = `${r2Base}/${img.r2Key}`;
                return (
                  <div
                    key={img.id}
                    className={`dt-admin-img-card ${selected ? "dt-admin-img-card--selected" : ""}`}
                    onClick={() => toggleSelect(img.id)}
                    title={img.title ?? img.slug}
                  >
                    {/* Thumbnail */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={img.title ?? img.slug}
                      className="dt-admin-img-card__thumb"
                      loading="lazy"
                    />

                    {/* Selection checkbox overlay */}
                    <div className="dt-admin-img-card__check-overlay">
                      <span className="dt-admin-img-card__check">{selected ? "✓" : ""}</span>
                    </div>

                    {/* Info bar */}
                    <div className="dt-admin-img-card__info">
                      <span className="dt-admin-img-card__name">
                        {img.title ?? img.slug}
                      </span>
                      <div className="dt-admin-img-card__tags">
                        {img.tags.map((t) => (
                          <span
                            key={t}
                            className={`dt-admin-img-card__tag-pill ${
                              t === activeDistrict.tag ? "dt-admin-img-card__tag-pill--district" : ""
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="dt-admin-img-card__actions" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={`/admin/images/${img.id}/edit`}
                          className="dt-admin-btn dt-admin-btn--xs"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Edit
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="dt-admin-empty">
              <div className="dt-admin-empty__sigil">{activeDistrict.emoji}</div>
              <h3 className="dt-admin-empty__title">This district is empty</h3>
              <p className="dt-admin-empty__sub">
                Upload images above. They will be automatically tagged{" "}
                <code>{activeDistrict.tag}</code> and appear in the district grid on the home page.
              </p>
            </div>
          )}

        </main>
      </div>

      {/* ── CSS: Admin district styles ── */}
      <style jsx>{`
        /* ── Layout ── */
        .dt-admin-districts {
          min-height: 100vh;
          background: #0a0a0a;
          color: #e0e0e0;
          font-family: var(--font-body, system-ui, sans-serif);
          padding: 2rem;
        }
        .dt-admin-districts__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .dt-admin-districts__title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.25rem;
          letter-spacing: -0.02em;
        }
        .dt-admin-districts__sub {
          color: #999;
          font-size: 0.9rem;
          margin: 0;
          max-width: 520px;
        }
        .dt-admin-districts__layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        /* ── Sidebar ── */
        .dt-admin-districts__sidebar {
          background: #111;
          border: 1px solid #222;
          border-radius: 10px;
          overflow: hidden;
          position: sticky;
          top: 1.5rem;
        }
        .dt-admin-districts__sidebar-title {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #555;
          padding: 0.9rem 1rem 0.5rem;
          margin: 0;
        }
        .dt-admin-district-tab {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.7rem 1rem;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          border-left: 3px solid transparent;
          transition: background 0.15s, border-color 0.15s;
          position: relative;
        }
        .dt-admin-district-tab:hover {
          background: #1a1a1a;
        }
        .dt-admin-district-tab--active {
          background: #1a1a1a;
          border-left-color: var(--tab-accent, #7b2d8b);
        }
        .dt-admin-district-tab__emoji {
          font-size: 1.2rem;
          flex-shrink: 0;
          width: 1.6rem;
          text-align: center;
        }
        .dt-admin-district-tab__info {
          flex: 1;
          min-width: 0;
        }
        .dt-admin-district-tab__label {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          color: #ddd;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dt-admin-district-tab__tag {
          display: block;
          font-size: 0.68rem;
          color: #555;
          font-family: monospace;
        }
        .dt-admin-district-tab__count {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--tab-accent, #7b2d8b);
          background: color-mix(in srgb, var(--tab-accent, #7b2d8b) 15%, transparent);
          padding: 0.1rem 0.4rem;
          border-radius: 9px;
          flex-shrink: 0;
        }

        /* ── Main panel ── */
        .dt-admin-districts__main {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .dt-admin-district-panel__head {
          background: #111;
          border: 1px solid #222;
          border-top: 3px solid var(--panel-accent, #7b2d8b);
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
        }
        .dt-admin-district-panel__title-row {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          margin-bottom: 0.75rem;
        }
        .dt-admin-district-panel__emoji {
          font-size: 2rem;
          flex-shrink: 0;
        }
        .dt-admin-district-panel__title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.2rem;
        }
        .dt-admin-district-panel__desc {
          font-size: 0.82rem;
          color: #888;
          margin: 0;
        }
        .dt-admin-district-panel__meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .dt-admin-district-panel__tag {
          font-size: 0.75rem;
          background: #1a1a1a;
          border: 1px solid #333;
          color: var(--panel-accent, #7b2d8b);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
        }
        .dt-admin-district-panel__total {
          font-size: 0.78rem;
          color: #666;
        }

        /* ── Upload zone ── */
        .dt-admin-upload-zone {
          background: #111;
          border: 2px dashed #2a2a2a;
          border-radius: 10px;
          padding: 1.5rem;
          transition: border-color 0.2s;
        }
        .dt-admin-upload-zone:hover {
          border-color: #444;
        }
        .dt-admin-upload-zone__inner {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .dt-admin-upload-zone__icon {
          font-size: 1.8rem;
        }
        .dt-admin-upload-zone__text {
          flex: 1;
          font-size: 0.85rem;
          color: #888;
          line-height: 1.6;
        }
        .dt-admin-upload-zone__text strong {
          color: #ccc;
        }
        .dt-admin-upload-zone__text code {
          color: #a78bfa;
          font-family: monospace;
          font-size: 0.82rem;
        }
        .dt-admin-upload-zone__status {
          margin: 0.75rem 0 0;
          font-size: 0.82rem;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
        }
        .dt-admin-upload-zone__status--ok {
          background: #0f2a1a;
          color: #4ade80;
          border: 1px solid #166534;
        }
        .dt-admin-upload-zone__status--err {
          background: #2a0f0f;
          color: #f87171;
          border: 1px solid #991b1b;
        }

        /* ── Action bar ── */
        .dt-admin-action-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #1a1205;
          border: 1px solid #4a3200;
          border-radius: 8px;
          padding: 0.6rem 1rem;
          font-size: 0.82rem;
          color: #c0a000;
          flex-wrap: wrap;
        }

        /* ── Image grid ── */
        .dt-admin-img-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.85rem;
        }
        .dt-admin-img-card {
          background: #111;
          border: 2px solid #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          transition: border-color 0.15s, transform 0.15s;
        }
        .dt-admin-img-card:hover {
          border-color: #333;
          transform: translateY(-2px);
        }
        .dt-admin-img-card--selected {
          border-color: #7b2d8b;
          box-shadow: 0 0 0 2px #7b2d8b55;
        }
        .dt-admin-img-card__thumb {
          width: 100%;
          aspect-ratio: 3 / 4;
          object-fit: cover;
          display: block;
        }
        .dt-admin-img-card__check-overlay {
          position: absolute;
          top: 0.4rem;
          right: 0.4rem;
          width: 1.4rem;
          height: 1.4rem;
          border-radius: 50%;
          border: 2px solid #fff;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          color: #fff;
          font-weight: 700;
          transition: background 0.15s;
        }
        .dt-admin-img-card--selected .dt-admin-img-card__check-overlay {
          background: #7b2d8b;
          border-color: #7b2d8b;
        }
        .dt-admin-img-card__info {
          padding: 0.5rem 0.6rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .dt-admin-img-card__name {
          font-size: 0.72rem;
          font-weight: 600;
          color: #ccc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dt-admin-img-card__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.2rem;
        }
        .dt-admin-img-card__tag-pill {
          font-size: 0.62rem;
          background: #1e1e1e;
          color: #666;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-family: monospace;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dt-admin-img-card__tag-pill--district {
          background: #2a1240;
          color: #a78bfa;
        }
        .dt-admin-img-card__actions {
          margin-top: 0.1rem;
        }

        /* ── Empty state ── */
        .dt-admin-empty {
          text-align: center;
          padding: 4rem 2rem;
          background: #111;
          border: 1px dashed #222;
          border-radius: 10px;
        }
        .dt-admin-empty__sigil {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .dt-admin-empty__title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #ccc;
          margin: 0 0 0.5rem;
        }
        .dt-admin-empty__sub {
          color: #666;
          font-size: 0.85rem;
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .dt-admin-empty__sub code {
          color: #a78bfa;
          font-family: monospace;
        }

        /* ── Loading ── */
        .dt-admin-loading {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #666;
          font-size: 0.85rem;
          padding: 2rem;
          justify-content: center;
        }
        .dt-admin-loading__spinner {
          width: 1.2rem;
          height: 1.2rem;
          border: 2px solid #333;
          border-top-color: #7b2d8b;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Buttons ── */
        .dt-admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.9rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          text-decoration: none;
          transition: opacity 0.15s, background 0.15s;
        }
        .dt-admin-btn:hover { opacity: 0.85; }
        .dt-admin-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .dt-admin-btn--primary {
          background: #7b2d8b;
          color: #fff;
        }
        .dt-admin-btn--ghost {
          background: transparent;
          border: 1px solid #333;
          color: #aaa;
        }
        .dt-admin-btn--ghost:hover {
          background: #1a1a1a;
          opacity: 1;
        }
        .dt-admin-btn--danger {
          background: #7f1d1d;
          color: #fca5a5;
        }
        .dt-admin-btn--danger:hover {
          background: #991b1b;
          opacity: 1;
        }
        .dt-admin-btn--xs {
          padding: 0.2rem 0.5rem;
          font-size: 0.68rem;
          background: #1e1e1e;
          color: #aaa;
          border: 1px solid #333;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .dt-admin-districts {
            padding: 1rem;
          }
          .dt-admin-districts__layout {
            grid-template-columns: 1fr;
          }
          .dt-admin-districts__sidebar {
            position: static;
            display: flex;
            flex-wrap: wrap;
            gap: 0;
          }
          .dt-admin-district-tab {
            flex: 1 1 48%;
            border-left: none;
            border-bottom: 2px solid transparent;
          }
          .dt-admin-district-tab--active {
            border-bottom-color: var(--tab-accent, #7b2d8b);
          }
          .dt-admin-img-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}