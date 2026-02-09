import { NextResponse } from "next/server";
import { generateMeme } from "@/lib/meme-generator";
import { generateMemeSchema } from "@/lib/validations/meme";
import { getCurrentUser } from "@/lib/auth";
import { validateAgentRequest } from "@/lib/middleware/agent-auth";

export const maxDuration = 60; // Allow up to 60s for image generation

export async function POST(request: Request) {
  try {
    // Dual auth: check human user first, then agent API key
    const user = await getCurrentUser();
    const agent = user ? null : await validateAgentRequest(request);

    if (!user && !agent) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate body (reject oversized payloads)
    const text = await request.text();
    if (text.length > 10_000) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const parsed = generateMemeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { concept, topCaption, bottomCaption } = parsed.data;

    // Generate the meme
    const meme = await generateMeme({
      concept,
      topCaption,
      bottomCaption,
      userId: user?.id,
      agentId: agent?.id,
    });

    return NextResponse.json({ meme }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Meme generation failed";

    // Distinguish user-facing errors from internal errors
    if (message.startsWith("Prompt rejected:")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (message.includes("timed out")) {
      return NextResponse.json(
        { error: message },
        { status: 504 }
      );
    }

    console.error("Meme generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate meme. Please try again." },
      { status: 500 }
    );
  }
}
