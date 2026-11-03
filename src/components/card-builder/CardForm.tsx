"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CardFormData, FormErrors } from "@/types/card";
import { PhotoUpload } from "./PhotoUpload";
import { validateCardForm } from "@/lib/validation";
import { Sparkles, Loader2, ArrowRight, Check, Copy, ExternalLink, AlertCircle } from "lucide-react";

interface CardFormProps {
  formData: CardFormData;
  onChange: (newData: CardFormData) => void;
}

export function CardForm({ formData, onChange }: CardFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...formData,
      [name]: value,
    });

    // Clear specific field error when typing
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

    // Client-side validation
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
    } catch (err) {
      console.error("Submission failed:", err);
      setErrors({
        general: "A network error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardFullUrl =
    createdSlug && typeof window !== "undefined"
      ? `${window.location.origin}/card/${createdSlug}`
      : createdSlug
      ? `/card/${createdSlug}`
      : "";

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
        <div className="p-6 bg-zinc-900/90 border border-emerald-500/30 rounded-2xl space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
            <Check className="w-5 h-5" />
            <span>Card Created Successfully!</span>
          </div>
          <p className="text-sm text-zinc-300">
            Your interactive digital business card is live and accessible at:
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
              <button
                type="button"
                onClick={() => router.push(`/card/${createdSlug}`)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-semibold rounded-lg transition-colors"
              >
                <span>View Card</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setCreatedSlug(null);
                onChange({
                  name: "",
                  designation: "",
                  companyName: "",
                  phoneNumber: "",
                  officeLocation: "",
                  photoUrl: "",
                });
              }}
              className="text-xs text-zinc-400 hover:text-white underline underline-offset-4"
            >
              Create another card
            </button>
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
              className={`w-full px-4 py-2.5 bg-zinc-900/90 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.name
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
                className={`w-full px-4 py-2.5 bg-zinc-900/90 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.designation
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
                className={`w-full px-4 py-2.5 bg-zinc-900/90 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.companyName
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
              className={`w-full px-4 py-2.5 bg-zinc-900/90 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.phoneNumber
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
              className={`w-full px-4 py-2.5 bg-zinc-900/90 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.officeLocation
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

          {/* Photo Upload Component */}
          <PhotoUpload
            currentPhotoUrl={formData.photoUrl}
            onPhotoUploaded={handlePhotoUploaded}
            onPhotoRemoved={handlePhotoRemoved}
            error={errors.photo}
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
