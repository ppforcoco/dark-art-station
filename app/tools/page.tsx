"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";

type ActiveTool = "resizer" | "darkener" | "upscaler" | "text" | "blur" | "split" | "oled" | "lockscreen" | "haunted-name" | "collage" | "timer";
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
  { label: "PC UHD",              w: 3840, h: 2160 },
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
    const scale = Math.min(340 / p.w, 500 / p.h);
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

  useEffect(() => {
    if (img) render(img, preset, fit);
  }, [img, preset, fit, render]);

  async function handleFile(file: File) {
    const image = await loadImg(file);
    setImg(image); setName(file.name.replace(/\.[^.]+$/, "")); setDone(false);
  }

  function changePreset(p: typeof preset) { setPreset(p); }
  function changeFit(f: string) { setFit(f as typeof fit); }

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
    const scale = Math.min(340 / image.width, 500 / image.height, 1);
    canvas.width  = Math.round(image.width  * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.filter = `brightness(${br}%)`;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";
    ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${op / 100})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (img) render(img, color, opacity, brightness);
  }, [img]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFile(file: File) {
    const image = await loadImg(file);
    setImg(image); setName(file.name.replace(/\.[^.]+$/, "")); setDone(false);
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
    const scale = Math.min(340 / image.width, 500 / image.height, 1);
    c.width  = Math.round(image.width  * scale);
    c.height = Math.round(image.height * scale);
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, c.width, c.height);
  }, []);

  useEffect(() => { if (img) renderPreview(img); }, [img]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFile(file: File) {
    const image = await loadImg(file);
    setImg(image);
    setName(file.name.replace(/\.[^.]+$/, ""));
    setStatus("idle");
  }

  function upscale() {
    if (!img) return;
    setStatus("processing");

    setTimeout(() => {
      const targetW = img.width  * factor;
      const targetH = img.height * factor;

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
            <p className="tool-drop-sub">JPG · PNG · WEBP — enlarged on your device</p>
          </div>
        )}
      </div>

      {img && (
        <>
          <div className="tool-section">
            <p className="tool-label">Enlarge Factor</p>
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
              : `↑ Enlarge ${factor}× & Download`}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Text Overlay Tool ────────────────────────────────────────────────────────
const TEXT_FONTS = [
  { label: "Cinzel",     value: "'Cinzel Decorative', cursive",    hint: "Gothic Title"   },
  { label: "Cormorant",  value: "'Cormorant Garamond', serif",      hint: "Elegant Serif"  },
  { label: "Space Mono", value: "'Space Mono', monospace",          hint: "Haunted Mono"   },
  { label: "Impact",     value: "Impact, 'Arial Narrow', sans-serif", hint: "Bold & Wide"  },
  { label: "Georgia",    value: "Georgia, 'Times New Roman', serif", hint: "Classic Serif" },
  { label: "Arial",      value: "Arial, Helvetica, sans-serif",     hint: "Clean Sans"     },
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
  const [size,     setSize]     = useState(120);
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
    const scale = Math.min(340 / image.width, 500 / image.height, 1);
    c.width  = Math.round(image.width  * scale);
    c.height = Math.round(image.height * scale);
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, c.width, c.height);
    if (!t.trim()) return;
    const scaledSize = Math.round(sz * scale);

    const doDraw = () => {
      ctx.drawImage(image, 0, 0, c.width, c.height);
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
      const lines = t.split("\n");
      lines.forEach((line, i) => {
        ctx.fillText(line, x, y + i * scaledSize * 1.2);
      });
      ctx.globalAlpha = 1; ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
    };

    if (document.fonts) {
      document.fonts.load(`bold ${scaledSize}px ${f}`).then(doDraw).catch(doDraw);
    } else {
      doDraw();
    }
  }, []);

  useEffect(() => {
    if (img) render(img, text, font, size, color, opacity, align, position, shadow);
  }, [img]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFile(file: File) {
    const image = await loadImg(file);
    setImg(image); setName(file.name.replace(/\.[^.]+$/, ""));
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

    const doDL = () => {
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
    };

    if (document.fonts) {
      document.fonts.load(`bold ${size}px ${font}`).then(doDL).catch(doDL);
    } else {
      doDL();
    }
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {TEXT_FONTS.map(f => (
              <button key={f.value}
                className={`tool-fit-btn ${font === f.value ? "tool-fit-btn--active" : ""}`}
                style={{ fontFamily: f.value, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px", minWidth: "90px" }}
                onClick={() => update(text, f.value)}
              >
                <span style={{ fontSize: "0.9rem" }}>{f.label}</span>
                <span style={{ fontFamily: "var(--font-space), monospace", fontSize: "0.42rem", letterSpacing: "0.08em", color: font === f.value ? "#c9a84c" : "#4a445a", textTransform: "uppercase" }}>{f.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="tool-section">
          <p className="tool-label">Font Size — <strong>{size}px</strong> <span style={{ fontFamily: "var(--font-space)", fontSize: "0.5rem", color: "#4a445a" }}>(on full image)</span></p>
          <input type="range" min={30} max={500} step={10} value={size} className="tool-range"
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
    const scale = Math.min(340 / image.width, 500 / image.height, 1);
    c.width  = Math.round(image.width  * scale);
    c.height = Math.round(image.height * scale);
    const ctx = c.getContext("2d")!;
    ctx.filter = `blur(${blur * scale}px)`;
    ctx.drawImage(image, -blur * scale * 2, -blur * scale * 2,
      c.width + blur * scale * 4, c.height + blur * scale * 4);
    ctx.filter = "none";
  }, []);

  useEffect(() => { if (img) render(img, amount); }, [img]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFile(file: File) {
    const image = await loadImg(file);
    setImg(image); setName(file.name.replace(/\.[^.]+$/, ""));
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

  useEffect(() => { if (img) render(img); }, [img]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFile(file: File) {
    const image = await loadImg(file);
    setImg(image); setName(file.name.replace(/\.[^.]+$/, "")); setDone("");
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

// ─── OLED Battery Savings Calculator ─────────────────────────────────────────
const OLED_PHONES = [
  { label: "iPhone 15 Pro",        brand: "Apple",   nits: 2000, res: [1179,2556], ppi: 460, oled: true,  battMah: 3274, screenInch: 6.1 },
  { label: "iPhone 15 Pro Max",    brand: "Apple",   nits: 2000, res: [1290,2796], ppi: 460, oled: true,  battMah: 4422, screenInch: 6.7 },
  { label: "iPhone 16 Pro",        brand: "Apple",   nits: 2000, res: [1206,2622], ppi: 460, oled: true,  battMah: 3582, screenInch: 6.3 },
  { label: "iPhone 16 Pro Max",    brand: "Apple",   nits: 2000, res: [1320,2868], ppi: 460, oled: true,  battMah: 4685, screenInch: 6.9 },
  { label: "Samsung Galaxy S24",   brand: "Samsung", nits: 2600, res: [1080,2340], ppi: 416, oled: true,  battMah: 4000, screenInch: 6.2 },
  { label: "Samsung Galaxy S24+",  brand: "Samsung", nits: 2600, res: [1080,2340], ppi: 393, oled: true,  battMah: 4900, screenInch: 6.7 },
  { label: "Samsung Galaxy S24 Ultra", brand: "Samsung", nits: 2600, res: [1440,3088], ppi: 505, oled: true, battMah: 5000, screenInch: 6.8 },
  { label: "Google Pixel 9",       brand: "Google",  nits: 2700, res: [1080,2424], ppi: 422, oled: true,  battMah: 4700, screenInch: 6.3 },
  { label: "Google Pixel 9 Pro",   brand: "Google",  nits: 3000, res: [1008,2244], ppi: 422, oled: true,  battMah: 4700, screenInch: 6.3 },
  { label: "OnePlus 12",           brand: "OnePlus", nits: 4500, res: [1440,3168], ppi: 510, oled: true,  battMah: 5400, screenInch: 6.82 },
];

function calcOledSavings(phone: typeof OLED_PHONES[0], hoursPerDay: number) {
  const screenBattPct = 0.35;
  const screenMahPerHour = (phone.battMah * screenBattPct) / 24;
  const whitePixelPower = screenMahPerHour * hoursPerDay;
  const savingPct = 0.30;
  const savedMah = whitePixelPower * savingPct;
  const savedPct = (savedMah / phone.battMah) * 100;
  const extraMinutes = (savedPct / 100) * 24 * 60;
  return { savedMah: Math.round(savedMah), savedPct: savedPct.toFixed(1), extraMinutes: Math.round(extraMinutes) };
}

function OledTool() {
  const [selected, setSelected] = useState(OLED_PHONES[0]);
  const [hours, setHours] = useState(4);

  const result = calcOledSavings(selected, hours);

  return (
    <div className="tool-body">
      <p className="tool-desc">
        OLED and AMOLED displays turn off individual pixels for true black (#000000), drawing near-zero power.
        This calculator estimates how much battery you save by switching from a bright white wallpaper
        to a pure black one — based on published display specs and real-world usage patterns.
      </p>

      <div className="tool-section">
        <p className="tool-label">Your Phone</p>
        <div className="oled-phone-grid">
          {OLED_PHONES.map(p => (
            <button key={p.label}
              className={`oled-phone-btn ${selected.label === p.label ? "oled-phone-btn--active" : ""}`}
              onClick={() => setSelected(p)}
            >
              <span className="oled-brand">{p.brand}</span>
              <span className="oled-model">{p.label.replace(p.brand + " ", "")}</span>
              <span className="oled-batt">{(p.battMah/1000).toFixed(1)}Ah · {p.screenInch}"</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tool-section">
        <p className="tool-label">Screen-on hours per day — <strong>{hours}h</strong></p>
        <input type="range" min={1} max={12} value={hours} className="tool-range"
          onChange={e => setHours(Number(e.target.value))} />
        <p className="tool-hint">Average smartphone user: 4–5 hrs/day screen-on time.</p>
      </div>
      <div className="oled-result">
        <div className="oled-result-header">
          <span className="oled-result-phone">{selected.label}</span>
          <span className="oled-result-badge">OLED · {selected.battMah.toLocaleString()} mAh</span>
        </div>
        <div className="oled-result-grid">
          <div className="oled-stat">
            <span className="oled-stat-val">{result.savedMah} mAh</span>
            <span className="oled-stat-label">Battery Saved / Day</span>
          </div>
          <div className="oled-stat">
            <span className="oled-stat-val">{result.savedPct}%</span>
            <span className="oled-stat-label">Total Battery Gain</span>
          </div>
          <div className="oled-stat">
            <span className="oled-stat-val">+{result.extraMinutes} min</span>
            <span className="oled-stat-label">Extra Screen Time</span>
          </div>
        </div>
        <p className="oled-disclaimer">
          Based on OLED true-black power reduction data from DisplayMate. Screen consumes ~35% of battery.
          True black saves ~30% of screen energy vs white. Actual results vary by brightness and usage.
        </p>
      </div>

      <div className="oled-tip">
        <span className="oled-tip-icon">⚡</span>
        <div>
          <p className="oled-tip-title">Get True Black Wallpapers</p>
          <p className="oled-tip-body">All wallpapers on this site use deep blacks and dark tones, making them naturally OLED-efficient. 
          Use the <strong>Color Darkener</strong> tool to push any image darker, or look for the 
          <strong> AMOLED</strong> tag when browsing.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Lock Screen Previewer ────────────────────────────────────────────────────
const LS_DEVICES = [
  { id: "iphone-dynamic",   label: "iPhone (Dynamic Island)", w: 393, h: 852,  notch: "dynamic",  os: "ios" },
  { id: "iphone-notch",     label: "iPhone (Notch)",           w: 390, h: 844,  notch: "notch",    os: "ios" },
  { id: "android-punch",    label: "Android (Punch-hole)",     w: 360, h: 800,  notch: "punch",    os: "android" },
  { id: "android-full",     label: "Android (Full Screen)",    w: 360, h: 800,  notch: "none",     os: "android" },
] as const;

function LockScreenTool() {
  const [imgUrl, setImgUrl]         = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      return p.get("wallpaper") ?? null;
    }
    return null;
  });
  const [imgTitle, setImgTitle]     = useState<string>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      return p.get("title") ?? "";
    }
    return "";
  });
  const [device, setDevice]         = useState<typeof LS_DEVICES[number]>(LS_DEVICES[0]);
  const [showClock, setShowClock]   = useState(true);
  const [showIcons, setShowIcons]   = useState(true);
  const [showNotif, setShowNotif]   = useState(false);
  const [clockPos, setClockPos]     = useState<"top"|"middle">("top");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const w = p.get("wallpaper");
    const t = p.get("title");
    if (w && !imgUrl) setImgUrl(w);
    if (t && !imgTitle) setImgTitle(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    setImgTitle(file.name.replace(/\.[^.]+$/, ""));
  }

  const MOCK_W = 260;
  const MOCK_H = Math.round((device.h / device.w) * MOCK_W);
  const scale  = MOCK_W / device.w;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="tool-body">
      <p className="tool-desc">
        Preview any wallpaper exactly as it would look on your lock screen — complete with a simulated clock,
        notifications, and app icons. See if the creature's eyes are covered before you download.
      </p>

      {imgUrl && imgTitle && (
        <div style={{
          padding: "10px 14px",
          background: "rgba(192,0,26,0.07)",
          border: "1px solid rgba(192,0,26,0.25)",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <span style={{ fontSize: "1.1rem" }}>📱</span>
          <div>
            <p style={{ fontFamily: "var(--font-space), monospace", fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#c0001a", margin: "0 0 2px" }}>Previewing</p>
            <p style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "0.95rem", color: "#f0ecff", margin: 0, fontStyle: "italic" }}>{imgTitle}</p>
          </div>
          <button onClick={() => { setImgUrl(null); setImgTitle(""); }} style={{
            marginLeft: "auto", padding: "4px 10px",
            background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
            color: "#6a6080", fontFamily: "var(--font-space), monospace",
            fontSize: "0.5rem", cursor: "pointer", letterSpacing: "0.1em",
          }}>
            Change
          </button>
        </div>
      )}
      {!imgUrl && (
        <div
          className="tool-drop"
          onClick={() => document.getElementById("ls-input")?.click()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
          onDragOver={e => e.preventDefault()}
        >
          <input id="ls-input" type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div className="tool-drop-empty">
            <span className="tool-drop-icon">📱</span>
            <p className="tool-drop-label">Drop wallpaper here or click to upload</p>
            <p className="tool-drop-sub">Or click "📱 Preview" on any wallpaper on the site</p>
          </div>
        </div>
      )}
      <div className="tool-section">
        <p className="tool-label">Device Frame</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {LS_DEVICES.map(d => (
            <button key={d.id}
              className={`tool-fit-btn ${device.id === d.id ? "tool-fit-btn--active" : ""}`}
              style={{ flex: "1 1 140px", fontSize: "0.52rem" }}
              onClick={() => setDevice(d)}
            >{d.label}</button>
          ))}
        </div>
      </div>

      <div className="tool-section">
        <p className="tool-label">Overlays</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {([
            { label: "Clock & Date", val: showClock, set: setShowClock },
            { label: "App Icons",    val: showIcons, set: setShowIcons },
            { label: "Notification", val: showNotif, set: setShowNotif },
          ] as const).map(o => (
            <label key={o.label} style={{ display: "flex", alignItems: "center", gap: "7px", cursor: "pointer" }}>
              <input type="checkbox" checked={o.val} onChange={e => (o.set as (v: boolean) => void)(e.target.checked)}
                style={{ accentColor: "#c0001a", width: "15px", height: "15px" }} />
              <span style={{ fontFamily: "var(--font-space), monospace", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8099" }}>{o.label}</span>
            </label>
          ))}
        </div>
      </div>

      {showClock && (
        <div className="tool-section">
          <p className="tool-label">Clock Position</p>
          <div className="tool-fit-row">
            {(["top", "middle"] as const).map(p => (
              <button key={p} className={`tool-fit-btn ${clockPos === p ? "tool-fit-btn--active" : ""}`}
                onClick={() => setClockPos(p)}>{p === "top" ? "Upper Third" : "Center"}</button>
            ))}
          </div>
        </div>
      )}

      {/* Phone mockup */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
        <div className="ls-phone" style={{ width: MOCK_W, height: MOCK_H }}>
          {/* Wallpaper */}
          {imgUrl && (
            <img src={imgUrl} alt="wallpaper preview"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
          )}
          {!imgUrl && (
            <div style={{ position: "absolute", inset: 0, background: "#0a0814", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "inherit" }}>
              <span style={{ fontFamily: "var(--font-space), monospace", fontSize: "0.48rem", letterSpacing: "0.14em", color: "#3a3452", textTransform: "uppercase" }}>No wallpaper</span>
            </div>
          )}

          {/* Dark overlay for readability */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.65) 100%)", borderRadius: "inherit" }} />

          {/* Notch / Dynamic Island */}
          {device.notch === "dynamic" && (
            <div style={{ position: "absolute", top: 10 * scale, left: "50%", transform: "translateX(-50%)", width: 95 * scale, height: 28 * scale, background: "#000", borderRadius: 20 * scale, zIndex: 10 }} />
          )}
          {device.notch === "notch" && (
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 120 * scale, height: 28 * scale, background: "#000", borderRadius: "0 0 18px 18px", zIndex: 10 }} />
          )}
          {device.notch === "punch" && (
            <div style={{ position: "absolute", top: 12 * scale, left: "50%", transform: "translateX(-50%)", width: 12 * scale, height: 12 * scale, background: "#000", borderRadius: "50%", zIndex: 10 }} />
          )}

          {/* Clock */}
          {showClock && (
            <div style={{
              position: "absolute",
              top: clockPos === "top" ? (device.notch !== "none" ? 52 * scale : 36 * scale) : "38%",
              left: 0, right: 0,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2 * scale,
              zIndex: 5,
              transform: clockPos === "middle" ? "translateY(-50%)" : "none",
            }}>
              <span style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 52 * scale, fontWeight: 200, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>{timeStr}</span>
              <span style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 13 * scale, fontWeight: 400, color: "rgba(255,255,255,0.85)", letterSpacing: "0.01em", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{dateStr}</span>
            </div>
          )}

          {/* Notification */}
          {showNotif && (
            <div style={{
              position: "absolute",
              top: showClock ? (clockPos === "top" ? 130 * scale : 56 * scale) : 56 * scale,
              left: 14 * scale, right: 14 * scale,
              background: "rgba(30,28,40,0.78)",
              backdropFilter: "blur(14px)",
              borderRadius: 12 * scale,
              padding: `${8 * scale}px ${10 * scale}px`,
              display: "flex", alignItems: "center", gap: 8 * scale,
              zIndex: 6,
            }}>
              <div style={{ width: 22 * scale, height: 22 * scale, background: "#c0001a", borderRadius: 6 * scale, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 * scale }}>👻</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 * scale }}>
                <span style={{ fontFamily: "system-ui", fontSize: 10 * scale, fontWeight: 600, color: "#fff" }}>Haunted Wallpapers</span>
                <span style={{ fontFamily: "system-ui", fontSize: 9 * scale, color: "rgba(255,255,255,0.7)" }}>New wallpaper: something watches.</span>
              </div>
            </div>
          )}

          {/* App icons row */}
          {showIcons && (
            <div style={{
              position: "absolute",
              bottom: 24 * scale,
              left: 20 * scale, right: 20 * scale,
              display: "flex", justifyContent: "space-around",
              zIndex: 6,
            }}>
              {["📷","📞","📩","🌐"].map((icon, i) => (
                <div key={i} style={{
                  width: 44 * scale, height: 44 * scale,
                  background: "rgba(30,28,40,0.75)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 10 * scale,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22 * scale,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}>
                  {icon}
                </div>
              ))}
            </div>
          )}

          {/* Home indicator */}
          <div style={{ position: "absolute", bottom: 7 * scale, left: "50%", transform: "translateX(-50%)", width: 80 * scale, height: 4 * scale, background: "rgba(255,255,255,0.5)", borderRadius: 2 * scale }} />
        </div>
      </div>

      <p style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "0.88rem", color: "#4a445a", fontStyle: "italic", textAlign: "center", margin: 0 }}>
        Toggle overlays to check if the clock or icons cover the focal point of your wallpaper.
      </p>
    </div>
  );
}


// ─── Haunted Name Generator ───────────────────────────────────────────────────
const HAUNT_STYLES = [
  { id: "strikethrough", label: "Strikethrough", fn: (s: string) => [...s].map(c => c + "\u0336").join("") },
  { id: "dots",          label: "Void Dots",     fn: (s: string) => [...s].map(c => c + "\u0307").join("") },
  { id: "underline",     label: "Underline",     fn: (s: string) => [...s].map(c => c + "\u0332").join("") },
  { id: "tilde",         label: "Tilde",         fn: (s: string) => [...s].map(c => c + "\u0334").join("") },
  { id: "mirror",        label: "Mirror Spaces",  fn: (s: string) => [...s].toReversed ? [...s].toReversed().join(" ") : s.split("").reverse().join(" ") },
  { id: "runes",         label: "Rune Mix",      fn: (s: string) => {
    const runes = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
    return [...s].map((c, i) => i % 2 === 0 ? c + "\u0336" : runes[c.charCodeAt(0) % runes.length]).join("");
  }},
] as const;

function HauntedNameTool() {
  const [name,    setName]    = useState("Your Name");
  const [style,   setStyle]   = useState(HAUNT_STYLES[0]);
  const [haunted, setHaunted] = useState("");
  const [done,    setDone]    = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function haunt(n = name, s = style) {
    setName(n); setStyle(s);
    const h = s.fn(n.toUpperCase());
    setHaunted(h);
    renderCanvas(h);
  }

  function renderCanvas(text: string) {
    const c = canvasRef.current; if (!c) return;
    c.width = 1080; c.height = 1920;
    const ctx = c.getContext("2d")!;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, "#0a0414");
    grad.addColorStop(0.5, "#140820");
    grad.addColorStop(1, "#0a0414");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Red glow
    const radGrad = ctx.createRadialGradient(540, 960, 0, 540, 960, 600);
    radGrad.addColorStop(0, "rgba(192,0,26,0.12)");
    radGrad.addColorStop(1, "transparent");
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Draw text
    const fontSize = Math.max(60, Math.min(160, Math.floor(1080 / (text.length * 0.55 + 1))));
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = "center";
    ctx.shadowColor = "#c0001a";
    ctx.shadowBlur = 40;
    ctx.fillStyle = "#f0ecff";
    ctx.fillText(text, 540, 960);
    ctx.shadowBlur = 0;

    // Eyebrow
    ctx.font = "28px monospace";
    ctx.fillStyle = "rgba(192,0,26,0.7)";
    ctx.letterSpacing = "0.3em";
    ctx.fillText("✦ HAUNTED NAME ✦", 540, 860);

    // Footer
    ctx.font = "22px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillText("hauntedwallpapers.com", 540, 1820);
  }

  function download() {
    const c = canvasRef.current; if (!c) return;
    downloadCanvas(c, `haunted-${name.toLowerCase().replace(/\s+/g,"-")}.jpg`, "jpeg");
    setDone(true); setTimeout(() => setDone(false), 2500);
  }

  return (
    <div className="tool-body">
      <p className="tool-desc">Type your name, pick a Unicode corruption style, and download a 1080×1920 haunted wallpaper with your name on it. Pure client-side — nothing leaves your device.</p>

      <div className="tool-section">
        <p className="tool-label">Your Name</p>
        <input
          type="text" value={name} maxLength={20}
          onChange={e => haunt(e.target.value)}
          placeholder="Type your name…"
          style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", color:"#f0ecff", padding:"10px 14px", fontFamily:"monospace", fontSize:"1rem", outline:"none" }}
        />
      </div>

      <div className="tool-section">
        <p className="tool-label">Haunt Style</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
          {HAUNT_STYLES.map(s => (
            <button key={s.id}
              className={`tool-fit-btn ${style.id === s.id ? "tool-fit-btn--active" : ""}`}
              onClick={() => haunt(name, s)}
            >{s.label}</button>
          ))}
        </div>
      </div>

      {haunted && (
        <>
          <div className="tool-section" style={{ textAlign:"center" }}>
            <p className="tool-label">Preview</p>
            <div style={{ padding:"24px 16px", background:"rgba(192,0,26,0.06)", border:"1px solid rgba(192,0,26,0.2)", borderRadius:"6px" }}>
              <p style={{ fontFamily:"monospace", fontSize:"clamp(1rem,5vw,2.2rem)", color:"#f0ecff", margin:0, textShadow:"0 0 20px rgba(192,0,26,0.6)", letterSpacing:"0.08em", wordBreak:"break-all" }}>
                {haunted}
              </p>
            </div>
          </div>

          <canvas ref={canvasRef} style={{ display:"none" }} />

          <button className="tool-action" onClick={download}>
            {done ? "✓ Downloaded!" : "↓ Download as Wallpaper (1080×1920)"}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Collage Maker ────────────────────────────────────────────────────────────
const COLLAGE_LAYOUTS = [
  { id: "2x2",     label: "2×2 Grid",      icon: "⊞", count: 4, desc: "Classic 4-phone square grid"         },
  { id: "3col",    label: "3 Column",       icon: "⫴", count: 3, desc: "3 phones side by side"              },
  { id: "feature", label: "Feature + 2",   icon: "▣", count: 3, desc: "1 large + 2 small phones"           },
  { id: "strip",   label: "5 Strip",        icon: "≡", count: 5, desc: "5 phones in a horizontal strip"     },
  { id: "diagonal",label: "Diagonal",       icon: "◪", count: 4, desc: "4 phones arranged diagonally"       },
] as const;
type CollageLayout = typeof COLLAGE_LAYOUTS[number]["id"];

function CollageTool() {
  const [walls,    setWalls]    = useState<{url:string;title:string}[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [layout,   setLayout]   = useState<CollageLayout>("2x2");
  const [done,     setDone]     = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const currentLayout = COLLAGE_LAYOUTS.find(l => l.id === layout)!;

  async function fetchWalls() {
    setLoading(true);
    try {
      const res = await fetch("/api/wallpapers-public?limit=48");
      const data = await res.json();
      setWalls((data.images ?? []).map((img: {r2Key: string; title: string}) => ({
        url: `https://pub-ba82ea76f3604402b8760527cc87149c.r2.dev/${img.r2Key}`,
        title: img.title,
      })));
    } catch { setWalls([]); }
    setLoading(false);
  }

  useEffect(() => { fetchWalls(); }, []);

  function toggleSelect(url: string) {
    setSelected(prev => {
      if (prev.includes(url)) return prev.filter(u => u !== url);
      if (prev.length >= currentLayout.count) return [...prev.slice(1), url];
      return [...prev, url];
    });
  }

  async function makeCollage() {
    if (selected.length < currentLayout.count) return;
    const c = previewRef.current; if (!c) return;

    const W = 1080, H = 1920;
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#06040e";
    ctx.fillRect(0, 0, W, H);

    const imgs = await Promise.all(selected.slice(0, currentLayout.count).map(url =>
      new Promise<HTMLImageElement>((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res(img);
        img.onerror = () => { img.crossOrigin = ""; img.src = url; img.onload = () => res(img); img.onerror = rej; };
        img.src = url;
      })
    ));

    const gap = 12;

    if (layout === "2x2") {
      const cw = (W - gap * 3) / 2, ch = (H - gap * 3) / 2;
      [[0,0],[1,0],[0,1],[1,1]].forEach(([col,row], i) => {
        if (!imgs[i]) return;
        const x = gap + col * (cw + gap), y = gap + row * (ch + gap);
        ctx.drawImage(imgs[i], x, y, cw, ch);
      });
    } else if (layout === "3col") {
      const cw = (W - gap * 4) / 3;
      imgs.forEach((img, i) => {
        const x = gap + i * (cw + gap);
        ctx.drawImage(img, x, gap, cw, H - gap * 2);
      });
    } else if (layout === "feature") {
      const featW = W * 0.6 - gap * 1.5, featH = H - gap * 2;
      const smallW = W * 0.4 - gap * 1.5, smallH = (H - gap * 3) / 2;
      ctx.drawImage(imgs[0], gap, gap, featW, featH);
      ctx.drawImage(imgs[1], gap + featW + gap, gap, smallW, smallH);
      ctx.drawImage(imgs[2], gap + featW + gap, gap + smallH + gap, smallW, smallH);
    } else if (layout === "strip") {
      const cw = (W - gap * 6) / 5;
      imgs.forEach((img, i) => {
        ctx.drawImage(img, gap + i * (cw + gap), gap, cw, H - gap * 2);
      });
    } else if (layout === "diagonal") {
      const cw = (W - gap * 3) / 2, ch = (H - gap * 3) / 2;
      const offsets = [[0,0],[1,0.15],[0,1],[1,0.85]];
      offsets.forEach(([col, rowFrac], i) => {
        if (!imgs[i]) return;
        const x = gap + col * (cw + gap);
        const y = (rowFrac > 0.5 ? gap + ch + gap : gap) + (rowFrac % 0.5) * ch * 0.3;
        ctx.drawImage(imgs[i], x, y, cw, ch * 0.7);
      });
    }

    // Watermark
    ctx.font = "20px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.textAlign = "center";
    ctx.fillText("hauntedwallpapers.com", W/2, H - 14);
  }

  async function download() {
    await makeCollage();
    const c = previewRef.current; if (!c) return;
    downloadCanvas(c, `haunted-collage-${layout}.jpg`, "jpeg");
    setDone(true); setTimeout(() => setDone(false), 2500);
  }

  return (
    <div className="tool-body">
      <p className="tool-desc">Pick up to {currentLayout.count} wallpapers from the collection, choose a layout, and download a ready-made collage. Great for Pinterest shares and aesthetic posts.</p>

      <div className="tool-section">
        <p className="tool-label">Collage Layout</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
          {COLLAGE_LAYOUTS.map(l => (
            <button key={l.id}
              className={`tool-fit-btn ${layout === l.id ? "tool-fit-btn--active" : ""}`}
              style={{ flexDirection:"column", alignItems:"flex-start", minWidth:"110px" }}
              onClick={() => { setLayout(l.id); setSelected([]); }}
            >
              <span style={{ fontSize:"1.1rem" }}>{l.icon} {l.label}</span>
              <span style={{ fontFamily:"monospace", fontSize:"0.42rem", color: layout === l.id ? "#c9a84c" : "#4a445a", letterSpacing:"0.08em", textTransform:"uppercase" }}>{l.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tool-section">
        <p className="tool-label">Select {currentLayout.count} Wallpapers <span style={{ color:"#4a445a" }}>({selected.length} / {currentLayout.count} selected)</span></p>

        {loading ? (
          <p style={{ fontFamily:"monospace", fontSize:"0.6rem", color:"#4a445a", letterSpacing:"0.1em" }}>Loading wallpapers…</p>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(72px, 1fr))", gap:"6px", maxHeight:"320px", overflowY:"auto" }}>
            {walls.map(w => (
              <div key={w.url}
                onClick={() => toggleSelect(w.url)}
                style={{
                  position:"relative", aspectRatio:"9/16", cursor:"pointer",
                  border: selected.includes(w.url) ? "2px solid #c0001a" : "2px solid transparent",
                  borderRadius:"4px", overflow:"hidden", transition:"border-color 0.15s",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.url} alt={w.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} loading="lazy" />
                {selected.includes(w.url) && (
                  <div style={{ position:"absolute", inset:0, background:"rgba(192,0,26,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontFamily:"monospace", fontSize:"1rem", color:"#fff", fontWeight:700 }}>
                      {selected.indexOf(w.url) + 1}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selected.length === currentLayout.count && (
        <>
          <canvas ref={previewRef} style={{ display:"none" }} />
          <button className="tool-action" onClick={download}>
            {done ? "✓ Downloaded!" : `↓ Download ${currentLayout.label} Collage`}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Wallpaper Timer ──────────────────────────────────────────────────────────
const CALENDAR_INTERVALS = [
  { label: "Every day",     days: 1  },
  { label: "Every 3 days",  days: 3  },
  { label: "Every week",    days: 7  },
  { label: "Every 2 weeks", days: 14 },
  { label: "Every month",   days: 30 },
];

const RRULE_MAP: Record<number, string> = {
  1:  "RRULE:FREQ=DAILY;INTERVAL=1",
  3:  "RRULE:FREQ=DAILY;INTERVAL=3",
  7:  "RRULE:FREQ=WEEKLY;INTERVAL=1",
  14: "RRULE:FREQ=WEEKLY;INTERVAL=2",
  30: "RRULE:FREQ=MONTHLY;INTERVAL=1",
};

function pad(n: number) { return String(n).padStart(2, "0"); }

function toIcsDate(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function TimerTool() {
  const [days,  setDays]  = useState(7);
  const [time,  setTime]  = useState("09:00");
  const [done,  setDone]  = useState(false);

  function downloadIcs() {
    const now   = new Date();
    const [hh, mm] = time.split(":").map(Number);

    // First alarm: next occurrence at chosen time
    const start = new Date(Date.UTC(
      now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hh, mm, 0
    ));
    if (start <= now) start.setUTCDate(start.getUTCDate() + days);

    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30-min event

    const uid = `hw-${Date.now()}@hauntedwallpapers.com`;
    const stamp = toIcsDate(now);
    const dtstart = toIcsDate(start);
    const dtend   = toIcsDate(end);
    const rrule   = RRULE_MAP[days] ?? `RRULE:FREQ=DAILY;INTERVAL=${days}`;
    const intervalLabel = CALENDAR_INTERVALS.find(c => c.days === days)?.label ?? `every ${days} days`;

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Haunted Wallpapers//Wallpaper Reminder//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      rrule,
      "SUMMARY:👻 Change your wallpaper",
      `DESCRIPTION:Time to summon a fresh haunted wallpaper. Browse at https://hauntedwallpapers.com/all — new drops every day.`,
      "URL:https://hauntedwallpapers.com/all",
      "BEGIN:VALARM",
      "TRIGGER:-PT0M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Change your wallpaper 👻",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `haunted-wallpaper-reminder-${intervalLabel.replace(/\s+/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);

    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  const intervalLabel = CALENDAR_INTERVALS.find(c => c.days === days)?.label ?? "";

  return (
    <div className="tool-body">
      <p className="tool-desc">
        Downloads a <strong>.ics calendar file</strong> — tap it and your phone asks which calendar app to add it to (iPhone Calendar, Google Calendar, Android Calendar). You get a real repeating alarm on your phone, not just a website banner.
      </p>

      {/* How it works */}
      <div style={{ padding:"14px 16px", background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.2)", borderRadius:"6px", marginBottom:"24px", display:"flex", gap:"12px", alignItems:"flex-start" }}>
        <span style={{ fontSize:"1.3rem", flexShrink:0 }}>📅</span>
        <div>
          <p style={{ fontFamily:"monospace", fontSize:"0.55rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"#c9a84c", margin:"0 0 6px" }}>How it works</p>
          <p style={{ fontFamily:"monospace", fontSize:"0.6rem", color:"#a89bc0", margin:0, lineHeight:1.8 }}>
            1. Pick how often + what time<br />
            2. Hit Download — a .ics file saves to your phone<br />
            3. Tap the file → it opens in your Calendar app<br />
            4. Tap "Add" — done. Real alarm, every time.
          </p>
        </div>
      </div>

      <div className="tool-section">
        <p className="tool-label">Reminder Frequency</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
          {CALENDAR_INTERVALS.map(c => (
            <button key={c.days}
              className={`tool-fit-btn ${days === c.days ? "tool-fit-btn--active" : ""}`}
              onClick={() => setDays(c.days)}
            >{c.label}</button>
          ))}
        </div>
      </div>

      <div className="tool-section">
        <p className="tool-label">Reminder Time</p>
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f0ecff",
            padding: "8px 14px",
            fontFamily: "monospace",
            fontSize: "1rem",
            outline: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        />
        <p className="tool-hint">You'll get an alarm at this time, {intervalLabel.toLowerCase()}.</p>
      </div>

      <button className="tool-action" onClick={downloadIcs}>
        {done ? "✓ File downloaded — tap it on your phone!" : `↓ Download Calendar Reminder (${intervalLabel})`}
      </button>

      <p style={{ fontFamily:"monospace", fontSize:"0.52rem", color:"#3a3452", marginTop:"14px", lineHeight:1.8 }}>
        Works with: iPhone Calendar · Google Calendar · Android Calendar · Outlook · Any app that supports .ics files.
      </p>
    </div>
  );
}

export default function ToolsPage() {
  const [active, setActive] = useState<ActiveTool>("resizer");

  const TOOLS = [
    { id: "resizer"  as const, icon: "⬛", label: "Wallpaper Resizer", sub: "Resize to any device"  },
    { id: "darkener" as const, icon: "🎨", label: "Color Darkener",    sub: "Darken any image"      },
    { id: "upscaler" as const, icon: "🔍", label: "Image Enlarger",    sub: "Enlarge up to 4×"      },
    { id: "text"     as const, icon: "✦",  label: "Add Text",          sub: "Overlay text & quotes" },
    { id: "blur"     as const, icon: "🌫", label: "Blur Tool",         sub: "Frosted glass effect"  },
    { id: "split"    as const, icon: "⊟",  label: "Split Wallpaper",   sub: "Lock + home screen"    },
    { id: "oled"     as const, icon: "🔋", label: "OLED Battery Calc", sub: "How much battery saved?" },
    { id: "lockscreen" as const, icon: "📱", label: "Lock Screen Preview", sub: "See it before you set it" },
    { id: "haunted-name" as const, icon: "💀", label: "Haunted Name", sub: "Your name, corrupted" },
    { id: "collage"      as const, icon: "🖼", label: "Collage Maker", sub: "Multi-layout collages" },
    { id: "timer"        as const, icon: "⏰", label: "Wallpaper Timer", sub: "Reminder to change it" },
  ];

  return (
    <main className="tools-page">

      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Tools" },
      ]} />

      <div className="tools-hero">
        <h1 className="tools-title">Wallpaper<br /><em>Tools</em></h1>
        <p className="tools-sub">Browser-based tools for customising wallpapers. Nothing is uploaded — everything runs on your device.</p>
      </div>

      <div className="tools-layout">
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
        <div className="tools-panel">
          <h2 className="tools-panel-title">
            {TOOLS.find(t => t.id === active)?.icon}{" "}
            {TOOLS.find(t => t.id === active)?.label}
          </h2>
          {active === "resizer"    && <ResizerTool />}
          {active === "darkener"   && <DarkenerTool />}
          {active === "upscaler"   && <UpscalerTool />}
          {active === "text"       && <TextTool />}
          {active === "blur"       && <BlurTool />}
          {active === "split"      && <SplitTool />}
          {active === "oled"       && <OledTool />}
          {active === "lockscreen"  && <LockScreenTool />}
          {active === "haunted-name" && <HauntedNameTool />}
          {active === "collage"      && <CollageTool />}
          {active === "timer"        && <TimerTool />}
        </div>
      </div>
    </main>
  );
}