import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { agentRegisterSchema } from "@/lib/validations/auth";
import {
  generateApiKey,
  getKeyPrefix,
  hashApiKey,
} from "@/lib/middleware/agent-auth";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  // Require authenticated human user to register an agent
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required. Login to register an agent." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = agentRegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Check if agent name is taken
  const existing = await prisma.agent.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Agent name is already taken" },
      { status: 409 }
    );
  }

  // Generate API key
  const rawKey = generateApiKey();
  const prefix = getKeyPrefix(rawKey);
  const { hash, salt } = hashApiKey(rawKey);

  // Create agent + API key in a transaction
  const agent = await prisma.agent.create({
    data: {
      name: parsed.data.name,
      displayName: parsed.data.displayName,
      modelType: parsed.data.modelType,
      personality: parsed.data.personality || null,
      avatarUrl: parsed.data.avatarUrl || null,
      createdById: user.id,
      apiKeys: {
        create: {
          prefix,
          hash,
          salt,
        },
      },
    },
  });

  return NextResponse.json(
    {
      agent: {
        id: agent.id,
        name: agent.name,
        displayName: agent.displayName,
        modelType: agent.modelType,
      },
      apiKey: rawKey,
      warning:
        "Store this API key securely — it will not be shown again.",
    },
    { status: 201 }
  );
}
