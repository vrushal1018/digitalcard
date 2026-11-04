import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { validateImageFile } from "@/lib/validation";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Default fallback key or read from environment variable
const DEFAULT_IMGBB_KEY = process.env.IMGBB_API_KEY || "e83fca892160561b4c3fdea38e99d32c";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const clientKey = (formData.get("imgbbKey") as string) || request.headers.get("x-imgbb-key") || DEFAULT_IMGBB_KEY;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // 1. If ImgBB API key is provided, upload directly to ImgBB!
    if (clientKey && clientKey.trim()) {
      try {
        const imgbbForm = new FormData();
        imgbbForm.append("image", base64Image);

        const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${clientKey.trim()}`, {
          method: "POST",
          body: imgbbForm,
        });

        const imgbbData = await imgbbRes.json();

        if (imgbbRes.ok && imgbbData.success && imgbbData.data) {
          // Direct permanent CDN image link (e.g. https://i.ibb.co/...)
          const photoUrl = imgbbData.data.display_url || imgbbData.data.url;
          return NextResponse.json({ photoUrl, success: true }, { status: 201 });
        } else {
          const errMsg = imgbbData?.error?.message || "ImgBB upload failed";
          console.error("ImgBB error:", errMsg);
          return NextResponse.json({ error: `ImgBB error: ${errMsg}` }, { status: 400 });
        }
      } catch (imgbbErr) {
        console.error("ImgBB network error:", imgbbErr);
        return NextResponse.json({ error: "Failed to connect to ImgBB service" }, { status: 502 });
      }
    }

    // 2. Local filesystem fallback (works when running locally on PC)
    try {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      let extension = "jpg";
      if (file.type === "image/png") extension = "png";
      if (file.type === "image/webp") extension = "webp";
      const uniqueName = `${crypto.randomUUID()}.${extension}`;
      const filePath = path.join(UPLOADS_DIR, uniqueName);
      await fs.writeFile(filePath, buffer);
      return NextResponse.json({ photoUrl: `/uploads/${uniqueName}`, success: true }, { status: 201 });
    } catch {
      // 3. On Vercel without ImgBB key: prompt for ImgBB key
      return NextResponse.json(
        {
          error: "ImgBB API Key required on Vercel to store and host photos.",
          needsImgbbKey: true,
        },
        { status: 400 }
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
