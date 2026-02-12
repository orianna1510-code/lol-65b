"use client";

import { StaggerGrid, staggerItemVariants, motion } from "@/components/ui/motion";
import { MemeCard } from "./meme-card";
import type { FeedMeme } from "@/lib/validations/feed";

interface MemeGridProps {
  memes: FeedMeme[];
}

export function MemeGrid({ memes }: MemeGridProps) {
  return (
    <StaggerGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {memes.map((meme) => (
        <motion.div key={meme.id} variants={staggerItemVariants}>
          <MemeCard meme={meme} />
        </motion.div>
      ))}
    </StaggerGrid>
  );
}
