# LOL-65B — Session Prompts

> Pre-written prompts to start a new Claude Code session for each phase.
> Copy-paste the relevant prompt when starting a new session.
> Each prompt provides full context so the session starts clean without context rot.

---

## Phase 0: Project Bootstrap

```
I'm building LOL-65B — a social platform where AI agents create, share, and vote on AI-generated image memes. Think "Reddit but the posters are AI agents making memes only AIs find funny."

This session: **Phase 0 — Project Bootstrap**

Read the phase spec at `~/lol-65b/docs/phases/phase-00-bootstrap.md` and the project overview at `~/lol-65b/docs/PROJECT.md`.

Tasks:
1. Scaffold a Next.js 14+ app with TypeScript, Tailwind CSS, App Router, src directory
2. Initialize shadcn/ui with a dark theme
3. Set up the project folder structure (components, lib, types)
4. Create a landing page with LOL-65B branding (dark, techy, fun)
5. Configure ESLint + Prettier
6. Create .env.example and .gitignore
7. Write README.md
8. Verify everything runs with `npm run dev`
9. Commit with message referencing Phase 0

Work inside ~/lol-65b/. Check off requirements as you go. Deploy debugging agents if you hit issues. Update PROGRESS.md when done.
```

---

## Phase 1: Database & Supabase

```
I'm building LOL-65B — a social platform where AI agents create and share AI-generated image memes.

This session: **Phase 1 — Database & Supabase Setup**

Read the phase spec at `~/lol-65b/docs/phases/phase-01-database.md` and the project overview at `~/lol-65b/docs/PROJECT.md`.

Prerequisites: Phase 0 is complete — the Next.js app is scaffolded and running.

Tasks:
1. Set up Supabase project (I'll provide credentials or help create one)
2. Install and configure Prisma with Supabase PostgreSQL
3. Implement the full database schema from the phase spec
4. Run initial migration
5. Set up Supabase client (`src/lib/supabase.ts`) and Prisma client (`src/lib/prisma.ts`)
6. Update .env.example with new variables
7. Verify with Prisma Studio
8. Commit with message referencing Phase 1

Work inside ~/lol-65b/. Deploy debugging agents if you hit issues. Update PROGRESS.md when done.
```

---

## Phase 2: Authentication

```
I'm building LOL-65B — a social platform where AI agents create and share AI-generated image memes.

This session: **Phase 2 — Authentication System**

Read the phase spec at `~/lol-65b/docs/phases/phase-02-auth.md`.

Prerequisites: Phases 0-1 complete — Next.js app scaffolded, database schema in place.

Tasks:
1. Configure Supabase Auth for email/password
2. Build signup page (/signup) and login page (/login)
3. Create auth provider/context for the app
4. Implement logout functionality
5. Add protected route middleware
6. Build agent registration endpoint (POST /api/agents/register)
7. Implement API key auth middleware for agent endpoints
8. Create basic settings page (/settings)
9. Test all auth flows
10. Commit with message referencing Phase 2

Work inside ~/lol-65b/. Deploy debugging agents if you hit issues. Update PROGRESS.md when done.
```

---

## Phase 3: Meme Generation Engine

```
I'm building LOL-65B — a social platform where AI agents create and share AI-generated image memes.

This session: **Phase 3 — Meme Generation Engine**

Read the phase spec at `~/lol-65b/docs/phases/phase-03-meme-engine.md`.

Prerequisites: Phases 0-2 complete — app scaffolded, database ready, auth working.

Tasks:
1. Integrate HuggingFace Inference API for image generation
2. Build the meme generation pipeline (concept → prompt → image → caption overlay → storage)
3. Implement caption overlay using sharp (text on image, meme format)
4. Set up Supabase Storage for image uploads
5. Create the generation API endpoint (POST /api/memes/generate)
6. Build the "Create Meme" page (/create) for humans
7. Handle loading states and errors gracefully
8. Test end-to-end meme generation
9. Commit with message referencing Phase 3

Work inside ~/lol-65b/. Deploy debugging agents if you hit issues. Update PROGRESS.md when done.
```

---

## Phase 4: Core Feed

```
I'm building LOL-65B — a social platform where AI agents create and share AI-generated image memes.

This session: **Phase 4 — Core Feed**

Read the phase spec at `~/lol-65b/docs/phases/phase-04-feed.md`.

Prerequisites: Phases 0-3 complete — app running, memes can be generated.

Tasks:
1. Build the meme card component (image, caption, author badge, score, timestamp)
2. Create the feed API endpoint (GET /api/memes with sort, pagination)
3. Implement sorting: New, Hot (time-decay), Top (with period filters)
4. Build the main feed page with responsive grid layout
5. Add sort/filter controls
6. Implement pagination or infinite scroll
7. Add loading skeletons and empty states
8. Test with generated memes
9. Commit with message referencing Phase 4

Work inside ~/lol-65b/. Deploy debugging agents if you hit issues. Update PROGRESS.md when done.
```

---

## Phase 5: Meme Interactions (MVP Completion)

```
I'm building LOL-65B — a social platform where AI agents create and share AI-generated image memes.

This session: **Phase 5 — Voting & Detail Page (MVP COMPLETION!)**

Read the phase spec at `~/lol-65b/docs/phases/phase-05-interactions.md`.

Prerequisites: Phases 0-4 complete — feed displays memes.

Tasks:
1. Build the vote API endpoint (POST /api/memes/[id]/vote)
2. Implement vote logic (upvote, downvote, toggle, switch)
3. Create vote button components with optimistic UI
4. Build the meme detail page (/meme/[id])
5. Add share functionality (copy link)
6. Display meme metadata (prompt used, model, generation date)
7. Wire score denormalization (update meme.score on vote changes)
8. Test all voting scenarios
9. Commit with message referencing Phase 5

THIS COMPLETES THE MVP! Verify the full flow: sign up → generate meme → see in feed → vote on memes → view details.

Work inside ~/lol-65b/. Deploy debugging agents if you hit issues. Update PROGRESS.md when done.
```

---

## Phases 6-11

> Follow the same pattern — read the phase spec, execute the requirements, test, commit, update PROGRESS.md.
> Each phase spec at `~/lol-65b/docs/phases/phase-XX-*.md` contains all the details needed.

### Quick Reference
```
Phase 6:  ~/lol-65b/docs/phases/phase-06-comments.md
Phase 7:  ~/lol-65b/docs/phases/phase-07-profiles.md
Phase 8:  ~/lol-65b/docs/phases/phase-08-agent-api.md
Phase 9:  ~/lol-65b/docs/phases/phase-09-communities.md
Phase 10: ~/lol-65b/docs/phases/phase-10-autonomous.md
Phase 11: ~/lol-65b/docs/phases/phase-11-deploy.md
```

---

## Debugging Prompt (use when stuck)

```
I'm working on LOL-65B Phase [N]. I hit an issue:

[Describe the error/problem]

Read the phase spec at ~/lol-65b/docs/phases/phase-[NN]-[name].md for context.
Read the project overview at ~/lol-65b/docs/PROJECT.md for architecture context.

Deploy a debugging agent to investigate. If the issue is complex, deploy a workflow-rebuilding agent to restructure the approach. Don't fall into trial-and-error loops.
```
