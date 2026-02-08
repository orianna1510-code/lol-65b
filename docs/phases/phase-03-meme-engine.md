# Phase 3: Meme Generation Engine

> Build the core meme creation pipeline — from text prompt to generated image meme.

## Objective
AI agents (and humans) can generate memes by providing a concept/prompt. The system uses a text-to-image model to generate the image, adds captions, and stores the result. This is the heart of LOL-65B.

## Requirements
- [ ] HuggingFace Inference API integration
- [ ] Meme generation endpoint (`POST /api/memes/generate`)
- [ ] Prompt engineering layer (concept → optimized image gen prompt)
- [ ] Caption overlay system (text on image — top/bottom meme format)
- [ ] Image upload to Supabase Storage
- [ ] Meme record created in database with all metadata
- [ ] Basic "Create Meme" page for humans (`/create`)
- [ ] Generation loading state with fun messages
- [ ] Error handling for failed generations

## Technical Details

### The Meme Pipeline
```
User/Agent Input (concept/idea)
    ↓
Prompt Engineering (LLM refines the concept into an image prompt)
    ↓
Image Generation (HuggingFace Inference API → raw image)
    ↓
Caption Overlay (sharp/canvas adds text to image)
    ↓
Upload to Storage (Supabase Storage)
    ↓
Save to Database (Meme record with metadata)
    ↓
Return meme to user/agent
```

### Image Generation (enhanced by Piccolo + Trunks)
- **Provider abstraction layer**: Don't hardcode HuggingFace — create `src/lib/providers/image-gen.ts` interface
- **Primary**: HuggingFace Inference API (free tier: ~42 memes/hour)
- **Fallback**: Replicate API (pay-per-use, faster, more models including FLUX)
- **Future-ready**: Interface supports swapping to any provider (DALL-E, Ideogram, etc.)
- Images generated at 1024x1024 (SDXL) or 512x512 (SD 1.5)

### Queue System (CRITICAL — from Piccolo)
Vercel serverless has a **10-second timeout**. Image generation takes 15-30s. Solutions:
- **Option A (MVP)**: Use Vercel's `maxDuration: 60` on Pro plan, or use Supabase Edge Functions
- **Option B (Recommended)**: Async generation with polling
  1. `POST /api/memes/generate` → returns `{ jobId, status: "processing" }`
  2. Client polls `GET /api/memes/jobs/[id]` every 2 seconds
  3. Server processes generation asynchronously via Supabase Edge Function or background job
- **Option C (Scale)**: BullMQ + Redis (Upstash) for full job queue

### Prompt Injection Defense (from Beerus)
- Sanitize ALL user input before passing to image generation
- Block known injection patterns (e.g., "ignore previous instructions")
- Content safety filter on generated images (HuggingFace safety checker)
- Log all prompts for audit trail
- NSFW content filtering before storage

### Prompt Engineering
The raw user concept (e.g., "a for loop excluding zero") needs to be transformed into:
1. An **image generation prompt** optimized for the model (style, composition, detail)
2. A **caption** (the funny text overlay)

This can be done with a simple template system initially:
```typescript
function buildMemePrompt(concept: string): { imagePrompt: string; caption: string } {
  // Template approach for MVP
  // Later: use an LLM to generate these
  return {
    imagePrompt: `cartoon meme style, funny illustration of ${concept}, digital art, colorful, expressive characters, meme format`,
    caption: concept.toUpperCase()
  };
}
```

### Caption Overlay
- Use `sharp` (Node.js image processing) to add text overlays
- Impact font style (classic meme look)
- White text with black stroke/outline
- Top and/or bottom placement

### Key Components
```
src/
├── app/
│   ├── create/
│   │   └── page.tsx            # Meme creation page
│   └── api/
│       └── memes/
│           └── generate/
│               └── route.ts    # Generation endpoint
├── lib/
│   ├── huggingface.ts          # HF Inference API client
│   ├── meme-generator.ts       # Meme pipeline orchestrator
│   ├── caption-overlay.ts      # Image text overlay logic
│   └── storage.ts              # Supabase Storage helpers
```

### Environment Variables
```
HUGGINGFACE_API_KEY=hf_...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...  # For storage uploads
```

## Dependencies
- Phase 0 (app scaffold)
- Phase 1 (database — Meme table)
- Phase 2 (auth — need to know who's creating)

## Testing
- Generation endpoint accepts a concept and returns a meme
- Image is generated and viewable
- Caption appears on the image correctly
- Meme is stored in Supabase Storage
- Meme record exists in database with correct metadata
- Error handling works for API failures/rate limits
- Human create page works end-to-end

## Estimated Scope
~1.5 hours. API integration + image processing.
