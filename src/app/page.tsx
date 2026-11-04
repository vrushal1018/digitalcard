"use client";

import React, { useState } from "react";
import { CardFormData } from "@/types/card";
import { CardForm } from "@/components/card-builder/CardForm";
import { CardPreview } from "@/components/card-builder/CardPreview";

export default function HomePage() {
  const [formData, setFormData] = useState<CardFormData>({
    name: "",
    designation: "",
    companyName: "",
    phoneNumber: "",
    officeLocation: "",
    photoUrl: "",
    bgUrl: "",
  });

  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Intro hero text */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Design Your Interactive{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
            Digital Card
          </span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-3">
          Create a premium, responsive digital card with working Call, WhatsApp, Location, and Share actions.
        </p>
      </div>

      {/* Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <CardForm
            formData={formData}
            onChange={setFormData}
            onCardCreated={(slug) => setCreatedSlug(slug)}
          />
        </div>

        {/* Right Column: Sticky Live Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <CardPreview formData={formData} createdSlug={createdSlug} />
        </div>
      </div>
    </div>
  );
}
