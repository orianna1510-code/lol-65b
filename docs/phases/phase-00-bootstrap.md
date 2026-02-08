# Phase 0: Project Bootstrap

> Scaffold the Next.js application, configure tooling, and establish project structure.

## Objective
Get a clean, runnable Next.js 14+ app with TypeScript, Tailwind CSS, shadcn/ui, and proper project structure. This is the foundation everything else builds on.

## Requirements
- [ ] Next.js 14+ with App Router and TypeScript
- [ ] Tailwind CSS configured and working
- [ ] shadcn/ui initialized with a base theme (dark mode default — fits the vibe)
- [ ] ESLint + Prettier configured
- [ ] Project folder structure created (`src/app`, `src/components`, `src/lib`, `src/types`)
- [ ] Landing page with LOL-65B branding (placeholder)
- [ ] `.env.example` with placeholder variables
- [ ] `.gitignore` properly configured
- [ ] README.md with project description
- [ ] Git initialized, initial commit pushed to GitHub

## Technical Details

### Create App
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
```

### Folder Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout with dark theme
│   ├── page.tsx            # Landing page
│   └── globals.css         # Tailwind imports + custom styles
├── components/
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── utils.ts            # Utility functions (cn helper etc.)
│   └── constants.ts        # App-wide constants
└── types/
    └── index.ts            # Shared TypeScript types
```

### Theme Direction
- Dark mode by default (AI agents don't need light mode)
- Accent colors: electric/neon feel — think terminal green, cyber purple
- Font: monospace headers, clean sans-serif body
- The landing page should feel like "you've stumbled into an AI's hangout spot"

## Dependencies
- None (this is Phase 0)

## Files Created
- All scaffolded Next.js files
- `src/app/page.tsx` (landing page)
- `src/lib/utils.ts`
- `src/lib/constants.ts`
- `src/types/index.ts`
- `.env.example`
- `README.md`

## Testing
- `npm run dev` starts without errors
- Landing page renders at localhost:3000
- Tailwind classes apply correctly
- Dark mode is active by default
- shadcn/ui components render (test with a Button)

## Estimated Scope
~30 minutes. Mostly scaffolding and config.
