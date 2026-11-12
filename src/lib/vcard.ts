export interface VCardData {
  name: string;
  designation?: string;
  companyName?: string;
  phoneNumber: string;
  officeLocation?: string;
  photoUrl?: string;
  cardUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  email?: string;
  websiteUrl?: string;
  googleBusinessUrl?: string;
}

/**
 * Generates RFC 2426 compliant vCard 3.0 text format
 * Compatible with iOS Contacts, Android Contacts, Google Contacts, Outlook & macOS.
 */
export function generateVCard(data: VCardData): string {
  const nameParts = data.name.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.name.trim()}`,
    `N:${lastName};${firstName};;;`,
  ];

  if (data.companyName?.trim()) {
    lines.push(`ORG:${data.companyName.trim()}`);
  }

  if (data.designation?.trim()) {
    lines.push(`TITLE:${data.designation.trim()}`);
  }

  if (data.phoneNumber?.trim()) {
    lines.push(`TEL;TYPE=CELL,VOICE:${data.phoneNumber.trim()}`);
  }

  if (data.officeLocation?.trim()) {
    lines.push(`ADR;TYPE=WORK:;;${data.officeLocation.trim()};;;;`);
  }

  if (data.websiteUrl?.trim()) {
    const cleanWeb = data.websiteUrl.trim().startsWith("http")
      ? data.websiteUrl.trim()
      : `https://${data.websiteUrl.trim()}`;
    lines.push(`URL;TYPE=WORK:${cleanWeb}`);
  }

  if (data.cardUrl?.trim()) {
    lines.push(`URL:${data.cardUrl.trim()}`);
  }

  if (data.linkedinUrl?.trim()) {
    lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${data.linkedinUrl.trim()}`);
  }

  if (data.instagramUrl?.trim()) {
    lines.push(`X-SOCIALPROFILE;TYPE=instagram:${data.instagramUrl.trim()}`);
  }

  if (data.facebookUrl?.trim()) {
    lines.push(`X-SOCIALPROFILE;TYPE=facebook:${data.facebookUrl.trim()}`);
  }

  if (data.googleBusinessUrl?.trim()) {
    lines.push(`X-SOCIALPROFILE;TYPE=googlebusiness:${data.googleBusinessUrl.trim()}`);
  }

  if (data.email?.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${data.email.trim()}`);
  }

  if (data.photoUrl?.startsWith("http")) {
    lines.push(`PHOTO;VALUE=URI:${data.photoUrl.trim()}`);
  }

  lines.push("END:VCARD");

  return lines.join("\r\n");
}

/**
 * Detects whether the current client is running Android
 */
export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Android/i.test(ua);
}

/**
 * Detects in-app webview browsers (e.g. Instagram, WhatsApp, LinkedIn, Facebook)
 * which may have restricted intent handling.
 */
export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram|WhatsApp|LinkedInApp|Line|MicroMessenger/i.test(ua);
}

/**
 * Constructs an Android Intent URI that directly opens the native Contacts / People app
 * to the "New Contact" creation screen with pre-filled details.
 * Prevents Android Chrome from dumping a .vcf file into the Downloads folder.
 */
export function buildAndroidContactIntent(data: VCardData, fallbackUrl?: string): string {
  const parts: string[] = [
    "action=android.intent.action.INSERT",
    "type=vnd.android.cursor.dir/contact",
  ];

  if (data.name?.trim()) {
    parts.push(`S.name=${encodeURIComponent(data.name.trim())}`);
  }
  if (data.phoneNumber?.trim()) {
    parts.push(`S.phone=${encodeURIComponent(data.phoneNumber.trim())}`);
  }
  if (data.companyName?.trim()) {
    parts.push(`S.company=${encodeURIComponent(data.companyName.trim())}`);
  }
  if (data.designation?.trim()) {
    parts.push(`S.job_title=${encodeURIComponent(data.designation.trim())}`);
  }
  if (data.email?.trim()) {
    parts.push(`S.email=${encodeURIComponent(data.email.trim())}`);
  }
  if (data.officeLocation?.trim()) {
    parts.push(`S.postal=${encodeURIComponent(data.officeLocation.trim())}`);
  }

  const notesList: string[] = [];
  if (data.websiteUrl?.trim()) notesList.push(`Website: ${data.websiteUrl.trim()}`);
  if (data.cardUrl?.trim()) notesList.push(`Digital Card: ${data.cardUrl.trim()}`);
  if (data.googleBusinessUrl?.trim()) notesList.push(`Google Business: ${data.googleBusinessUrl.trim()}`);
  if (data.linkedinUrl?.trim()) notesList.push(`LinkedIn: ${data.linkedinUrl.trim()}`);
  if (data.instagramUrl?.trim()) notesList.push(`Instagram: ${data.instagramUrl.trim()}`);
  if (data.facebookUrl?.trim()) notesList.push(`Facebook: ${data.facebookUrl.trim()}`);

  if (notesList.length > 0) {
    parts.push(`S.notes=${encodeURIComponent(notesList.join("\n"))}`);
  }

  if (fallbackUrl?.trim()) {
    parts.push(`S.browser_fallback_url=${encodeURIComponent(fallbackUrl.trim())}`);
  }

  parts.push("end");
  return `intent://#Intent;${parts.join(";")};`;
}

/**
 * Client-side download trigger for .vcf contact card
 */
export function downloadVCard(data: VCardData) {
  if (typeof window === "undefined") return;

  const vcardText = generateVCard(data);
  const blob = new Blob([vcardText], { type: "text/x-vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeFilename =
    data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "contact";
  link.setAttribute("download", `${safeFilename}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Universal save contact handler.
 * On Android (Chrome / Samsung Internet): opens native Contacts app directly.
 * On iOS / Desktop: triggers standard .vcf import.
 */
export function saveContact(data: VCardData, options?: { fallbackUrl?: string }) {
  if (typeof window === "undefined") return;

  if (isAndroidDevice() && !isInAppBrowser()) {
    const intentUrl = buildAndroidContactIntent(data, options?.fallbackUrl);
    window.location.href = intentUrl;
    return;
  }

  downloadVCard(data);
}

