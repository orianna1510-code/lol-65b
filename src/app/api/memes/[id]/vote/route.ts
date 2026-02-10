import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { validateAgentRequest } from "@/lib/middleware/agent-auth";
import { voteSchema } from "@/lib/validations/vote";
import type { VoteResponse } from "@/lib/validations/vote";
import { Prisma } from "@/generated/prisma/client";

function isPrismaUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memeId } = await params;

    // Dual auth: human user or agent API key
    const user = await getCurrentUser();
    const agent = user ? null : await validateAgentRequest(request);

    if (!user && !agent) {
      return NextResponse.json(
        { error: "Authentication required. Log in to vote." },
        { status: 401 }
      );
    }

    // Parse and validate body
    const body = await request.json().catch(() => null);
    const parsed = voteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid vote. Direction must be 1 (up), -1 (down), or 0 (remove)." },
        { status: 400 }
      );
    }

    const { direction } = parsed.data;

    // Build the voter identity filter (XOR: userId or agentId)
    const voterFilter = user
      ? { userId: user.id }
      : { agentId: agent!.id };

    // Execute vote logic in a Serializable transaction to prevent race conditions
    const result = await prisma.$transaction(
      async (tx) => {
        // Verify the meme exists
        const meme = await tx.meme.findUnique({
          where: { id: memeId },
          select: { id: true, score: true },
        });

        if (!meme) {
          return { error: "Meme not found", status: 404 } as const;
        }

        // Find existing vote by this voter on this meme
        const existingVote = await tx.vote.findFirst({
          where: { memeId, ...voterFilter },
        });

        let scoreChange = 0;
        let newUserVote: 1 | -1 | null = null;

        if (direction === 0) {
          // Explicit remove
          if (existingVote) {
            await tx.vote.delete({ where: { id: existingVote.id } });
            scoreChange = -existingVote.direction;
          }
          newUserVote = null;
        } else if (existingVote) {
          if (existingVote.direction === direction) {
            // Same direction → toggle off (remove vote)
            await tx.vote.delete({ where: { id: existingVote.id } });
            scoreChange = -direction;
            newUserVote = null;
          } else {
            // Opposite direction → switch vote
            await tx.vote.update({
              where: { id: existingVote.id },
              data: { direction },
            });
            scoreChange = 2 * direction; // swing from -1 to +1 or vice versa
            newUserVote = direction as 1 | -1;
          }
        } else {
          // No existing vote → create new
          await tx.vote.create({
            data: {
              direction,
              memeId,
              ...voterFilter,
            },
          });
          scoreChange = direction;
          newUserVote = direction as 1 | -1;
        }

        // Update denormalized score
        const updatedMeme = await tx.meme.update({
          where: { id: memeId },
          data: { score: { increment: scoreChange } },
          select: { score: true },
        });

        return {
          score: updatedMeme.score,
          userVote: newUserVote,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    // Check if transaction returned an error object
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const response: VoteResponse = result;
    return NextResponse.json(response);
  } catch (error) {
    // Handle concurrent vote race condition gracefully
    if (isPrismaUniqueViolation(error)) {
      return NextResponse.json(
        { error: "Vote conflict — please try again" },
        { status: 409 }
      );
    }

    console.error("Vote error:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}
