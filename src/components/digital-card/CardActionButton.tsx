"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface CardActionButtonProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
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
  disabled = false,
}: CardActionButtonProps) {
  const content = (
    <div className="flex flex-col items-center group w-full cursor-pointer select-none">
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
          disabled
            ? "bg-zinc-100 text-zinc-400 opacity-40 cursor-not-allowed"
            : "bg-[#e8f3fa] text-[#1886cf] group-hover:bg-[#d4ecfa] group-hover:scale-105 active:scale-95 shadow-sm"
        }`}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
      </div>
      <span className="text-[11px] sm:text-xs font-semibold text-zinc-800 mt-1.5 text-center transition-colors group-hover:text-[#1886cf]">
        {label}
      </span>
    </div>
  );

  if (href && !disabled) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        aria-label={label}
        title={label}
        className="outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-xl"
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
      title={label}
      className="outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-xl"
    >
      {content}
    </button>
  );
}


