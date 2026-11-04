import { NextRequest, NextResponse } from "next/server";
import { generateVCard } from "@/lib/vcard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get("name") || "Contact";
    const designation = searchParams.get("designation") || "";
    const company = searchParams.get("company") || "";
    const phone = searchParams.get("phone") || "";
    const location = searchParams.get("location") || "";
    const photo = searchParams.get("photo") || "";
    const url = searchParams.get("url") || "";

    const vcardContent = generateVCard({
      name,
      designation,
      companyName: company,
      phoneNumber: phone,
      officeLocation: location,
      photoUrl: photo,
      cardUrl: url,
    });

    const safeFilename =
      name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") || "contact";

    return new Response(vcardContent, {
      status: 200,
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeFilename}.vcf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("vCard error:", error);
    return NextResponse.json({ error: "Failed to generate vCard" }, { status: 500 });
  }
}
