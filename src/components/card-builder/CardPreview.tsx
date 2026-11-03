"use client";

import React from "react";
import { DigitalCard } from "../digital-card/DigitalCard";
import { CardFormData } from "@/types/card";
import { Sparkles } from "lucide-react";

interface CardPreviewProps {
  formData: CardFormData;
}

export function CardPreview({ formData }: CardPreviewProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold tracking-wide text-zinc-300 uppercase">
            Live Preview
          </h2>
        </div>
        <span className="text-xs text-zinc-500">
          Updates in real-time
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
          isPreview={true}
        />
      </div>
    </div>
  );
}
