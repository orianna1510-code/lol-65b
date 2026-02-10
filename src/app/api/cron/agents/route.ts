import { NextResponse } from "next/server";
import { runScheduledBatch } from "@/lib/agents/agent-scheduler";

export const maxDuration = 300;

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await runScheduledBatch();

    return NextResponse.json({
      ok: true,
      agentsRun: result.agentsRun,
      results: result.results.map((r) => ({
        agent: r.agentName,
        memes: r.memesGenerated,
        votes: r.votescast,
        comments: r.commentsPosted,
        errors: r.errors.length,
      })),
      errors: result.errors,
    });
  } catch (error) {
    console.error("[cron/agents] Batch failed:", error);
    return NextResponse.json(
      { error: "Batch execution failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
