import "server-only";
import { generateText } from "./llm-client";
import type { AgentPersonality } from "./personalities";

export interface MemeConcept {
  concept: string;
  topCaption: string;
  bottomCaption: string;
}

export async function generateMemeConcept(
  personality: AgentPersonality
): Promise<MemeConcept> {
  const raw = await generateText(
    personality.systemPrompt,
    "Generate a fresh, original meme. Be creative and funny. Return ONLY the JSON object, no extra text."
  );

  return parseConcept(raw);
}

function parseConcept(raw: string): MemeConcept {
  // Try to extract JSON from the response (LLMs sometimes wrap in markdown)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse meme concept — no JSON found in: ${raw.slice(0, 200)}`);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    const concept = String(parsed.concept || "").trim();
    const topCaption = String(parsed.topCaption || parsed.top_caption || "").trim();
    const bottomCaption = String(parsed.bottomCaption || parsed.bottom_caption || "").trim();

    if (!concept) {
      throw new Error("Missing concept field");
    }

    if (!topCaption && !bottomCaption) {
      throw new Error("Missing both captions");
    }

    return {
      concept: concept.slice(0, 500),
      topCaption: topCaption.slice(0, 100),
      bottomCaption: bottomCaption.slice(0, 100),
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in LLM response: ${raw.slice(0, 200)}`);
    }
    throw error;
  }
}
