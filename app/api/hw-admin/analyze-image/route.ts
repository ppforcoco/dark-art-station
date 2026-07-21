// app/api/hw-admin/analyze-image/route.ts
//
// Server-side proxy for AI image analysis (title / description / alt text /
// meta description / tags). This exists so the GLM API key never has to sit
// in client-side code — the admin panel calls THIS route, and this route
// calls Z.ai from the server, where the key is safe.
import { NextRequest, NextResponse } from "next/server";

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

const GLM_API_URL = "https://api.z.ai/api/paas/v4/chat/completions";
// glm-4.6v-flash is Z.ai's free-tier vision model — see docs.z.ai
const GLM_MODEL = "glm-4.6v-flash";

const ALL_TAG_LIST = [
  "dark","gothic","horror","fantasy","minimal","amoled","neon","cyberpunk",
  "nature","abstract","skull","moon","forest","city","demon","angel","witch",
  "fire","ice","space","ocean","halloween","anime","street","pattern",
  "texture","portrait","landscape",
];

interface ImageAnalysis {
  title: string;
  description: string;
  altText: string;
  metaDescription: string;
  tags: string[];
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

    const prompt = `You are an SEO expert for "Haunted Wallpapers", a dark-aesthetic wallpaper site.
Analyze this wallpaper image and return ONLY valid JSON, no markdown, no code fences, no commentary:
{
  "title": "Compelling wallpaper title (4-8 words)",
  "description": "SEO description, ~200 words, flowing prose, no HTML tags",
  "altText": "130-150 characters alt text, no period at end",
  "metaDescription": "130-155 characters, keyword-rich, what Google shows in search results",
  "tags": ["3-6 tags from: ${ALL_TAG_LIST.join(", ")}"]
}`;

    const glmRes = await fetch(GLM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GLM_MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mediaType};base64,${imageBase64}` },
              },
              { type: "text", text: prompt },
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
      const clean = raw.replace(/^```json\n?|```$/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: "GLM response could not be parsed as JSON.", raw: raw.slice(0, 300) },
        { status: 502 }
      );
    }

    return NextResponse.json({
      title: parsed.title ?? "",
      description: parsed.description ?? "",
      altText: parsed.altText ?? "",
      metaDescription: parsed.metaDescription ?? "",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    });

  } catch (err) {
    console.error("[admin/analyze-image POST]", err);
    return NextResponse.json({ error: "Image analysis failed." }, { status: 500 });
  }
}
