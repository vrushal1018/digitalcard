import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { validateImageFile } from "@/lib/validation";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Uploads an image to public temporary cloud storage if running on serverless (Vercel),
 * returning a direct public HTTPS URL.
 */
async function uploadToCloudStorage(buffer: Buffer, filename: string, mimeType: string): Promise<string | null> {
  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
    formData.append("file", blob, filename);

    const res = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (json.status === "success" && json.data?.url) {
      // tmpfiles URL format: https://tmpfiles.org/12345/file.jpg
      // Direct raw download URL format: https://tmpfiles.org/dl/12345/file.jpg
      return json.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
    }
  } catch (err) {
    console.warn("Cloud upload fallback failed:", err);
  }
  return null;
}

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

    // 1. Try local filesystem (succeeds in development / traditional servers)
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      const filePath = path.join(UPLOADS_DIR, uniqueName);
      await fs.writeFile(filePath, buffer);
      return NextResponse.json({ photoUrl: `/uploads/${uniqueName}`, success: true }, { status: 201 });
    } catch {
      // 2. Read-only filesystem (Vercel Serverless)
      // Upload to public storage for a persistent shareable public URL
      const cloudUrl = await uploadToCloudStorage(buffer, uniqueName, mimeType);
      if (cloudUrl) {
        return NextResponse.json({ photoUrl: cloudUrl, success: true }, { status: 201 });
      }

      // 3. Fallback to optimized Base64 Data URL if external upload fails
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
