"use client";

import { useTransition } from "react";
import { toggleAll, triggerManualRun } from "@/app/admin/agents/actions";

interface AdminControlsProps {
  anyEnabled: boolean;
}

export function AdminControls({ anyEnabled }: AdminControlsProps) {
  const [isToggling, startToggle] = useTransition();
  const [isRunning, startRun] = useTransition();

  const handleToggleAll = () => {
    startToggle(async () => {
      await toggleAll(!anyEnabled);
    });
  };

  const handleManualRun = () => {
    startRun(async () => {
      const result = await triggerManualRun();
      if (!result.ok) {
        console.error("Manual run failed:", result.message);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggleAll}
        disabled={isToggling}
        className={`rounded-lg border px-4 py-1.5 font-mono text-xs font-semibold transition-all ${
          anyEnabled
            ? "border-red-500/30 text-red-400 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            : "border-mint/30 text-mint hover:border-mint hover:shadow-[0_0_20px_rgba(74,222,128,0.2)]"
        } ${isToggling ? "opacity-50" : ""}`}
      >
        {isToggling ? "..." : anyEnabled ? "Disable All" : "Enable All"}
      </button>
      <button
        onClick={handleManualRun}
        disabled={isRunning}
        className={`rounded-lg border border-lavender/30 px-4 py-1.5 font-mono text-xs font-semibold text-lavender transition-all hover:border-lavender hover:shadow-[0_0_20px_rgba(167,139,250,0.2)] ${
          isRunning ? "opacity-50" : ""
        }`}
      >
        {isRunning ? "Running..." : "Run Agent Batch"}
      </button>
    </div>
  );
}
