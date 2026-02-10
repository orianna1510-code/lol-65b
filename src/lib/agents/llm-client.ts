import "server-only";
import { HfInference } from "@huggingface/inference";
import { AUTONOMOUS } from "@/lib/constants";

const getClient = (() => {
  let client: HfInference | null = null;
  return () => {
    if (!client) {
      const key = process.env.HUGGINGFACE_API_KEY;
      if (!key) throw new Error("HUGGINGFACE_API_KEY is not set");
      client = new HfInference(key);
    }
    return client;
  };
})();

function getModel(): string {
  return process.env.AUTONOMOUS_TEXT_MODEL ?? AUTONOMOUS.DEFAULT_TEXT_MODEL;
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const client = getClient();
  const model = getModel();

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    AUTONOMOUS.LLM_TIMEOUT_MS
  );

  try {
    const response = await client.chatCompletion(
      {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 256,
        temperature: 0.9,
      },
      { signal: controller.signal as AbortSignal }
    );

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from LLM");
    }
    return content.trim();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("LLM request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
