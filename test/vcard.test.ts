import { describe, it, expect } from "vitest";
import { generateVCard } from "../src/lib/vcard";

describe("vCard generation", () => {
  it("generates a valid vCard 3.0 payload with contact fields", () => {
    const vcard = generateVCard({
      name: "Siddharth Menon",
      designation: "Founder",
      companyName: "1 change",
      phoneNumber: "+919876543210",
      officeLocation: "Mumbai, Maharashtra",
      photoUrl: "https://i.ibb.co/photo.jpg",
      cardUrl: "https://digitalcard.vercel.app/card/siddharth-menon",
    });

    expect(vcard).toContain("BEGIN:VCARD");
    expect(vcard).toContain("VERSION:3.0");
    expect(vcard).toContain("FN:Siddharth Menon");
    expect(vcard).toContain("N:Menon;Siddharth;;;");
    expect(vcard).toContain("TITLE:Founder");
    expect(vcard).toContain("ORG:1 change");
    expect(vcard).toContain("TEL;TYPE=CELL,VOICE:+919876543210");
    expect(vcard).toContain("ADR;TYPE=WORK:;;Mumbai, Maharashtra;;;;");
    expect(vcard).toContain("URL:https://digitalcard.vercel.app/card/siddharth-menon");
    expect(vcard).toContain("PHOTO;VALUE=URI:https://i.ibb.co/photo.jpg");
    expect(vcard).toContain("END:VCARD");
  });
});

