import { normalizePhoneForCall, normalizePhoneForWhatsApp, isValidPhoneNumber } from "./phone";

export function getCallLink(phone: string): string | null {
  if (!isValidPhoneNumber(phone)) return null;
  const normalized = normalizePhoneForCall(phone);
  return normalized ? `tel:${normalized}` : null;
}

export function getWhatsAppLink(phone: string): string | null {
  if (!isValidPhoneNumber(phone)) return null;
  const digits = normalizePhoneForWhatsApp(phone);
  return digits ? `https://wa.me/${digits}` : null;
}

export function getGoogleMapsLink(location: string): string | null {
  if (!location || !location.trim()) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.trim())}`;
}

export function getLinkedInLink(input?: string): string | null {
  if (!input || !input.trim()) return null;
  const val = input.trim();
  if (val.startsWith("http://") || val.startsWith("https://")) return val;
  const handle = val.replace(/^@/, "").replace(/^in\//, "");
  return `https://www.linkedin.com/in/${handle}`;
}

export function getInstagramLink(input?: string): string | null {
  if (!input || !input.trim()) return null;
  const val = input.trim();
  if (val.startsWith("http://") || val.startsWith("https://")) return val;
  const handle = val.replace(/^@/, "");
  return `https://www.instagram.com/${handle}/`;
}

export function getFacebookLink(input?: string): string | null {
  if (!input || !input.trim()) return null;
  const val = input.trim();
  if (val.startsWith("http://") || val.startsWith("https://")) return val;
  const handle = val.replace(/^@/, "");
  return `https://www.facebook.com/${handle}`;
}

export function getCardUrl(slug: string, baseUrl?: string): string {
  if (baseUrl) {
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}/card/${slug}`;
  }
  return `/card/${slug}`;
}

