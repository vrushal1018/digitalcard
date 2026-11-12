"use client";

import React, { useState, useEffect } from "react";
import { Phone, MapPin, Check, Mail, Globe } from "lucide-react";
import { CardActionButton } from "./CardActionButton";
import { ShareButton } from "./ShareButton";
import {
  getCallLink,
  getWhatsAppLink,
  getGoogleMapsLink,
  getLinkedInLink,
  getInstagramLink,
  getFacebookLink,
  getEmailLink,
  getGoogleBusinessLink,
} from "@/lib/links";
import {
  downloadVCard,
  buildAndroidContactIntent,
  isAndroidDevice,
  VCardData,
} from "@/lib/vcard";
import {
  LinkedInIcon,
  InstagramIcon,
  WhatsAppIcon,
  FacebookIcon,
  GoogleBusinessIcon,
} from "./SocialIcons";

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
  email?: string;
  websiteUrl?: string;
  googleBusinessUrl?: string;
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
  bgFit = "cover",
  linkedinUrl,
  instagramUrl,
  facebookUrl,
  email,
  websiteUrl,
  googleBusinessUrl,
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

  // Split name for visual formatting: first word bold, remaining regular
  const nameParts = displayName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || displayName;
  const lastName = nameParts.slice(1).join(" ");

  const callHref = getCallLink(phoneNumber);
  const whatsappHref = getWhatsAppLink(phoneNumber);
  const mapsHref = getGoogleMapsLink(officeLocation);
  const linkedinHref = getLinkedInLink(linkedinUrl);
  const instagramHref = getInstagramLink(instagramUrl);
  const facebookHref = getFacebookLink(facebookUrl);
  const emailHref = getEmailLink(email);
  const googleBusinessHref = getGoogleBusinessLink(googleBusinessUrl);

  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    setIsAndroid(isAndroidDevice());
  }, []);

  const vcardPayload: VCardData = {
    name: displayName,
    designation: displayDesignation,
    companyName: displayCompany,
    phoneNumber,
    officeLocation,
    photoUrl,
    cardUrl: shareUrl,
    linkedinUrl: linkedinHref || undefined,
    instagramUrl: instagramHref || undefined,
    facebookUrl: facebookUrl || undefined,
    email: email?.trim() || undefined,
    websiteUrl: websiteUrl?.trim() || undefined,
    googleBusinessUrl: googleBusinessUrl?.trim() || undefined,
  };

  const androidIntentUrl = isAndroid ? buildAndroidContactIntent(vcardPayload) : undefined;

  const handleSaveContact = () => {
    if (!phoneNumber) return;
    downloadVCard(vcardPayload);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 4000);
  };

  // Clean website display label without protocol
  const displayWebsite = websiteUrl
    ? websiteUrl.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "")
    : "";
  const websiteHref = websiteUrl
    ? websiteUrl.trim().startsWith("http")
      ? websiteUrl.trim()
      : `https://${websiteUrl.trim()}`
    : undefined;

  return (
    <div className={`w-full mx-auto select-none flex-1 flex flex-col font-poppins ${isPreview ? "max-w-[420px]" : "w-full sm:max-w-[420px]"}`}>
      {/* Card Container: Edge-to-edge full screen on mobile, exact mobile preview on desktop */}
      <div
        className={`relative overflow-hidden bg-white flex-1 flex flex-col justify-between transition-all duration-300 font-poppins ${
          isPreview
            ? "rounded-[32px] sm:rounded-[38px] border border-zinc-200/80 shadow-xl"
            : "w-full min-h-screen sm:min-h-0 rounded-none sm:rounded-[38px] border-0 sm:border sm:border-zinc-200/90 shadow-none sm:shadow-2xl"
        }`}
      >
        {/* Top Vivid Blue Banner */}
        <div className="relative w-full h-44 sm:h-52 bg-[#1886cf] overflow-hidden flex flex-col items-center justify-start text-white flex-shrink-0">
          {/* Custom Theme Background (if provided) */}
          {bgUrl && (
            <div className="absolute inset-0 z-0 pointer-events-none select-none">
              <img
                src={bgUrl}
                alt="Header Theme"
                className={`w-full h-full transition-all duration-300 ${
                  bgFit === "cover" ? "object-cover" : "object-contain"
                }`}
              />
            </div>
          )}
        </div>

        {/* Foreground Content with Overlapping Avatar */}
        <div className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 pb-8 bg-white text-zinc-900 flex-1 flex flex-col justify-between">
          <div className="w-full">
            {/* Overlapping Avatar Circle */}
            <div className="relative -mt-14 sm:-mt-16 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 sm:border-[5px] border-white shadow-md mx-auto overflow-hidden bg-[#d6cec7] flex items-center justify-center z-20">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={displayName}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <span className="text-xs sm:text-[13px] font-semibold tracking-widest text-[#666059] uppercase select-none">
                  PHOTO
                </span>
              )}
            </div>

            {/* Identity: Name, Designation & Company */}
            <div className="text-center mt-3 sm:mt-3.5">
              <h1 className="text-2xl sm:text-[26px] tracking-tight text-zinc-950 font-poppins">
                {lastName ? (
                  <>
                    <span className="font-bold">{firstName}</span>{" "}
                    <span className="font-normal text-zinc-800">{lastName}</span>
                  </>
                ) : (
                  <span className="font-bold">{displayName}</span>
                )}
              </h1>

              <p className="text-sm sm:text-[15px] font-semibold text-[#1886cf] mt-1 leading-snug">
                {displayDesignation}
              </p>

              {displayCompany && (
                <p className="text-xs sm:text-[13px] font-normal text-zinc-500 mt-0.5 leading-relaxed">
                  {displayCompany}
                </p>
              )}
            </div>

            {/* 4 Action Icons in a Row */}
            <div className="grid grid-cols-4 gap-1.5 place-items-center w-full my-4 sm:my-5 px-1">
              <CardActionButton
                icon={Phone}
                label="Call"
                href={isPreview ? undefined : callHref}
                disabled={!callHref}
              />
              <CardActionButton
                icon={WhatsAppIcon}
                label="WhatsApp"
                href={isPreview ? undefined : whatsappHref}
                disabled={!whatsappHref}
              />
              <CardActionButton
                icon={Mail}
                label="Email"
                href={isPreview ? undefined : emailHref}
                disabled={!emailHref}
              />
              <CardActionButton
                icon={MapPin}
                label="Location"
                href={isPreview ? undefined : mapsHref}
                disabled={!mapsHref}
              />
            </div>

            {/* Details Information Box */}
            <div className="bg-[#f4f2ee] border border-[#eae6de] rounded-2xl sm:rounded-3xl p-5 sm:p-6 my-2 space-y-4 text-left">
              {/* Phone field */}
              {phoneNumber && (
                <div>
                  <div className="text-[10px] sm:text-[11px] font-normal text-zinc-500 uppercase tracking-wider mb-0.5">
                    PHONE
                  </div>
                  <a
                    href={isPreview ? undefined : callHref || undefined}
                    className="text-sm sm:text-[15px] font-normal text-zinc-800 hover:text-[#1886cf] transition-colors"
                  >
                    {phoneNumber}
                  </a>
                </div>
              )}

              {/* Email field */}
              {email && (
                <div>
                  <div className="text-[10px] sm:text-[11px] font-normal text-zinc-500 uppercase tracking-wider mb-0.5">
                    EMAIL
                  </div>
                  <a
                    href={isPreview ? undefined : emailHref || undefined}
                    className="text-sm sm:text-[15px] font-normal text-zinc-800 hover:text-[#1886cf] transition-colors break-all"
                  >
                    {email}
                  </a>
                </div>
              )}

              {/* Website field */}
              {websiteUrl && (
                <div>
                  <div className="text-[10px] sm:text-[11px] font-normal text-zinc-500 uppercase tracking-wider mb-0.5">
                    WEBSITE
                  </div>
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-[15px] font-normal text-zinc-800 hover:text-[#1886cf] transition-colors break-all"
                  >
                    {displayWebsite}
                  </a>
                </div>
              )}

              {/* Address field */}
              {officeLocation && (
                <div>
                  <div className="text-[10px] sm:text-[11px] font-normal text-zinc-500 uppercase tracking-wider mb-0.5">
                    ADDRESS
                  </div>
                  <a
                    href={isPreview ? undefined : mapsHref || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-[13.5px] font-normal text-zinc-800 hover:text-[#1886cf] transition-colors leading-relaxed block"
                  >
                    {officeLocation}
                  </a>
                </div>
              )}

              {/* Online Social Profiles (if LinkedIn, Instagram, Website, Google Business or Facebook configured) */}
              {(linkedinHref || instagramHref || websiteHref || googleBusinessHref || facebookHref) && (
                <div className="pt-2 border-t border-zinc-200/80">
                  <div className="text-[10px] sm:text-[11px] font-normal text-zinc-500 uppercase tracking-wider mb-1.5">
                    ONLINE PROFILES
                  </div>
                  <div className="flex items-center gap-3">
                    {websiteHref && (
                      <a
                        href={websiteHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Visit Website"
                        aria-label="Website"
                        className="text-zinc-700 hover:text-[#1886cf] transition-colors p-1"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                    {googleBusinessHref && (
                      <a
                        href={googleBusinessHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Google Business Profile"
                        aria-label="Google Business Profile"
                        className="text-zinc-700 hover:opacity-80 transition-opacity p-1 flex items-center justify-center"
                      >
                        <GoogleBusinessIcon className="w-5 h-5" />
                      </a>
                    )}
                    {linkedinHref && (
                      <a
                        href={linkedinHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open LinkedIn Profile"
                        aria-label="LinkedIn"
                        className="text-zinc-700 hover:text-[#0077b5] transition-colors p-1"
                      >
                        <LinkedInIcon className="w-5 h-5" />
                      </a>
                    )}
                    {instagramHref && (
                      <a
                        href={instagramHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open Instagram Profile"
                        aria-label="Instagram"
                        className="text-zinc-700 hover:text-pink-600 transition-colors p-1"
                      >
                        <InstagramIcon className="w-5 h-5" />
                      </a>
                    )}
                    {facebookHref && (
                      <a
                        href={facebookHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open Facebook Profile"
                        aria-label="Facebook"
                        className="text-zinc-700 hover:text-[#1877f2] transition-colors p-1"
                      >
                        <FacebookIcon className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Pill Buttons */}
          <div className="w-full my-4 sm:my-5 space-y-2.5">
            {/* Save contact button */}
            {isAndroid ? (
              <a
                role="button"
                href={androidIntentUrl}
                onClick={() => {
                  setHasSaved(true);
                  setTimeout(() => setHasSaved(false), 3000);
                }}
                aria-disabled={!phoneNumber}
                className={`w-full py-3.5 px-6 rounded-full bg-[#1886cf] hover:bg-[#1578bb] active:scale-[0.99] text-white font-semibold text-sm sm:text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all select-none ${
                  !phoneNumber
                    ? "opacity-50 pointer-events-none cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                {hasSaved ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Contact details saved!</span>
                  </>
                ) : (
                  <span>Save contact</span>
                )}
              </a>
            ) : (
              <button
                type="button"
                onClick={handleSaveContact}
                disabled={!phoneNumber}
                className="w-full py-3.5 px-6 rounded-full bg-[#1886cf] hover:bg-[#1578bb] active:scale-[0.99] text-white font-semibold text-sm sm:text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                {hasSaved ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Contact details saved!</span>
                  </>
                ) : (
                  <span>Save contact</span>
                )}
              </button>
            )}

            {/* Share card button */}
            <ShareButton
              cardName={displayName}
              designation={displayDesignation}
              companyName={displayCompany}
              shareUrl={shareUrl}
              variant="pill"
            />
          </div>

          {/* Interactive preview note when in preview */}
          {isPreview && (
            <div className="mt-2 pt-2 border-t border-zinc-200 text-center">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                Live Card Preview
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
