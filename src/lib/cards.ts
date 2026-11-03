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

/**
 * Reads cards from a specified file path safely.
 */
async function readCardsFromFile(filePath: string): Promise<DigitalCard[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as DigitalCard[];
  } catch {
    return [];
  }
}

/**
 * Writes cards to a specified file path safely, creating parent directories if needed.
 */
async function writeCardsToFile(dirPath: string, filePath: string, cards: DigitalCard[]): Promise<boolean> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    const tempFile = `${filePath}.tmp.${Date.now()}`;
    await fs.writeFile(tempFile, JSON.stringify(cards, null, 2), "utf-8");
    await fs.rename(tempFile, filePath);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Generates an unguessable slug based on name and a random unique suffix.
 */
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

/**
 * Retrieves all stored cards, checking in-memory cache, local data directory,
 * and /tmp storage.
 */
export async function getAllCards(): Promise<DigitalCard[]> {
  const memoryCards = globalThis.__INACARD_STORE__ || [];

  // Read bundled seeds from repository
  const localCards = await readCardsFromFile(LOCAL_CARDS_FILE);
  // Read serverless /tmp writes if on Vercel
  const tmpCards = await readCardsFromFile(TMP_CARDS_FILE);

  // Merge unique by ID
  const map = new Map<string, DigitalCard>();
  for (const c of localCards) map.set(c.id, c);
  for (const c of tmpCards) map.set(c.id, c);
  for (const c of memoryCards) map.set(c.id, c);

  const all = Array.from(map.values());
  globalThis.__INACARD_STORE__ = all;
  return all;
}

/**
 * Finds a card by its unique slug.
 */
export async function getCardBySlug(slug: string): Promise<DigitalCard | null> {
  if (!slug) return null;
  const cards = await getAllCards();
  const normalizedSlug = slug.toLowerCase().trim();
  const found = cards.find((c) => c.slug.toLowerCase() === normalizedSlug);
  return found || null;
}

/**
 * Creates and persists a new card record.
 * Works seamlessly on local filesystems as well as Vercel serverless environments.
 */
export async function createCard(formData: CardFormData): Promise<DigitalCard> {
  const cards = await getAllCards();

  let slug = generateSlug(formData.name);
  while (cards.some((c) => c.slug === slug)) {
    slug = generateSlug(formData.name);
  }

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
    createdAt: now,
    updatedAt: now,
  };

  cards.push(newCard);
  globalThis.__INACARD_STORE__ = cards;

  // 1. Try local data file write (succeeds locally)
  const localSuccess = await writeCardsToFile(LOCAL_DATA_DIR, LOCAL_CARDS_FILE, cards);

  // 2. If local write fails (read-only filesystem on Vercel), write to /tmp
  if (!localSuccess) {
    await writeCardsToFile(TMP_DATA_DIR, TMP_CARDS_FILE, cards);
  }

  return newCard;
}
