"use client";

import React, { useState } from "react";
import { Share2, Check, Copy, ExternalLink, QrCode, MessageCircle, X } from "lucide-react";
import { CardActionButton } from "./CardActionButton";

interface ShareButtonProps {
  cardName: string;
  designation: string;
  companyName: string;
  shareUrl?: string;
  variant?: "icon" | "pill";
}

export function ShareButton({
  cardName,
  designation,
  companyName,
  shareUrl,
  variant = "icon",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const getEffectiveUrl = () => {
    if (shareUrl) return shareUrl;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const handleShareClick = async () => {
    const url = getEffectiveUrl();

    // If native share is supported (mostly mobile browsers)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${cardName} — Digital Business Card`,
          text: `Connect with ${cardName}, ${designation} at ${companyName}:`,
          url,
        });
        return;
      } catch (err) {
        // User closed or cancelled native share sheet
        if ((err as Error)?.name === "AbortError") {
          return;
        }
      }
    }

    // On desktop or when native share is unavailable: open the share & preview sheet
    setShowModal(true);
  };

  const handleCopy = async () => {
    const url = getEffectiveUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (clipErr) {
      console.error("Clipboard copy failed:", clipErr);
    }
  };

  const effectiveUrl = getEffectiveUrl();
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Connect with ${cardName}, ${designation} at ${companyName}:\n${effectiveUrl}`
  )}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    effectiveUrl
  )}`;

  return (
    <>
      {variant === "pill" ? (
        <button
          type="button"
          onClick={handleShareClick}
          aria-label="Share card"
          className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-zinc-50 border-2 border-zinc-900 active:scale-[0.99] text-zinc-900 font-semibold text-sm sm:text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span>Link copied to clipboard!</span>
            </>
          ) : (
            <span>Share card</span>
          )}
        </button>
      ) : (
        <CardActionButton
          icon={copied ? Check : Share2}
          label={copied ? "Copied!" : "Share"}
          onClick={handleShareClick}
          isPrimary={copied}
        />
      )}

      {/* Share & Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-left">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Share Digital Card
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Share or preview the card link across any device or platform.
            </p>

            {/* URL input and copy button */}
            <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded-xl border border-zinc-800 mb-4">
              <input
                type="text"
                readOnly
                value={effectiveUrl}
                className="flex-1 bg-transparent text-xs text-zinc-300 outline-none px-1 truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Quick Share Actions */}
            <div className="space-y-2 mb-4">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4" />
                  <span>Share via WhatsApp</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <a
                href={effectiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4" />
                  <span>Open & Preview in New Tab</span>
                </div>
                <span className="text-[10px] text-zinc-500">Live Card</span>
              </a>
            </div>

            {/* QR Code Section for Phone Preview */}
            <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-300 mb-2">
                <QrCode className="w-4 h-4 text-sky-400" />
                <span>Scan with phone to preview</span>
              </div>
              <div className="inline-block p-2 bg-white rounded-xl shadow-md">
                <img
                  src={qrCodeUrl}
                  alt="QR Code for digital business card"
                  className="w-32 h-32 block"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
