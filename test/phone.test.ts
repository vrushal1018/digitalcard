import { describe, it, expect } from "vitest";
import {
  isValidPhoneNumber,
  normalizePhoneForCall,
  normalizePhoneForWhatsApp,
} from "../src/lib/phone";

describe("Phone utilities", () => {
  describe("isValidPhoneNumber", () => {
    it("validates standard international phone numbers", () => {
      expect(isValidPhoneNumber("+91 98765 43210")).toBe(true);
      expect(isValidPhoneNumber("+1 (555) 123-4567")).toBe(true);
      expect(isValidPhoneNumber("9876543210")).toBe(true);
      expect(isValidPhoneNumber("+44 20 7946 0958")).toBe(true);
    });

    it("rejects invalid phone numbers", () => {
      expect(isValidPhoneNumber("")).toBe(false);
      expect(isValidPhoneNumber("123")).toBe(false); // too short
      expect(isValidPhoneNumber("abc1234567")).toBe(false); // invalid characters
      expect(isValidPhoneNumber("+1234567890123456789")).toBe(false); // too long
    });
  });

  describe("normalizePhoneForCall", () => {
    it("preserves leading + and strips spaces, hyphens, and brackets", () => {
      expect(normalizePhoneForCall("+91 98765 43210")).toBe("+919876543210");
      expect(normalizePhoneForCall("+1 (555) 123-4567")).toBe("+15551234567");
      expect(normalizePhoneForCall("98765-43210")).toBe("9876543210");
    });
  });

  describe("normalizePhoneForWhatsApp", () => {
    it("strips all non-digit characters including + for wa.me links", () => {
      expect(normalizePhoneForWhatsApp("+91 98765 43210")).toBe("919876543210");
      expect(normalizePhoneForWhatsApp("+1 (555) 123-4567")).toBe("15551234567");
      expect(normalizePhoneForWhatsApp("9876543210")).toBe("9876543210");
    });
  });
});
