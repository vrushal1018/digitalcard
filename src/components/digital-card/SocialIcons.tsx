import React from "react";

export interface SocialIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Clean official LinkedIn "in" vector glyph without any background box
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
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
    </svg>
  );
}

/**
 * Clean official Instagram camera outline without any background fill
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
 * Clean official Facebook "f" vector glyph without any background circle/box
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
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03.73-1.5 1.5-1.5h2V2.5c-.7-.1-2.1-.2-3.5-.2-3.5 0-5.5 2-5.5 5.5v2.7H6v4h2.5V24h5.5v-10.5z" />
    </svg>
  );
}
