import { describe, it, expect } from "vitest";
import {
  getCallLink,
  getWhatsAppLink,
  getGoogleMapsLink,
  getCardUrl,
} from "../src/lib/links";

describe("Link generation helpers", () => {
  it("generates correct dialer tel: links", () => {
    expect(getCallLink("+91 98765 43210")).toBe("tel:+919876543210");
    expect(getCallLink("invalid")).toBeNull();
  });

  it("generates correct wa.me links with international digits only", () => {
    expect(getWhatsAppLink("+91 98765 43210")).toBe("https://wa.me/919876543210");
    expect(getWhatsAppLink("invalid")).toBeNull();
  });

  it("generates correct Google Maps URLs with URL-encoded query", () => {
    expect(getGoogleMapsLink("BKC, Mumbai, Maharashtra")).toBe(
      "https://www.google.com/maps/search/?api=1&query=BKC%2C%20Mumbai%2C%20Maharashtra"
    );
    expect(getGoogleMapsLink("   ")).toBeNull();
  });

  it("generates card URLs correctly", () => {
    expect(getCardUrl("alex-jordan-1234")).toBe("/card/alex-jordan-1234");
    expect(getCardUrl("alex-jordan-1234", "https://inacard.com")).toBe(
      "https://inacard.com/card/alex-jordan-1234"
    );
  });
});

