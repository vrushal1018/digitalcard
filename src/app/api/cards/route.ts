import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { validateCardForm } from "@/lib/validation";
import {
  createCard,
  updateCard,
  deleteCard,
  getAllCards,
  getCardBySlug,
  encodeCardToken,
} from "@/lib/cards";
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
    try {
      revalidatePath(`/card/${newCard.slug}`);
      revalidatePath("/");
    } catch {}
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

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const slug = searchParams.get("slug") || body.slug;

    if (!slug) {
      return NextResponse.json(
        { error: "Card slug is required for updates" },
        { status: 400 }
      );
    }

    const validation = validateCardForm(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    const updatedCard = await updateCard(slug, body);
    if (!updatedCard) {
      return NextResponse.json(
        { error: `Card with slug "${slug}" not found to update` },
        { status: 404 }
      );
    }

    const token = encodeCardToken(updatedCard);
    try {
      revalidatePath(`/card/${updatedCard.slug}`);
      revalidatePath("/");
    } catch {}
    return NextResponse.json({
      success: true,
      card: updatedCard,
      slug: updatedCard.slug,
      token,
    });
  } catch (error) {
    console.error("PUT /api/cards error:", error);
    return NextResponse.json(
      { error: "Failed to update digital business card" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let slug = searchParams.get("slug");

    if (!slug) {
      try {
        const body = await request.json();
        slug = body.slug;
      } catch {
        // no json body
      }
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Card slug is required for deletion" },
        { status: 400 }
      );
    }

    const success = await deleteCard(slug);
    if (!success) {
      return NextResponse.json(
        { error: `Card with slug "${slug}" not found` },
        { status: 404 }
      );
    }

    try {
      revalidatePath(`/card/${slug}`);
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Card deleted successfully",
      slug,
    });
  } catch (error) {
    console.error("DELETE /api/cards error:", error);
    return NextResponse.json(
      { error: "Failed to delete digital business card" },
      { status: 500 }
    );
  }
}
