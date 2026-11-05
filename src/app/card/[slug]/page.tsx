import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCardBySlug, decodeCardToken, saveCardToStorage } from "@/lib/cards";
import { DigitalCard } from "@/components/digital-card/DigitalCard";
import { Sparkles, ArrowLeft } from "lucide-react";

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
  let card = await getCardBySlug(slug);

  if (!card && token) {
    const decoded = decodeCardToken(token);
    if (decoded && decoded.slug.toLowerCase() === slug.toLowerCase()) {
      card = decoded;
      await saveCardToStorage(decoded);
    }
  }

  return card;
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

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

  const querySuffix = searchParams?.d ? `?d=${searchParams.d}` : "";
  const cardUrl = `${appUrl}/card/${card.slug}${querySuffix}`;

  // Generate dynamic 1200x630 OpenGraph card image via /api/og
  const ogParams = new URLSearchParams({
    name: card.name,
    designation: card.designation,
    company: card.companyName,
  });
  if (card.photoUrl && card.photoUrl.startsWith("http")) {
    ogParams.set("photo", card.photoUrl);
  }
  if (card.bgUrl && card.bgUrl.startsWith("http")) {
    ogParams.set("bg", card.bgUrl);
    if (card.bgFit) {
      ogParams.set("fit", card.bgFit);
    }
  }
  const ogBannerImageUrl = `${appUrl}/api/og?${ogParams.toString()}&format=banner`;
  const hasDirectPhoto = Boolean(card.photoUrl && card.photoUrl.startsWith("http"));
  const primaryImage = hasDirectPhoto ? (card.photoUrl as string) : ogBannerImageUrl;

  return {
    title: `${card.name} — ${card.companyName} | Digital Business Card`,
    description: `${card.name}, ${card.designation} at ${card.companyName}. Connect via Call, WhatsApp, Location, and Share.`,
    alternates: {
      canonical: cardUrl,
    },
    openGraph: {
      title: `${card.name} — ${card.companyName}`,
      description: `${card.name}, ${card.designation} at ${card.companyName}. Connect via Call, WhatsApp, Location, and Share.`,
      url: cardUrl,
      siteName: "InaCard Digital Business Card",
      images: [
        {
          url: primaryImage,
          secureUrl: primaryImage,
          width: 600,
          height: 600,
          alt: `${card.name}`,
          type: "image/jpeg",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${card.name} — ${card.companyName}`,
      description: `${card.name}, ${card.designation} at ${card.companyName}`,
      images: [primaryImage],
    },
  };
}

export default async function PublicCardPage({ params, searchParams }: CardPageProps) {
  const card = await resolveCard(params.slug, searchParams?.d);

  if (!card) {
    notFound();
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
  const querySuffix = searchParams?.d ? `?d=${searchParams.d}` : "";
  const shareUrl = `${appUrl}/card/${card.slug}${querySuffix}`;

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md mx-auto space-y-6">
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
          slug={card.slug}
          shareUrl={shareUrl}
          isPreview={false}
          autoSave={searchParams?.save === "1" || searchParams?.scan === "1"}
        />

        {/* Footer actions for the public view */}
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-zinc-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Create your own card</span>
          </Link>

          <span className="inline-flex items-center gap-1 text-zinc-600">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>Powered by InaCard</span>
          </span>
        </div>
      </div>
    </div>
  );
}
