import { NextRequest, NextResponse } from "next/server";
import { validateCardForm } from "@/lib/validation";
import { createCard, getAllCards, getCardBySlug, encodeCardToken } from "@/lib/cards";
import { CardFormData } from "@/types/card";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const card = await getCardBySlug(slug);
      if (!card) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      return NextResponse.json({ card });
    }

    const cards = await getAllCards();
    return NextResponse.json({ cards });
  } catch (error) {
    console.error("GET /api/cards error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CardFormData;

    const validation = validateCardForm(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    const newCard = await createCard(body);
    const token = encodeCardToken(newCard);
    return NextResponse.json(
      {
        success: true,
        card: newCard,
        slug: newCard.slug,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/cards error:", error);
    return NextResponse.json(
      { error: "Failed to create digital business card" },
      { status: 500 }
    );
  }
}
