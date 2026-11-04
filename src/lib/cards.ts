import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { DigitalCard, CardFormData } from "../types/card";
import { normalizePhoneForCall } from "./phone";
import { getMongoDb, isMongoConfigured } from "./mongodb";
import { Redis } from "@upstash/redis";

// Optional Upstash Redis fallback
let redisClient: Redis | null = null;
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  try {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  } catch (err) {
    console.warn("Could not initialize Redis client:", err);
  }
}

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
  u?: string; // photoUrl
  s: string; // slug
}

export function encodeCardToken(card: DigitalCard): string {
  const compact: CompactCardData = {
    n: card.name,
    d: card.designation,
    c: card.companyName,
    p: card.phoneNumber,
    l: card.officeLocation,
    s: card.slug,
  };
  if (card.photoUrl && card.photoUrl.length < 250) {
    compact.u = card.photoUrl;
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
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const mongoCards = await db
          .collection<DigitalCard>("cards")
          .find({})
          .project<DigitalCard>({ _id: 0 })
          .toArray();
        return mongoCards;
      }
    } catch (err) {
      console.error("MongoDB getAllCards failed:", err);
    }
  }

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

  // 1. Try MongoDB Atlas first
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        const card = await db
          .collection<DigitalCard>("cards")
          .findOne({ slug: normalizedSlug }, { projection: { _id: 0 } });
        if (card) return card;
      }
    } catch (err) {
      console.error("MongoDB getCardBySlug failed:", err);
    }
  }

  // 2. Try Redis if configured
  if (redisClient) {
    try {
      const card = await redisClient.get<DigitalCard>(`card:${normalizedSlug}`);
      if (card) return card;
    } catch (err) {
      console.warn("Redis fetch failed:", err);
    }
  }

  // 3. Fallback to in-memory and local files
  const cards = await getAllCards();
  const found = cards.find((c) => c.slug.toLowerCase() === normalizedSlug);
  return found || null;
}

export async function saveCardToStorage(card: DigitalCard): Promise<void> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        await db.collection("cards").updateOne(
          { slug: card.slug.toLowerCase() },
          { $set: card },
          { upsert: true }
        );
        return;
      }
    } catch (err) {
      console.error("MongoDB saveCardToStorage failed:", err);
    }
  }

  if (redisClient) {
    try {
      await redisClient.set(`card:${card.slug.toLowerCase()}`, card);
    } catch (err) {
      console.warn("Redis save failed:", err);
    }
  }

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
  let finalPhotoUrl = formData.photoUrl.trim();

  // 1. If MongoDB is connected and photoUrl is Base64 data from local upload:
  // Automatically extract the image and persist it into MongoDB's photos collection!
  if (isMongoConfigured() && finalPhotoUrl.startsWith("data:image/")) {
    try {
      const db = await getMongoDb();
      if (db) {
        const matches = finalPhotoUrl.match(/^data:(image\/\w+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");
          const photoId = crypto.randomUUID();
          let ext = "jpg";
          if (mimeType === "image/png") ext = "png";
          if (mimeType === "image/webp") ext = "webp";

          await db.collection("photos").insertOne({
            _id: photoId as any,
            filename: `${photoId}.${ext}`,
            contentType: mimeType,
            data: buffer,
            createdAt: new Date(),
          });

          finalPhotoUrl = `/api/images/${photoId}.${ext}`;
        }
      }
    } catch (savePhotoErr) {
      console.error("Failed to extract and save base64 photo to MongoDB:", savePhotoErr);
    }
  }

  const newCard: DigitalCard = {
    id: crypto.randomUUID(),
    slug,
    name: formData.name.trim(),
    designation: formData.designation.trim(),
    companyName: formData.companyName.trim(),
    phoneNumber: normalizePhoneForCall(formData.phoneNumber.trim()),
    officeLocation: formData.officeLocation.trim(),
    photoUrl: finalPhotoUrl,
    createdAt: now,
    updatedAt: now,
  };

  // 2. Save card record directly to MongoDB Atlas
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        let existing = await db.collection("cards").findOne({ slug: newCard.slug });
        while (existing) {
          newCard.slug = generateSlug(formData.name);
          existing = await db.collection("cards").findOne({ slug: newCard.slug });
        }

        await db.collection("cards").insertOne({ ...newCard });
        return newCard;
      }
    } catch (err) {
      console.error("MongoDB createCard failed, falling back to local:", err);
    }
  }

  // 3. Save to Redis if available
  if (redisClient) {
    try {
      await redisClient.set(`card:${newCard.slug.toLowerCase()}`, newCard);
    } catch (err) {
      console.warn("Redis save failed:", err);
    }
  }

  // 4. Save to local/tmp files
  const cards = await getAllCards();
  cards.push(newCard);
  globalThis.__INACARD_STORE__ = cards;

  const localSuccess = await writeCardsToFile(LOCAL_DATA_DIR, LOCAL_CARDS_FILE, cards);
  if (!localSuccess) {
    await writeCardsToFile(TMP_DATA_DIR, TMP_CARDS_FILE, cards);
  }

  return newCard;
}

export function isDatabaseConfigured(): boolean {
  return isMongoConfigured() || Boolean(redisClient);
}
