import { NextResponse } from "next/server";
import { hasDatabaseConnection, getAllCards } from "@/lib/cards";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const isDbConnected = hasDatabaseConnection();
    const cards = await getAllCards();

    return NextResponse.json({
      connected: isDbConnected,
      storageType: isDbConnected ? "Vercel KV / Redis Cloud Database" : "Local & Git Storage",
      cardCount: cards.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      storageType: "Local & Git Storage",
      error: (error as Error).message,
    });
  }
}
