"use client";

import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, X, Loader2, Key, Check, ExternalLink } from "lucide-react";
import { validateImageFile } from "@/lib/validation";

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUploaded: (url: string) => void;
  onPhotoRemoved: () => void;
  error?: string;
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
  const [imgbbKey, setImgbbKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  useEffect(() => {
    // Load saved ImgBB key from localStorage if present
    const saved = localStorage.getItem("inacard_imgbb_key");
    if (saved) {
      setImgbbKey(saved);
    }
  }, []);

  const handleSaveKey = (val: string) => {
    const clean = val.trim();
    setImgbbKey(clean);
    if (clean) {
      localStorage.setItem("inacard_imgbb_key", clean);
    } else {
      localStorage.removeItem("inacard_imgbb_key");
    }
  };

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
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      if (imgbbKey) {
        formData.append("imgbbKey", imgbbKey);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.needsImgbbKey) {
          setShowKeyInput(true);
        }
        throw new Error(data.error || "Failed to upload image to ImgBB");
      }

      if (data.photoUrl) {
        onPhotoUploaded(data.photoUrl);
      }
    } catch (err) {
      console.error("Upload error:", err);
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
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-300">
          Profile Photo <span className="text-rose-400">*</span>
        </label>
        <button
          type="button"
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="text-[11px] text-zinc-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
        >
          <Key className="w-3 h-3" />
          <span>{imgbbKey ? "ImgBB Key Configured" : "Configure ImgBB Key"}</span>
        </button>
      </div>

      {/* Optional ImgBB Key Input Box */}
      {showKeyInput && (
        <div className="p-3 bg-zinc-900 border border-sky-500/30 rounded-xl space-y-2 text-xs animate-fade-in">
          <div className="flex items-center justify-between text-zinc-300 font-medium">
            <span>ImgBB API Key</span>
            <a
              href="https://api.imgbb.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Get Free Key (5 sec)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={imgbbKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              placeholder="Paste your 32-character ImgBB API key..."
              className="flex-1 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-white outline-none focus:border-sky-500 text-xs"
            />
            {imgbbKey && (
              <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                <Check className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-500">
            Stored in your browser and used to upload photos to ImgBB CDN so they are permanently visible to anyone who opens your link.
          </p>
        </div>
      )}

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
              Photo Uploaded
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {currentPhotoUrl.startsWith("http")
                ? "Hosted on permanent CDN (ImgBB)"
                : "Ready to display on your digital card"}
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
                Uploading photo to ImgBB...
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
                JPG, PNG, or WebP (uploaded directly to ImgBB CDN)
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
