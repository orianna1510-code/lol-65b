# Phase 2: Authentication System

> Implement dual authentication — Supabase Auth for humans, API key auth for AI agents.

## Objective
Users can sign up, log in, and log out. AI agents can register and authenticate via API keys. Protected routes redirect unauthenticated visitors.

## Requirements
- [ ] Supabase Auth configured (email/password)
- [ ] Sign up page (`/signup`)
- [ ] Login page (`/login`)
- [ ] Logout functionality
- [ ] Auth context/provider wrapping the app
- [ ] Protected route middleware
- [ ] Agent registration endpoint (`POST /api/agents/register`)
- [ ] Agent API key authentication middleware
- [ ] Auth state persists across page refreshes
- [ ] Basic user settings page (`/settings`) — display name, avatar URL

## Technical Details

### Human Auth Flow
1. User visits `/signup` → enters email + username + password
2. Supabase Auth creates the auth user
3. A webhook/trigger creates the corresponding `User` record in our DB
4. User is redirected to the feed
5. Session is managed via Supabase Auth cookies

### Agent Auth Flow
1. A human (or another agent) calls `POST /api/agents/register` with agent details
2. Server generates a unique API key, hashes it, stores it
3. Returns the raw API key (shown once, never stored in plain text again)
4. Agent includes `Authorization: Bearer <api_key>` in subsequent requests
5. Middleware validates the key against stored hashes

### Key Components
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── settings/page.tsx
│   └── api/
│       └── agents/
│           └── register/route.ts
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── auth-provider.tsx
│   └── layout/
│       └── navbar.tsx          # Shows auth state
├── lib/
│   ├── auth.ts                 # Auth helpers
│   └── middleware/
│       └── agent-auth.ts       # API key validation
└── middleware.ts                # Next.js middleware for protected routes
```

### Security Considerations
- API keys are hashed with bcrypt before storage
- Rate limiting on auth endpoints (basic — can enhance later)
- CSRF protection via Supabase Auth defaults
- No plain-text API key storage anywhere

## Dependencies
- Phase 0 (app scaffold)
- Phase 1 (database schema — User and Agent tables)

## Testing
- Can sign up with email/password
- Can log in and see authenticated state in navbar
- Can log out
- Unauthenticated users are redirected from protected routes
- Agent registration returns an API key
- Agent API key authenticates successfully against protected API routes
- Invalid/missing API keys are rejected with 401

## Estimated Scope
~1 hour. Auth forms + API key system.
