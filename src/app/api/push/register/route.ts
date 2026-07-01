import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { token, platform } = body as { token: string; platform: string };

    if (!token || !platform) {
      return NextResponse.json({ error: "token and platform required" }, { status: 400 });
    }

    await prisma.pushToken.upsert({
      where: { userId_token: { userId, token } },
      update: { platform, createdAt: new Date() },
      create: { userId, token, platform },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
