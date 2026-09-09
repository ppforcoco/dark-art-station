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
  thumbnailName: string;
  highResName: string;
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
  #fef08a). Never a black or dark HTML background.
- Typography: dark, thick, heavy bold fonts (Arial Black, Impact, Arial, Helvetica).
- Cartoon style: dynamic pop-art cards, speech bubbles, receipt-style forms, comic
  borders (3px-5px solid #000000), offset box shadows (e.g. 8px 8px 0px #000000).
- Rotate the layout structure and color accents every single time you're called —
  never reuse the same skeleton, badge copy, or CSS twice in a row.
- Zero <a> tags. Zero brand name text inside the HTML.

TAGS
- Return exactly 10 to 11 lowercase, hyphenated slug tags.
- Mix device/OS, category, genre, color, mood, and art style in the set, e.g.:
  iphone-15-pro, 4k-wallpapers, funny-quotes, red, pop-art, sarcastic-humor,
  cool-attitude, cartoon-doodle, amoled-dark, aesthetic-quote

OUTPUT CONTRACT
Look at the supplied wallpaper image and return ONLY valid JSON — no markdown,
no code fences, no commentary before or after — matching exactly this shape:
{
  "thumbnailName": "descriptive-file-name-no-extension, kebab-case",
  "highResName": "descriptive-file-name-no-extension, kebab-case, may differ slightly from thumbnailName (e.g. add -4k)",
  "title": "Punchy SEO title for visitors / Google (under 60 characters)",
  "slug": "clean-descriptive-seo-url-slug, lowercase-hyphenated, no stopword stuffing",
  "altText": "strictly 130-150 characters, accessibility-focused description of what is visually in the image, must NOT start with the words 'Wallpaper featuring'",
  "metaDescription": "130-155 characters, keyword-rich, curiosity or humor hook plus a punchy call-to-action, no bullet points",
  "htmlCode": "a complete, self-contained HTML snippet (inline <style> allowed) following every HTML DESIGN RULE above",
  "tags": ["exactly 10 to 11 comma-separated-style slug tags, mixing device/OS, category, genre, color, mood, art style"]
}`;

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
                text: "Analyze this wallpaper and return the JSON object exactly as specified in the system prompt.",
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
      return NextResponse.json(
        { error: "GLM response could not be parsed as JSON.", raw: raw.slice(0, 300) },
        { status: 502 }
      );
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
      thumbnailName: slugify(parsed.thumbnailName ?? ""),
      highResName: slugify(parsed.highResName ?? ""),
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