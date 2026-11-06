"use client";

import React, { useState, useEffect } from "react";
import { CardFormData, DigitalCard } from "@/types/card";
import { CardForm } from "@/components/card-builder/CardForm";
import { CardPreview } from "@/components/card-builder/CardPreview";
import { SavedCardsList } from "@/components/card-builder/SavedCardsList";

export default function HomePage() {
  const [formData, setFormData] = useState<CardFormData>({
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

  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check URL query parameters for ?edit=<slug>
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const editSlug = params.get("edit");
    if (editSlug) {
      fetch(`/api/cards?slug=${encodeURIComponent(editSlug)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.card) {
            handleSelectCardToEdit(data.card);
          }
        })
        .catch((err) => console.error("Failed to load card to edit", err));
    }
  }, []);

  const handleSelectCardToEdit = (card: DigitalCard) => {
    setFormData({
      name: card.name || "",
      designation: card.designation || "",
      companyName: card.companyName || "",
      phoneNumber: card.phoneNumber || "",
      officeLocation: card.officeLocation || "",
      photoUrl: card.photoUrl || "",
      bgUrl: card.bgUrl || "",
      bgFit: card.bgFit || "contain",
      linkedinUrl: card.linkedinUrl || "",
      instagramUrl: card.instagramUrl || "",
      facebookUrl: card.facebookUrl || "",
    });
    setEditingSlug(card.slug);
    setCreatedSlug(null);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCancelEdit = () => {
    setEditingSlug(null);
    setCreatedSlug(null);
    setFormData({
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
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Intro hero text */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Design Your Interactive{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
            Digital Card
          </span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-3">
          Create and manage your interactive digital cards with working Call, WhatsApp, Location, and Share actions.
        </p>
      </div>

      {/* Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <CardForm
            formData={formData}
            onChange={setFormData}
            editingSlug={editingSlug}
            onCancelEdit={handleCancelEdit}
            onCardCreated={(slug) => {
              setCreatedSlug(slug);
              setEditingSlug(slug);
              setRefreshTrigger((prev) => prev + 1);
            }}
            onCardUpdated={(slug) => {
              setCreatedSlug(slug);
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        </div>

        {/* Right Column: Sticky Live Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <CardPreview
            formData={formData}
            createdSlug={createdSlug || editingSlug}
          />
        </div>
      </div>

      {/* Saved Cards Section */}
      <SavedCardsList
        onSelectCard={handleSelectCardToEdit}
        currentSlug={editingSlug}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}
