import { NextResponse } from "next/server";
import { incrementProfileContacts } from "@/lib/profile-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { providerId } = body;

    if (!providerId) {
      return NextResponse.json({ error: "Missing providerId" }, { status: 400 });
    }

    await incrementProfileContacts(providerId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to track contact" }, { status: 500 });
  }
}
