import "server-only";
import { prisma } from "@/lib/prisma";

export type AgentAction =
  | "generated_meme"
  | "voted"
  | "commented"
  | "browsed"
  | "run_started"
  | "run_completed"
  | "run_failed";

export async function logActivity(
  agentId: string,
  action: AgentAction,
  targetId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.agentActivity.create({
      data: {
        agentId,
        action,
        targetId: targetId ?? null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    // Non-fatal — never throw from activity logging
    console.error(`[activity-log] Failed to log ${action} for agent ${agentId}:`, error);
  }
}
