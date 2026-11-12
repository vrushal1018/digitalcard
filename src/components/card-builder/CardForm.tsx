"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CardFormData, FormErrors } from "@/types/card";
import { PhotoUpload } from "./PhotoUpload";
import { ThemeBackgroundUpload } from "./ThemeBackgroundUpload";
import { validateCardForm } from "@/lib/validation";
import { LinkedInIcon, InstagramIcon, FacebookIcon, GoogleBusinessIcon } from "../digital-card/SocialIcons";
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
  Edit3,
  Mail,
  Globe,
} from "lucide-react";

interface CardFormProps {
  formData: CardFormData;
  onChange: (newData: CardFormData) => void;
  onCardCreated?: (slug: string, token?: string | null) => void;
  onCardUpdated?: (slug: string, token?: string | null) => void;
  editingSlug?: string | null;
  onCancelEdit?: () => void;
}

export function CardForm({
  formData,
  onChange,
  onCardCreated,
  onCardUpdated,
  editingSlug,
  onCancelEdit,
}: CardFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [isUpdatedNotice, setIsUpdatedNotice] = useState(false);
  const [cardToken, setCardToken] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    storageType: string;
    isVercel?: boolean;
  } | null>(null);

  React.useEffect(() => {
    fetch("/api/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setDbStatus(data);
      })
      .catch(() => {});
  }, []);

  type ProfileKey = "website" | "googleBusiness" | "linkedin" | "instagram" | "facebook";

  const [enabledProfiles, setEnabledProfiles] = useState<Record<ProfileKey, boolean>>({
    website: Boolean(formData.websiteUrl),
    googleBusiness: Boolean(formData.googleBusinessUrl),
    linkedin: Boolean(formData.linkedinUrl),
    instagram: Boolean(formData.instagramUrl),
    facebook: Boolean(formData.facebookUrl),
  });

  React.useEffect(() => {
    setEnabledProfiles((prev) => ({
      website: prev.website || Boolean(formData.websiteUrl),
      googleBusiness: prev.googleBusiness || Boolean(formData.googleBusinessUrl),
      linkedin: prev.linkedin || Boolean(formData.linkedinUrl),
      instagram: prev.instagram || Boolean(formData.instagramUrl),
      facebook: prev.facebook || Boolean(formData.facebookUrl),
    }));
  }, [
    formData.websiteUrl,
    formData.googleBusinessUrl,
    formData.linkedinUrl,
    formData.instagramUrl,
    formData.facebookUrl,
  ]);

  const toggleProfile = (key: ProfileKey, field: keyof CardFormData) => {
    const nextState = !enabledProfiles[key];
    setEnabledProfiles((prev) => ({ ...prev, [key]: nextState }));
    if (!nextState) {
      onChange({
        ...formData,
        [field]: "",
      });
    }
  };

  const saveCardToLocalCache = (card: any) => {
    if (typeof window === "undefined" || !card?.slug) return;
    try {
      const raw = localStorage.getItem("inacard_saved_cards");
      let list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      const idx = list.findIndex(
        (c: any) => c.slug.toLowerCase() === card.slug.toLowerCase()
      );
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...card, updatedAt: new Date().toISOString() };
      } else {
        list.unshift(card);
      }
      localStorage.setItem("inacard_saved_cards", JSON.stringify(list));
    } catch (e) {
      console.error("Failed to save to local cache", e);
    }
  };

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
      const url = editingSlug
        ? `/api/cards?slug=${encodeURIComponent(editingSlug)}`
        : "/api/cards";
      const method = editingSlug ? "PUT" : "POST";
      const payload = editingSlug ? { ...formData, slug: editingSlug } : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({
            general:
              data.error ||
              (editingSlug
                ? "Failed to update digital card."
                : "Failed to create digital card."),
          });
        }
        return;
      }

      const activeSlug = data.slug || editingSlug;
      if (data.card) {
        saveCardToLocalCache({ ...data.card, token: data.token });
      }

      setCreatedSlug(activeSlug);
      setIsUpdatedNotice(Boolean(editingSlug));

      // Only include token query param if database is not active
      if (data.token && !data.hasDatabase) {
        setCardToken(data.token);
      } else {
        setCardToken(null);
      }

      const tokenToPass = !data.hasDatabase && data.token ? data.token : null;

      if (editingSlug && onCardUpdated) {
        onCardUpdated(activeSlug, tokenToPass);
      } else if (onCardCreated) {
        onCardCreated(activeSlug, tokenToPass);
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
  const querySuffix = cardToken ? `?d=${cardToken}` : "";
  const cardPath = createdSlug ? `/card/${createdSlug}${querySuffix}` : "";
  const cardFullUrl = createdSlug ? `${origin}${cardPath}` : "";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    cardFullUrl
  )}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    cardFullUrl
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
        <div className="flex items-center gap-2">
          {editingSlug ? (
            <span className="p-1 rounded-md bg-sky-500/20 text-sky-400">
              <Edit3 className="w-5 h-5" />
            </span>
          ) : null}
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {editingSlug ? "Edit Digital Card" : "Create Digital Card"}
          </h2>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          {editingSlug
            ? "Make changes below and update. Your existing URL, QR code, and saved link stay the same."
            : "Fill in your details below to generate a shareable, interactive card."}
        </p>

        {/* Live Cloud Sync / Storage Status Badge */}
        {dbStatus && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs border flex items-center justify-between gap-2 transition-all ${
              dbStatus.connected
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  dbStatus.connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              <span className="font-medium">
                {dbStatus.connected
                  ? `Live Cloud Storage Active (${dbStatus.storageType}): Any change here saves immediately across all live cards.`
                  : "Live Cloud Storage (Vercel KV): Connect Vercel KV in 1 click (Storage → Create Database → KV) to enable instant live saving directly from this hosted form."}
              </span>
            </div>
          </div>
        )}
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
              <span>
                {isUpdatedNotice
                  ? "Card Updated Successfully!"
                  : "Card Created & Ready to Share!"}
              </span>
            </div>
            <p className="text-sm text-zinc-300">
              {isUpdatedNotice
                ? "All changes are saved. Your existing QR code and link now display your latest details:"
                : "Your digital card is live at:"}
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

          {/* Reset / Edit Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCreatedSlug(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors border border-zinc-700"
              >
                <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                <span>Edit this card again</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreatedSlug(null);
                  setCardToken(null);
                  setShowQr(false);
                  setIsUpdatedNotice(false);
                  if (onCancelEdit) onCancelEdit();
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
                    email: "",
                    websiteUrl: "",
                  });
                }}
                className="text-zinc-400 hover:text-white underline underline-offset-4"
              >
                Create new card
              </button>
            </div>

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
          {editingSlug && (
            <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-2 text-xs sm:text-sm text-sky-300">
              <div className="flex items-center gap-2 min-w-0">
                <Edit3 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span className="truncate">
                  Editing: <strong className="text-white font-mono">{editingSlug}</strong>
                </span>
              </div>
              {onCancelEdit && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors flex-shrink-0 border border-zinc-700"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          )}
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

          {/* Online & Social Profiles Section */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>Online & Social Profiles</span>
                  <span className="text-[11px] font-normal text-zinc-500">(Optional)</span>
                </label>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Choose which profiles to display under Online Profiles on your card:
                </p>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                {
                  [
                    formData.websiteUrl,
                    formData.googleBusinessUrl,
                    formData.linkedinUrl,
                    formData.instagramUrl,
                    formData.facebookUrl,
                  ].filter(Boolean).length
                }{" "}
                displayed
              </span>
            </div>

            {/* Platform Selection Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                {
                  key: "website" as ProfileKey,
                  label: "Website",
                  field: "websiteUrl" as keyof CardFormData,
                  icon: Globe,
                },
                {
                  key: "googleBusiness" as ProfileKey,
                  label: "Google Business",
                  field: "googleBusinessUrl" as keyof CardFormData,
                  icon: GoogleBusinessIcon,
                },
                {
                  key: "linkedin" as ProfileKey,
                  label: "LinkedIn",
                  field: "linkedinUrl" as keyof CardFormData,
                  icon: LinkedInIcon,
                },
                {
                  key: "instagram" as ProfileKey,
                  label: "Instagram",
                  field: "instagramUrl" as keyof CardFormData,
                  icon: InstagramIcon,
                },
                {
                  key: "facebook" as ProfileKey,
                  label: "Facebook",
                  field: "facebookUrl" as keyof CardFormData,
                  icon: FacebookIcon,
                },
              ].map((p) => {
                const isSelected = Boolean(enabledProfiles[p.key]);
                const Icon = p.icon;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => toggleProfile(p.key, p.field)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-sky-500/15 border-sky-500/50 text-sky-300 shadow-sm shadow-sky-500/10"
                        : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{p.label}</span>
                    {isSelected ? (
                      <Check className="w-3 h-3 text-sky-400 stroke-[2.5]" />
                    ) : (
                      <span className="text-zinc-500 text-[11px] leading-none">+</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Inputs for Selected Platforms */}
            {Object.values(enabledProfiles).some(Boolean) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {enabledProfiles.website && (
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="websiteUrl"
                        className="text-xs font-medium text-zinc-300 flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5 text-sky-400" />
                        <span>Website URL</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleProfile("website", "websiteUrl")}
                        className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      id="websiteUrl"
                      name="websiteUrl"
                      type="text"
                      value={formData.websiteUrl || ""}
                      onChange={handleInputChange}
                      placeholder="https://inaspaceworks.com"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none transition-all"
                    />
                    <p className="text-[10px] text-zinc-500">
                      Company website displayed as Globe icon on card.
                    </p>
                  </div>
                )}

                {enabledProfiles.googleBusiness && (
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="googleBusinessUrl"
                        className="text-xs font-medium text-zinc-300 flex items-center gap-1.5"
                      >
                        <GoogleBusinessIcon className="w-3.5 h-3.5" />
                        <span>Google Business Profile</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleProfile("googleBusiness", "googleBusinessUrl")}
                        className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      id="googleBusinessUrl"
                      name="googleBusinessUrl"
                      type="text"
                      value={formData.googleBusinessUrl || ""}
                      onChange={handleInputChange}
                      placeholder="https://maps.app.goo.gl/... or https://g.page/..."
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none transition-all"
                    />
                    <p className="text-[10px] text-zinc-500">
                      Google Business link (opens reviews/business profile when tapped).
                    </p>
                  </div>
                )}

                {enabledProfiles.linkedin && (
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="linkedinUrl"
                        className="text-xs font-medium text-zinc-300 flex items-center gap-1.5"
                      >
                        <LinkedInIcon className="w-3.5 h-3.5 text-[#0077b5]" />
                        <span>LinkedIn Profile</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleProfile("linkedin", "linkedinUrl")}
                        className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      id="linkedinUrl"
                      name="linkedinUrl"
                      type="text"
                      value={formData.linkedinUrl || ""}
                      onChange={handleInputChange}
                      placeholder="username or https://linkedin.com/in/username"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none transition-all"
                    />
                    <p className="text-[10px] text-zinc-500">
                      LinkedIn profile or company page.
                    </p>
                  </div>
                )}

                {enabledProfiles.instagram && (
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="instagramUrl"
                        className="text-xs font-medium text-zinc-300 flex items-center gap-1.5"
                      >
                        <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                        <span>Instagram Profile</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleProfile("instagram", "instagramUrl")}
                        className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      id="instagramUrl"
                      name="instagramUrl"
                      type="text"
                      value={formData.instagramUrl || ""}
                      onChange={handleInputChange}
                      placeholder="@username or https://instagram.com/username"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none transition-all"
                    />
                    <p className="text-[10px] text-zinc-500">
                      Instagram handle or profile link.
                    </p>
                  </div>
                )}

                {enabledProfiles.facebook && (
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="facebookUrl"
                        className="text-xs font-medium text-zinc-300 flex items-center gap-1.5"
                      >
                        <FacebookIcon className="w-3.5 h-3.5 text-[#1877f2]" />
                        <span>Facebook Profile</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleProfile("facebook", "facebookUrl")}
                        className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      id="facebookUrl"
                      name="facebookUrl"
                      type="text"
                      value={formData.facebookUrl || ""}
                      onChange={handleInputChange}
                      placeholder="username or https://facebook.com/username"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none transition-all"
                    />
                    <p className="text-[10px] text-zinc-500">
                      Facebook profile or public page.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60 text-center">
                <p className="text-xs text-zinc-400">
                  Select any profile above (e.g. <strong className="text-zinc-300">Website</strong>, <strong className="text-zinc-300">Google Business</strong>, or <strong className="text-zinc-300">LinkedIn</strong>) to display its icon link on your card.
                </p>
              </div>
            )}

            {/* Email Address */}
            <div className="pt-2 border-t border-zinc-800/80">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>Email Address (Optional)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                placeholder="name@inaspaceworks.com"
                className="w-full px-3 py-2 bg-zinc-900/90 border border-zinc-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none transition-all"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Displayed in contact details and enables one-tap email action.
              </p>
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
                  <span>
                    {editingSlug ? "Updating Digital Card..." : "Generating Digital Card..."}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {editingSlug ? "Save & Update Digital Card" : "Generate Digital Card"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            {editingSlug && (
              <p className="text-center text-[11px] text-zinc-400 mt-2">
                All changes will be updated at <span className="text-sky-400 font-mono">/card/{editingSlug}</span> and its existing QR code.
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
