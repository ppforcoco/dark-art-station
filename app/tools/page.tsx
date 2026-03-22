"use client";

import { useState, useRef, useCallback } from "react";

type ActiveTool = "resizer" | "darkener" | "upscaler" | "text" | "blur" | "split";
type ImgFormat = "jpeg" | "png" | "webp";

const FORMATS: { value: ImgFormat; label: string; ext: string }[] = [
  { value: "jpeg", label: "JPG",  ext: "jpg"  },
  { value: "png",  label: "PNG",  ext: "png"  },
  { value: "webp", label: "WEBP", ext: "webp" },
];

// ─── Device presets ───────────────────────────────────────────────────────────
const PRESETS = [
  { label: "iPhone 16 Pro",      w: 1320, h: 2868 },
  { label: "iPhone 14 / 15",     w: 1179, h: 2556 },
  { label: "Samsung S24",        w: 1080, h: 2340 },
  { label: "Google Pixel 9",     w: 1080, h: 2424 },
  { label: "Android Generic",    w: 1080, h: 1920 },
  { label: "PC 4K",              w: 3840, h: 2160 },
  { label: "PC 1440p",           w: 2560, h: 1440 },
  { label: "PC 1080p",           w: 1920, h: 1080 },
  { label: "iPad Pro 12.9\"",    w: 2048, h: 2732 },
];

// ─── Overlay colour presets ───────────────────────────────────────────────────
const COLORS = [
  { label: "Crimson",  r: 192, g: 0,   b: 26  },
  { label: "Void",     r: 0,   g: 0,   b: 0   },
  { label: "Midnight", r: 10,  g: 8,   b: 30  },
  { label: "Gold",     r: 201, g: 168, b: 76  },
  { label: "Purple",   r: 80,  g: 0,   b: 120 },
  { label: "Emerald",  r: 0,   g: 80,  b: 40  },
  { label: "Slate",    r: 20,  g: 30,  b: 60  },
  { label: "Ember",    r: 180, g: 60,  b: 0   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadImg(file: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = rej;
    img.src = url;
  });
}

function downloadCanvas(canvas: HTMLCanvasElement, name: string, fmt: ImgFormat = "jpeg") {
  const mime = `image/${fmt}`;
  const quality = fmt === "png" ? undefined : 0.96;
  canvas.toBlob(blob => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }, mime, quality);
}

// ─── Wallpaper Resizer ────────────────────────────────────────────────────────
function ResizerTool() {
  const [img,    setImg]    = useState<HTMLImageElement | null>(null);
  const [name,   setName]   = useState("");
  const [preset, setPreset] = useState(PRESETS[0]);
  const [fit,    setFit]    = useState<"cover"|"contain"|"stretch">("cover");
  const [fmt,    setFmt]    = useState<ImgFormat>("jpeg");
  const [done,   setDone]   = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback((image: HTMLImageElement, p: typeof preset, f: string) => {
    const c = previewRef.current; if (!c) return;
    const scale = Math.min(280 / p.w, 460 / p.h);
    c.width  = Math.round(p.w * scale);
    c.height = Math.round(p.h * scale);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#070710"; ctx.fillRect(0, 0, c.width, c.height);
    if (f === "stretch") {
      ctx.drawImage(image, 0, 0, c.width, c.height);
    } else {
      const r = f === "contain"
        ? Math.min(c.width / image.width, c.height / image.height)
        : Math.max(c.width / image.width, c.height / image.height);
      const dw = image.width * r, dh = image.height * r;
      ctx.drawImage(image, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh);
    }
  }, []);

  async function handleFile(file: File) {
    const image = await loadImg(file);
    setImg(image); setName(file.name.replace(/\.[^.]+$/, "")); setDone(false);
    render(image, preset, fit);
  }

  function changePreset(p: typeof preset) { setPreset(p); if (img) render(img, p, fit); }
  function changeFit(f: string) { setFit(f as typeof fit); if (img) render(img, preset, f); }

  function download() {
    if (!img) return;
    const c = document.createElement("canvas");
    c.width = preset.w; c.height = preset.h;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#070710"; ctx.fillRect(0, 0, c.width, c.height);
    if (fit === "stretch") {
      ctx.drawImage(img, 0, 0, c.width, c.height);
    } else {
      const r = fit === "contain"
        ? Math.min(c.width / img.width, c.height / img.height)
        : Math.max(c.width / img.width, c.height / img.height);
      const dw = img.width * r, dh = img.height * r;
      ctx.drawImage(img, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh);
    }
    downloadCanvas(c, `${name || "wallpaper"}-${preset.label.replace(/[^a-z0-9]/gi,"-").toLowerCase()}.${FORMATS.find(f=>f.value===fmt)?.ext ?? "jpg"}`, fmt);
    setDone(true); setTimeout(() => setDone(false), 3000);
  }

  return (
    <div className="tool-body">
      <p className="tool-desc">Upload any image and export it at the exact resolution of your device. Runs entirely in your browser — nothing is uploaded anywhere.</p>

      {/* Drop zone */}
      <div
        className={`tool-drop ${img ? "tool-drop--filled" : ""}`}
        onClick={() => document.getElementById("resizer-input")?.click()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
        onDragOver={e => e.preventDefault()}
      >
        <input id="resizer-input" type="file" accept="image/*" style={{display:"none"}}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {img ? (
          <div className="tool-preview-wrap">
            <canvas ref={previewRef} className="tool-canvas" />
            <p className="tool-change-hint">Click to change image</p>
          </div>
        ) : (
          <div className="tool-drop-empty">
            <span className="tool-drop-icon">↑</span>
            <p className="tool-drop-label">Drop image here or click to upload</p>
            <p className="tool-drop-sub">JPG · PNG · WEBP — stays on your device</p>
          </div>
        )}
      </div>

      {img && <>
        {/* Device presets */}
        <div className="tool-section">
          <p className="tool-label">Target Device</p>
          <div className="tool-preset-grid">
            {PRESETS.map(p => (
              <button key={p.label}
                className={`tool-preset ${preset.label === p.label ? "tool-preset--active" : ""}`}
                onClick={() => changePreset(p)}
              >
                <span className="tool-preset-name">{p.label}</span>
                <span className="tool-preset-size">{p.w}×{p.h}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fit mode */}
        <div className="tool-section">
          <p className="tool-label">Fit Mode</p>
          <div className="tool-fit-row">
            {(["cover","contain","stretch"] as const).map(f => (
              <button key={f}
                className={`tool-fit-btn ${fit === f ? "tool-fit-btn--active" : ""}`}
                onClick={() => changeFit(f)}
              >
                {f === "cover" ? "Fill (Crop)" : f === "contain" ? "Fit (Bars)" : "Stretch"}
              </button>
            ))}
          </div>
          <p className="tool-hint">
            {fit === "cover" ? "Image fills frame — edges may crop." : fit === "contain" ? "Full image visible — dark bars fill gaps." : "Image stretched to fill — may distort."}
          </p>
        </div>

        <div className="tool-section">
          <p className="tool-label">Output Format</p>
          <div className="tool-fit-row">
            {FORMATS.map(f => (
              <button key={f.value}
                className={`tool-fit-btn ${fmt === f.value ? "tool-fit-btn--active" : ""}`}
                onClick={() => setFmt(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button className="tool-action" onClick={download}>
          {done ? "✓ Downloaded!" : `↓ Download for ${preset.label}`}
        </button>
      </>}
    </div>
  );
}

// ─── Color Darkener ───────────────────────────────────────────────────────────
function DarkenerTool() {
  const [img,        setImg]        = useState<HTMLImageElement | null>(null);
  const [name,       setName]       = useState("");
  const [color,      setColor]      = useState(COLORS[0]);
  const [opacity,    setOpacity]    = useState(40);
  const [brightness, setBrightness] = useState(100);
  const [fmt,        setFmt]        = useState<ImgFormat>("jpeg");
  const [done,       setDone]       = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback((image: HTMLImageElement, c: typeof color, op: number, br: number) => {
    const canvas = previewRef.current; if (!canvas) return;
    const scale = Math.min(280 / image.width, 460 / image.height, 1);
    canvas.width  = Math.round(image.width  * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.filter = `brightness(${br}%)`;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";
    ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${op / 100})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  async function handleFile(file: File) {
    const image = await loadImg(file);
    setImg(image); setName(file.name.replace(/\.[^.]+$/, "")); setDone(false);
    render(image, color, opacity, brightness);
  }

  function update(c: typeof color, op: number, br: number) {
    setColor(c); setOpacity(op); setBrightness(br);
    if (img) render(img, c, op, br);
  }

  function download() {
    if (!img) return;
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext("2d")!;
    ctx.filter = `brightness(${brightness}%)`;
    ctx.drawImage(img, 0, 0);
    ctx.filter = "none";
    ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${opacity / 100})`;
    ctx.fillRect(0, 0, c.width, c.height);
    downloadCanvas(c, `${name || "wallpaper"}-${color.label.toLowerCase()}-dark.${FORMATS.find(f=>f.value===fmt)?.ext ?? "jpg"}`, fmt);
    setDone(true); setTimeout(() => setDone(false), 3000);
  }

  return (
    <div className="tool-body">
      <p className="tool-desc">Apply a dark colour tint to any image. Turn a bright photo into a dark wallpaper instantly. Adjust intensity and brightness with the sliders — the preview updates live.</p>

      <div
        className={`tool-drop ${img ? "tool-drop--filled" : ""}`}
        onClick={() => document.getElementById("darkener-input")?.click()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
        onDragOver={e => e.preventDefault()}
      >
        <input id="darkener-input" type="file" accept="image/*" style={{display:"none"}}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {img ? (
          <div className="tool-preview-wrap">
            <canvas ref={previewRef} className="tool-canvas" />
            <p className="tool-change-hint">Click to change image</p>
          </div>
        ) : (
          <div className="tool-drop-empty">
            <span className="tool-drop-icon">🎨</span>
            <p className="tool-drop-label">Drop image here or click to upload</p>
            <p className="tool-drop-sub">Any image — add a dark overlay instantly</p>
          </div>
        )}
      </div>

      {img && <>
        {/* Colour picker */}
        <div className="tool-section">
          <p className="tool-label">Overlay Colour</p>
          <div className="tool-color-row">
            {COLORS.map(c => (
              <button key={c.label}
                className={`tool-color-btn ${color.label === c.label ? "tool-color-btn--active" : ""}`}
                onClick={() => update(c, opacity, brightness)}
                title={c.label}
              >
                <span className="tool-color-swatch"
                  style={{ background: `rgba(${c.r},${c.g},${c.b},0.85)` }} />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="tool-section">
          <p className="tool-label">Overlay Intensity — <strong>{opacity}%</strong></p>
          <input type="range" min={0} max={90} value={opacity} className="tool-range"
            onChange={e => update(color, Number(e.target.value), brightness)} />
        </div>

        <div className="tool-section">
          <p className="tool-label">Source Brightness — <strong>{brightness}%</strong></p>
          <input type="range" min={20} max={120} value={brightness} className="tool-range"
            onChange={e => update(color, opacity, Number(e.target.value))} />
        </div>

        <div className="tool-section">
          <p className="tool-label">Output Format</p>
          <div className="tool-fit-row">
            {FORMATS.map(f => (
              <button key={f.value}
                className={`tool-fit-btn ${fmt === f.value ? "tool-fit-btn--active" : ""}`}
                onClick={() => setFmt(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button className="tool-action" onClick={download}>
          {done ? "✓ Downloaded!" : "↓ Download Darkened Image"}
        </button>
      </>}
    </div>
  );
}

// ─── Image Upscaler ───────────────────────────────────────────────────────────
const UPSCALE_FACTORS = [2, 3, 4] as const;
type UpscaleFactor = typeof UPSCALE_FACTORS[number];

function UpscalerTool() {
  const [img,    setImg]    = useState<HTMLImageElement | null>(null);
  const [name,   setName]   = useState("");
  const [factor, setFactor] = useState<UpscaleFactor>(2);
  const [fmt,    setFmt]    = useState<ImgFormat>("jpeg");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const previewRef = useRef<HTMLCanvasElement>(null);

  const renderPreview = useCallback((image: HTMLImageElement) => {
    const c = previewRef.current; if (!c) return;
    const scale = Math.min(280 / image.width, 460 / image.height, 1);
    c.width  = Math.round(image.width  * scale);
    c.height = Math.round(image.height * scale);
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, c.width, c.height);
  }, []);

  async function handleFile(file: File) {
    const image = await loadImg(file);
    setImg(image);
    setName(file.name.replace(/\.[^.]+$/, ""));
    setStatus("idle");
    renderPreview(image);
  }

  function upscale() {
    if (!img) return;
    setStatus("processing");

    // Use setTimeout so UI can update before heavy canvas work
    setTimeout(() => {
      const targetW = img.width  * factor;
      const targetH = img.height * factor;

      // Step-up upscaling: always double in steps for best sharpness
      // Each step uses high-quality smoothing to preserve detail
      let current: HTMLCanvasElement = document.createElement("canvas");
      current.width  = img.width;
      current.height = img.height;
      const initCtx = current.getContext("2d")!;
      initCtx.imageSmoothingEnabled = true;
      initCtx.imageSmoothingQuality = "high";
      initCtx.drawImage(img, 0, 0);

      let w = img.width;
      let h = img.height;

      while (w < targetW || h < targetH) {
        const next = document.createElement("canvas");
        const stepW = Math.min(w * 2, targetW);
        const stepH = Math.min(h * 2, targetH);
        next.width  = stepW;
        next.height = stepH;
        const ctx = next.getContext("2d", { willReadFrequently: false })!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(current, 0, 0, stepW, stepH);
        current = next;
        w = stepW;
        h = stepH;
      }

      downloadCanvas(current, `${name || "wallpaper"}-${factor}x-upscaled.${FORMATS.find(f=>f.value===fmt)?.ext ?? "jpg"}`, fmt);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    }, 50);
  }

  const outW = img ? img.width  * factor : 0;
  const outH = img ? img.height * factor : 0;

  return (
    <div className="tool-body">
      <p className="tool-desc">
        Enlarge any wallpaper up to 4× its original size using step-up canvas interpolation.
        Best for images that need a resolution boost before setting as wallpaper.
        Runs entirely in your browser — nothing is uploaded.
      </p>

      <div
        className={`tool-drop ${img ? "tool-drop--filled" : ""}`}
        onClick={() => document.getElementById("upscaler-input")?.click()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
        onDragOver={e => e.preventDefault()}
      >
        <input id="upscaler-input" type="file" accept="image/*" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {img ? (
          <div className="tool-preview-wrap">
            <canvas ref={previewRef} className="tool-canvas" />
            <p className="tool-change-hint">Click to change image</p>
          </div>
        ) : (
          <div className="tool-drop-empty">
            <span className="tool-drop-icon">🔍</span>
            <p className="tool-drop-label">Drop image here or click to upload</p>
            <p className="tool-drop-sub">JPG · PNG · WEBP — upscaled on your device</p>
          </div>
        )}
      </div>

      {img && (
        <>
          <div className="tool-section">
            <p className="tool-label">Upscale Factor</p>
            <div className="tool-fit-row">
              {UPSCALE_FACTORS.map(f => (
                <button key={f}
                  className={`tool-fit-btn ${factor === f ? "tool-fit-btn--active" : ""}`}
                  onClick={() => setFactor(f)}
                >
                  {f}×
                </button>
              ))}
            </div>
            <p className="tool-hint">
              Output: {img.width}×{img.height} → <strong style={{ color: "#c9a84c" }}>{outW}×{outH}px</strong>
            </p>
          </div>

          <div className="tool-section">
            <p className="tool-label">Output Format</p>
            <div className="tool-fit-row">
              {FORMATS.map(f => (
                <button key={f.value}
                  className={`tool-fit-btn ${fmt === f.value ? "tool-fit-btn--active" : ""}`}
                  onClick={() => setFmt(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="tool-action"
            onClick={upscale}
            disabled={status === "processing"}
          >
            {status === "processing" ? "⏳ Upscaling…"
              : status === "done"      ? "✓ Downloaded!"
              : `↑ Upscale ${factor}× & Download`}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Text Overlay Tool ────────────────────────────────────────────────────────
const TEXT_FONTS = [
  { label: "Serif",      value: "Georgia, serif"              },
  { label: "Sans",       value: "Arial, sans-serif"           },
  { label: "Mono",       value: "Courier New, monospace"      },
  { label: "Display",    value: "Impact, sans-serif"          },
];
const TEXT_ALIGNS = ["left", "center", "right"] as const;
const TEXT_POSITIONS = [
  { label: "Top",    value: "top"    },
  { label: "Middle", value: "middle" },
  { label: "Bottom", value: "bottom" },
] as const;

function TextTool() {
  const [img,      setImg]      = useState<HTMLImageElement | null>(null);
  const [name,     setName]     = useState("");
  const [text,     setText]     = useState("YOUR TEXT");
  const [font,     setFont]     = useState(TEXT_FONTS[0].value);
  const [size,     setSize]     = useState(80);
  const [color,    setTextColor]= useState("#ffffff");
  const [opacity,  setOpacity]  = useState(100);
  const [align,    setAlign]    = useState<typeof TEXT_ALIGNS[number]>("center");
  const [position, setPosition] = useState<typeof TEXT_POSITIONS[number]["value"]>("bottom");
  const [shadow,   setShadow]   = useState(true);
  const [fmt,      setFmt]      = useState<ImgFormat>("jpeg");
  const [done,     setDone]     = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback((
    image: HTMLImageElement, t: string, f: string, sz: number,
    col: string, op: number, al: string, pos: string, sh: boolean
  ) => {
    const c = previewRef.current; if (!c) return;
    const scale = Math.min(300 / image.width, 500 / image.height, 1);
    c.width  = Math.round(image.width  * scale);
    c.height = Math.round(image.height * scale);
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, c.width, c.height);
    if (!t.trim()) return;
    const scaledSize = Math.round(sz * scale);
    ctx.font = `bold ${scaledSize}px ${f}`;
    ctx.textAlign = al as CanvasTextAlign;
    ctx.globalAlpha = op / 100;
    if (sh) {
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur  = scaledSize * 0.3;
      ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
    }
    ctx.fillStyle = col;
    const x = al === "left" ? 20 * scale : al === "right" ? c.width - 20 * scale : c.width / 2;
    const y = pos === "top" ? scaledSize + 20 * scale : pos === "middle" ? c.height / 2 : c.height - 30 * scale;
    // Handle multiline
    const lines = t.split("\n");
    lines.forEach((line, i) => {
      ctx.fillText(line, x, y + i * scaledSize * 1.2);
    });
    ctx.globalAlpha = 1; ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  }, []);

  async function handleFile(file: File) {
    const image = await loadImg(file);
    setImg(image); setName(file.name.replace(/\.[^.]+$/, ""));
    render(image, text, font, size, color, opacity, align, position, shadow);
  }

  function update(t=text, f=font, sz=size, col=color, op=opacity, al=align, pos=position, sh=shadow) {
    setText(t); setFont(f); setSize(sz); setTextColor(col);
    setOpacity(op); setAlign(al); setPosition(pos); setShadow(sh);
    if (img) render(img, t, f, sz, col, op, al, pos, sh);
  }

  function download() {
    if (!img) return;
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0);
    if (text.trim()) {
      ctx.font = `bold ${size}px ${font}`;
      ctx.textAlign = align as CanvasTextAlign;
      ctx.globalAlpha = opacity / 100;
      if (shadow) { ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = size * 0.3; }
      ctx.fillStyle = color;
      const x = align === "left" ? 20 : align === "right" ? c.width - 20 : c.width / 2;
      const y = position === "top" ? size + 20 : position === "middle" ? c.height / 2 : c.height - 30;
      text.split("\n").forEach((line, i) => ctx.fillText(line, x, y + i * size * 1.2));
      ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.shadowColor = "transparent";
    }
    const ext = FORMATS.find(f => f.value === fmt)?.ext ?? "jpg";
    downloadCanvas(c, `${name || "wallpaper"}-text.${ext}`, fmt);
    setDone(true); setTimeout(() => setDone(false), 3000);
  }

  return (
    <div className="tool-body">
      <p className="tool-desc">Add custom text or quotes to any wallpaper. Choose font, size, colour, position and shadow. Use line breaks for multiple lines.</p>

      <div className={`tool-drop ${img ? "tool-drop--filled" : ""}`}
        onClick={() => document.getElementById("text-input")?.click()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
        onDragOver={e => e.preventDefault()}
      >
        <input id="text-input" type="file" accept="image/*" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {img ? (
          <div className="tool-preview-wrap">
            <canvas ref={previewRef} className="tool-canvas" />
            <p className="tool-change-hint">Click to change image</p>
          </div>
        ) : (
          <div className="tool-drop-empty">
            <span className="tool-drop-icon">✦</span>
            <p className="tool-drop-label">Drop image here or click to upload</p>
            <p className="tool-drop-sub">Add your text on top of any image</p>
          </div>
        )}
      </div>

      {img && <>
        <div className="tool-section">
          <p className="tool-label">Text (use Enter for new line)</p>
          <textarea
            value={text}
            onChange={e => update(e.target.value)}
            rows={2}
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#f0ecff", padding: "10px 12px", fontFamily: "var(--font-space), monospace",
              fontSize: "0.8rem", resize: "vertical", outline: "none",
            }}
          />
        </div>

        <div className="tool-section">
          <p className="tool-label">Font</p>
          <div className="tool-fit-row" style={{ flexWrap: "wrap" }}>
            {TEXT_FONTS.map(f => (
              <button key={f.value}
                className={`tool-fit-btn ${font === f.value ? "tool-fit-btn--active" : ""}`}
                style={{ fontFamily: f.value }}
                onClick={() => update(text, f.value)}
              >{f.label}</button>
            ))}
          </div>
        </div>

        <div className="tool-section">
          <p className="tool-label">Font Size — <strong>{size}px</strong></p>
          <input type="range" min={20} max={300} value={size} className="tool-range"
            onChange={e => update(text, font, Number(e.target.value))} />
        </div>

        <div className="tool-section">
          <p className="tool-label">Text Color</p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input type="color" value={color}
              onChange={e => update(text, font, size, e.target.value)}
              style={{ width: "44px", height: "36px", border: "none", background: "none", cursor: "pointer" }} />
            <span style={{ fontFamily: "var(--font-space)", fontSize: "0.65rem", color: "#8a8099" }}>{color.toUpperCase()}</span>
            {["#ffffff","#000000","#c0001a","#c9a84c","#8b00ff","#00cfff"].map(c => (
              <button key={c} onClick={() => update(text, font, size, c)}
                style={{ width: "24px", height: "24px", background: c, border: color === c ? "2px solid #fff" : "1px solid rgba(255,255,255,0.2)", cursor: "pointer", borderRadius: "2px" }} />
            ))}
          </div>
        </div>

        <div className="tool-section">
          <p className="tool-label">Opacity — <strong>{opacity}%</strong></p>
          <input type="range" min={10} max={100} value={opacity} className="tool-range"
            onChange={e => update(text, font, size, color, Number(e.target.value))} />
        </div>

        <div className="tool-section">
          <p className="tool-label">Position</p>
          <div className="tool-fit-row">
            {TEXT_POSITIONS.map(p => (
              <button key={p.value}
                className={`tool-fit-btn ${position === p.value ? "tool-fit-btn--active" : ""}`}
                onClick={() => update(text, font, size, color, opacity, align, p.value)}
              >{p.label}</button>
            ))}
          </div>
        </div>

        <div className="tool-section">
          <p className="tool-label">Alignment</p>
          <div className="tool-fit-row">
            {TEXT_ALIGNS.map(a => (
              <button key={a}
                className={`tool-fit-btn ${align === a ? "tool-fit-btn--active" : ""}`}
                onClick={() => update(text, font, size, color, opacity, a)}
              >{a.charAt(0).toUpperCase() + a.slice(1)}</button>
            ))}
          </div>
        </div>

        <div className="tool-section">
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input type="checkbox" checked={shadow} onChange={e => update(text, font, size, color, opacity, align, position, e.target.checked)}
              style={{ accentColor: "#c0001a", width: "16px", height: "16px" }} />
            <span style={{ fontFamily: "var(--font-space)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8099" }}>
              Drop Shadow (improves readability)
            </span>
          </label>
        </div>

        <div className="tool-section">
          <p className="tool-label">Output Format</p>
          <div className="tool-fit-row">
            {FORMATS.map(f => (
              <button key={f.value} className={`tool-fit-btn ${fmt === f.value ? "tool-fit-btn--active" : ""}`}
                onClick={() => setFmt(f.value)}>{f.label}</button>
            ))}
          </div>
        </div>

        <button className="tool-action" onClick={download}>
          {done ? "✓ Downloaded!" : "↓ Download with Text"}
        </button>
      </>}
    </div>
  );
}

// ─── Blur Tool ────────────────────────────────────────────────────────────────
function BlurTool() {
  const [img,    setImg]    = useState<HTMLImageElement | null>(null);
  const [name,   setName]   = useState("");
  const [amount, setAmount] = useState(8);
  const [fmt,    setFmt]    = useState<ImgFormat>("jpeg");
  const [done,   setDone]   = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback((image: HTMLImageElement, blur: number) => {
    const c = previewRef.current; if (!c) return;
    const scale = Math.min(300 / image.width, 500 / image.height, 1);
    c.width  = Math.round(image.width  * scale);
    c.height = Math.round(image.height * scale);
    const ctx = c.getContext("2d")!;
    ctx.filter = `blur(${blur * scale}px)`;
    ctx.drawImage(image, -blur * scale * 2, -blur * scale * 2,
      c.width + blur * scale * 4, c.height + blur * scale * 4);
    ctx.filter = "none";
  }, []);

  async function handleFile(file: File) {
    const image = await loadImg(file);
    setImg(image); setName(file.name.replace(/\.[^.]+$/, ""));
    render(image, amount);
  }

  function updateBlur(v: number) { setAmount(v); if (img) render(img, v); }

  function download() {
    if (!img) return;
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext("2d")!;
    ctx.filter = `blur(${amount}px)`;
    ctx.drawImage(img, -amount * 2, -amount * 2,
      c.width + amount * 4, c.height + amount * 4);
    ctx.filter = "none";
    const ext = FORMATS.find(f => f.value === fmt)?.ext ?? "jpg";
    downloadCanvas(c, `${name || "wallpaper"}-blur${amount}.${ext}`, fmt);
    setDone(true); setTimeout(() => setDone(false), 3000);
  }

  return (
    <div className="tool-body">
      <p className="tool-desc">Blur any image for a soft, frosted background effect. Great for widget wallpapers on iOS and Android where you want icons to stand out.</p>

      <div className={`tool-drop ${img ? "tool-drop--filled" : ""}`}
        onClick={() => document.getElementById("blur-input")?.click()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
        onDragOver={e => e.preventDefault()}
      >
        <input id="blur-input" type="file" accept="image/*" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {img ? (
          <div className="tool-preview-wrap">
            <canvas ref={previewRef} className="tool-canvas" />
            <p className="tool-change-hint">Click to change image</p>
          </div>
        ) : (
          <div className="tool-drop-empty">
            <span className="tool-drop-icon">🌫</span>
            <p className="tool-drop-label">Drop image here or click to upload</p>
            <p className="tool-drop-sub">Create frosted glass wallpaper effects</p>
          </div>
        )}
      </div>

      {img && <>
        <div className="tool-section">
          <p className="tool-label">Blur Amount — <strong>{amount}px</strong></p>
          <input type="range" min={1} max={40} value={amount} className="tool-range"
            onChange={e => updateBlur(Number(e.target.value))} />
          <p className="tool-hint">
            {amount < 5 ? "Subtle soft focus." : amount < 15 ? "Medium blur — good for widgets." : "Heavy blur — frosted glass effect."}
          </p>
        </div>

        <div className="tool-section">
          <p className="tool-label">Output Format</p>
          <div className="tool-fit-row">
            {FORMATS.map(f => (
              <button key={f.value} className={`tool-fit-btn ${fmt === f.value ? "tool-fit-btn--active" : ""}`}
                onClick={() => setFmt(f.value)}>{f.label}</button>
            ))}
          </div>
        </div>

        <button className="tool-action" onClick={download}>
          {done ? "✓ Downloaded!" : "↓ Download Blurred Image"}
        </button>
      </>}
    </div>
  );
}

// ─── Split Wallpaper Maker ────────────────────────────────────────────────────
function SplitTool() {
  const [img,    setImg]    = useState<HTMLImageElement | null>(null);
  const [name,   setName]   = useState("");
  const [fmt,    setFmt]    = useState<ImgFormat>("jpeg");
  const [done,   setDone]   = useState<"" | "lock" | "home" | "both">("");
  const lockRef = useRef<HTMLCanvasElement>(null);
  const homeRef = useRef<HTMLCanvasElement>(null);

  // Lock screen: left half | Home screen: right half
  const render = useCallback((image: HTMLImageElement) => {
    const half = image.width / 2;
    const h    = image.height;
    const previewScale = Math.min(140 / half, 240 / h, 1);
    const W = Math.round(half * previewScale);
    const H = Math.round(h * previewScale);

    const lock = lockRef.current;
    if (lock) {
      lock.width = W; lock.height = H;
      const ctx = lock.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, half, h, 0, 0, W, H);
    }
    const home = homeRef.current;
    if (home) {
      home.width = W; home.height = H;
      const ctx = home.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, half, 0, half, h, 0, 0, W, H);
    }
  }, []);

  async function handleFile(file: File) {
    const image = await loadImg(file);
    setImg(image); setName(file.name.replace(/\.[^.]+$/, "")); setDone("");
    render(image);
  }

  function downloadSplit(side: "lock" | "home" | "both") {
    if (!img) return;
    const half = img.width / 2;
    const ext  = FORMATS.find(f => f.value === fmt)?.ext ?? "jpg";

    function makeSide(sx: number, label: string) {
      const c = document.createElement("canvas");
      c.width  = half; c.height = img!.height;
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img!, sx, 0, half, img!.height, 0, 0, half, img!.height);
      downloadCanvas(c, `${name || "wallpaper"}-${label}.${ext}`, fmt);
    }

    if (side === "lock" || side === "both") makeSide(0, "lock-screen");
    if (side === "home" || side === "both") setTimeout(() => makeSide(half, "home-screen"), side === "both" ? 300 : 0);
    setDone(side); setTimeout(() => setDone(""), 3000);
  }

  return (
    <div className="tool-body">
      <p className="tool-desc">
        Split any wide image into two matching wallpapers — one for your lock screen and one for your home screen.
        Upload a landscape or wide portrait image for best results.
      </p>

      <div className={`tool-drop ${img ? "tool-drop--filled" : ""}`}
        onClick={() => document.getElementById("split-input")?.click()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
        onDragOver={e => e.preventDefault()}
      >
        <input id="split-input" type="file" accept="image/*" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {img ? (
          <div className="tool-preview-wrap" style={{ width: "100%" }}>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", alignItems: "flex-start" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-space)", fontSize: "0.5rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "6px" }}>Lock Screen</p>
                <canvas ref={lockRef} className="tool-canvas" style={{ border: "1px solid rgba(192,0,26,0.4)" }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-space)", fontSize: "0.5rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "6px" }}>Home Screen</p>
                <canvas ref={homeRef} className="tool-canvas" style={{ border: "1px solid rgba(192,0,26,0.4)" }} />
              </div>
            </div>
            <p className="tool-change-hint" style={{ marginTop: "8px" }}>Click to change image</p>
          </div>
        ) : (
          <div className="tool-drop-empty">
            <span className="tool-drop-icon">⊟</span>
            <p className="tool-drop-label">Drop a wide image here or click to upload</p>
            <p className="tool-drop-sub">Best with landscape or panoramic images</p>
          </div>
        )}
      </div>

      {img && <>
        <div className="tool-section">
          <p className="tool-label">Output Format</p>
          <div className="tool-fit-row">
            {FORMATS.map(f => (
              <button key={f.value} className={`tool-fit-btn ${fmt === f.value ? "tool-fit-btn--active" : ""}`}
                onClick={() => setFmt(f.value)}>{f.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="tool-action" onClick={() => downloadSplit("lock")}>
            {done === "lock" ? "✓ Downloaded!" : "↓ Lock Screen"}
          </button>
          <button className="tool-action" onClick={() => downloadSplit("home")}>
            {done === "home" ? "✓ Downloaded!" : "↓ Home Screen"}
          </button>
          <button className="tool-action" style={{ background: "#2a2535", borderColor: "#2a2535" }}
            onClick={() => downloadSplit("both")}>
            {done === "both" ? "✓ Both Downloaded!" : "↓ Download Both"}
          </button>
        </div>
      </>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ToolsPage() {
  const [active, setActive] = useState<ActiveTool>("resizer");

  const TOOLS = [
    { id: "resizer"  as const, icon: "⬛", label: "Wallpaper Resizer", sub: "Resize to any device"  },
    { id: "darkener" as const, icon: "🎨", label: "Color Darkener",    sub: "Darken any image"      },
    { id: "upscaler" as const, icon: "🔍", label: "Image Upscaler",    sub: "Enlarge up to 4×"      },
    { id: "text"     as const, icon: "✦",  label: "Add Text",          sub: "Overlay text & quotes" },
    { id: "blur"     as const, icon: "🌫", label: "Blur Tool",         sub: "Frosted glass effect"  },
    { id: "split"    as const, icon: "⊟",  label: "Split Wallpaper",   sub: "Lock + home screen"    },
  ];

  return (
    <main className="tools-page">

      <div className="tools-hero">
        <span className="tools-eyebrow">Free Utilities</span>
        <h1 className="tools-title">Wallpaper<br /><em>Tools</em></h1>
        <p className="tools-sub">Browser-based tools for customising wallpapers. Nothing is uploaded — everything runs on your device.</p>
      </div>

      <div className="tools-layout">

        {/* Sidebar */}
        <nav className="tools-nav">
          {TOOLS.map(t => (
            <button key={t.id}
              className={`tools-nav-btn ${active === t.id ? "tools-nav-btn--active" : ""}`}
              onClick={() => setActive(t.id)}
            >
              <span className="tools-nav-icon">{t.icon}</span>
              <span className="tools-nav-info">
                <span className="tools-nav-label">{t.label}</span>
                <span className="tools-nav-sub">{t.sub}</span>
              </span>
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className="tools-panel">
          <h2 className="tools-panel-title">
            {TOOLS.find(t => t.id === active)?.icon}{" "}
            {TOOLS.find(t => t.id === active)?.label}
          </h2>
          {active === "resizer"  && <ResizerTool />}
          {active === "darkener" && <DarkenerTool />}
          {active === "upscaler" && <UpscalerTool />}
          {active === "text"     && <TextTool />}
          {active === "blur"     && <BlurTool />}
          {active === "split"    && <SplitTool />}
        </div>
      </div>

      <style>{`
        /* ── Page ── */
        .tools-page { max-width: 1100px; margin: 0 auto; padding: 0 24px 80px; }

        .tools-hero { padding: 60px 0 48px; border-bottom: 1px solid rgba(192,0,26,0.2); margin-bottom: 40px; }
        .tools-eyebrow { font-family: var(--font-space), monospace; font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase; color: #c0001a; display: block; margin-bottom: 12px; }
        .tools-title { font-family: var(--font-cinzel), cursive; font-size: clamp(2rem,5vw,3.2rem); font-weight: 900; color: #f0ecff; line-height: 1.1; margin-bottom: 14px; }
        .tools-title em { color: #c9a84c; font-style: italic; }
        [data-theme="light"] .tools-title { color: #1a1814; }
        .tools-sub { font-family: var(--font-cormorant), serif; font-size: 1.05rem; color: #8a8099; line-height: 1.7; max-width: 520px; margin: 0; }
        [data-theme="light"] .tools-sub { color: #5a5058; }

        /* ── Layout ── */
        .tools-layout { display: grid; grid-template-columns: 220px 1fr; gap: 28px; align-items: start; }
        @media (max-width: 767px) { .tools-layout { grid-template-columns: 1fr; } }

        /* ── Sidebar ── */
        .tools-nav { display: flex; flex-direction: column; gap: 6px; position: sticky; top: 80px; }
        @media (max-width: 767px) { .tools-nav { flex-direction: row; position: static; overflow-x: auto; padding-bottom: 4px; } }
        .tools-nav-btn { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: transparent; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; text-align: left; transition: background .18s, border-color .18s; }
        .tools-nav-btn:hover { background: rgba(255,255,255,0.03); border-color: rgba(192,0,26,0.3); }
        .tools-nav-btn--active { background: rgba(192,0,26,0.08); border-color: rgba(192,0,26,0.5); }
        [data-theme="light"] .tools-nav-btn { border-color: rgba(0,0,0,0.08); background: #f4f0e8; }
        [data-theme="light"] .tools-nav-btn--active { background: rgba(192,0,26,0.06); border-color: rgba(192,0,26,0.3); }
        .tools-nav-icon { font-size: 1.1rem; flex-shrink: 0; }
        .tools-nav-info { display: flex; flex-direction: column; gap: 2px; }
        .tools-nav-label { font-family: var(--font-space), monospace; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #f0ecff; }
        [data-theme="light"] .tools-nav-label { color: #1a1814; }
        .tools-nav-sub { font-family: var(--font-cormorant), serif; font-size: 0.85rem; color: #6a6080; }

        /* ── Panel ── */
        .tools-panel { border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.02); padding: 28px; min-height: 480px; }
        [data-theme="light"] .tools-panel { background: #f4f0e8; border-color: rgba(0,0,0,0.08); }
        .tools-panel-title { font-family: var(--font-cinzel), cursive; font-size: 1.05rem; font-weight: 700; color: #f0ecff; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid rgba(192,0,26,0.2); display: flex; align-items: center; gap: 10px; }
        [data-theme="light"] .tools-panel-title { color: #1a1814; }

        /* ── Tool body ── */
        .tool-body { display: flex; flex-direction: column; gap: 20px; }
        .tool-desc { font-family: var(--font-cormorant), serif; font-size: 1.05rem; color: #8a8099; line-height: 1.7; margin: 0; }
        [data-theme="light"] .tool-desc { color: #5a5058; }

        /* ── Drop zone ── */
        .tool-drop { border: 2px dashed rgba(192,0,26,0.35); background: rgba(192,0,26,0.03); cursor: pointer; display: flex; align-items: center; justify-content: center; min-height: 160px; transition: border-color .2s, background .2s; }
        .tool-drop:hover { border-color: rgba(192,0,26,0.65); background: rgba(192,0,26,0.06); }
        .tool-drop--filled { border-style: solid; border-color: rgba(192,0,26,0.3); background: #070710; min-height: unset; }
        [data-theme="light"] .tool-drop { background: #ede9e0; border-color: rgba(192,0,26,0.25); }
        [data-theme="light"] .tool-drop--filled { background: #e0dbd0; }
        .tool-drop-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 24px; text-align: center; }
        .tool-drop-icon { font-size: 1.8rem; }
        .tool-drop-label { font-family: var(--font-space), monospace; font-size: 0.68rem; letter-spacing: 0.1em; color: #8a8099; margin: 0; }
        .tool-drop-sub { font-family: var(--font-space), monospace; font-size: 0.55rem; letter-spacing: 0.1em; color: #4a445a; margin: 0; }
        .tool-preview-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px; }
        .tool-canvas { max-width: 100%; display: block; }
        .tool-change-hint { font-family: var(--font-space), monospace; font-size: 0.52rem; letter-spacing: 0.1em; text-transform: uppercase; color: #4a445a; margin: 0; }

        /* ── Sections ── */
        .tool-section { display: flex; flex-direction: column; gap: 10px; }
        .tool-label { font-family: var(--font-space), monospace; font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase; color: #8a8099; margin: 0; }
        [data-theme="light"] .tool-label { color: #5a5058; }
        .tool-label strong { color: #f0ecff; }
        [data-theme="light"] .tool-label strong { color: #1a1814; }
        .tool-hint { font-family: var(--font-cormorant), serif; font-size: 0.9rem; color: #4a445a; font-style: italic; margin: 0; }

        /* ── Preset grid ── */
        .tool-preset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; }
        .tool-preset { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 9px 12px; background: transparent; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; text-align: left; transition: border-color .15s, background .15s; }
        .tool-preset:hover { border-color: rgba(192,0,26,0.4); background: rgba(192,0,26,0.04); }
        .tool-preset--active { border-color: #c0001a; background: rgba(192,0,26,0.1); }
        [data-theme="light"] .tool-preset { border-color: rgba(0,0,0,0.1); }
        .tool-preset-name { font-family: var(--font-space), monospace; font-size: 0.6rem; letter-spacing: 0.06em; color: #f0ecff; }
        [data-theme="light"] .tool-preset-name { color: #1a1814; }
        .tool-preset-size { font-family: var(--font-space), monospace; font-size: 0.5rem; color: #4a445a; }

        /* ── Fit buttons ── */
        .tool-fit-row { display: flex; gap: 8px; }
        .tool-fit-btn { flex: 1; padding: 10px; background: transparent; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; font-family: var(--font-space), monospace; font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8099; transition: all .15s; }
        .tool-fit-btn:hover { border-color: rgba(192,0,26,0.4); color: #f0ecff; }
        .tool-fit-btn--active { border-color: #c0001a; background: rgba(192,0,26,0.1); color: #f0ecff; }
        [data-theme="light"] .tool-fit-btn { border-color: rgba(0,0,0,0.1); color: #5a5058; }
        [data-theme="light"] .tool-fit-btn--active { color: #1a1814; }

        /* ── Color row ── */
        .tool-color-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .tool-color-btn { display: flex; align-items: center; gap: 7px; padding: 7px 11px; background: transparent; border: 1px solid rgba(255,255,255,0.08); cursor: pointer; font-family: var(--font-space), monospace; font-size: 0.58rem; letter-spacing: 0.06em; color: #8a8099; transition: all .15s; }
        .tool-color-btn:hover { border-color: rgba(192,0,26,0.4); color: #f0ecff; }
        .tool-color-btn--active { border-color: #c0001a; color: #f0ecff; background: rgba(192,0,26,0.08); }
        [data-theme="light"] .tool-color-btn { border-color: rgba(0,0,0,0.1); color: #5a5058; }
        [data-theme="light"] .tool-color-btn--active { color: #1a1814; }
        .tool-color-swatch { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); flex-shrink: 0; display: block; }

        /* ── Range ── */
        .tool-range { width: 100%; accent-color: #c0001a; cursor: pointer; }

        /* ── Action button ── */
        .tool-action { padding: 0 24px; min-height: 50px; background: #c0001a; border: 1px solid #c0001a; color: #fff; font-family: var(--font-space), monospace; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: background .2s; align-self: flex-start; }
        .tool-action:hover { background: #a00014; }
      `}</style>
    </main>
  );
}