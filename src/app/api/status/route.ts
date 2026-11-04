import { NextResponse } from "next/server";
import { isMongoConfigured, getMongoDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json({
        connected: false,
        message: "MONGODB_URI is not set. Add it in Vercel Settings -> Environment Variables.",
      });
    }

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json({
        connected: false,
        message: "Unable to connect to MongoDB cluster.",
      });
    }

    // Ping MongoDB to verify live connectivity
    await db.command({ ping: 1 });

    return NextResponse.json({
      connected: true,
      message: "MongoDB Atlas connected successfully.",
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      message: (error as Error).message || "Database connection error.",
    });
  }
}
