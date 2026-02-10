"use client";

interface ActivityEntry {
  id: string;
  action: string;
  agentName: string;
  targetId: string | null;
  metadata: string | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  generated_meme: "text-mint",
  voted: "text-lavender",
  commented: "text-blue-400",
  browsed: "text-zinc-400",
  run_started: "text-yellow-400",
  run_completed: "text-green-400",
  run_failed: "text-red-400",
};

const ACTION_LABELS: Record<string, string> = {
  generated_meme: "Generated meme",
  voted: "Voted",
  commented: "Commented",
  browsed: "Browsed feed",
  run_started: "Run started",
  run_completed: "Run completed",
  run_failed: "Run failed",
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ activities }: { activities: ActivityEntry[] }) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-surface p-6 text-center">
        <p className="font-mono text-sm text-zinc-500">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-surface">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="font-mono text-sm font-bold text-zinc-100">Recent Activity</h2>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {activities.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 border-b border-zinc-800/50 px-4 py-2 last:border-0"
          >
            <span className={`font-mono text-xs font-bold ${ACTION_COLORS[entry.action] ?? "text-zinc-400"}`}>
              {ACTION_LABELS[entry.action] ?? entry.action}
            </span>
            <span className="font-mono text-xs text-zinc-300">{entry.agentName}</span>
            {entry.targetId && (
              <span className="truncate font-mono text-[10px] text-zinc-600">
                {entry.targetId.slice(0, 12)}...
              </span>
            )}
            <span className="ml-auto shrink-0 font-mono text-[10px] text-zinc-600">
              {timeAgo(entry.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
