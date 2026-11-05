"use client";

import React from "react";
import { DigitalCard } from "../digital-card/DigitalCard";
import { CardFormData } from "@/types/card";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface CardPreviewProps {
  formData: CardFormData;
  createdSlug?: string | null;
}

export function CardPreview({ formData, createdSlug }: CardPreviewProps) {
  const isLive = Boolean(createdSlug);
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const shareUrl = createdSlug ? `${origin}/card/${createdSlug}` : undefined;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {isLive ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold tracking-wide text-emerald-400 uppercase">
                Active Card Preview
              </h2>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold tracking-wide text-zinc-300 uppercase">
                Live Preview
              </h2>
            </>
          )}
        </div>
        <span className="text-xs text-zinc-500">
          {isLive ? "Published & Live" : "Updates in real-time"}
        </span>
      </div>

      <div className="w-full p-4 sm:p-6 bg-zinc-950/40 rounded-3xl border border-zinc-800/60 shadow-2xl backdrop-blur-sm flex justify-center">
        <DigitalCard
          name={formData.name}
          designation={formData.designation}
          companyName={formData.companyName}
          phoneNumber={formData.phoneNumber}
          officeLocation={formData.officeLocation}
          photoUrl={formData.photoUrl}
          bgUrl={formData.bgUrl}
          bgFit={formData.bgFit}
          linkedinUrl={formData.linkedinUrl}
          instagramUrl={formData.instagramUrl}
          facebookUrl={formData.facebookUrl}
          slug={createdSlug || undefined}
          shareUrl={shareUrl}
          isPreview={!isLive}
        />
      </div>
    </div>
  );
}
