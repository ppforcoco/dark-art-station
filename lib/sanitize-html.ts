/**
 * sanitizeAdminHtml
 *
 * Admin-entered HTML can be a full standalone page (with <html>, <body>, <style>,
 * <script> tags) OR clean prose markup (<p>, <h2>, <ul> etc.).
 *
 * This function strips all layout/style wrappers and returns ONLY the readable
 * prose content that is safe to render inside a <div>.
 *
 * Works server-side with no DOM — pure string/regex transforms.
 */
export function sanitizeAdminHtml(raw: string): string {
  if (!raw || !raw.trim()) return "";

  let html = raw;

  // 1. Remove <style>…</style> blocks entirely
  html = html.replace(/<style[\s\S]*?<\/style>/gi, "");

  // 2. Remove <script>…</script> blocks entirely
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "");

  // 3. Remove <head>…</head>
  html = html.replace(/<head[\s\S]*?<\/head>/gi, "");

  // 4. If there's a <body>, extract only its contents
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1];
  }

  // 5. Unwrap structural/layout divs that carry no semantic prose value.
  //    We keep: p, h1-h6, ul, ol, li, em, strong, span, a, br, blockquote, hr
  //    We unwrap (remove tag but keep inner content): div, section, article,
  //    main, aside, header, footer, nav, figure, figcaption, form
  const UNWRAP_TAGS = [
    "div","section","article","main","aside",
    "header","footer","nav","figure","figcaption","form",
    "html","body","table","tbody","tr","td","th",
  ];
  for (const tag of UNWRAP_TAGS) {
    // Remove opening tag (with any attributes)
    html = html.replace(new RegExp(`<${tag}[^>]*>`, "gi"), "");
    // Remove closing tag
    html = html.replace(new RegExp(`<\\/${tag}>`, "gi"), "");
  }

  // 6. Strip inline style="" and class="" attributes from remaining tags
  //    (keeps the tag but removes layout-specific overrides)
  html = html.replace(/\s+style="[^"]*"/gi, "");
  html = html.replace(/\s+class="[^"]*"/gi, "");

  // 7. Remove on* event handlers
  html = html.replace(/\s+on\w+="[^"]*"/gi, "");

  // 8. Collapse excessive blank lines (3+ newlines → 2)
  html = html.replace(/\n{3,}/g, "\n\n");

  // 9. Trim
  html = html.trim();

  // 10. If after all this we have no <p> tags at all (e.g. content was pure text),
  //     wrap bare text runs in <p> tags so they render with prose styling.
  if (!/<p[\s\S]*?>/i.test(html) && html.length > 0) {
    html = `<p>${html.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
  }

  return html;
}