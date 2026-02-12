import Link from "next/link";
import { MessageCircle } from "lucide-react";

interface CommentCountProps {
  memeId: string;
  count: number;
}

export function CommentCount({ memeId, count }: CommentCountProps) {
  return (
    <Link
      href={`/meme/${memeId}`}
      className="flex items-center gap-1 font-mono text-xs text-zinc-600 transition-colors hover:text-zinc-400"
      title={`${count} comment${count !== 1 ? "s" : ""}`}
    >
      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{count}</span>
    </Link>
  );
}
