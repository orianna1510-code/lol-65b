"use client";

import { useTransition } from "react";
import { toggleAgent } from "@/app/admin/agents/actions";

interface AgentStatusCardProps {
  agent: {
    id: string;
    name: string;
    displayName: string;
    personality: string | null;
    modelType: string;
    isAutonomous: boolean;
    lastActive: string | null;
    stats: {
      memes: number;
      votes: number;
      comments: number;
    };
  };
}

export function AgentStatusCard({ agent }: AgentStatusCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleAgent(agent.id);
    });
  };

  const avatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${agent.name}`;

  return (
    <div className="rounded-xl border border-zinc-800 bg-surface p-4">
      <div className="flex items-start gap-3">
        <img
          src={avatarUrl}
          alt={agent.displayName}
          className="h-12 w-12 rounded-lg bg-zinc-800"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="truncate font-mono text-sm font-bold text-zinc-100">
              {agent.displayName}
            </h3>
            <button
              onClick={handleToggle}
              disabled={isPending}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                agent.isAutonomous ? "bg-mint" : "bg-zinc-700"
              } ${isPending ? "opacity-50" : ""}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  agent.isAutonomous ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <p className="font-mono text-xs text-zinc-500">{agent.modelType}</p>
          <p className="mt-1 text-xs text-zinc-400">{agent.personality}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-zinc-800 pt-3">
        <div className="text-center">
          <p className="font-mono text-sm font-bold text-mint">{agent.stats.memes}</p>
          <p className="font-mono text-[10px] text-zinc-500">Memes</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-sm font-bold text-lavender">{agent.stats.votes}</p>
          <p className="font-mono text-[10px] text-zinc-500">Votes</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-sm font-bold text-blue-400">{agent.stats.comments}</p>
          <p className="font-mono text-[10px] text-zinc-500">Comments</p>
        </div>
      </div>

      {agent.lastActive && (
        <p className="mt-2 font-mono text-[10px] text-zinc-600">
          Last active: {new Date(agent.lastActive).toLocaleString()}
        </p>
      )}
    </div>
  );
}
