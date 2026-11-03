"use client";

import React from "react";
import Image from "next/image";
import { Phone, MessageCircle, MapPin, BadgeCheck, User } from "lucide-react";
import { CardActionButton } from "./CardActionButton";
import { ShareButton } from "./ShareButton";
import { getCallLink, getWhatsAppLink, getGoogleMapsLink } from "@/lib/links";

export interface DigitalCardProps {
  name: string;
  designation: string;
  companyName: string;
  phoneNumber: string;
  officeLocation: string;
  photoUrl?: string;
  slug?: string;
  shareUrl?: string;
  isPreview?: boolean;
}

export function DigitalCard({
  name,
  designation,
  companyName,
  phoneNumber,
  officeLocation,
  photoUrl,
  shareUrl,
  isPreview = false,
}: DigitalCardProps) {
  const displayName = name.trim() || (isPreview ? "Your Name" : "—");
  const displayDesignation =
    designation.trim() || (isPreview ? "Your Job Title" : "—");
  const displayCompany =
    companyName.trim() || (isPreview ? "Company Name" : "");

  const callHref = getCallLink(phoneNumber);
  const whatsappHref = getWhatsAppLink(phoneNumber);
  const mapsHref = getGoogleMapsLink(officeLocation);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Outer Card Container */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-[#0d0f14] border border-zinc-800/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-5 sm:p-7 backdrop-blur-sm transition-all duration-300">
        {/* Subtle decorative top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Profile and Identity Header */}
        <div className="relative flex items-center gap-4 sm:gap-5">
          {/* Profile Photo */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-inner">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600">
                <User className="w-10 h-10 stroke-1 text-zinc-500" />
              </div>
            )}
          </div>

          {/* Identity Information */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate max-w-full">
                {displayName}
              </h1>
              <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 fill-sky-400/20 flex-shrink-0" />
            </div>

            <p className="text-xs sm:text-sm font-medium text-zinc-300 mt-1 truncate">
              {displayDesignation}
            </p>

            {displayCompany && (
              <p className="text-xs font-normal text-zinc-400 mt-0.5 truncate">
                {displayCompany}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 sm:my-6 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

        {/* Action Row */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* Call Action */}
          <CardActionButton
            icon={Phone}
            label="Call"
            href={isPreview ? undefined : callHref}
            disabled={!callHref}
            isPrimary={Boolean(callHref)}
          />

          {/* WhatsApp Action */}
          <CardActionButton
            icon={MessageCircle}
            label="WhatsApp"
            href={isPreview ? undefined : whatsappHref}
            disabled={!whatsappHref}
          />

          {/* Location Action */}
          <CardActionButton
            icon={MapPin}
            label="Location"
            href={isPreview ? undefined : mapsHref}
            disabled={!mapsHref}
          />

          {/* Share Action */}
          <ShareButton
            cardName={displayName}
            designation={displayDesignation}
            companyName={displayCompany}
            shareUrl={shareUrl}
          />
        </div>

        {/* Interactive preview note when in preview */}
        {isPreview && (
          <div className="mt-4 pt-3 border-t border-zinc-900 text-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
              Live Card Preview
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
