import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BLOGS_FILE = path.join(process.cwd(), "public", "hw-blogs.json");

function checkAuth(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
  return pw === correct;
}

function loadBlogs(): { slug: string; title: string; label: string; content: string; date: string }[] {
  try {
    if (fs.existsSync(BLOGS_FILE)) {
      return JSON.parse(fs.readFileSync(BLOGS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function saveBlogs(blogs: { slug: string; title: string; label: string; content: string; date: string }[]) {
  fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), "utf-8");
}

// GET — list all posts
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const blogs = loadBlogs();
  return NextResponse.json({
    posts: blogs.map((b) => ({ slug: b.slug, title: b.title, date: b.date })),
  });
}

// POST — create a new post
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, slug, content, label } = await req.json();

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "title, slug, and content are required" }, { status: 400 });
    }

    // Validate slug
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: "Slug can only contain lowercase letters, numbers, and hyphens" }, { status: 400 });
    }

    const blogs = loadBlogs();

    // Check for duplicate slug
    if (blogs.find((b) => b.slug === slug)) {
      return NextResponse.json({ error: `A post with slug "${slug}" already exists` }, { status: 409 });
    }

    const newPost = {
      slug,
      title,
      label: label ?? "Guide",
      content,
      date: new Date().toISOString().split("T")[0],
    };

    blogs.unshift(newPost); // newest first
    saveBlogs(blogs);

    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    console.error("[admin/blogs POST]", err);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}

// DELETE — remove a post by slug
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { slug } = await req.json();
    const blogs = loadBlogs().filter((b) => b.slug !== slug);
    saveBlogs(blogs);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}