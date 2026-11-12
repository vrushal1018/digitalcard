import { NextResponse } from "next/server";
import { hasDatabaseConnection, getStorageProviderName, getAllCards } from "@/lib/cards";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const isDbConnected = hasDatabaseConnection();
    const cards = await getAllCards();
    const storageType = getStorageProviderName();

    return NextResponse.json({
      connected: isDbConnected,
      storageType,
      isVercel: Boolean(process.env.VERCEL),
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
