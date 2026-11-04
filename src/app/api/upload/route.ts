import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { validateImageFile } from "@/lib/validation";
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
    const uniqueName = `${crypto.randomUUID()}.${extension}`;

    // 1. If Vercel Blob Storage is connected (BLOB_READ_WRITE_TOKEN is set)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`avatars/${uniqueName}`, buffer, {
          access: "public",
          contentType: mimeType,
        });
        return NextResponse.json({ photoUrl: blob.url, success: true }, { status: 201 });
      } catch (blobErr) {
        console.warn("Vercel Blob upload failed, falling back:", blobErr);
      }
    }

    // 2. Try local filesystem (development environment or persistent container)
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      const filePath = path.join(UPLOADS_DIR, uniqueName);
      await fs.writeFile(filePath, buffer);
      return NextResponse.json({ photoUrl: `/uploads/${uniqueName}`, success: true }, { status: 201 });
    } catch {
      // 3. Vercel Serverless without Blob storage:
      // Return clean, self-contained Base64 Data URL (renders natively in <img> without external storage)
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
