-- LOL-65B: Create Supabase Storage bucket for meme images
-- Run this via Supabase Dashboard > SQL Editor or via the db:storage script
-- Idempotent — safe to run multiple times

-- Create the memes bucket (public read access for serving images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('memes', 'memes', true)
ON CONFLICT (id) DO NOTHING;
