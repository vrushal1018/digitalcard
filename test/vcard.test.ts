import { describe, it, expect } from "vitest";
import {
  generateVCard,
  buildAndroidContactIntent,
  getGoogleContactsUrl,
  isAndroidDevice,
} from "../src/lib/vcard";

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
      linkedinUrl: "https://linkedin.com/in/siddharth",
      instagramUrl: "https://instagram.com/siddharth",
      facebookUrl: "https://facebook.com/siddharth",
      email: "siddharth@1change.com",
      websiteUrl: "https://inaspaceworks.com",
    });

    expect(vcard).toContain("BEGIN:VCARD");
    expect(vcard).toContain("VERSION:3.0");
    expect(vcard).toContain("FN:Siddharth Menon");
    expect(vcard).toContain("N:Menon;Siddharth;;;");
    expect(vcard).toContain("TITLE:Founder");
    expect(vcard).toContain("ORG:1 change");
    expect(vcard).toContain("TEL;TYPE=CELL,VOICE:+919876543210");
    expect(vcard).toContain("EMAIL;TYPE=INTERNET,WORK:siddharth@1change.com");
    expect(vcard).toContain("ADR;TYPE=WORK:;;Mumbai, Maharashtra;;;;");
    expect(vcard).toContain("URL;TYPE=WORK:https://inaspaceworks.com");
    expect(vcard).toContain("URL:https://digitalcard.vercel.app/card/siddharth-menon");
    expect(vcard).toContain("X-SOCIALPROFILE;TYPE=linkedin:https://linkedin.com/in/siddharth");
    expect(vcard).toContain("X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/siddharth");
    expect(vcard).toContain("X-SOCIALPROFILE;TYPE=facebook:https://facebook.com/siddharth");
    expect(vcard).toContain("PHOTO;VALUE=URI:https://i.ibb.co/photo.jpg");
    expect(vcard).toContain("END:VCARD");
  });

  it("builds a valid Android Contacts Intent URI that opens native Contacts app", () => {
    const intentUri = buildAndroidContactIntent({
      name: "Jaisalil Shilewant",
      designation: "Founder & Principal Architect",
      companyName: "INA Spaceworks",
      phoneNumber: "+919579732585",
      officeLocation: "Pune, Maharashtra",
      email: "contact@inaspaceworks.com",
      websiteUrl: "https://inaspaceworks.com",
      cardUrl: "https://inadigitalcard.vercel.app/card/jaisalil-shilewant",
      googleBusinessUrl: "https://share.google/vAs5vkjSyINd2SOoA",
    });

    expect(intentUri.startsWith("intent:#Intent;")).toBe(true);
    expect(intentUri).toContain("action=android.intent.action.INSERT");
    expect(intentUri).toContain("type=vnd.android.cursor.dir/contact");
    expect(intentUri).toContain("S.name=Jaisalil%20Shilewant");
    expect(intentUri).toContain("S.phone=%2B919579732585");
    expect(intentUri).toContain("S.company=INA%20Spaceworks");
    expect(intentUri).toContain("S.job_title=Founder%20%26%20Principal%20Architect");
    expect(intentUri).toContain("S.email=contact%40inaspaceworks.com");
    expect(intentUri).toContain("S.postal=Pune%2C%20Maharashtra");
    expect(intentUri).toContain("S.notes=");
    expect(intentUri.endsWith(";end;")).toBe(true);
  });

  it("builds a valid Google Contacts prefilled URL", () => {
    const url = getGoogleContactsUrl({
      name: "Jaisalil Shilewant",
      phoneNumber: "+919579732585",
      email: "jaisalil.s@inaspaceworks.com",
      companyName: "INA Spaceworks",
      designation: "Founder & Principal Architect",
    });

    expect(url.startsWith("https://contacts.google.com/new?")).toBe(true);
    expect(url).toContain("givenname=Jaisalil");
    expect(url).toContain("familyname=Shilewant+%28INA+Spaceworks%29");
    expect(url).toContain("phone=%2B919579732585");
    expect(url).toContain("email=jaisalil.s%40inaspaceworks.com");
    expect(url).toContain("company=INA+Spaceworks");
    expect(url).toContain("jobtitle=Founder+%26+Principal+Architect");
  });
});


