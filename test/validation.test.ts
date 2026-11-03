import { describe, it, expect } from "vitest";
import { validateCardForm, validateImageFile } from "../src/lib/validation";

describe("Validation helpers", () => {
  it("validates a complete and valid card form", () => {
    const validData = {
      name: "Alex Jordan",
      designation: "Creative Director",
      companyName: "Innovative Spaces",
      phoneNumber: "+91 98765 43210",
      officeLocation: "BKC, Mumbai, Maharashtra",
      photoUrl: "/uploads/photo.jpg",
    };

    const result = validateCardForm(validData);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it("detects missing or invalid required fields", () => {
    const emptyResult = validateCardForm({});
    expect(emptyResult.isValid).toBe(false);
    expect(emptyResult.errors.name).toBeDefined();
    expect(emptyResult.errors.designation).toBeDefined();
    expect(emptyResult.errors.companyName).toBeDefined();
    expect(emptyResult.errors.phoneNumber).toBeDefined();
    expect(emptyResult.errors.officeLocation).toBeDefined();
    expect(emptyResult.errors.photo).toBeDefined();
  });

  it("validates image file types and size", () => {
    const validFile = new File(["dummy content"], "avatar.png", {
      type: "image/png",
    });
    expect(validateImageFile(validFile).isValid).toBe(true);

    const invalidTypeFile = new File(["dummy content"], "avatar.gif", {
      type: "image/gif",
    });
    expect(validateImageFile(invalidTypeFile).isValid).toBe(false);
  });
});
