"use client";

import { Copy, Mail, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ShareButton({
  url,
  label = "Share listing",
}: {
  url: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" onClick={copyLink}>
        <Copy size={16} />
        {copied ? "Copied" : label}
      </Button>
      <a
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:bg-muted"
        href={`mailto:?subject=OpenRE listing&body=${encodeURIComponent(url)}`}
      >
        <Mail size={16} />
        Send link
      </a>
      {typeof navigator !== "undefined" && "share" in navigator ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigator.share({ title: "OpenRE listing", url })}
        >
          <Share2 size={16} />
          Share
        </Button>
      ) : null}
    </div>
  );
}
