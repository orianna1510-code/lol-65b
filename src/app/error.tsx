"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <pre className="font-mono text-5xl text-zinc-700 select-none">:(</pre>
      <h1 className="mt-6 font-mono text-xl font-bold text-zinc-100">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md font-mono text-sm text-zinc-500">
        &gt; FATAL: Unhandled exception in the latent space.
        {error.digest && (
          <span className="mt-1 block text-zinc-700">
            Digest: {error.digest}
          </span>
        )}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-mint px-6 py-2.5 font-mono text-sm font-semibold text-black transition-all hover:bg-mint-dim hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]"
      >
        Try Again
      </button>
    </main>
  );
}
