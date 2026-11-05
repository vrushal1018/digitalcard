"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CardFormData, FormErrors } from "@/types/card";
import { PhotoUpload } from "./PhotoUpload";
import { ThemeBackgroundUpload } from "./ThemeBackgroundUpload";
import { validateCardForm } from "@/lib/validation";
import { LinkedInIcon, InstagramIcon, FacebookIcon } from "../digital-card/SocialIcons";
import {
  Sparkles,
  Loader2,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  AlertCircle,
  QrCode,
  MessageCircle,
  Eye,
  Share2,
  Download,
} from "lucide-react";

interface CardFormProps {
  formData: CardFormData;
  onChange: (newData: CardFormData) => void;
  onCardCreated?: (slug: string) => void;
}

export function CardForm({ formData, onChange, onCardCreated }: CardFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [cardToken, setCardToken] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...formData,
      [name]: value,
    });

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
  };

  const handlePhotoUploaded = (photoUrl: string) => {
    onChange({
      ...formData,
      photoUrl,
    });
    if (errors.photo) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.photo;
        return next;
      });
    }
  };

  const handlePhotoRemoved = () => {
    onChange({
      ...formData,
      photoUrl: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateCardForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.error || "Failed to create digital card." });
        }
        return;
      }

      setCreatedSlug(data.slug);
      // Only include token query param if database is not active
      if (data.token && !data.hasDatabase) {
        setCardToken(data.token);
      } else {
        setCardToken(null);
      }
      if (onCardCreated) {
        onCardCreated(data.slug);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrors({
        general: "A network error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const queryPart = cardToken ? `?d=${cardToken}` : "";
  const cardPath = createdSlug ? `/card/${createdSlug}${queryPart}` : "";
  const cardFullUrl = createdSlug ? `${origin}${cardPath}` : "";
  const qrAutoSaveUrl = `${cardFullUrl}${cardFullUrl.includes("?") ? "&" : "?"}scan=1`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrAutoSaveUrl
  )}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check out ${formData.name}'s digital business card: ${cardFullUrl}`
  )}`;

  const handleCopyLink = async () => {
    if (!cardFullUrl) return;
    try {
      await navigator.clipboard.writeText(cardFullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Create Digital Card
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Fill in your details below to generate a shareable, interactive card.
        </p>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      {createdSlug ? (
        <div className="space-y-6 animate-fade-in">
          {/* Success Banner */}
          <div className="p-5 bg-zinc-900/90 border border-emerald-500/30 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
              <Check className="w-5 h-5" />
              <span>Card Created & Ready to Share!</span>
            </div>
            <p className="text-sm text-zinc-300">
              Your digital card is live at:
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
              <input
                type="text"
                readOnly
                value={cardFullUrl}
                className="flex-1 bg-transparent text-sm text-zinc-300 px-2 py-1 outline-none truncate"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors border border-zinc-700"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <a
                  href={cardPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Card</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-medium border border-emerald-500/30 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
              >
                <QrCode className="w-4 h-4 text-sky-400" />
                <span>{showQr ? "Hide QR Code" : "Preview Mobile QR"}</span>
              </button>
            </div>

            {showQr && (
              <div className="p-4 sm:p-5 bg-zinc-950 rounded-2xl border border-zinc-800 text-center animate-fade-in space-y-4">
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Scan with your phone camera to open the card and automatically save the contact number to your device.
                </p>

                {/* QR Code Graphic Container */}
                <div className="inline-block p-3 bg-white rounded-2xl shadow-xl shadow-black/50 border border-zinc-200">
                  <img
                    src={qrCodeUrl}
                    alt="Digital Business Card QR Code"
                    className="w-44 h-44 block"
                  />
                </div>

                <div className="flex items-center justify-center gap-3 pt-1">
                  <a
                    href={qrCodeUrl}
                    download={`${formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "card"}-qr.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-medium border border-zinc-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR Image</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Social Link Preview Card Mockup */}
          <div className="p-5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Link Preview When Shared</span>
            </div>
            <p className="text-xs text-zinc-400">
              This is how your link appears when sent via WhatsApp, iMessage, Slack, or LinkedIn:
            </p>

            {/* WhatsApp-style horizontal Link Preview Mockup */}
            <a
              href={cardPath}
              target="_blank"
              rel="noopener noreferrer"
              className="block group rounded-xl overflow-hidden border border-zinc-700/60 bg-zinc-950/90 shadow-lg hover:border-sky-500/50 transition-colors"
            >
              <div className="flex items-stretch min-h-[105px]">
                {/* Left: Uploaded Photo Only */}
                <div className="w-24 sm:w-28 flex-shrink-0 bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt={formData.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      👤
                    </div>
                  )}
                </div>

                {/* Right: Theme in Background with Information on top */}
                <div className="flex-1 p-3 sm:p-3.5 relative overflow-hidden flex flex-col justify-center">
                  {/* Theme Background on the right */}
                  {formData.bgUrl ? (
                    <div className="absolute inset-0 z-0">
                      <img
                        src={formData.bgUrl}
                        alt="Theme background"
                        className={`w-full h-full opacity-35 ${
                          formData.bgFit === "cover" ? "object-cover" : "object-contain p-1"
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/75 to-zinc-950/85" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 z-0 bg-[#061814]" />
                  )}

                  <div className="relative z-10 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {formData.name || "Your Name"}
                        {formData.companyName ? ` — ${formData.companyName}` : ""}
                      </h4>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold">
                        ✓
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 line-clamp-2">
                      {formData.name || "Name"}, {formData.designation || "Title"} at {formData.companyName || "Company"}. Connect via Call, WhatsApp, Location, and Share.
                    </p>
                    <p className="text-[10px] text-zinc-500 pt-0.5 truncate">
                      {origin ? origin.replace(/^https?:\/\//, "") : "digitalcard.vercel.app"}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* Reset Action */}
          <div className="pt-2 flex justify-between items-center text-xs text-zinc-400">
            <button
              type="button"
              onClick={() => {
                setCreatedSlug(null);
                setCardToken(null);
                setShowQr(false);
                onChange({
                  name: "",
                  designation: "",
                  companyName: "",
                  phoneNumber: "",
                  officeLocation: "",
                  photoUrl: "",
                  bgUrl: "",
                  bgFit: "contain",
                  linkedinUrl: "",
                  instagramUrl: "",
                  facebookUrl: "",
                });
              }}
              className="text-zinc-400 hover:text-white underline underline-offset-4"
            >
              Create another digital card
            </button>

            <a
              href={cardPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Go to live card</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Alex Jordan"
              className={`w-full px-4 py-2.5 bg-zinc-900/90 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 transition-all ${errors.name
                  ? "border-rose-500 focus:ring-rose-500/30"
                  : "border-zinc-800 focus:border-sky-500 focus:ring-sky-500/20"
                }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-400 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Designation and Company Name Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="designation"
                className="block text-sm font-medium text-zinc-300 mb-1.5"
              >
                Designation / Job Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="designation"
                name="designation"
                type="text"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="Creative Director"
                className={`w-full px-4 py-2.5 bg-zinc-900/90 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 transition-all ${errors.designation
                    ? "border-rose-500 focus:ring-rose-500/30"
                    : "border-zinc-800 focus:border-sky-500 focus:ring-sky-500/20"
                  }`}
              />
              {errors.designation && (
                <p className="text-xs text-rose-400 mt-1">{errors.designation}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-zinc-300 mb-1.5"
              >
                Company Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Innovative Spaces"
                className={`w-full px-4 py-2.5 bg-zinc-900/90 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 transition-all ${errors.companyName
                    ? "border-rose-500 focus:ring-rose-500/30"
                    : "border-zinc-800 focus:border-sky-500 focus:ring-sky-500/20"
                  }`}
              />
              {errors.companyName && (
                <p className="text-xs text-rose-400 mt-1">{errors.companyName}</p>
              )}
            </div>
          </div>

          {/* Phone Number Field */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Phone Number <span className="text-rose-400">*</span>
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+91 98765 43210"
              className={`w-full px-4 py-2.5 bg-zinc-900/90 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 transition-all ${errors.phoneNumber
                  ? "border-rose-500 focus:ring-rose-500/30"
                  : "border-zinc-800 focus:border-sky-500 focus:ring-sky-500/20"
                }`}
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Used to enable one-tap Call and WhatsApp actions on your card.
            </p>
            {errors.phoneNumber && (
              <p className="text-xs text-rose-400 mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Office Location Field */}
          <div>
            <label
              htmlFor="officeLocation"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Office Location / Address <span className="text-rose-400">*</span>
            </label>
            <input
              id="officeLocation"
              name="officeLocation"
              type="text"
              value={formData.officeLocation}
              onChange={handleInputChange}
              placeholder="BKC, Mumbai, Maharashtra"
              className={`w-full px-4 py-2.5 bg-zinc-900/90 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 transition-all ${errors.officeLocation
                  ? "border-rose-500 focus:ring-rose-500/30"
                  : "border-zinc-800 focus:border-sky-500 focus:ring-sky-500/20"
                }`}
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Used to launch Google Maps directions on your card.
            </p>
            {errors.officeLocation && (
              <p className="text-xs text-rose-400 mt-1">{errors.officeLocation}</p>
            )}
          </div>

          {/* Social Profiles Section */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Share2 className="w-4 h-4 text-sky-400" />
                <span>Social Profiles</span>
                <span className="text-[11px] font-normal text-zinc-500">(Optional)</span>
              </label>
              <span className="text-[11px] text-zinc-500">Links appear as clickable buttons</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* LinkedIn */}
              <div>
                <label
                  htmlFor="linkedinUrl"
                  className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5"
                >
                  <LinkedInIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
                  <span>LinkedIn</span>
                </label>
                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="text"
                  value={formData.linkedinUrl || ""}
                  onChange={handleInputChange}
                  placeholder="username or URL"
                  className="w-full px-3 py-2 bg-zinc-900/90 border border-zinc-800 focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]/30 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none transition-all"
                />
              </div>

              {/* Instagram */}
              <div>
                <label
                  htmlFor="instagramUrl"
                  className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
                  <span>Instagram</span>
                </label>
                <input
                  id="instagramUrl"
                  name="instagramUrl"
                  type="text"
                  value={formData.instagramUrl || ""}
                  onChange={handleInputChange}
                  placeholder="@username or URL"
                  className="w-full px-3 py-2 bg-zinc-900/90 border border-zinc-800 focus:border-[#E1306C] focus:ring-1 focus:ring-[#E1306C]/30 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none transition-all"
                />
              </div>

              {/* Facebook */}
              <div>
                <label
                  htmlFor="facebookUrl"
                  className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5"
                >
                  <FacebookIcon className="w-3.5 h-3.5 text-[#1877F2]" />
                  <span>Facebook</span>
                </label>
                <input
                  id="facebookUrl"
                  name="facebookUrl"
                  type="text"
                  value={formData.facebookUrl || ""}
                  onChange={handleInputChange}
                  placeholder="username or URL"
                  className="w-full px-3 py-2 bg-zinc-900/90 border border-zinc-800 focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2]/30 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Photo Upload Component */}
          <PhotoUpload
            currentPhotoUrl={formData.photoUrl}
            onPhotoUploaded={handlePhotoUploaded}
            onPhotoRemoved={handlePhotoRemoved}
            error={errors.photo}
          />

          {/* Theme & Background Upload Component */}
          <ThemeBackgroundUpload
            currentBgUrl={formData.bgUrl}
            bgFit={formData.bgFit}
            onBgUploaded={(bgUrl, fit) =>
              onChange({ ...formData, bgUrl, bgFit: fit || formData.bgFit || "contain" })
            }
            onBgRemoved={() => onChange({ ...formData, bgUrl: "", bgFit: "contain" })}
            onFitChange={(bgFit) => onChange({ ...formData, bgFit })}
          />

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.99] text-zinc-950 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Generating Digital Card...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Digital Card</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
