import { NextResponse } from "next/server";
import { investigateApp } from "@/lib/agent/investigate";

// Two LLM phases (research + structured guide); allow headroom on Fluid Compute.
export const maxDuration = 120;

/** Live OAuth readiness guide generation for an unfamiliar app. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      appQuery?: string;
      website?: string;
      notes?: string;
    };

    const appQuery = body.appQuery?.trim();
    if (!appQuery) {
      return NextResponse.json(
        { error: "appQuery is required" },
        { status: 400 },
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OpenRouter is not configured. Set OPENROUTER_API_KEY in .env.local (see .env.example).",
        },
        { status: 503 },
      );
    }

    console.log(`[api/generate] start appQuery="${appQuery}"`);
    const { guide, steps } = await investigateApp({
      appQuery,
      website: body.website?.trim(),
      notes: body.notes?.trim(),
    });

    console.log(
      `[api/generate] done slug=${guide.slug} steps=${steps.length}\n` +
        steps.map((s, i) => `  ${i + 1}. ${s}`).join("\n"),
    );

    return NextResponse.json({ guide, steps });
  } catch (err) {
    console.error("[api/generate]", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to generate guide",
      },
      { status: 500 },
    );
  }
}
