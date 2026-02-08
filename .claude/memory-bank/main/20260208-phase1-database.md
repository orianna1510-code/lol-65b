# Phase 1: Database & Supabase — Session Log
**Date**: 2026-02-08
**Branch**: main
**Status**: Code-complete, NOT YET COMMITTED

## What Was Built
- **Prisma 7 schema** (`prisma/schema.prisma`) — 8 models: User, Agent, AgentApiKey, Meme, Vote, Comment, Community, CommunityMember
- **Prisma config** (`prisma.config.ts`) — Prisma 7 style with `DIRECT_URL` fallback for migrations
- **PG adapter** (`src/lib/prisma.ts`) — `@prisma/adapter-pg` with serverless pool limits (max: 3)
- **Supabase clients** — Split into `supabase.ts` (browser, anon key) and `supabase-server.ts` (server-only, service role key with `server-only` import guard)
- **Seed script** (`prisma/seed.ts`) — 2 users, 2 agents, 2 communities, 2 memes, votes, threaded comments. Uses `tsx` runner (not ts-node) for ESM compat
- **CHECK constraints** (`prisma/check_constraints.sql`) — Idempotent XOR enforcement on author fields + vote direction
- **DB scripts** in package.json — `db:generate`, `db:migrate`, `db:push`, `db:seed`, `db:studio`, `postinstall`

## Dependencies Added
**Runtime**: @prisma/client, @prisma/adapter-pg, @supabase/supabase-js, pg, dotenv, server-only
**Dev**: prisma, tsx, @types/pg

## Codex Review Fixes (10+ issues resolved)
1. Explicit `onDelete` on every relation (Restrict on meme authors, Cascade on votes/comments/memberships, SetNull on comment parents)
2. Removed redundant `@@index([prefix])` on AgentApiKey
3. Added missing FK indexes on Vote/Comment/CommunityMember userId/agentId
4. Switched seed runner from ts-node (CJS) to tsx (ESM-compatible)
5. Made CHECK constraints idempotent (IF NOT EXISTS)
6. Made seed script idempotent (skipDuplicates)
7. Split Supabase client into browser/server modules
8. Added server-only import guard
9. Pool max: 3 + idleTimeoutMillis for serverless
10. Fixed .env docs (use .env not .env.local for Prisma CLI)
11. Fixed DIRECT_URL format (db.<ref>.supabase.co:5432)

## Prisma 7 Gotchas Learned
- Generator is `prisma-client` (not `prisma-client-js`)
- Output goes to `src/generated/prisma/` with `client.ts` as main entry (no index.ts)
- Import from `@/generated/prisma/client` (not `@/generated/prisma`)
- PrismaClient REQUIRES either `adapter` or `accelerateUrl` — no raw URL mode
- Generated code is ESM (`import.meta.url`) — ts-node CJS mode won't work
- Must exclude seed.ts from tsconfig (Next.js picks it up)

## Next Steps
1. **Commit Phase 1** — all code is verified (build + lint pass)
2. **Create Supabase project** (free tier) — get connection strings + keys
3. **Fill in .env** — DATABASE_URL (pooled), DIRECT_URL (direct), Supabase keys
4. **Run migrations** — `npx prisma migrate dev --name init`
5. **Apply CHECK constraints** — `psql $DIRECT_URL -f prisma/check_constraints.sql`
6. **Seed** — `npx prisma db seed`
7. **Verify** — `npx prisma studio`
