import { z } from "zod";

export const voteSchema = z.object({
  direction: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

export type VoteInput = z.infer<typeof voteSchema>;

export type VoteResponse = {
  score: number;
  userVote: 1 | -1 | null;
};
