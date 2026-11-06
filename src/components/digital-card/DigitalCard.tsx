"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Phone, MapPin, BadgeCheck, User, UserPlus, Check } from "lucide-react";
import { CardActionButton } from "./CardActionButton";
import { ShareButton } from "./ShareButton";
import {
  getCallLink,
  getWhatsAppLink,
  getGoogleMapsLink,
  getLinkedInLink,
  getInstagramLink,
  getFacebookLink,
} from "@/lib/links";
import { downloadVCard } from "@/lib/vcard";
import { LinkedInIcon, InstagramIcon, FacebookIcon, WhatsAppIcon } from "./SocialIcons";

export interface DigitalCardProps {
  name: string;
  designation: string;
  companyName: string;
  phoneNumber: string;
  officeLocation: string;
  photoUrl?: string;
  bgUrl?: string;
  bgFit?: "contain" | "cover";
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  slug?: string;
  shareUrl?: string;
  isPreview?: boolean;
  autoSave?: boolean;
}

export function DigitalCard({
  name,
  designation,
  companyName,
  phoneNumber,
  officeLocation,
  photoUrl,
  bgUrl,
  bgFit = "contain",
  linkedinUrl,
  instagramUrl,
  facebookUrl,
  shareUrl,
  isPreview = false,
  autoSave = false,
}: DigitalCardProps) {
  const [hasSaved, setHasSaved] = useState(false);

  const displayName = name.trim() || (isPreview ? "Your Name" : "—");
  const displayDesignation =
    designation.trim() || (isPreview ? "Your Job Title" : "—");
  const displayCompany =
    companyName.trim() || (isPreview ? "Company Name" : "");

  const callHref = getCallLink(phoneNumber);
  const whatsappHref = getWhatsAppLink(phoneNumber);
  const mapsHref = getGoogleMapsLink(officeLocation);
  const linkedinHref = getLinkedInLink(linkedinUrl);
  const instagramHref = getInstagramLink(instagramUrl);
  const facebookHref = getFacebookLink(facebookUrl);

  const handleSaveContact = () => {
    if (!phoneNumber) return;
    downloadVCard({
      name: displayName,
      designation: displayDesignation,
      companyName: displayCompany,
      phoneNumber,
      officeLocation,
      photoUrl,
      cardUrl: shareUrl,
      linkedinUrl: linkedinHref || undefined,
      instagramUrl: instagramHref || undefined,
      facebookUrl: facebookHref || undefined,
    });
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 3000);
  };

  useEffect(() => {
    if (autoSave && !isPreview && phoneNumber) {
      const timer = setTimeout(() => {
        handleSaveContact();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [autoSave, isPreview, phoneNumber]);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Outer Card Container */}
      <div className="relative overflow-hidden rounded-[30px] sm:rounded-[36px] bg-[#0d0f14] border border-zinc-800/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-6 sm:p-8 backdrop-blur-sm transition-all duration-300">
        {/* Custom Theme Background Image */}
        {bgUrl && (
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <img
              src={bgUrl}
              alt="Card Theme"
              className={`w-full h-full transition-all duration-300 ${
                bgFit === "cover" ? "object-cover" : "object-contain p-2 sm:p-4"
              }`}
            />
            {/* Elegant dark gradient overlay ensuring 100% legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d0f14]/80 via-[#0d0f14]/75 to-[#0d0f14]/92 backdrop-blur-[1px]" />
          </div>
        )}

        {/* Subtle decorative top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-sky-500/10 blur-3xl pointer-events-none rounded-full z-0" />

        {/* Foreground Content Container - Always above background layers */}
        <div className="relative z-10 flex flex-col">
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
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate max-w-full">
                  {displayName}
                </h1>
                <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 fill-sky-400/20 flex-shrink-0" />
              </div>

              {/* Share Icon in line with Name on the far right */}
              <div className="flex-shrink-0">
                <ShareButton
                  cardName={displayName}
                  designation={displayDesignation}
                  companyName={displayCompany}
                  shareUrl={shareUrl}
                />
              </div>
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

        {/* Primary Action Icons (3 by 3: Row 1) */}
        <div className="grid grid-cols-3 place-items-center py-1 sm:py-2 w-full">
          {/* Call Action */}
          <CardActionButton
            icon={Phone}
            label="Call"
            href={isPreview ? undefined : callHref}
            disabled={!callHref}
          />

          {/* WhatsApp Action */}
          <CardActionButton
            icon={WhatsAppIcon}
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
        </div>

        {/* Spacing & Separator between 3 by 3 */}
        <div className="my-3 sm:my-4 h-px bg-gradient-to-r from-transparent via-zinc-800/70 to-transparent" />

        {/* Social Action Icons (3 by 3: Row 2) */}
        <div className="grid grid-cols-3 place-items-center py-1 sm:py-2 w-full">
          {/* LinkedIn Action */}
          <a
            href={linkedinHref || undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!linkedinHref) e.preventDefault();
            }}
            aria-label="LinkedIn"
            title="Open LinkedIn Profile"
            className="group relative flex items-center justify-center p-2.5 sm:p-3 rounded-full transition-all duration-200 outline-none text-white hover:text-sky-400 hover:scale-115 active:scale-95 cursor-pointer"
          >
            <LinkedInIcon className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />
          </a>

          {/* Instagram Action */}
          <a
            href={instagramHref || undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!instagramHref) e.preventDefault();
            }}
            aria-label="Instagram"
            title="Open Instagram Profile"
            className="group relative flex items-center justify-center p-2.5 sm:p-3 rounded-full transition-all duration-200 outline-none text-white hover:text-pink-400 hover:scale-115 active:scale-95 cursor-pointer"
          >
            <InstagramIcon className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />
          </a>

          {/* Facebook Action */}
          <a
            href={facebookHref || undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!facebookHref) e.preventDefault();
            }}
            aria-label="Facebook"
            title="Open Facebook Profile"
            className="group relative flex items-center justify-center p-2.5 sm:p-3 rounded-full transition-all duration-200 outline-none text-white hover:text-blue-400 hover:scale-115 active:scale-95 cursor-pointer"
          >
            <FacebookIcon className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />
          </a>
        </div>

        {/* Save Contact to Device Button */}
        <div className="relative z-20 mt-5 pt-1">
          <button
            type="button"
            onClick={handleSaveContact}
            disabled={!phoneNumber}
            className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-zinc-200 active:scale-[0.99] text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-white/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasSaved ? (
              <>
                <Check className="w-4 h-4 text-zinc-950 stroke-[3]" />
                <span>Contact Details Saved to Device!</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
                <span>Save Contact to Phone</span>
              </>
            )}
          </button>
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
    </div>
  );
}

