"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { validateImageFile } from "@/lib/validation";

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUploaded: (url: string) => void;
  onPhotoRemoved: () => void;
  error?: string;
}

/**
 * Compresses and scales down the avatar image in the browser using HTML5 Canvas.
 * Creates a lightweight ~10-25KB avatar that renders instantly without lag or server dependencies.
 */
  function compressAvatar(file: File, maxDimension = 240, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > height) {
              if (width > maxDimension) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              }
            } else {
                if (height > maxDimension) {
                  width = Math.round((width * maxDimension) / height);
                  height = maxDimension;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                resolve(e.target?.result as string);
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL("image/jpeg", quality);
              resolve(dataUrl);
            };
            img.onerror = () => reject(new Error("Unable to read image"));
            img.src = e.target?.result as string;
          };
          reader.onerror = () => reject(new Error("Failed to read image file"));
          reader.readAsDataURL(file);
        });
  }

  export function PhotoUpload({
    currentPhotoUrl,
    onPhotoUploaded,
    onPhotoRemoved,
    error,
  }: PhotoUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLocalError(null);

      // Validate size and file type
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setLocalError(validation.error || "Invalid image");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      try {
        setIsProcessing(true);

        // 1. Instantly compress avatar client-side and set photo URL for immediate visual feedback
        const localAvatarUrl = await compressAvatar(file);
        onPhotoUploaded(localAvatarUrl);

        // 2. Upload to server in background (for Vercel Blob or local storage if available)
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

            if (response.ok) {
              const data = await response.json();
              // If server returned a persistent CDN/Blob URL, upgrade to it
              if (data.photoUrl && !data.photoUrl.startsWith("data:")) {
                onPhotoUploaded(data.photoUrl);
              }
            }
          } catch (uploadErr) {
            // Safe to ignore: localAvatarUrl is already active and displayed
            console.warn("Background upload sync skipped, using local avatar:", uploadErr);
          }
        } catch (err) {
          console.error("Photo processing error:", err);
          setLocalError((err as Error).message || "An error occurred while loading photo");
        } finally {
          setIsProcessing(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };

      const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPhotoRemoved();
        setLocalError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      };

      const displayError = error || localError;

      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">
            Profile Photo <span className="text-rose-400">*</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            id="photo-upload-input"
          />

          {currentPhotoUrl ? (
            <div className="flex items-center gap-4 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-700">
                <img
                  src={currentPhotoUrl}
                  alt="Uploaded profile preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">
                  Photo selected
                </p>
                <p className="text-xs text-zinc-500">
                  Ready to display on your digital card
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors border border-zinc-700 font-medium"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Remove photo"
                  className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${displayError
                  ? "border-rose-500/50 bg-rose-500/5 hover:border-rose-500"
                  : "border-zinc-800 hover:border-sky-500/50 hover:bg-zinc-900/50 bg-zinc-900/30"
                }`}
            >
                {
                  isProcessing?(
            <div className = "flex flex-col items-center gap-2" >
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              <span className="text-sm font-medium text-zinc-300">
                Processing photo...
              </span>
            </div>
          ) : (
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-zinc-800/80 rounded-full text-zinc-400 mb-3 group-hover:text-sky-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-zinc-200">
              Click to upload profile photo
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              JPG, PNG, or WebP (max 5MB)
            </p>
          </div>
          )}
        </div>
      )
    }

    {
      displayError && (
        <p className="text-xs text-rose-400 font-medium">{displayError}</p>
      )
    }
    </div >
  );
  }
