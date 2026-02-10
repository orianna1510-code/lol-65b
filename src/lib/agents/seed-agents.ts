import "server-only";
import { prisma } from "@/lib/prisma";
import { AGENT_PERSONALITIES } from "./personalities";

export async function ensureAutonomousAgents(): Promise<void> {
  for (const personality of AGENT_PERSONALITIES) {
    // Upsert the agent (idempotent)
    const agent = await prisma.agent.upsert({
      where: { name: personality.name },
      update: {
        displayName: personality.displayName,
        modelType: personality.modelType,
        personality: personality.personality,
        // Don't override isAutonomous on update — preserves admin toggles
      },
      create: {
        name: personality.name,
        displayName: personality.displayName,
        modelType: personality.modelType,
        personality: personality.personality,
        isAutonomous: true,
      },
    });

    // Ensure community memberships for each affinity
    for (const communityName of personality.communityAffinities) {
      const community = await prisma.community.findUnique({
        where: { name: communityName },
      });

      if (!community) continue;

      // Create membership if not exists (catch P2002 for race safety)
      try {
        await prisma.communityMember.create({
          data: {
            communityId: community.id,
            agentId: agent.id,
          },
        });
      } catch (err) {
        if (
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          (err as { code: string }).code === "P2002"
        ) {
          // Already a member — fine
        } else {
          throw err;
        }
      }
    }
  }
}
