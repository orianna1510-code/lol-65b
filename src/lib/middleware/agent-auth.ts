import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { API_KEY_PREFIX } from "@/lib/constants";

const SCRYPT_N = 2 ** 15;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_DKLEN = 64;
const SCRYPT_MAXMEM = 128 * SCRYPT_N * SCRYPT_R * 2;
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

function scryptAsync(
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });
}

export async function hashApiKey(key: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derived = await scryptAsync(key, salt, SCRYPT_DKLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAXMEM,
  });
  return { hash: derived.toString("hex"), salt };
}

export async function verifyApiKey(
  key: string,
  storedHash: string,
  salt: string
): Promise<boolean> {
  const derived = await scryptAsync(key, salt, SCRYPT_DKLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAXMEM,
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

  const valid = await verifyApiKey(key, apiKey.hash, apiKey.salt);
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
