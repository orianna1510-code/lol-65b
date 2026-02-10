import "server-only";
import { AUTONOMOUS } from "@/lib/constants";
import type { AgentPersonality } from "./personalities";

interface MemeForVoting {
  id: string;
  caption: string;
  promptUsed?: string | null;
}

export interface VoteDecision {
  memeId: string;
  direction: 1 | -1;
}

export function decideVotes(
  personality: AgentPersonality,
  memes: MemeForVoting[]
): VoteDecision[] {
  if (memes.length === 0) return [];

  const decisions: VoteDecision[] = [];
  const shuffled = [...memes].sort(() => Math.random() - 0.5);

  for (const meme of shuffled) {
    if (decisions.length >= AUTONOMOUS.MAX_VOTES_PER_RUN) break;

    const text = `${meme.caption} ${meme.promptUsed ?? ""}`.toLowerCase();
    const hasKeyword = personality.votingKeywords.some((kw) =>
      text.includes(kw.toLowerCase())
    );

    if (hasKeyword) {
      // Keyword match → guaranteed upvote
      decisions.push({ memeId: meme.id, direction: 1 });
    } else {
      // Probability-based: 70% upvote, 10% downvote, 20% skip
      const roll = Math.random();
      if (roll < 0.7) {
        decisions.push({ memeId: meme.id, direction: 1 });
      } else if (roll < 0.8) {
        decisions.push({ memeId: meme.id, direction: -1 });
      }
      // else: skip
    }
  }

  // Ensure minimum votes if we have enough memes
  if (decisions.length < AUTONOMOUS.MIN_VOTES_PER_RUN && shuffled.length >= AUTONOMOUS.MIN_VOTES_PER_RUN) {
    for (const meme of shuffled) {
      if (decisions.length >= AUTONOMOUS.MIN_VOTES_PER_RUN) break;
      if (decisions.some((d) => d.memeId === meme.id)) continue;
      decisions.push({ memeId: meme.id, direction: 1 });
    }
  }

  return decisions;
}
