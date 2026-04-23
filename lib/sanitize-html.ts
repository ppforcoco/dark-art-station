/**
 * sanitizeAdminHtml
 *
 * Admin HTML can be a full standalone page with <style>, <script>, <svg>,
 * layout divs, grids, animations — or clean prose markup.
 *
 * Strategy:
 *  1. Nuke everything that is purely presentational (style, script, svg, img…)
 *  2. Extract ONLY <p> paragraph content — the actual readable text
 *  3. Rebuild as clean prose-only HTML safe to drop inside a <div>
 *
 * This is intentionally aggressive: we'd rather lose a <h2> subheading
 * than accidentally render a CSS grid or animated SVG inside the page.
 */
export function sanitizeAdminHtml(raw: string): string {
  if (!raw || !raw.trim()) return "";

  let html = raw;

  // ── Phase 1: Nuke entire block-level non-prose elements ──────────────────

  // Remove <style>…</style>
  html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
  // Remove <script>…</script>
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  // Remove <head>…</head>
  html = html.replace(/<head[\s\S]*?<\/head>/gi, "");
  // Remove <svg>…</svg>  (kills ALL inline SVGs/illustrations)
  html = html.replace(/<svg[\s\S]*?<\/svg>/gi, "");
  // Remove <noscript>
  html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");

  // Remove paired non-prose tags AND their contents entirely
  const NUKE_PAIRED = [
    "canvas","video","audio","iframe","embed","object",
    "picture","figure","map","table","thead","tbody","tfoot",
    "select","datalist","details","dialog","menu",
  ];
  for (const tag of NUKE_PAIRED) {
    html = html.replace(new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`, "gi"), "");
  }

  // Remove self-closing / void non-prose tags
  const NUKE_VOID = ["img","input","br","hr","source","track","area","col","link","meta","base","wbr"];
  for (const tag of NUKE_VOID) {
    html = html.replace(new RegExp(`<${tag}[^>]*\\/?>`, "gi"), " ");
  }

  // ── Phase 2: Extract <body> if this is a full page ───────────────────────
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) html = bodyMatch[1];

  // ── Phase 3: Collect all <p> paragraphs ─────────────────────────────────
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(html)) !== null) {
    const inner = match[1]
      // strip any remaining tags inside <p> except em, strong, span, a
      .replace(/<(?!\/?(em|strong|span|a|b|i|u|mark|code|abbr)\b)[^>]+>/gi, "")
      // strip style/class/on* attributes from surviving inline tags
      .replace(/\s+style="[^"]*"/gi, "")
      .replace(/\s+style='[^']*'/gi, "")
      .replace(/\s+class="[^"]*"/gi, "")
      .replace(/\s+class='[^']*'/gi, "")
      .replace(/\s+on\w+="[^"]*"/gi, "")
      .replace(/\s+id="[^"]*"/gi, "")
      .trim();

    if (inner.length > 0) {
      paragraphs.push(`<p>${inner}</p>`);
    }
  }

  // ── Phase 4: If no <p> tags found, fall back to h1-h6 / li text ─────────
  if (paragraphs.length === 0) {
    // Try to grab heading text
    const headingRegex = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
    while ((match = headingRegex.exec(html)) !== null) {
      const inner = match[1].replace(/<[^>]+>/g, "").trim();
      if (inner) paragraphs.push(`<p>${inner}</p>`);
    }
    // Try list items
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    while ((match = liRegex.exec(html)) !== null) {
      const inner = match[1].replace(/<[^>]+>/g, "").trim();
      if (inner) paragraphs.push(`<p>${inner}</p>`);
    }
  }

  // ── Phase 5: If still nothing, strip ALL tags and wrap in <p> ────────────
  if (paragraphs.length === 0) {
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
    if (text) paragraphs.push(`<p>${text}</p>`);
  }

  return paragraphs.join("\n");
}