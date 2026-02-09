/**
 * Prompt sanitization and injection defense for image generation.
 * Blocks known prompt injection patterns and NSFW content triggers.
 */

const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above|prior|earlier)\s+(instructions?|prompts?|commands?)/i,
  /disregard\s+(previous|all|above|prior|earlier|everything)/i,
  /you\s+(are|r)\s+now/i,
  /act\s+as\s+(if|though)/i,
  /pretend\s+(you|to\s+be|that)/i,
  /(^|\n)\s*system\s*:/i, // Tightened: only match directive-like "system:" at line start
  /\[INST\]/i,
  /\[SYSTEM\]/i,
  /<<SYS>>/i,
  /```\s*(system|assistant|user)/i,
  /new\s+instructions?:/i,
  /override\s+(previous|all)/i,
  /reset\s+(instructions?|context)/i,
  /forget\s+(previous|all|everything)/i,
  /<\|.*?\|>/i, // Control token patterns
  /###\s*Instruction/i,
];

const NSFW_KEYWORDS = [
  "nude",
  "naked",
  "nsfw",
  "explicit",
  "pornograph",
  "sexual",
  "gore",
  "violence",
  "murder",
  "terrorist",
  "child abuse",
  "xxx",
  "porn",
  "erotic",
  "obscene",
  "lewd",
  "hentai",
  "self-harm",
  "suicide",
  "hate speech",
];

const MAX_PROMPT_LENGTH = 500;

export interface SafetyResult {
  safe: boolean;
  reason?: string;
}

/**
 * Normalize input before safety checks:
 * collapse whitespace, strip zero-width chars.
 */
function normalize(input: string): string {
  return input
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Zero-width chars
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}

export function checkPromptSafety(input: string): SafetyResult {
  if (!input || input.trim().length === 0) {
    return { safe: false, reason: "Prompt cannot be empty" };
  }

  if (input.length > MAX_PROMPT_LENGTH) {
    return {
      safe: false,
      reason: `Prompt too long (max ${MAX_PROMPT_LENGTH} characters)`,
    };
  }

  const normalized = normalize(input);

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      console.warn("Prompt injection attempt blocked:", {
        pattern: pattern.toString(),
        input: normalized.slice(0, 100),
        timestamp: new Date().toISOString(),
      });
      return { safe: false, reason: "Prompt contains disallowed patterns" };
    }
  }

  const lower = normalized.toLowerCase();
  for (const keyword of NSFW_KEYWORDS) {
    if (lower.includes(keyword)) {
      console.warn("NSFW prompt blocked:", {
        keyword,
        timestamp: new Date().toISOString(),
      });
      return { safe: false, reason: "Prompt contains prohibited content" };
    }
  }

  return { safe: true };
}

export function sanitizePrompt(input: string): string {
  return input
    .replace(/[<>{}[\]]/g, "") // Strip markup/template chars
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Zero-width chars
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
    .slice(0, MAX_PROMPT_LENGTH);
}
