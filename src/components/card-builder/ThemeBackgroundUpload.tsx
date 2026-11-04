"use client";

import React, { useRef, useState } from "react";
import { Palette, UploadCloud, X, Loader2, Sparkles, Check, Image as ImageIcon } from "lucide-react";
import { validateImageFile } from "@/lib/validation";

interface ThemeBackgroundUploadProps {
  currentBgUrl?: string;
  onBgUploaded: (url: string) => void;
  onBgRemoved: () => void;
}

// Curated high quality presets for one-tap selection
const PRESET_THEMES = [
  {
    id: "none",
    name: "Classic Obsidian",
    url: "",
    previewStyle: "bg-zinc-950 border-zinc-800",
  },
  {
    id: "midnight",
    name: "Midnight Azure",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    previewStyle: "bg-gradient-to-tr from-slate-900 via-sky-950 to-indigo-950",
  },
  {
    id: "violet",
    name: "Cosmic Violet",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    previewStyle: "bg-gradient-to-tr from-purple-950 via-indigo-950 to-slate-950",
  },
  {
    id: "emerald",
    name: "Emerald Forest",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    previewStyle: "bg-gradient-to-tr from-emerald-950 via-teal-950 to-slate-950",
  },
  {
    id: "monochrome",
    name: "Graphite Studio",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    previewStyle: "bg-gradient-to-tr from-zinc-900 via-zinc-800 to-stone-900",
  },
];

export function ThemeBackgroundUpload({
  currentBgUrl,
  onBgUploaded,
  onBgRemoved,
}: ThemeBackgroundUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || "Invalid image file");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const savedKey = typeof window !== "undefined" ? localStorage.getItem("inacard_imgbb_key") : "";
      if (savedKey) {
        formData.append("imgbbKey", savedKey);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload background theme image");
      }

      if (data.photoUrl) {
        onBgUploaded(data.photoUrl);
      }
    } catch (err) {
      console.error("Theme upload error:", err);
      setError((err as Error).message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isCustomUploaded = Boolean(
    currentBgUrl &&
      !PRESET_THEMES.some((t) => t.url && t.url === currentBgUrl)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Palette className="w-4 h-4 text-sky-400" />
          <span>Card Theme & Background</span>
          <span className="text-[11px] font-normal text-zinc-500">(Optional)</span>
        </label>
        {currentBgUrl && (
          <button
            type="button"
            onClick={onBgRemoved}
            className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors"
          >
            Reset to default
          </button>
        )}
      </div>

      {/* Preset Theme Selection Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {PRESET_THEMES.map((theme) => {
          const isSelected =
            (!currentBgUrl && theme.id === "none") ||
            (currentBgUrl && currentBgUrl === theme.url);

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                if (theme.url) {
                  onBgUploaded(theme.url);
                } else {
                  onBgRemoved();
                }
              }}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                isSelected
                  ? "border-sky-500 bg-sky-500/10 text-white ring-1 ring-sky-500/30"
                  : "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <div
                className={`w-full h-8 rounded-lg mb-1.5 border border-zinc-700/50 overflow-hidden relative ${theme.previewStyle}`}
              >
                {theme.url && (
                  <img
                    src={theme.url}
                    alt={theme.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-sky-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <span className="truncate w-full text-center text-[11px]">
                {theme.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Background Upload Zone */}
      <div className="pt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {isCustomUploaded && currentBgUrl ? (
          <div className="relative p-2.5 bg-zinc-900/80 border border-sky-500/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-10 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 flex-shrink-0">
                <img
                  src={currentBgUrl}
                  alt="Custom Theme Background"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  Custom Wallpaper Uploaded
                </p>
                <p className="text-[11px] text-sky-400">
                  Active card background
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-zinc-700"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={onBgRemoved}
                className="p-1 text-zinc-400 hover:text-rose-400 transition-colors"
                title="Remove custom background"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full py-2 px-3 border border-dashed border-zinc-800 hover:border-sky-500/50 bg-zinc-900/30 hover:bg-zinc-900/60 rounded-xl flex items-center justify-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                <span>Uploading custom background...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
                <span>Or upload your own custom background photo/wallpaper</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-400 animate-fade-in">{error}</p>
      )}
    </div>
  );
}

