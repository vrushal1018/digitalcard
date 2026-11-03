import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { DigitalCard, CardFormData } from "../types/card";
import { normalizePhoneForCall } from "./phone";

const DATA_DIR = path.join(process.cwd(), "data");
const CARDS_FILE = path.join(DATA_DIR, "cards.json");

/**
 * Ensures the data directory and cards.json file exist.
 */
async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(CARDS_FILE);
    } catch {
      await fs.writeFile(CARDS_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error ensuring data directory:", err);
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
 * Retrieves all stored cards.
 */
export async function getAllCards(): Promise<DigitalCard[]> {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(CARDS_FILE, "utf-8");
    return JSON.parse(raw) as DigitalCard[];
  } catch (error) {
    console.error("Failed to read cards file:", error);
    return [];
  }
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
 */
export async function createCard(formData: CardFormData): Promise<DigitalCard> {
  await ensureDataFile();
  const cards = await getAllCards();

  let slug = generateSlug(formData.name);
  // Ensure absolute uniqueness
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

  // Write atomically
  const tempFile = `${CARDS_FILE}.tmp.${Date.now()}`;
  await fs.writeFile(tempFile, JSON.stringify(cards, null, 2), "utf-8");
  await fs.rename(tempFile, CARDS_FILE);

  return newCard;
}
