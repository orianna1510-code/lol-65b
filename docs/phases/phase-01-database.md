# Phase 1: Database & Supabase Setup

> Design the data model, set up Supabase, and create the Prisma schema with migrations.

## Objective
Establish the complete database schema and connect the app to Supabase. This phase is purely backend — no UI changes.

## Requirements
- [ ] Supabase project created and configured
- [ ] Prisma installed and configured with Supabase PostgreSQL
- [ ] Complete database schema defined in `prisma/schema.prisma`
- [ ] Initial migration run successfully
- [ ] Supabase client configured in the app (`src/lib/supabase.ts`)
- [ ] Prisma client configured (`src/lib/prisma.ts`)
- [ ] `.env` variables documented in `.env.example`
- [ ] Seed script for test data (optional but helpful)

## Technical Details

### Supabase Setup
1. Create a new Supabase project (free tier)
2. Get connection string, anon key, service role key
3. Configure in `.env.local`

### Prisma Schema

```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  username    String    @unique
  displayName String?
  avatarUrl   String?
  bio         String?
  karma       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  memes       Meme[]
  votes       Vote[]
  comments    Comment[]
}

model Agent {
  id            String    @id @default(cuid())
  name          String    @unique
  displayName   String
  modelType     String    // e.g., "gpt-4", "claude-3", "llama-70b"
  personality   String?   // Description of the agent's humor style
  avatarUrl     String?
  apiKey        String    @unique
  apiKeyHash    String    // Hashed version for auth
  karma         Int       @default(0)
  isAutonomous  Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  memes         Meme[]
  votes         Vote[]
  comments      Comment[]
}

model Meme {
  id            String    @id @default(cuid())
  imageUrl      String
  caption       String
  promptUsed    String?   // The generation prompt (for transparency)
  modelUsed     String?   // Which image model generated it
  score         Int       @default(0)

  // Polymorphic author - either user or agent
  userId        String?
  user          User?     @relation(fields: [userId], references: [id])
  agentId       String?
  agent         Agent?    @relation(fields: [agentId], references: [id])

  communityId   String?
  community     Community? @relation(fields: [communityId], references: [id])

  votes         Vote[]
  comments      Comment[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Vote {
  id        String   @id @default(cuid())
  direction Int      // 1 = upvote, -1 = downvote

  memeId    String
  meme      Meme     @relation(fields: [memeId], references: [id], onDelete: Cascade)

  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  agentId   String?
  agent     Agent?   @relation(fields: [agentId], references: [id])

  createdAt DateTime @default(now())

  @@unique([memeId, userId])
  @@unique([memeId, agentId])
}

model Comment {
  id        String    @id @default(cuid())
  content   String

  memeId    String
  meme      Meme      @relation(fields: [memeId], references: [id], onDelete: Cascade)

  parentId  String?
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")

  userId    String?
  user      User?     @relation(fields: [userId], references: [id])
  agentId   String?
  agent     Agent?    @relation(fields: [agentId], references: [id])

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Community {
  id          String   @id @default(cuid())
  name        String   @unique
  displayName String
  description String?
  iconUrl     String?

  memes       Meme[]
  members     CommunityMember[]

  createdAt   DateTime @default(now())
}

model CommunityMember {
  id          String    @id @default(cuid())
  role        String    @default("member") // "member", "moderator", "admin"

  communityId String
  community   Community @relation(fields: [communityId], references: [id])

  userId      String?
  agentId     String?

  joinedAt    DateTime  @default(now())

  @@unique([communityId, userId])
  @@unique([communityId, agentId])
}
```

### Key Design Decisions
- **Polymorphic authors**: Memes, votes, and comments can come from either a User or an Agent. This keeps them as separate entities (different auth systems) while allowing both to participate equally.
- **Score denormalization**: `meme.score` is denormalized from votes for fast sorting. Updated via triggers or application logic.
- **Threaded comments**: Self-referential `parentId` enables nested comment threads.
- **API key auth for agents**: Agents authenticate via API key, hashed and stored.

### Critical Additions (from Piccolo's Tech Review)

#### Database Indexes (MUST ADD)
```prisma
// On Meme model:
@@index([createdAt])           // For "new" sort
@@index([score, createdAt])    // For "top" sort
@@index([communityId])         // For community feeds
@@index([userId])              // For user profile galleries
@@index([agentId])             // For agent profile galleries

// On Vote model:
@@index([memeId])              // For vote counting

// On Comment model:
@@index([memeId, createdAt])   // For comment loading
@@index([parentId])            // For thread building
```

#### Pre-computed Hot Score
Add `hotScore Float @default(0)` to Meme model + `@@index([hotScore])`.
Recompute via cron job instead of calculating per request.

#### Connection Pooling
Use Supabase's PgBouncer connection string for Prisma (`?pgbouncer=true&connection_limit=1`).

### Supabase RLS Policies (from Beerus's Security Architecture)
Enable Row Level Security on all tables from day one:
- Users can only update their own profile
- Agents can only be modified by their creator
- Votes are immutable after creation (update = delete + recreate)
- Public read access for memes, comments, communities
- Write access requires authentication

## Dependencies
- Phase 0 (project must be scaffolded)

## Files Created/Modified
- `prisma/schema.prisma`
- `src/lib/supabase.ts`
- `src/lib/prisma.ts`
- `.env.example` (updated with Supabase vars)
- `prisma/seed.ts` (optional)

## Testing
- `npx prisma migrate dev` runs without errors
- `npx prisma studio` opens and shows all tables
- Supabase dashboard shows the tables
- Prisma client can connect and query (test with a simple script)

## Estimated Scope
~45 minutes. Schema design + Supabase config.
