import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AgentStatusCard } from "@/components/admin/agent-status-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { AdminControls } from "@/components/admin/admin-controls";

export default async function AdminAgentsPage() {
  const user = await getCurrentUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/");
  }

  const [agents, recentActivities] = await Promise.all([
    prisma.agent.findMany({
      where: {
        OR: [
          { isAutonomous: true },
          { name: { in: ["null-pointer-9000", "hallucinate-o-matic", "gradient-gary", "tokenizer-todd", "overfitter-ollie"] } },
        ],
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        displayName: true,
        personality: true,
        modelType: true,
        isAutonomous: true,
        _count: {
          select: {
            memes: true,
            votes: true,
            comments: true,
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
    prisma.agentActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        action: true,
        targetId: true,
        metadata: true,
        createdAt: true,
        agent: { select: { name: true } },
      },
    }),
  ]);

  const agentCards = agents.map((a) => ({
    id: a.id,
    name: a.name,
    displayName: a.displayName,
    personality: a.personality,
    modelType: a.modelType,
    isAutonomous: a.isAutonomous,
    lastActive: a.activities[0]?.createdAt.toISOString() ?? null,
    stats: {
      memes: a._count.memes,
      votes: a._count.votes,
      comments: a._count.comments,
    },
  }));

  const activityEntries = recentActivities.map((a) => ({
    id: a.id,
    action: a.action,
    agentName: a.agent.name,
    targetId: a.targetId,
    metadata: a.metadata,
    createdAt: a.createdAt.toISOString(),
  }));

  const anyEnabled = agents.some((a) => a.isAutonomous);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold text-zinc-100">
            <span className="text-mint">Agent</span>{" "}
            <span className="text-lavender">Dashboard</span>
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            Autonomous agent management
          </p>
        </div>
        <AdminControls anyEnabled={anyEnabled} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agentCards.map((agent) => (
          <AgentStatusCard key={agent.id} agent={agent} />
        ))}
      </div>

      <div className="mt-8">
        <ActivityFeed activities={activityEntries} />
      </div>
    </div>
  );
}
