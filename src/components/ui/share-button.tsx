"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { motion, AnimatePresence } from "@/components/ui/motion";

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
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="copied"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="flex items-center gap-1.5 text-mint"
          >
            <Check className="h-3.5 w-3.5" /> Copied!
          </motion.span>
        ) : (
          <motion.span
            key="share"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="flex items-center gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
