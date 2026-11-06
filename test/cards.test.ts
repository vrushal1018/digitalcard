import { describe, it, expect } from "vitest";
import {
  generateSlug,
  createCard,
  updateCard,
  deleteCard,
  getCardBySlug,
  encodeCardToken,
  decodeCardToken,
} from "../src/lib/cards";

describe("Card storage and slug generation", () => {
  it("generates an unguessable slug containing clean base name and hex suffix", () => {
    const slug1 = generateSlug("Alex Jordan");
    const slug2 = generateSlug("Alex Jordan");

    expect(slug1).toMatch(/^alex-jordan-[a-f0-9]{8}$/);
    expect(slug2).toMatch(/^alex-jordan-[a-f0-9]{8}$/);
    expect(slug1).not.toBe(slug2); // Unique suffixes
  });

  it("creates and retrieves a card successfully", async () => {
    const testData = {
      name: "Jane Doe",
      designation: "Lead Architect",
      companyName: "Modern Studio",
      phoneNumber: "+1 555 123 4567",
      officeLocation: "Seattle, WA",
      photoUrl: "/uploads/jane.jpg",
    };

    const created = await createCard(testData);
    expect(created.id).toBeDefined();
    expect(created.slug).toBeDefined();
    expect(created.name).toBe("Jane Doe");

    const fetched = await getCardBySlug(created.slug);
    expect(fetched).not.toBeNull();
    expect(fetched?.slug).toBe(created.slug);
    expect(fetched?.designation).toBe("Lead Architect");
  });

  it("updates an existing card and preserves the slug", async () => {
    const initialData = {
      name: "Morgan Smith",
      designation: "Product Lead",
      companyName: "Nexus",
      phoneNumber: "+1 555 456 7890",
      officeLocation: "Austin, TX",
      photoUrl: "/uploads/morgan.jpg",
    };

    const card = await createCard(initialData);
    expect(card.designation).toBe("Product Lead");

    const updated = await updateCard(card.slug, {
      name: "Morgan Smith",
      designation: "VP of Product",
      companyName: "Nexus Global",
      phoneNumber: "+1 555 999 8888",
      officeLocation: "Austin, TX & Remote",
      photoUrl: "/uploads/morgan-new.jpg",
      linkedinUrl: "https://linkedin.com/in/morgansmith",
    });

    expect(updated).not.toBeNull();
    expect(updated?.slug).toBe(card.slug); // Slug remains identical
    expect(updated?.designation).toBe("VP of Product");
    expect(updated?.companyName).toBe("Nexus Global");
    expect(updated?.linkedinUrl).toBe("https://linkedin.com/in/morgansmith");

    // Retrieve again to ensure persistence
    const fetched = await getCardBySlug(card.slug);
    expect(fetched?.designation).toBe("VP of Product");
    expect(fetched?.companyName).toBe("Nexus Global");
  });

  it("returns null when updating a non-existent card", async () => {
    const result = await updateCard("non-existent-card-9999", {
      name: "Ghost",
      designation: "None",
      companyName: "None",
      phoneNumber: "+15551234567",
      officeLocation: "None",
      photoUrl: "",
    });
    expect(result).toBeNull();
  });

  it("deletes an existing card successfully", async () => {
    const card = await createCard({
      name: "Temporary User",
      designation: "Intern",
      companyName: "Temp Corp",
      phoneNumber: "+1 555 000 1111",
      officeLocation: "Denver, CO",
      photoUrl: "",
    });

    const foundBefore = await getCardBySlug(card.slug);
    expect(foundBefore).not.toBeNull();

    const deleted = await deleteCard(card.slug);
    expect(deleted).toBe(true);

    const foundAfter = await getCardBySlug(card.slug);
    expect(foundAfter).toBeNull();
  });

  it("returns false when deleting a non-existent card", async () => {
    const result = await deleteCard("does-not-exist-slug");
    expect(result).toBe(false);
  });

  it("encodes and decodes a card token for serverless URL resilience", () => {
    const card = {
      id: "test-id",
      slug: "alex-jordan-1234",
      name: "Alex Jordan",
      designation: "Creative Director",
      companyName: "Innovative Spaces",
      phoneNumber: "+919876543210",
      officeLocation: "BKC, Mumbai",
      photoUrl: "https://example.com/avatar.jpg",
      bgUrl: "https://example.com/wallpaper.jpg",
      bgFit: "contain" as const,
      createdAt: "2026-11-03T12:00:00Z",
      updatedAt: "2026-11-03T12:00:00Z",
    };

    const token = encodeCardToken(card);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const decoded = decodeCardToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.name).toBe("Alex Jordan");
    expect(decoded?.slug).toBe("alex-jordan-1234");
    expect(decoded?.phoneNumber).toBe("+919876543210");
    expect(decoded?.bgUrl).toBe("https://example.com/wallpaper.jpg");
    expect(decoded?.bgFit).toBe("contain");
  });

  it("returns null for non-existent slug", async () => {
    const result = await getCardBySlug("non-existent-slug-xyz");
    expect(result).toBeNull();
  });
});
