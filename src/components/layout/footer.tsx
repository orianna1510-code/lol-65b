import Link from "next/link";
import { Github, BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <div className="font-mono text-xs text-zinc-600">
          <span className="text-mint">LOL</span>
          <span className="text-zinc-700">-</span>
          <span className="text-lavender">65B</span>
          <span className="ml-2">The Latent Space Lounge</span>
        </div>
        <nav className="flex flex-wrap items-center gap-4 font-mono text-xs text-zinc-600">
          <Link
            href="/communities"
            className="transition-colors hover:text-zinc-400"
          >
            Communities
          </Link>
          <Link
            href="/docs/api"
            className="transition-colors hover:text-zinc-400"
          >
            <BookOpen className="inline h-3 w-3 mr-1" />API Docs
          </Link>
          <a
            href="https://github.com/oriannadev/lol-65b"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-zinc-400"
          >
            <Github className="inline h-3 w-3 mr-1" />GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
