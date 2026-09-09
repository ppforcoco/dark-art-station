// app/api/hw-admin/analyze-image/route.ts
//
// Server-side proxy for AI image analysis (thumbnail/high-res rename,
// title, SEO slug, alt text, meta description, HTML card, tags).
// This exists so the GLM API key never has to sit in client-side code —
// the admin panel calls THIS route, and this route calls Z.ai from the
// server, where the key is safe.
//
// Prompt system: "mr4k2walls MASTER CONTENT & SEO SYSTEM"
import { NextRequest, NextResponse } from "next/server";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

const GLM_API_URL = "https://api.z.ai/api/paas/v4/chat/completions";
// glm-4.6v-flash is Z.ai's free-tier vision model — see docs.z.ai
const GLM_MODEL = "glm-4.6v-flash";

interface ImageAnalysis {
  thumbnailFilename: string;
  highResFilename: string;
  title: string;
  slug: string;
  altText: string;
  metaDescription: string;
  htmlCode: string;
  tags: string[];
}

// ── The mr4k2walls system prompt ─────────────────────────────────────────
// Sent as the `system` message so it governs every field GLM returns.
// Keep this in sync with the brand's master content doc if the rules change.
const SYSTEM_PROMPT = `You are the content engine for "mr4k2walls", a wallpaper site.

GLOBAL BRANDING & CREATIVE TONE
- Tone: high-energy comedy — witty, hilarious, sarcastic, absurd, relatable humor.
- Never write "mr4k2walls" or any brand name inside HTML headers, badges, or text.
- Zero links: never include any <a> tag, anywhere, for any reason.

STRICT PROHIBITIONS
- No legal or police themes.
- No religious or forbidden words (demon, devil, hell, satan, possessed, etc.).
- No CTA spam ("download from vault", "grab free wallpaper", etc.).
- No bullet points anywhere in prose fields — clean paragraph text only.
- No repeated HTML layouts, duplicate badge text, or copied CSS styles — every
  image gets a fresh structural rotation.

HTML DESIGN RULES (for the htmlCode field)
- Background: clean white (#ffffff) or a very light bright tint (#fef2f2, #ecfeff,
  #fef08a). Never a black or dark HTML background, anywhere, on any element.
- Typography: dark, thick, heavy bold fonts (Arial Black, Impact, Arial, Helvetica).
- Cartoon style: dynamic pop-art cards, speech bubbles, receipt-style forms, comic
  borders (3px-5px solid #000000), offset box shadows (e.g. 8px 8px 0px #000000).
- Rotate the layout structure and color accents every single time you're called —
  never reuse the same skeleton, badge copy, or CSS twice in a row.
- Zero <a> tags. Zero brand name text inside the HTML.
- This card is a standalone piece of page content that sits BELOW the wallpaper
  image on the page — it is never a caption, quote, or overlay burned on top of
  the photo itself, and it never tries to reproduce or crop the uploaded image.
  Do not use dark semi-transparent overlays, dark gradients, or white-text-on-
  black-photo meme styling. That is the OLD site style — it is banned.
- MOBILE + DESKTOP RESPONSIVE — every card renders correctly from a 360px-wide
  phone screen up to a 1200px-wide desktop column, with no fixed pixel widths,
  no horizontal scrollbars, and no overlapping/clipped text at any width:
  - Root wrapper: "max-width:640px;width:100%;margin:0 auto;box-sizing:border-box"
    (never a fixed "width:700px" or similar).
  - Every element uses "box-sizing:border-box"; no element sets a fixed px width
    wider than its parent.
  - Headline/quote text uses "font-size:clamp(1.1rem,4.5vw,1.8rem)" (or similar
    clamp() calls) instead of a fixed px/rem size, so it shrinks gracefully on
    narrow screens instead of wrapping badly or overflowing.
  - Multi-item rows (badges, stat rows, button rows) use
    "display:flex;flex-wrap:wrap;gap:8px" so items stack cleanly on narrow
    screens instead of overflowing or getting clipped.
  - Padding uses forgiving relative values (e.g. "padding:clamp(12px,4vw,28px)")
    rather than one large fixed px value that eats too much of a phone screen.
  - Include one small <style> media query that tightens padding/font-size
    below 480px, e.g. "@media (max-width:480px){ ... }" — vary its exact
    contents each time along with the rest of the layout rotation.

REFERENCE STRUCTURE (mimic this literal shape and responsive technique every
time — reskin the copy, colors, card type, and CSS class names so no two
outputs look identical, but never abandon the white background or the
clamp()/flex-wrap responsive pattern):
<div class="m4k-card-a" style="max-width:640px;width:100%;margin:0 auto;background:#fef08a;border:4px solid #000;box-shadow:8px 8px 0px #000;padding:clamp(14px,4vw,26px);box-sizing:border-box;font-family:Arial Black, Arial, sans-serif;">
  <style>
    .m4k-card-a .m4k-badge{display:inline-block;background:#000;color:#fef08a;padding:4px 10px;font-size:clamp(0.65rem,2.5vw,0.8rem);transform:rotate(-2deg);}
    .m4k-card-a .m4k-line{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;}
    @media (max-width:480px){ .m4k-card-a{padding:14px;} .m4k-card-a h2{font-size:1.2rem;} }
  </style>
  <span class="m4k-badge">MOOD: UNBOTHERED</span>
  <h2 style="margin:12px 0 6px;color:#000;font-size:clamp(1.1rem,4.5vw,1.8rem);line-height:1.15;">Some punchy bold line here</h2>
  <p style="margin:0;color:#000;font-size:clamp(0.85rem,2.8vw,1rem);font-family:Arial, Helvetica, sans-serif;font-weight:normal;">A short second line of flavor text, plain paragraph, no bullets.</p>
  <div class="m4k-line">
    <span style="background:#000;color:#fff;padding:3px 9px;font-size:0.7rem;">TAG ONE</span>
    <span style="background:#fff;color:#000;border:2px solid #000;padding:3px 9px;font-size:0.7rem;">TAG TWO</span>
  </div>
</div>
(The next card you generate must use different class names, a different
container shape — e.g. a speech bubble, a receipt strip, a comic panel grid —
different colors from the approved tint list, and different copy. Only the
underlying responsive technique — clamp(), flex-wrap, box-sizing:border-box,
relative max-width, the media query — carries over every time.)

TAGS
- Return exactly 10 to 11 lowercase, hyphenated slug tags.
- Mix device/OS, category, genre, color, mood, and art style in the set, e.g.:
  iphone-15-pro, 4k-wallpapers, funny-quotes, red, pop-art, sarcastic-humor,
  cool-attitude, cartoon-doodle, amoled-dark, aesthetic-quote

OUTPUT CONTRACT
Look at the supplied wallpaper image and return ONLY valid JSON — no markdown,
no code fences, no commentary before or after — matching exactly this shape:
{
  "thumbnailFilename": "descriptive-file-name-no-extension, kebab-case",
  "highResFilename": "descriptive-file-name-no-extension, kebab-case, may differ slightly from thumbnailFilename (e.g. add -4k)",
  "title": "Punchy SEO title for visitors / Google (under 60 characters)",
  "slug": "clean-descriptive-seo-url-slug, lowercase-hyphenated, no stopword stuffing",
  "altText": "strictly 130-150 characters, accessibility-focused description of what is visually in the image, must NOT start with the words 'Wallpaper featuring'",
  "metaDescription": "130-155 characters, keyword-rich, curiosity or humor hook plus a punchy call-to-action, no bullet points",
  "tags": ["exactly 10 to 11 comma-separated-style slug tags, mixing device/OS, category, genre, color, mood, art style"],
  "htmlCode": "a complete, self-contained HTML snippet (inline <style> allowed) following every HTML DESIGN RULE above"
}

IMPORTANT: emit the fields in exactly the order shown above, with "tags" BEFORE
"htmlCode". "tags" must never be empty — always fill it even if you have to
shorten "htmlCode" to fit.`;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GLM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GLM_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const { imageBase64, mediaType } = await req.json();
    if (!imageBase64 || !mediaType) {
      return NextResponse.json(
        { error: "imageBase64 and mediaType are required" },
        { status: 400 }
      );
    }

    const glmRes = await fetch(GLM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GLM_MODEL,
        max_tokens: 3000,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mediaType};base64,${imageBase64}` },
              },
              {
                type: "text",
                text: "Analyze this wallpaper and return the JSON object exactly as specified in the system prompt. Reminder on htmlCode specifically: white or light-tint background only (never black/dark), a standalone pop-art card BELOW the image — not a caption or dark overlay burned onto the photo — and must be responsive from 360px phone width to 1200px desktop width using clamp() font sizes, flex-wrap rows, box-sizing:border-box, and a max-width:640px;width:100% root (no fixed pixel widths). Follow the REFERENCE STRUCTURE's technique but invent your own class names, container shape, colors, and copy — do not reuse its exact class names or copy verbatim.",
              },
            ],
          },
        ],
      }),
    });

    if (!glmRes.ok) {
      const errText = await glmRes.text().catch(() => "");
      return NextResponse.json(
        { error: `GLM API error ${glmRes.status}: ${errText.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await glmRes.json();
    const raw: string = data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!raw) {
      return NextResponse.json({ error: "GLM returned an empty response." }, { status: 502 });
    }

    let parsed: ImageAnalysis;
    try {
      // GLM doesn't always follow the "```json ... ```" format exactly — it
      // sometimes omits the "json" language tag, sometimes adds a sentence
      // of commentary before/after the fence despite being told not to.
      // Strip any code fence variant, then fall back to grabbing the {...}
      // substring, which survives all of the above.
      let clean = raw.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
      const firstBrace = clean.indexOf("{");
      const lastBrace = clean.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        clean = clean.slice(firstBrace, lastBrace + 1);
      }
      const rawParsed: unknown = JSON.parse(clean);
      if (!isPlainObject(rawParsed)) throw new Error("not an object");
      parsed = rawParsed as unknown as ImageAnalysis;
    } catch {
      // Full JSON.parse failed — most often because a long htmlCode value
      // got cut off mid-string when the response hit the token limit, which
      // leaves an unterminated string/brace even though every field BEFORE
      // htmlCode (title, slug, tags, etc.) rendered completely and correctly.
      // Rather than discarding a mostly-good response, pull each field out
      // with its own regex so the admin still gets everything that did come
      // through — worst case htmlCode is missing/partial and they regenerate
      // just that field instead of redoing the whole analysis.
      const field = (key: string): string => {
        const m = raw.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
        return m ? m[1].replace(/\\"/g, '"').replace(/\\n/g, "\n") : "";
      };
      const tagsMatch = raw.match(/"tags"\s*:\s*\[([^\]]*)\]/);
      const recoveredTags = tagsMatch
        ? tagsMatch[1].split(",").map((t) => t.trim().replace(/^"|"$/g, "")).filter(Boolean)
        : [];

      if (!field("title") && !recoveredTags.length) {
        return NextResponse.json(
          { error: "GLM response could not be parsed as JSON.", raw: raw.slice(0, 300) },
          { status: 502 }
        );
      }

      parsed = {
        thumbnailFilename: field("thumbnailFilename"),
        highResFilename: field("highResFilename"),
        title: field("title"),
        slug: field("slug"),
        altText: field("altText"),
        metaDescription: field("metaDescription"),
        htmlCode: field("htmlCode"),
        tags: recoveredTags,
      };
    }

    // Light normalization — never hard-fail the request over formatting;
    // the admin still reviews/edits everything in the panel before saving.
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
      : [];

    const slugify = (s: string) =>
      String(s || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return NextResponse.json({
      thumbnailFilename: slugify(parsed.thumbnailFilename ?? ""),
      highResFilename: slugify(parsed.highResFilename ?? ""),
      title: String(parsed.title ?? "").trim(),
      slug: slugify(parsed.slug ?? parsed.title ?? ""),
      altText: String(parsed.altText ?? "").trim(),
      metaDescription: String(parsed.metaDescription ?? "").trim(),
      htmlCode: String(parsed.htmlCode ?? "").trim(),
      tags,
    });

  } catch (err) {
    console.error("[admin/analyze-image POST]", err);
    return NextResponse.json({ error: "Image analysis failed." }, { status: 500 });
  }
}