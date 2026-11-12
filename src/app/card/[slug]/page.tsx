import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getCardBySlug, getDeletedSlugs, decodeCardToken, saveCardToStorage } from "@/lib/cards";
import { DigitalCard } from "@/components/digital-card/DigitalCard";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CardPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    d?: string;
    save?: string;
    scan?: string;
  };
}

async function resolveCard(slug: string, token?: string) {
  const deletedSlugs = await getDeletedSlugs();
  if (deletedSlugs.has(slug.toLowerCase())) {
    return null;
  }

  let card = await getCardBySlug(slug);

  if (token) {
    const decoded = decodeCardToken(token);
    if (decoded && decoded.slug.toLowerCase() === slug.toLowerCase()) {
      if (!card) {
        // Recovery fallback if card does not exist in storage
        card = decoded;
        await saveCardToStorage(decoded);
      } else {
        // If card already exists in storage, only allow token if it is strictly NEWER
        // Legacy shared tokens without timestamp (epoch 0) will never revert newer card edits
        const cardTime = card.updatedAt ? new Date(card.updatedAt).getTime() : 0;
        const tokenTime = decoded.updatedAt ? new Date(decoded.updatedAt).getTime() : 0;
        if (tokenTime > cardTime) {
          card = decoded;
          await saveCardToStorage(decoded);
        }
      }
    }
  }

  return card;
}

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }

  try {
    const headerList = headers();
    const host = headerList.get("x-forwarded-host") || headerList.get("host");
    const proto = headerList.get("x-forwarded-proto") || "https";
    if (host) {
      return `${proto}://${host}`.replace(/\/+$/, "");
    }
  } catch {
    // ignore
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

export async function generateMetadata({
  params,
  searchParams,
}: CardPageProps): Promise<Metadata> {
  const card = await resolveCard(params.slug, searchParams?.d);
  if (!card) {
    return {
      title: "Card Not Found | Digital Business Card",
      description: "Digital business card not found.",
    };
  }

  const appUrl = getAppUrl();
  const querySuffix = searchParams?.d ? `?d=${searchParams.d}` : "";
  const cardUrl = `${appUrl}/card/${card.slug}${querySuffix}`;

  // Generate dynamic 1200x630 OpenGraph card image via /api/og (Split: Left photo | Right theme & info)
  const ogParams = new URLSearchParams({
    name: card.name,
    designation: card.designation,
    company: card.companyName,
  });

  if (card.photoUrl) {
    const fullPhotoUrl = card.photoUrl.startsWith("http")
      ? card.photoUrl
      : `${appUrl}${card.photoUrl.startsWith("/") ? "" : "/"}${card.photoUrl}`;
    ogParams.set("photo", fullPhotoUrl);
  }

  if (card.bgUrl) {
    const fullBgUrl = card.bgUrl.startsWith("http")
      ? card.bgUrl
      : `${appUrl}${card.bgUrl.startsWith("/") ? "" : "/"}${card.bgUrl}`;
    ogParams.set("bg", fullBgUrl);
    if (card.bgFit) {
      ogParams.set("fit", card.bgFit);
    }
  }

  const ogBannerImageUrl = `${appUrl}/api/og?${ogParams.toString()}&format=banner`;
  const pageTitle = `${card.name} — ${card.companyName}`;
  const pageDescription = `${card.name}, ${card.designation} at ${card.companyName}. Connect via Call, WhatsApp, Location, and Share.`;

  return {
    title: `${pageTitle} | Digital Business Card`,
    description: pageDescription,
    alternates: {
      canonical: cardUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: cardUrl,
      siteName: "InaCard Digital Business Card",
      images: [
        {
          url: ogBannerImageUrl,
          secureUrl: ogBannerImageUrl,
          width: 1200,
          height: 630,
          alt: `${card.name} — ${card.companyName}`,
          type: "image/png",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: `${card.name}, ${card.designation} at ${card.companyName}`,
      images: [ogBannerImageUrl],
    },
  };
}

export default async function PublicCardPage({ params, searchParams }: CardPageProps) {
  const card = await resolveCard(params.slug, searchParams?.d);

  if (!card) {
    notFound();
  }

  const appUrl = getAppUrl();
  const querySuffix = searchParams?.d ? `?d=${searchParams.d}` : "";
  const shareUrl = `${appUrl}/card/${card.slug}${querySuffix}`;

  return (
    <div className="min-h-screen w-full bg-white sm:bg-[#0b0e14] flex flex-col justify-start sm:justify-center items-center p-0 sm:py-10 sm:px-4">
      <div className="w-full sm:max-w-[420px] mx-auto flex-1 sm:flex-initial flex flex-col space-y-0 sm:space-y-4">
        {/* Digital Business Card */}
        <DigitalCard
          name={card.name}
          designation={card.designation}
          companyName={card.companyName}
          phoneNumber={card.phoneNumber}
          officeLocation={card.officeLocation}
          photoUrl={card.photoUrl}
          bgUrl={card.bgUrl}
          bgFit={card.bgFit}
          linkedinUrl={card.linkedinUrl}
          instagramUrl={card.instagramUrl}
          facebookUrl={card.facebookUrl}
          email={card.email}
          websiteUrl={card.websiteUrl}
          googleBusinessUrl={card.googleBusinessUrl}
          slug={card.slug}
          shareUrl={shareUrl}
          isPreview={false}
        />

        {/* Footer for the public view (no builder links) */}
        <div className="flex items-center justify-center py-2 text-xs text-zinc-400 sm:text-zinc-500 bg-white sm:bg-transparent">
          <span className="inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#1886cf]" />
            <span>Powered by Ina</span>
          </span>
        </div>
      </div>
    </div>
  );
}
