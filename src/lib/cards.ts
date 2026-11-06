import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { DigitalCard, CardFormData } from "../types/card";
import { normalizePhoneForCall } from "./phone";

declare global {
  var __INACARD_STORE__: DigitalCard[] | undefined;
  var __INACARD_DELETED__: Set<string> | undefined;
}

if (!globalThis.__INACARD_STORE__) {
  globalThis.__INACARD_STORE__ = [];
}
if (!globalThis.__INACARD_DELETED__) {
  globalThis.__INACARD_DELETED__ = new Set<string>();
}

const isTestEnv = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);
const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_CARDS_FILE = isTestEnv
  ? path.join(LOCAL_DATA_DIR, "cards.test.json")
  : path.join(LOCAL_DATA_DIR, "cards.json");
const LOCAL_DELETED_FILE = isTestEnv
  ? path.join(LOCAL_DATA_DIR, "deleted.test.json")
  : path.join(LOCAL_DATA_DIR, "deleted.json");

const TMP_DATA_DIR = path.join("/tmp", "inacard");
const TMP_CARDS_FILE = path.join(TMP_DATA_DIR, "cards.json");
const TMP_DELETED_FILE = path.join(TMP_DATA_DIR, "deleted.json");

export interface CompactCardData {
  n: string; // name
  d: string; // designation
  c: string; // companyName
  p: string; // phoneNumber
  l: string; // officeLocation
  u?: string; // photoUrl (ImgBB permanent CDN link)
  b?: string; // bgUrl (theme background image)
  f?: "contain" | "cover"; // bgFit (contain or cover)
  li?: string; // linkedin
  ig?: string; // instagram
  fb?: string; // facebook
  s: string; // slug
}

/**
 * Encodes card data into a lightweight token.
 * With ImgBB, photoUrl is a short CDN link (e.g. https://i.ibb.co/...) so it fits easily under ~180 bytes!
 */
export function encodeCardToken(card: DigitalCard): string {
  const compact: CompactCardData = {
    n: card.name,
    d: card.designation,
    c: card.companyName,
    p: card.phoneNumber,
    l: card.officeLocation,
    s: card.slug,
  };
  if (card.photoUrl && card.photoUrl.startsWith("http")) {
    compact.u = card.photoUrl;
  }
  if (card.bgUrl && (card.bgUrl.startsWith("http") || card.bgUrl.startsWith("/"))) {
    compact.b = card.bgUrl;
  }
  if (card.bgFit) {
    compact.f = card.bgFit;
  }
  if (card.linkedinUrl) {
    compact.li = card.linkedinUrl;
  }
  if (card.instagramUrl) {
    compact.ig = card.instagramUrl;
  }
  if (card.facebookUrl) {
    compact.fb = card.facebookUrl;
  }
  return Buffer.from(JSON.stringify(compact)).toString("base64url");
}

export function decodeCardToken(token: string): DigitalCard | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw) as CompactCardData;
    if (!parsed.n || !parsed.s) return null;
    return {
      id: crypto.randomUUID(),
      slug: parsed.s,
      name: parsed.n,
      designation: parsed.d || "",
      companyName: parsed.c || "",
      phoneNumber: parsed.p || "",
      officeLocation: parsed.l || "",
      photoUrl: parsed.u || "",
      bgUrl: parsed.b || "",
      bgFit: parsed.f || (parsed.b ? "contain" : undefined),
      linkedinUrl: parsed.li || "",
      instagramUrl: parsed.ig || "",
      facebookUrl: parsed.fb || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

async function readCardsFromFile(filePath: string): Promise<DigitalCard[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as DigitalCard[];
  } catch {
    return [];
  }
}

async function writeCardsToFile(dirPath: string, filePath: string, cards: DigitalCard[]): Promise<boolean> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    const tempFile = `${filePath}.tmp.${Date.now()}`;
    await fs.writeFile(tempFile, JSON.stringify(cards, null, 2), "utf-8");
    await fs.rename(tempFile, filePath);
    return true;
  } catch {
    return false;
  }
}

export function generateSlug(name: string): string {
  const baseName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

  const randomSuffix = crypto.randomBytes(4).toString("hex");
  return baseName ? `${baseName}-${randomSuffix}` : `card-${randomSuffix}`;
}

async function readDeletedSlugsFromFile(filePath: string): Promise<string[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

async function writeDeletedSlugsToFile(
  dirPath: string,
  filePath: string,
  list: string[]
): Promise<boolean> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(list), "utf-8");
    return true;
  } catch {
    return false;
  }
}

export async function getDeletedSlugs(): Promise<Set<string>> {
  const memoryDeleted = globalThis.__INACARD_DELETED__ || new Set<string>();
  const localDeleted = await readDeletedSlugsFromFile(LOCAL_DELETED_FILE);
  const tmpDeleted = await readDeletedSlugsFromFile(TMP_DELETED_FILE);

  for (const s of localDeleted) memoryDeleted.add(s.toLowerCase());
  for (const s of tmpDeleted) memoryDeleted.add(s.toLowerCase());

  globalThis.__INACARD_DELETED__ = memoryDeleted;
  return memoryDeleted;
}

export async function getAllCards(): Promise<DigitalCard[]> {
  const deletedSlugs = await getDeletedSlugs();
  const memoryCards = globalThis.__INACARD_STORE__ || [];
  const localCards = await readCardsFromFile(LOCAL_CARDS_FILE);
  const tmpCards = await readCardsFromFile(TMP_CARDS_FILE);

  const map = new Map<string, DigitalCard>();
  for (const c of localCards) {
    if (c.slug && !deletedSlugs.has(c.slug.toLowerCase())) {
      map.set(c.id, c);
    }
  }
  for (const c of tmpCards) {
    if (c.slug && !deletedSlugs.has(c.slug.toLowerCase())) {
      map.set(c.id, c);
    }
  }
  for (const c of memoryCards) {
    if (c.slug && !deletedSlugs.has(c.slug.toLowerCase())) {
      map.set(c.id, c);
    }
  }

  const all = Array.from(map.values()).sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });
  globalThis.__INACARD_STORE__ = all;
  return all;
}

export async function getCardBySlug(slug: string): Promise<DigitalCard | null> {
  if (!slug) return null;
  const normalizedSlug = slug.toLowerCase().trim();
  const deletedSlugs = await getDeletedSlugs();
  if (deletedSlugs.has(normalizedSlug)) {
    return null;
  }

  const cards = await getAllCards();
  const found = cards.find((c) => c.slug.toLowerCase() === normalizedSlug);
  return found || null;
}

export async function saveCardToStorage(card: DigitalCard): Promise<void> {
  const cards = await getAllCards();
  const existingIndex = cards.findIndex(
    (c) => c.slug.toLowerCase() === card.slug.toLowerCase() || c.id === card.id
  );

  if (existingIndex >= 0) {
    cards[existingIndex] = {
      ...cards[existingIndex],
      ...card,
      updatedAt: new Date().toISOString(),
    };
  } else {
    cards.push(card);
  }

  globalThis.__INACARD_STORE__ = cards;
  const localSuccess = await writeCardsToFile(LOCAL_DATA_DIR, LOCAL_CARDS_FILE, cards);
  if (!localSuccess) {
    await writeCardsToFile(TMP_DATA_DIR, TMP_CARDS_FILE, cards);
  }
}

export async function updateCard(
  slug: string,
  formData: CardFormData
): Promise<DigitalCard | null> {
  if (!slug) return null;
  const normalizedSlug = slug.toLowerCase().trim();
  const cards = await getAllCards();

  const index = cards.findIndex((c) => c.slug.toLowerCase() === normalizedSlug);
  if (index === -1) {
    return null;
  }

  const existing = cards[index];
  const now = new Date().toISOString();

  const updatedCard: DigitalCard = {
    ...existing,
    name: formData.name.trim(),
    designation: formData.designation.trim(),
    companyName: formData.companyName.trim(),
    phoneNumber: normalizePhoneForCall(formData.phoneNumber.trim()),
    officeLocation: formData.officeLocation.trim(),
    photoUrl: formData.photoUrl.trim(),
    bgUrl: (formData.bgUrl || "").trim(),
    bgFit: formData.bgFit || "contain",
    linkedinUrl: (formData.linkedinUrl || "").trim(),
    instagramUrl: (formData.instagramUrl || "").trim(),
    facebookUrl: (formData.facebookUrl || "").trim(),
    updatedAt: now,
  };

  cards[index] = updatedCard;
  globalThis.__INACARD_STORE__ = cards;

  const localSuccess = await writeCardsToFile(LOCAL_DATA_DIR, LOCAL_CARDS_FILE, cards);
  if (!localSuccess) {
    await writeCardsToFile(TMP_DATA_DIR, TMP_CARDS_FILE, cards);
  }

  return updatedCard;
}

export async function createCard(formData: CardFormData): Promise<DigitalCard> {
  let slug = generateSlug(formData.name);
  const now = new Date().toISOString();

  const newCard: DigitalCard = {
    id: crypto.randomUUID(),
    slug,
    name: formData.name.trim(),
    designation: formData.designation.trim(),
    companyName: formData.companyName.trim(),
    phoneNumber: normalizePhoneForCall(formData.phoneNumber.trim()),
    officeLocation: formData.officeLocation.trim(),
    photoUrl: formData.photoUrl.trim(),
    bgUrl: (formData.bgUrl || "").trim(),
    bgFit: formData.bgFit || "contain",
    linkedinUrl: (formData.linkedinUrl || "").trim(),
    instagramUrl: (formData.instagramUrl || "").trim(),
    facebookUrl: (formData.facebookUrl || "").trim(),
    createdAt: now,
    updatedAt: now,
  };

  const cards = await getAllCards();
  cards.push(newCard);
  globalThis.__INACARD_STORE__ = cards;

  const localSuccess = await writeCardsToFile(LOCAL_DATA_DIR, LOCAL_CARDS_FILE, cards);
  if (!localSuccess) {
    await writeCardsToFile(TMP_DATA_DIR, TMP_CARDS_FILE, cards);
  }

  return newCard;
}

export async function deleteCard(slug: string): Promise<boolean> {
  if (!slug) return false;
  const normalizedSlug = slug.toLowerCase().trim();
  const cards = await getAllCards();

  const exists = cards.some((c) => c.slug.toLowerCase() === normalizedSlug);
  if (!exists) {
    return false;
  }

  // 1. Mark in deletedSlugs so it can never be resurrected
  const deletedSlugs = await getDeletedSlugs();
  deletedSlugs.add(normalizedSlug);
  globalThis.__INACARD_DELETED__ = deletedSlugs;

  const deletedList = Array.from(deletedSlugs);
  await writeDeletedSlugsToFile(LOCAL_DATA_DIR, LOCAL_DELETED_FILE, deletedList);
  await writeDeletedSlugsToFile(TMP_DATA_DIR, TMP_DELETED_FILE, deletedList);

  // 2. Remove from active cards
  const filtered = cards.filter((c) => c.slug.toLowerCase() !== normalizedSlug);
  globalThis.__INACARD_STORE__ = filtered;

  await writeCardsToFile(LOCAL_DATA_DIR, LOCAL_CARDS_FILE, filtered);
  await writeCardsToFile(TMP_DATA_DIR, TMP_CARDS_FILE, filtered);

  return true;
}
