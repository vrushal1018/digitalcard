"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react";

interface AdminLockScreenProps {
  onUnlock: () => void;
  expectedPin: string;
}

export function AdminLockScreen({ onUnlock, expectedPin }: AdminLockScreenProps) {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const cleanInput = pin.trim();
    const cleanExpected = (expectedPin || "1018").trim();

    if (cleanInput === cleanExpected) {
      if (typeof window !== "undefined") {
        localStorage.setItem("inacard_admin_auth", "true");
      }
      onUnlock();
    } else {
      setError("Incorrect Admin PIN. Access denied.");
      setPin("");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md mx-auto">
        {/* Glow backdrop */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0d0f14] border border-zinc-800/90 shadow-2xl p-7 sm:p-9 backdrop-blur-sm">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-sky-500/15 blur-3xl pointer-events-none rounded-full" />

          {/* Header */}
          <div className="text-center relative z-10">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-4 text-sky-400 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              Card creation and editing is restricted. Enter your Admin PIN to manage business cards.
            </p>
          </div>

          {/* PIN Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 relative z-10">
            <div>
              <label htmlFor="adminPin" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Admin Passcode / PIN
              </label>
              <div className="relative">
                <input
                  id="adminPin"
                  type={showPin ? "text" : "password"}
                  autoFocus
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter PIN"
                  className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 rounded-xl text-white text-center tracking-widest text-lg font-mono focus:outline-none transition-all placeholder:text-zinc-600 placeholder:text-sm placeholder:tracking-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                  title={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!pin.trim() || isSubmitting}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.99] text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Unlock Card Creator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note & link to live card */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center relative z-10 space-y-3">
            <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Public card links remain active and shareable</span>
            </p>

            <Link
              href="/card/jaisalil-shilewant"
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>View Ina SpaceWorks Digital Card</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
