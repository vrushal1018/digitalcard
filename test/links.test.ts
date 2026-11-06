import { describe, it, expect } from "vitest";
import {
  getCallLink,
  getWhatsAppLink,
  getGoogleMapsLink,
  getLinkedInLink,
  getInstagramLink,
  getFacebookLink,
  getEmailLink,
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

  it("generates and normalizes social profile links correctly", () => {
    expect(getLinkedInLink("https://linkedin.com/in/vrushal")).toBe("https://linkedin.com/in/vrushal");
    expect(getLinkedInLink("@vrushal")).toBe("https://www.linkedin.com/in/vrushal");
    expect(getLinkedInLink("vrushal")).toBe("https://www.linkedin.com/in/vrushal");
    expect(getLinkedInLink("")).toBeNull();

    expect(getInstagramLink("https://instagram.com/vrushal")).toBe("https://instagram.com/vrushal");
    expect(getInstagramLink("@vrushal")).toBe("https://www.instagram.com/vrushal/");
    expect(getInstagramLink("vrushal")).toBe("https://www.instagram.com/vrushal/");
    expect(getInstagramLink("")).toBeNull();

    expect(getFacebookLink("https://facebook.com/vrushal")).toBe("https://facebook.com/vrushal");
    expect(getFacebookLink("@vrushal")).toBe("https://www.facebook.com/vrushal");
    expect(getFacebookLink("vrushal")).toBe("https://www.facebook.com/vrushal");
    expect(getFacebookLink("")).toBeNull();

    expect(getEmailLink("info@example.com")).toBe("mailto:info@example.com");
    expect(getEmailLink("mailto:info@example.com")).toBe("mailto:info@example.com");
    expect(getEmailLink("")).toBeNull();
  });
});

