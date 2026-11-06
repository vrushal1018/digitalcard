"use client";

import React, { useState, useEffect } from "react";
import { DigitalCard } from "@/types/card";
import {
  CreditCard,
  Edit3,
  ExternalLink,
  Copy,
  Check,
  User,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface SavedCardsListProps {
  onSelectCard: (card: DigitalCard) => void;
  onDeleteCard?: (slug: string) => void;
  currentSlug?: string | null;
  refreshTrigger?: number;
}

export function SavedCardsList({
  onSelectCard,
  onDeleteCard,
  currentSlug,
  refreshTrigger = 0,
}: SavedCardsListProps) {
  const [cards, setCards] = useState<DigitalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [confirmingSlug, setConfirmingSlug] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCards() {
      try {
        setLoading(true);
        // 1. Load from API
        const res = await fetch("/api/cards");
        let serverCards: DigitalCard[] = [];
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.cards)) {
            serverCards = data.cards;
          }
        }

        // 2. Load from localStorage
        let localCards: DigitalCard[] = [];
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("inacard_saved_cards");
            if (raw) {
              localCards = JSON.parse(raw);
            }
          } catch (e) {
            console.error("Failed to parse local cards", e);
          }
        }

        // 3. Merge unique by slug
        const map = new Map<string, DigitalCard>();
        for (const c of serverCards) {
          if (c.slug) map.set(c.slug.toLowerCase(), c);
        }
        for (const c of localCards) {
          if (c.slug && !map.has(c.slug.toLowerCase())) {
            map.set(c.slug.toLowerCase(), c);
          }
        }

        const merged = Array.from(map.values()).sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        if (isMounted) {
          setCards(merged);
        }
      } catch (err) {
        console.error("Failed to load saved cards", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCards();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const handleCopyLink = async (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const url = `${origin}/card/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleDeleteCard = async (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDeletingSlug(slug);
      const res = await fetch(`/api/cards?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove from local storage
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("inacard_saved_cards");
            if (raw) {
              const list: DigitalCard[] = JSON.parse(raw);
              const filtered = list.filter(
                (item) => item.slug.toLowerCase() !== slug.toLowerCase()
              );
              localStorage.setItem("inacard_saved_cards", JSON.stringify(filtered));
            }
          } catch (err) {
            console.error("Failed to remove from localStorage", err);
          }
        }

        // Remove from local state
        setCards((prev) =>
          prev.filter((item) => item.slug.toLowerCase() !== slug.toLowerCase())
        );
        setConfirmingSlug(null);
        if (onDeleteCard) {
          onDeleteCard(slug);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete card.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete card. Please try again.");
    } finally {
      setDeletingSlug(null);
    }
  };

  if (loading && cards.length === 0) {
    return null;
  }

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 sm:mt-12 bg-zinc-950/70 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Your Saved Digital Cards
            </h3>
            <p className="text-xs text-zinc-400">
              Select any card to edit its information or copy its shareable link.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 self-start sm:self-auto">
          {cards.length} {cards.length === 1 ? "Card" : "Cards"} Total
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {cards.map((c) => {
          const isCurrent = currentSlug && c.slug.toLowerCase() === currentSlug.toLowerCase();
          return (
            <div
              key={c.slug}
              onClick={() => onSelectCard(c)}
              className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                isCurrent
                  ? "bg-sky-950/20 border-sky-500/60 shadow-lg shadow-sky-500/10"
                  : "bg-zinc-900/50 hover:bg-zinc-900/90 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Photo / Avatar */}
                <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {c.photoUrl ? (
                    <img
                      src={c.photoUrl}
                      alt={c.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <User className="w-5 h-5 text-zinc-600" />
                  )}
                </div>

                {/* Identity Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                      {c.name || "Untitled Card"}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        Editing
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {c.designation || "No Designation"}
                    {c.companyName ? ` • ${c.companyName}` : ""}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5 font-mono">
                    /card/{c.slug}
                  </p>
                </div>
              </div>

              {/* Action buttons or Delete confirmation bar */}
              {confirmingSlug === c.slug ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs animate-fade-in"
                >
                  <div className="flex items-center gap-1.5 text-rose-300 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>Delete this card permanently?</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={deletingSlug === c.slug}
                      onClick={(e) => handleDeleteCard(c.slug, e)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {deletingSlug === c.slug ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <span>Yes, Delete</span>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={deletingSlug === c.slug}
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmingSlug(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCard(c);
                    }}
                    className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isCurrent ? "Currently Editing" : "Edit Details"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(c.slug, e)}
                      className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                      title="Copy Card Link"
                    >
                      {copiedSlug === c.slug ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <a
                      href={`/card/${c.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 p-1.5 px-2.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                      title="Open Live Card"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmingSlug(c.slug);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Delete Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

