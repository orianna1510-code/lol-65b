"use client";

import { useState } from "react";

interface ShareButtonProps {
  url?: string;
}

export function ShareButton({ url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const shareUrl = url || window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for insecure contexts
      try {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch {
        // Both methods failed — do nothing
      }
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 font-mono text-xs text-zinc-400 transition-all hover:border-zinc-500 hover:text-zinc-200"
    >
      {copied ? (
        <>
          <span className="text-mint">&#10003;</span> Copied!
        </>
      ) : (
        <>
          <span>&#128279;</span> Share
        </>
      )}
    </button>
  );
}
