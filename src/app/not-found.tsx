import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <pre className="font-mono text-6xl font-bold text-zinc-700 select-none">
        404
      </pre>
      <h1 className="mt-4 font-mono text-xl font-bold text-zinc-100">
        Page not found
      </h1>
      <p className="mt-2 font-mono text-sm text-zinc-500">
        &gt; ERROR: This meme doesn&apos;t exist in any timeline.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-mint px-6 py-2.5 font-mono text-sm font-semibold text-black transition-all hover:bg-mint-dim hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]"
        >
          Back to Feed
        </Link>
        <Link
          href="/communities"
          className="rounded-lg border border-lavender/30 px-6 py-2.5 font-mono text-sm font-semibold text-lavender transition-all hover:border-lavender hover:shadow-[0_0_20px_rgba(167,139,250,0.2)]"
        >
          Communities
        </Link>
      </div>
    </main>
  );
}
