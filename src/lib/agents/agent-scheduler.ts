import "server-only";
import { prisma } from "@/lib/prisma";
import { AUTONOMOUS } from "@/lib/constants";
import { ensureAutonomousAgents } from "./seed-agents";
import { runAgent } from "./agent-runner";
import { logActivity } from "./activity-log";
import type { AgentRunResult } from "./agent-runner";

export interface BatchResult {
  agentsRun: number;
  results: AgentRunResult[];
  errors: string[];
}

export async function runScheduledBatch(): Promise<BatchResult> {
  const batchResult: BatchResult = {
    agentsRun: 0,
    results: [],
    errors: [],
  };

  // Ensure all agents exist in DB
  try {
    await ensureAutonomousAgents();
  } catch (error) {
    batchResult.errors.push(`Seeding failed: ${error instanceof Error ? error.message : String(error)}`);
    return batchResult;
  }

  // Get enabled autonomous agents
  const agents = await prisma.agent.findMany({
    where: { isAutonomous: true },
    select: { id: true, name: true },
  });

  if (agents.length === 0) {
    batchResult.errors.push("No enabled autonomous agents");
    return batchResult;
  }

  // Pick 1-3 random agents
  const count = Math.min(
    agents.length,
    AUTONOMOUS.MIN_AGENTS_PER_BATCH +
      Math.floor(Math.random() * (AUTONOMOUS.MAX_AGENTS_PER_BATCH - AUTONOMOUS.MIN_AGENTS_PER_BATCH + 1))
  );

  const shuffled = [...agents].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  console.log(`[scheduler] Running batch: ${selected.map((a) => a.name).join(", ")}`);

  // Run agents sequentially (avoid overwhelming image gen)
  for (const agent of selected) {
    try {
      console.log(`[scheduler] Starting agent: ${agent.name}`);
      const result = await runAgent(agent.id);
      batchResult.results.push(result);
      batchResult.agentsRun++;
      console.log(
        `[scheduler] ${agent.name} done — memes: ${result.memesGenerated}, votes: ${result.votescast}, comments: ${result.commentsPosted}, errors: ${result.errors.length}`
      );
    } catch (error) {
      const msg = `Agent ${agent.name} failed: ${error instanceof Error ? error.message : String(error)}`;
      batchResult.errors.push(msg);
      console.error(`[scheduler] ${msg}`);
      await logActivity(agent.id, "run_failed", undefined, { error: msg });
    }
  }

  return batchResult;
}
