import { describe, it, expect, beforeEach } from "vitest";
import { generateSlug, createCard, getCardBySlug, getAllCards } from "../src/lib/cards";
import fs from "fs/promises";
import path from "path";

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

  it("returns null for non-existent slug", async () => {
    const result = await getCardBySlug("non-existent-slug-xyz");
    expect(result).toBeNull();
  });
});

