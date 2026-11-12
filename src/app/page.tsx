"use client";

import React, { useState, useEffect } from "react";
import { CardFormData, DigitalCard } from "@/types/card";
import { CardForm } from "@/components/card-builder/CardForm";
import { CardPreview } from "@/components/card-builder/CardPreview";
import { SavedCardsList } from "@/components/card-builder/SavedCardsList";
import { AdminLockScreen } from "@/components/card-builder/AdminLockScreen";
import { Lock } from "lucide-react";

const EXPECTED_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "1018";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
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
    email: "",
    websiteUrl: "",
    googleBusinessUrl: "",
  });

  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check authentication & URL query parameters
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const pinParam = params.get("pin") || params.get("admin");

    // If matching PIN provided in URL, auto-authenticate and save session
    if (pinParam && pinParam.trim() === EXPECTED_PIN.trim()) {
      localStorage.setItem("inacard_admin_auth", "true");
      setIsAuthenticated(true);
    } else {
      const savedAuth = localStorage.getItem("inacard_admin_auth");
      setIsAuthenticated(savedAuth === "true");
    }

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
      email: card.email || "",
      websiteUrl: card.websiteUrl || "",
      googleBusinessUrl: card.googleBusinessUrl || "",
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
      email: "",
      websiteUrl: "",
      googleBusinessUrl: "",
    });
  };

  const handleDeleteCard = (slug: string) => {
    if (editingSlug && editingSlug.toLowerCase() === slug.toLowerCase()) {
      handleCancelEdit();
    }
    if (createdSlug && createdSlug.toLowerCase() === slug.toLowerCase()) {
      setCreatedSlug(null);
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isAuthenticated === null) {
    return (
      <div className="bg-[#07080a] text-zinc-100 min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-[#07080a] text-zinc-100 min-h-screen">
        <AdminLockScreen
          onUnlock={() => setIsAuthenticated(true)}
          expectedPin={EXPECTED_PIN}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#07080a] text-zinc-100 min-h-screen dark flex flex-col">
      <header className="border-b border-zinc-800/60 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold tracking-tight text-white select-none">
            <span className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center text-xs">
              🪪
            </span>
            <span className="text-sm sm:text-base">Digi</span>
          </div>
          <span className="text-xs text-zinc-400">Digital Business Card</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Admin Status Pill */}
      <div className="flex items-center justify-end mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-zinc-400 backdrop-blur-sm shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-zinc-300">Admin Mode Active</span>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("inacard_admin_auth");
              }
              setIsAuthenticated(false);
            }}
            className="ml-2 pl-2 border-l border-zinc-800 text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
            title="Lock Admin Portal"
          >
            <Lock className="w-3 h-3" />
            <span>Lock</span>
          </button>
        </div>
      </div>

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
        onDeleteCard={handleDeleteCard}
        currentSlug={editingSlug}
        refreshTrigger={refreshTrigger}
      />
    </div>
    </div>
  );
}
