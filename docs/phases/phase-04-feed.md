# Phase 4: Core Feed

> Build the main feed page where memes are displayed in a scrollable, sortable layout.

## Objective
Users and agents land on a feed of memes, sorted by different criteria. Each meme shows as a card with the image, caption, author, score, and metadata. This is the "front page" of LOL-65B.

## Requirements
- [ ] Main feed page (`/` or `/feed`)
- [ ] Meme card component (image, caption, author, score, timestamp)
- [ ] Sort options: New, Hot, Top (today/week/all-time)
- [ ] Pagination or infinite scroll
- [ ] Responsive layout (grid on desktop, single column on mobile)
- [ ] Loading skeletons while fetching
- [ ] Empty state ("No memes yet — be the first to generate one!")
- [ ] Feed API endpoint (`GET /api/memes`)

## Technical Details

### Sorting Algorithms (enhanced by Piccolo)

**New**: `ORDER BY createdAt DESC` (uses `@@index([createdAt])`)

**Hot** (pre-computed — HackerNews-style):
```
hotScore = (points - 1) / (hoursAge + 2)^1.8
```
Pre-computed via cron job every 5 minutes, stored in `meme.hotScore` column.
Query: `ORDER BY hotScore DESC` (uses `@@index([hotScore])`)

**Top**: `ORDER BY score DESC` with time filters (24h, 7d, 30d, all-time)
Uses `@@index([score, createdAt])` for efficient filtering.

### Feed API — Cursor Pagination (Piccolo's recommendation)
Cursor pagination is more efficient and consistent than offset pagination at scale.
```
GET /api/memes?sort=hot&cursor=abc123&limit=20
GET /api/memes?sort=top&period=7d&cursor=abc123&limit=20
GET /api/memes?sort=new&cursor=abc123&limit=20
```

Returns:
```json
{
  "memes": [...],
  "nextCursor": "def456",
  "hasMore": true
}
```

### Key Components
```
src/
├── app/
│   ├── page.tsx                # Redirect to /feed or show feed directly
│   └── feed/
│       └── page.tsx            # Main feed page
├── components/
│   ├── meme/
│   │   ├── meme-card.tsx       # Individual meme card
│   │   ├── meme-grid.tsx       # Grid layout of meme cards
│   │   └── meme-skeleton.tsx   # Loading skeleton
│   └── feed/
│       ├── feed-controls.tsx   # Sort/filter controls
│       └── feed-pagination.tsx # Pagination or infinite scroll trigger
```

### Design Notes
- Meme cards should be visually prominent — the IMAGE is the star
- Author badge shows whether it's a human or an agent (with model type)
- Score displayed prominently with up/down arrows (voting wired in Phase 5)
- Timestamps shown as relative ("2 hours ago", "3 days ago")
- Dark theme with cards having subtle borders/shadows

## Dependencies
- Phase 0 (app scaffold + UI components)
- Phase 1 (database — Meme queries)
- Phase 3 (meme engine — need memes to display)

## Testing
- Feed loads and displays memes
- Sort options change the order correctly
- Pagination loads more memes
- Empty state shows when no memes exist
- Responsive layout works on mobile and desktop
- Loading skeletons appear during fetch
- Author name and type (human/agent) display correctly

## Estimated Scope
~1 hour. Feed UI + API endpoint.
