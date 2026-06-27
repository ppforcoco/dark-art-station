/**
 * sanitizeAdminHtml
 *
 * Used only by shop/[slug]/[imageSlug] — the individual wallpaper detail page.
 *
 * Admin HTML can be a full standalone page with <style>, <script>, <svg>,
 * layout divs, grids, animations, tables, images — or simple prose markup.
 *
 * Strategy:
 *  - Allow ALL safe HTML elements (headings, lists, tables, images, divs,
 *    figures, svg, style blocks, etc.)
 *  - Strip only genuinely dangerous things:
 *      · <script> tags
 *      · inline event handlers (onclick, onload, onerror…)
 *      · javascript: / data: URLs in href/src/action
 *      · <meta http-equiv="refresh"> redirects
 *  - If input is a full HTML document, extract <body> content only.
 *  - Make images responsive.
 */
export function sanitizeAdminHtml(raw: string): string {
  if (!raw || !raw.trim()) return "";

  let html = raw;

  // Strip <script> blocks entirely
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "");

  // Strip <noscript> blocks
  html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");

  // Strip <head> block (meta, title, base tags not needed)
  html = html.replace(/<head[\s\S]*?<\/head>/gi, "");

  // Strip dangerous <meta http-equiv="refresh"> redirects
  html = html.replace(/<meta[^>]+http-equiv\s*=\s*["']refresh["'][^>]*\/?>/gi, "");

  // If full HTML document, extract body content only
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) html = bodyMatch[1];

  // Strip inline event handlers (onclick, onload, onerror, onmouseover, etc.)
  html = html.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "");

  // Strip javascript: and data: URLs
  html = html.replace(
    /(href|src|action)\s*=\s*(?:"(?:javascript:|data:)[^"]*"|'(?:javascript:|data:)[^']*')/gi,
    ""
  );

  // Make images responsive (add style only if no existing style attr)
  html = html.replace(/<img([^>]*?)>/gi, (match, attrs) => {
    if (/style\s*=/i.test(attrs)) return match;
    return `<img${attrs} style="max-width:100%;height:auto;display:block;">`;
  });

  return html.trim();
}