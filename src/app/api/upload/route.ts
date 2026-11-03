import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { validateImageFile } from "@/lib/validation";

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

    // Attempt to write to public/uploads (works on local development / persistent server)
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });

      let extension = "jpg";
      if (file.type === "image/png") extension = "png";
      if (file.type === "image/webp") extension = "webp";

      const uniqueName = `${crypto.randomUUID()}.${extension}`;
      const filePath = path.join(UPLOADS_DIR, uniqueName);
      await fs.writeFile(filePath, buffer);

      const photoUrl = `/uploads/${uniqueName}`;
      return NextResponse.json({ photoUrl, success: true }, { status: 201 });
    } catch (fsError) {
      // Serverless / Vercel environment: filesystem is read-only.
      // Gracefully encode image as an optimized Base64 Data URL.
      console.warn("Filesystem read-only (e.g. Vercel). Falling back to Base64 Data URL.", fsError);
      const base64Data = buffer.toString("base64");
      const photoUrl = `data:${mimeType};base64,${base64Data}`;

      return NextResponse.json({ photoUrl, success: true }, { status: 201 });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
