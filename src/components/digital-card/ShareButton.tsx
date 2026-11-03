"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import { CardActionButton } from "./CardActionButton";

interface ShareButtonProps {
  cardName: string;
  designation: string;
  companyName: string;
  shareUrl?: string;
}

export function ShareButton({
  cardName,
  designation,
  companyName,
  shareUrl,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cardName} — Digital Business Card`,
          text: `${cardName}, ${designation} at ${companyName}`,
          url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share was cancelled or failed
        if ((err as Error)?.name === "AbortError") {
          return;
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        // Older fallback
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (clipErr) {
      console.error("Clipboard copy failed:", clipErr);
    }
  };

  return (
    <div className="relative flex-1">
      <CardActionButton
        icon={copied ? Check : Share2}
        label={copied ? "Copied!" : "Share"}
        onClick={handleShare}
        isPrimary={copied}
      />
      {copied && (
        <div
          role="status"
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-sky-500 text-zinc-950 font-semibold text-xs px-2.5 py-1 rounded-md shadow-md animate-fade-in pointer-events-none whitespace-nowrap"
        >
          Link copied!
        </div>
      )}
    </div>
  );
}
