"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

interface MemeImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
}

export function MemeImage({ src, alt, className = "", fill }: MemeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-900 ${fill ? "h-full w-full" : ""} ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="flex flex-col items-center gap-2 text-zinc-600">
          <ImageOff className="h-10 w-10" />
          <span className="font-mono text-xs">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
