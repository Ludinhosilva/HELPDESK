import { NextRequest, NextResponse } from "next/server";
import { analyzeSentiment, getPriorityOverride } from "@/lib/sentiment";

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: "title y description son requeridos" }, { status: 400 });
    }

    const text = `${title} ${description}`;
    const result = analyzeSentiment(text);
    const priorityOverride = getPriorityOverride(result.level, "MEDIUM");

    return NextResponse.json({ sentiment: result, priorityOverride });
  } catch {
    return NextResponse.json({ error: "Error al analizar sentimiento" }, { status: 500 });
  }
}
