"use client";

import { cn } from "@/lib/utils";

interface OutputPaneProps {
  content: string;
  isLoading?: boolean;
}

export function OutputPane({ content, isLoading }: OutputPaneProps) {
  const isEmpty = !content && !isLoading;

  return (
    <div
      className={cn(
        "min-h-40 rounded-lg border border-zinc-200 bg-white p-4 text-sm",
        isEmpty && "text-zinc-400",
      )}
    >
      {isEmpty ? (
        "Output will appear here…"
      ) : (
        <span className="whitespace-pre-wrap">
          {content}
          {/* Blinking cursor while tokens are streaming in */}
          {isLoading && (
            <span className="ml-px inline-block h-[1em] w-0.5 animate-pulse bg-zinc-500 align-middle" />
          )}
        </span>
      )}
    </div>
  );
}
