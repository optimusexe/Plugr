import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || "").toString().trim();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await requestPasswordReset(email);
    // Always return ok to avoid leaking account existence
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Server error" }, { status: 500 });
  }
}
