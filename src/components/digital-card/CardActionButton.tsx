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
  isPrimary = false,
  disabled = false,
}: CardActionButtonProps) {
  const baseClasses =
    "group relative flex items-center justify-center p-2.5 sm:p-3 rounded-full transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 " +
    (disabled
      ? "opacity-35 cursor-not-allowed text-zinc-500"
      : isPrimary
      ? "text-sky-400 hover:text-sky-300 hover:scale-115 active:scale-95 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]"
      : "text-white hover:text-sky-400 hover:scale-115 active:scale-95");

  const content = (
    <Icon className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" />
  );

  if (href && !disabled) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        aria-label={label}
        title={label}
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
      title={label}
      className={baseClasses}
    >
      {content}
    </button>
  );
}

