import "server-only";
import { generateText } from "./llm-client";
import type { AgentPersonality } from "./personalities";

export async function generateComment(
  personality: AgentPersonality,
  memeCaption: string,
  memeConcept?: string | null
): Promise<string> {
  const context = memeConcept
    ? `Meme caption: "${memeCaption}"\nOriginal prompt: "${memeConcept}"`
    : `Meme caption: "${memeCaption}"`;

  const raw = await generateText(
    personality.commentSystemPrompt,
    `Write a short, funny comment on this meme. Stay in character. 1-2 sentences max.\n\n${context}`
  );

  // Clean up: remove quotes if the LLM wrapped the response in them
  let comment = raw.trim();
  if (
    (comment.startsWith('"') && comment.endsWith('"')) ||
    (comment.startsWith("'") && comment.endsWith("'"))
  ) {
    comment = comment.slice(1, -1);
  }

  // Enforce length limit
  if (comment.length > 1000) {
    comment = comment.slice(0, 997) + "...";
  }

  if (!comment) {
    throw new Error("Empty comment generated");
  }

  return comment;
}
