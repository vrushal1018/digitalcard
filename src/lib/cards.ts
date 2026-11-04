import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { DigitalCard, CardFormData } from "../types/card";
import { normalizePhoneForCall } from "./phone";

declare global {
  var __INACARD_STORE__: DigitalCard[] | undefined;
}

if (!globalThis.__INACARD_STORE__) {
  globalThis.__INACARD_STORE__ = [];
}

const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_CARDS_FILE = path.join(LOCAL_DATA_DIR, "cards.json");

const TMP_DATA_DIR = path.join("/tmp", "inacard");
const TMP_CARDS_FILE = path.join(TMP_DATA_DIR, "cards.json");

export interface CompactCardData {
  n: string; // name
  d: string; // designation
  c: string; // companyName
  p: string; // phoneNumber
  l: string; // officeLocation
  u?: string; // photoUrl (ImgBB permanent CDN link)
  b?: string; // bgUrl (theme background image)
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

export async function getAllCards(): Promise<DigitalCard[]> {
  const memoryCards = globalThis.__INACARD_STORE__ || [];
  const localCards = await readCardsFromFile(LOCAL_CARDS_FILE);
  const tmpCards = await readCardsFromFile(TMP_CARDS_FILE);

  const map = new Map<string, DigitalCard>();
  for (const c of localCards) map.set(c.id, c);
  for (const c of tmpCards) map.set(c.id, c);
  for (const c of memoryCards) map.set(c.id, c);

  const all = Array.from(map.values());
  globalThis.__INACARD_STORE__ = all;
  return all;
}

export async function getCardBySlug(slug: string): Promise<DigitalCard | null> {
  if (!slug) return null;
  const normalizedSlug = slug.toLowerCase().trim();

  const cards = await getAllCards();
  const found = cards.find((c) => c.slug.toLowerCase() === normalizedSlug);
  return found || null;
}

export async function saveCardToStorage(card: DigitalCard): Promise<void> {
  const cards = await getAllCards();
  if (!cards.some((c) => c.slug === card.slug)) {
    cards.push(card);
    globalThis.__INACARD_STORE__ = cards;
    const localSuccess = await writeCardsToFile(LOCAL_DATA_DIR, LOCAL_CARDS_FILE, cards);
    if (!localSuccess) {
      await writeCardsToFile(TMP_DATA_DIR, TMP_CARDS_FILE, cards);
    }
  }
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
