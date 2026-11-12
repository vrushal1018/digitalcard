import { NextRequest, NextResponse } from "next/server";
import { generateVCard } from "@/lib/vcard";
import { getCardBySlug } from "@/lib/cards";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    let name = searchParams.get("name") || "Contact";
    let designation = searchParams.get("designation") || "";
    let company = searchParams.get("company") || "";
    let phone = searchParams.get("phone") || "";
    let location = searchParams.get("location") || "";
    let photo = searchParams.get("photo") || "";
    let url = searchParams.get("url") || "";
    let email = searchParams.get("email") || "";
    let website = searchParams.get("website") || "";
    let googleBusiness = searchParams.get("googleBusiness") || "";
    let linkedin = searchParams.get("linkedin") || "";
    let instagram = searchParams.get("instagram") || "";
    let facebook = searchParams.get("facebook") || "";

    if (slug) {
      const card = await getCardBySlug(slug);
      if (card) {
        name = card.name || name;
        designation = card.designation || designation;
        company = card.companyName || company;
        phone = card.phoneNumber || phone;
        location = card.officeLocation || location;
        photo = card.photoUrl || photo;
        email = card.email || email;
        website = card.websiteUrl || website;
        googleBusiness = card.googleBusinessUrl || googleBusiness;
        linkedin = card.linkedinUrl || linkedin;
        instagram = card.instagramUrl || instagram;
        facebook = card.facebookUrl || facebook;
      }
    }

    const vcardContent = generateVCard({
      name,
      designation,
      companyName: company,
      phoneNumber: phone,
      officeLocation: location,
      photoUrl: photo,
      cardUrl: url,
      email,
      websiteUrl: website,
      googleBusinessUrl: googleBusiness,
      linkedinUrl: linkedin,
      instagramUrl: instagram,
      facebookUrl: facebook,
    });

    const safeFilename =
      name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") || "contact";

    return new Response(vcardContent, {
      status: 200,
      headers: {
        "Content-Type": "text/x-vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeFilename}.vcf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("vCard error:", error);
    return NextResponse.json({ error: "Failed to generate vCard" }, { status: 500 });
  }
}
