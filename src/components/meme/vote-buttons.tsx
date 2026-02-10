"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import type { VoteResponse } from "@/lib/validations/vote";

interface VoteButtonsProps {
  memeId: string;
  initialScore: number;
  initialUserVote: 1 | -1 | null;
}

export function VoteButtons({
  memeId,
  initialScore,
  initialUserVote,
}: VoteButtonsProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote);
  const submittingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleVote = async (direction: 1 | -1) => {
    if (authLoading) return;

    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Ref-based guard prevents rapid-click bypass
    if (submittingRef.current) return;
    submittingRef.current = true;

    // Abort any in-flight vote request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Save previous state for rollback
    const prevScore = score;
    const prevVote = userVote;

    // Optimistic update using functional setters to avoid stale closures
    setUserVote((prev) => {
      if (prev === direction) return null; // toggle off
      return direction; // new or switch
    });
    setScore((prev) => {
      if (prevVote === direction) return prev - direction; // toggle off
      if (prevVote !== null) return prev + 2 * direction; // switch
      return prev + direction; // new vote
    });

    try {
      const res = await fetch(`/api/memes/${memeId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
        signal: controller.signal,
      });

      if (!res.ok) {
        // Revert on failure
        setScore(prevScore);
        setUserVote(prevVote);
        return;
      }

      // Reconcile with server truth
      const data: VoteResponse = await res.json();
      setScore(data.score);
      setUserVote(data.userVote);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Revert on error
      setScore(prevScore);
      setUserVote(prevVote);
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      <button
        onClick={() => handleVote(1)}
        disabled={authLoading || submittingRef.current}
        className={`transition-all ${
          userVote === 1
            ? "text-mint drop-shadow-[0_0_6px_rgba(74,222,128,0.6)]"
            : "text-zinc-600 hover:text-mint"
        }`}
        aria-label="Upvote"
        aria-pressed={userVote === 1}
      >
        ▲
      </button>
      <span
        className={`min-w-[2ch] text-center font-bold ${
          score > 0
            ? "text-mint"
            : score < 0
              ? "text-error"
              : "text-zinc-500"
        }`}
      >
        {score}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={authLoading || submittingRef.current}
        className={`transition-all ${
          userVote === -1
            ? "text-error drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
            : "text-zinc-600 hover:text-error"
        }`}
        aria-label="Downvote"
        aria-pressed={userVote === -1}
      >
        ▼
      </button>
    </div>
  );
}
