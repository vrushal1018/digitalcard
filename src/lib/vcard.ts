export interface VCardData {
  name: string;
  designation?: string;
  companyName?: string;
  phoneNumber: string;
  officeLocation?: string;
  photoUrl?: string;
  cardUrl?: string;
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

  if (data.cardUrl?.trim()) {
    lines.push(`URL:${data.cardUrl.trim()}`);
  }

  if (data.photoUrl?.startsWith("http")) {
    lines.push(`PHOTO;VALUE=URI:${data.photoUrl.trim()}`);
  }

  lines.push("END:VCARD");

  return lines.join("\r\n");
}

/**
 * Client-side download trigger for .vcf contact card
 */
export function downloadVCard(data: VCardData) {
  if (typeof window === "undefined") return;

  const vcardText = generateVCard(data);
  const blob = new Blob([vcardText], { type: "text/vcard;charset=utf-8" });
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

