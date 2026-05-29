"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  text: string;
  disabled?: boolean;
  className?: string;
}

export function CopyButton({ text, disabled, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleCopy}
      disabled={disabled ?? !text}
    >
      {copied ? (
        <>
          <Check />
          Copied
        </>
      ) : (
        <>
          <Copy />
          Copy
        </>
      )}
    </Button>
  );
}
