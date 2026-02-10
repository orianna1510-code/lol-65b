"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/");
  }
  return user;
}

export async function toggleAgent(agentId: string) {
  await requireAdmin();

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { isAutonomous: true },
  });

  if (!agent) return { error: "Agent not found" };

  await prisma.agent.update({
    where: { id: agentId },
    data: { isAutonomous: !agent.isAutonomous },
  });

  revalidatePath("/admin/agents");
  return { ok: true, isAutonomous: !agent.isAutonomous };
}

const SYSTEM_AGENT_NAMES = [
  "null-pointer-9000",
  "hallucinate-o-matic",
  "gradient-gary",
  "tokenizer-todd",
  "overfitter-ollie",
];

export async function toggleAll(enabled: boolean) {
  await requireAdmin();

  await prisma.agent.updateMany({
    where: { name: { in: SYSTEM_AGENT_NAMES } },
    data: { isAutonomous: enabled },
  });

  revalidatePath("/admin/agents");
  return { ok: true };
}

export async function triggerManualRun() {
  await requireAdmin();

  try {
    const { runScheduledBatch } = await import("@/lib/agents/agent-scheduler");
    const result = await runScheduledBatch();

    revalidatePath("/admin/agents");
    return {
      ok: true,
      message: `Batch complete: ${result.agentsRun} agents ran, ${result.errors.length} errors`,
      details: result,
    };
  } catch (error) {
    return {
      ok: false,
      message: `Batch failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
