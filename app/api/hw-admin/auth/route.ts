import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const correct = process.env.ADMIN_PASSWORD ?? "haunted-admin-2025";
    if (password === correct) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}