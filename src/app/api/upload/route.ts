import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { validateImageFile } from "@/lib/validation";
import { getMongoDb, isMongoConfigured } from "@/lib/mongodb";
import { put } from "@vercel/blob";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "image/jpeg";

    let extension = "jpg";
    if (file.type === "image/png") extension = "png";
    if (file.type === "image/webp") extension = "webp";

    const uniqueId = crypto.randomUUID();
    const uniqueName = `${uniqueId}.${extension}`;

    // 1. If MongoDB Atlas is connected, store directly in MongoDB!
    if (isMongoConfigured()) {
      try {
        const db = await getMongoDb();
        if (db) {
          await db.collection("photos").insertOne({
            _id: uniqueId as any,
            filename: uniqueName,
            contentType: mimeType,
            data: buffer,
            createdAt: new Date(),
          });

          const photoUrl = `/api/images/${uniqueName}`;
          return NextResponse.json({ photoUrl, success: true }, { status: 201 });
        }
      } catch (mongoErr) {
        console.error("MongoDB photo save error, falling back:", mongoErr);
      }
    }

    // 2. If Vercel Blob is connected
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`avatars/${uniqueName}`, buffer, {
          access: "public",
          contentType: mimeType,
        });
        return NextResponse.json({ photoUrl: blob.url, success: true }, { status: 201 });
      } catch (blobErr) {
        console.warn("Vercel Blob upload failed:", blobErr);
      }
    }

    // 3. Try local filesystem (for local development)
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      const filePath = path.join(UPLOADS_DIR, uniqueName);
      await fs.writeFile(filePath, buffer);
      return NextResponse.json({ photoUrl: `/uploads/${uniqueName}`, success: true }, { status: 201 });
    } catch {
      // 4. Serverless fallback: Base64 data URL
      const base64Data = buffer.toString("base64");
      return NextResponse.json(
        { photoUrl: `data:${mimeType};base64,${base64Data}`, success: true },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
