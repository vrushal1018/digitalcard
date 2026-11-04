import { NextRequest, NextResponse } from "next/server";
import { getMongoDb, isMongoConfigured } from "@/lib/mongodb";
import { Binary } from "mongodb";

interface ImageDoc {
  _id: string;
  filename: string;
  contentType: string;
  data: Binary | Buffer | string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params.id;
    // Strip extension if present (e.g. "abc-123.jpg" -> "abc-123")
    const id = rawId.replace(/\.[^/.]+$/, "");

    if (!isMongoConfigured()) {
      return new Response("MongoDB not configured", { status: 404 });
    }

    const db = await getMongoDb();
    if (!db) {
      return new Response("Database unavailable", { status: 500 });
    }

    const photoDoc = await db.collection<ImageDoc>("photos").findOne({ _id: id });
    if (!photoDoc) {
      return new Response("Image not found", { status: 404 });
    }

    let imageBuffer: Buffer;
    if (typeof photoDoc.data === "string") {
      // Base64 string fallback
      const base64Clean = photoDoc.data.replace(/^data:image\/\w+;base64,/, "");
      imageBuffer = Buffer.from(base64Clean, "base64");
    } else if (Buffer.isBuffer(photoDoc.data)) {
      imageBuffer = photoDoc.data;
    } else if (photoDoc.data && (photoDoc.data as Binary).buffer) {
      imageBuffer = Buffer.from((photoDoc.data as Binary).buffer);
    } else {
      return new Response("Invalid image data", { status: 500 });
    }

    return new Response(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        "Content-Type": photoDoc.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/images/[id] error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
