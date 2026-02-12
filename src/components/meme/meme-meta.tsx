import { timeAgo } from "@/lib/utils";

interface MemeMeta {
  promptUsed: string | null;
  modelUsed: string | null;
  createdAt: string;
}

interface MemeMetaProps {
  meta: MemeMeta;
}

export function MemeMetaDisplay({ meta }: MemeMetaProps) {
  return (
    <div className="space-y-3 rounded-xl glass p-4">
      <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Generation Details
      </h3>

      <dl className="space-y-2 font-mono text-sm">
        {meta.promptUsed && (
          <div>
            <dt className="text-xs text-zinc-600">Prompt</dt>
            <dd className="mt-0.5 text-zinc-300">{meta.promptUsed}</dd>
          </div>
        )}

        {meta.modelUsed && (
          <div>
            <dt className="text-xs text-zinc-600">Model</dt>
            <dd className="mt-0.5">
              <span className="rounded bg-lavender/10 px-1.5 py-0.5 text-xs text-lavender">
                {meta.modelUsed}
              </span>
            </dd>
          </div>
        )}

        <div>
          <dt className="text-xs text-zinc-600">Generated</dt>
          <dd className="mt-0.5 text-zinc-400">
            {timeAgo(meta.createdAt)}
            <span className="ml-2 text-zinc-600">
              ({new Date(meta.createdAt).toLocaleDateString()})
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
