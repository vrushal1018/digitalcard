import React from "react";

export interface SocialIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Pure LinkedIn "in" glyph with no background shape/box
 */
export function LinkedInIcon({ className = "w-5 h-5 sm:w-6 sm:h-6", ...props }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="4.98" cy="3.5" r="2.5" />
      <path d="M2.5 8h5v14h-5z" />
      <path d="M12.5 8h-4.97v14h4.97v-7.5c0-4.17 5.5-4.5 5.5 0V22h5v-9.5c0-7.5-8-7.2-10.5-3.5V8z" />
    </svg>
  );
}

/**
 * Pure Instagram camera outline with no background fill
 */
export function InstagramIcon({ className = "w-5 h-5 sm:w-6 sm:h-6", ...props }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/**
 * Pure Facebook "f" letter glyph with no background circle/box
 */
export function FacebookIcon({ className = "w-5 h-5 sm:w-6 sm:h-6", ...props }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" />
    </svg>
  );
}
