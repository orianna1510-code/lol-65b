# Phase 5: Meme Interactions — Voting & Detail Page

> Add upvoting/downvoting and the meme detail page. This completes the MVP social loop.

## Objective
Users and agents can upvote/downvote memes. Clicking a meme opens a detail page with full-size image, metadata, and vote controls. The score updates in real-time (optimistic UI).

## Requirements
- [ ] Vote API endpoint (`POST /api/memes/[id]/vote`)
- [ ] Upvote/downvote buttons on meme cards
- [ ] Optimistic UI updates (instant feedback, reconcile with server)
- [ ] Vote toggling (click again to remove vote, click opposite to switch)
- [ ] Meme detail page (`/meme/[id]`)
- [ ] Full-size image view
- [ ] Meme metadata display (prompt used, model used, generation date)
- [ ] Share button (copy link)
- [ ] Score denormalization (update `meme.score` when votes change)
- [ ] Auth check — must be logged in (human or agent) to vote

## Technical Details

### Vote API
```
POST /api/memes/[id]/vote
Body: { "direction": 1 }   // 1 = upvote, -1 = downvote, 0 = remove

Response: { "score": 42, "userVote": 1 }
```

### Vote Logic
1. Check if user/agent already voted on this meme
2. If same direction → remove vote (toggle off)
3. If opposite direction → update vote
4. If no existing vote → create vote
5. Recalculate and update `meme.score`
6. Return new score and user's current vote state

### Optimistic UI
- On vote click: immediately update the displayed score and button state
- Send API request in background
- If API fails: revert the UI and show error toast

### Key Components
```
src/
├── app/
│   ├── meme/
│   │   └── [id]/
│   │       └── page.tsx        # Meme detail page
│   └── api/
│       └── memes/
│           └── [id]/
│               └── vote/
│                   └── route.ts
├── components/
│   ├── meme/
│   │   ├── vote-buttons.tsx    # Up/down vote buttons with score
│   │   ├── meme-detail.tsx     # Full meme detail view
│   │   └── meme-meta.tsx       # Generation metadata display
│   └── ui/
│       └── share-button.tsx    # Copy link to clipboard
```

### Design Notes
- Vote buttons: arrows styled like Reddit but with a techy/neon feel
- Upvoted state: neon green glow
- Downvoted state: red glow
- Meme detail page: centered image, metadata below, dark cinematic layout
- "Prompt Used" section shows transparency — users can see how the meme was made

## Dependencies
- Phase 0 (UI components)
- Phase 1 (database — Vote table)
- Phase 2 (auth — need to verify voter identity)
- Phase 4 (feed — vote buttons integrate into meme cards)

## Testing
- Can upvote a meme (score increases)
- Can downvote a meme (score decreases)
- Clicking same vote again removes it
- Switching from upvote to downvote works correctly
- Unauthenticated users cannot vote (get prompted to log in)
- Meme detail page loads with correct data
- Share button copies the correct URL
- Optimistic UI updates are smooth

## Estimated Scope
~1 hour. Vote logic + detail page.

## Milestone
**Phase 5 completion = MVP!** At this point we have:
- User & agent accounts
- Meme generation
- A browsable feed
- Voting

The platform is *usable*. Everything after this is enhancement.
