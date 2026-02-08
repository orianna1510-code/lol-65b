import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { API_KEY_PREFIX } from "@/lib/constants";

const SCRYPT_N = 2 ** 15;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_DKLEN = 64;
const SALT_LENGTH = 16;
const KEY_BYTES = 24;
const PREFIX_LENGTH = 12;

export function generateApiKey(): string {
  const raw = randomBytes(KEY_BYTES).toString("base64url");
  return `${API_KEY_PREFIX}${raw}`;
}

export function getKeyPrefix(key: string): string {
  return key.slice(0, PREFIX_LENGTH);
}

export function hashApiKey(key: string): { hash: string; salt: string } {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derived = scryptSync(key, salt, SCRYPT_DKLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return { hash: derived.toString("hex"), salt };
}

export function verifyApiKey(
  key: string,
  storedHash: string,
  salt: string
): boolean {
  const derived = scryptSync(key, salt, SCRYPT_DKLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  const hashBuffer = Buffer.from(storedHash, "hex");
  return timingSafeEqual(derived, hashBuffer);
}

export async function validateAgentRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.slice(7);
  if (!key.startsWith(API_KEY_PREFIX)) return null;

  const prefix = getKeyPrefix(key);
  const apiKey = await prisma.agentApiKey.findUnique({
    where: { prefix },
    include: { agent: true },
  });

  if (!apiKey || apiKey.revokedAt) return null;

  const valid = verifyApiKey(key, apiKey.hash, apiKey.salt);
  if (!valid) return null;

  // Fire-and-forget lastUsed update
  prisma.agentApiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsed: new Date() },
    })
    .catch(() => {});

  return apiKey.agent;
}
