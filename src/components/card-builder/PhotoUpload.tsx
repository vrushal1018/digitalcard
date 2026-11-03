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
 * Resizes an image in the browser using HTML5 Canvas to keep profile photos
 * fast, lightweight (~20-40KB), and fully compatible with serverless environments.
 */
function compressImageClientSide(file: File, maxWidth = 360, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
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
      img.onerror = () => reject(new Error("Failed to load image for processing"));
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
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    // Client-side validation
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setLocalError(validation.error || "Invalid image");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsUploading(true);

      // Compress client-side first for instant speed and low bandwidth
      let clientCompressedUrl = "";
      try {
        clientCompressedUrl = await compressImageClientSide(file);
      } catch (compErr) {
        console.warn("Client compression skipped:", compErr);
      }

      // Try uploading to /api/upload
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.photoUrl) {
          onPhotoUploaded(data.photoUrl);
          return;
        }
      } catch (netErr) {
        console.warn("API upload failed, using client data URL fallback:", netErr);
      }

      // Fallback: If server upload had any issue or is read-only serverless
      if (clientCompressedUrl) {
        onPhotoUploaded(clientCompressedUrl);
      } else {
        throw new Error("Unable to process the photo. Please try a different image.");
      }
    } catch (err) {
      console.error("Photo processing error:", err);
      setLocalError((err as Error).message || "An error occurred while uploading");
    } finally {
      setIsUploading(false);
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
              disabled={isUploading}
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
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
            displayError
              ? "border-rose-500/50 bg-rose-500/5 hover:border-rose-500"
              : "border-zinc-800 hover:border-sky-500/50 hover:bg-zinc-900/50 bg-zinc-900/30"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
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
      )}

      {displayError && (
        <p className="text-xs text-rose-400 font-medium">{displayError}</p>
      )}
    </div>
  );
}
