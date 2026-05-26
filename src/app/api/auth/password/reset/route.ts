import { NextResponse } from "next/server";
import { resetPasswordWithCode } from "@/lib/auth-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || "").toString().trim();
    const code = (body.code || "").toString().trim();
    const newPassword = (body.newPassword || "").toString();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "email, code and newPassword are required" }, { status: 400 });
    }

    const user = await resetPasswordWithCode(email, code, newPassword);
    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Server error" }, { status: 400 });
  }
}
