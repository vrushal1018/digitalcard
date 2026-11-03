"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface CardActionButtonProps {
  icon: LucideIcon;
  label: string;
  href?: string | null;
  onClick?: () => void;
  isPrimary?: boolean;
  disabled?: boolean;
}

export function CardActionButton({
  icon: Icon,
  label,
  href,
  onClick,
  isPrimary = false,
  disabled = false,
}: CardActionButtonProps) {
  const baseClasses =
    "group relative flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 " +
    (disabled
      ? "opacity-40 cursor-not-allowed bg-zinc-900 border border-zinc-800 text-zinc-500"
      : isPrimary
      ? "bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/40 shadow-lg shadow-sky-500/10 hover:scale-105 active:scale-95"
      : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 hover:border-zinc-500 hover:scale-105 active:scale-95");

  const content = (
    <>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
      <span className="text-[11px] sm:text-xs font-medium mt-1.5 tracking-tight text-center">
        {label}
      </span>
    </>
  );

  if (href && !disabled) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        aria-label={label}
        className={baseClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={label}
      className={baseClasses}
    >
      {content}
    </button>
  );
}

