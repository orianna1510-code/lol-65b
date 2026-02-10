import "server-only";
import { prisma } from "@/lib/prisma";
import { AUTONOMOUS } from "@/lib/constants";
import { generateMeme } from "@/lib/meme-generator";
import { getPersonalityByName } from "./personalities";
import { generateMemeConcept } from "./concept-generator";
import { generateComment } from "./comment-generator";
import { decideVotes } from "./agent-voter";
import { logActivity } from "./activity-log";
import { Prisma } from "@/generated/prisma/client";

export interface AgentRunResult {
  agentId: string;
  agentName: string;
  memesGenerated: number;
  votescast: number;
  commentsPosted: number;
  errors: string[];
}

export async function runAgent(agentId: string): Promise<AgentRunResult> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { id: true, name: true, isAutonomous: true },
  });

  if (!agent) throw new Error(`Agent not found: ${agentId}`);
  if (!agent.isAutonomous) throw new Error(`Agent ${agent.name} is not autonomous`);

  const personality = getPersonalityByName(agent.name);
  if (!personality) throw new Error(`No personality found for: ${agent.name}`);

  const result: AgentRunResult = {
    agentId: agent.id,
    agentName: agent.name,
    memesGenerated: 0,
    votescast: 0,
    commentsPosted: 0,
    errors: [],
  };

  await logActivity(agent.id, "run_started");

  // 1. Browse recent hot memes
  let recentMemes: { id: string; caption: string; promptUsed: string | null; communityId: string | null }[] = [];
  try {
    recentMemes = await prisma.meme.findMany({
      orderBy: { hotScore: "desc" },
      take: AUTONOMOUS.BROWSE_LIMIT,
      select: { id: true, caption: true, promptUsed: true, communityId: true },
    });
    await logActivity(agent.id, "browsed", undefined, { count: recentMemes.length });
  } catch (error) {
    result.errors.push(`Browse failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 2. Vote on memes
  try {
    const decisions = decideVotes(personality, recentMemes);
    for (const { memeId, direction } of decisions) {
      try {
        // Check if already voted
        const existing = await prisma.vote.findUnique({
          where: { memeId_agentId: { memeId, agentId: agent.id } },
        });
        if (existing) continue;

        await prisma.$transaction(
          async (tx) => {
            await tx.vote.create({
              data: { direction, memeId, agentId: agent.id },
            });
            await tx.meme.update({
              where: { id: memeId },
              data: { score: { increment: direction } },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
        );

        result.votescast++;
        await logActivity(agent.id, "voted", memeId, { direction });
      } catch (error) {
        // P2002 = already voted (race), skip silently
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code: string }).code === "P2002"
        ) {
          continue;
        }
        result.errors.push(`Vote failed on ${memeId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } catch (error) {
    result.errors.push(`Voting phase failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 3-5. Generate and post a meme
  try {
    const concept = await generateMemeConcept(personality);

    // Pick a community from affinities
    const communityName = personality.communityAffinities[
      Math.floor(Math.random() * personality.communityAffinities.length)
    ];
    const community = await prisma.community.findUnique({
      where: { name: communityName },
      select: { id: true },
    });

    const meme = await generateMeme({
      concept: concept.concept,
      topCaption: concept.topCaption || undefined,
      bottomCaption: concept.bottomCaption || undefined,
      agentId: agent.id,
      communityId: community?.id,
    });

    result.memesGenerated++;
    await logActivity(agent.id, "generated_meme", meme.id, {
      concept: concept.concept,
      community: communityName,
    });
  } catch (error) {
    result.errors.push(`Meme generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 6. Comment on 0-2 random memes
  try {
    const commentCount = Math.floor(Math.random() * (AUTONOMOUS.MAX_COMMENTS_PER_RUN + 1));
    if (commentCount > 0 && recentMemes.length > 0) {
      const shuffled = [...recentMemes].sort(() => Math.random() - 0.5);
      const toComment = shuffled.slice(0, commentCount);

      for (const meme of toComment) {
        try {
          const commentText = await generateComment(
            personality,
            meme.caption,
            meme.promptUsed
          );

          const comment = await prisma.comment.create({
            data: {
              content: commentText,
              memeId: meme.id,
              agentId: agent.id,
            },
          });

          result.commentsPosted++;
          await logActivity(agent.id, "commented", comment.id, { memeId: meme.id });
        } catch (error) {
          result.errors.push(`Comment failed on ${meme.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
  } catch (error) {
    result.errors.push(`Commenting phase failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Log completion
  const finalAction = result.errors.length > 0 ? "run_failed" : "run_completed";
  await logActivity(agent.id, finalAction, undefined, {
    memes: result.memesGenerated,
    votes: result.votescast,
    comments: result.commentsPosted,
    errorCount: result.errors.length,
  });

  return result;
}
