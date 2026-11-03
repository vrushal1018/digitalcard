import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCardBySlug } from "@/lib/cards";
import { DigitalCard } from "@/components/digital-card/DigitalCard";
import { Sparkles, ArrowLeft } from "lucide-react";

interface CardPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: CardPageProps): Promise<Metadata> {
  const card = await getCardBySlug(params.slug);
  if (!card) {
    return {
      title: "Card Not Found | Digital Business Card",
      description: "Digital business card not found.",
    };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const cardUrl = `${appUrl}/card/${card.slug}`;
  const resolvedPhoto = card.photoUrl.startsWith("http")
    ? card.photoUrl
    : `${appUrl}${card.photoUrl.startsWith("/") ? "" : "/"}${card.photoUrl}`;

  return {
    title: `${card.name} — ${card.companyName} | Digital Business Card`,
    description: `${card.name}, ${card.designation} at ${card.companyName}. Connect via Call, WhatsApp, Location, and Share.`,
    alternates: {
      canonical: cardUrl,
    },
    openGraph: {
      title: `${card.name} — ${card.companyName}`,
      description: `${card.name}, ${card.designation} at ${card.companyName}`,
      url: cardUrl,
      siteName: "InaCard Digital Business Card",
      images: [
        {
          url: resolvedPhoto,
          width: 800,
          height: 800,
          alt: `${card.name} profile photo`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${card.name} — ${card.companyName}`,
      description: `${card.name}, ${card.designation} at ${card.companyName}`,
      images: [resolvedPhoto],
    },
  };
}

export default async function PublicCardPage({ params }: CardPageProps) {
  const card = await getCardBySlug(params.slug);

  if (!card) {
    notFound();
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const shareUrl = `${appUrl}/card/${card.slug}`;

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
          slug={card.slug}
          shareUrl={shareUrl}
          isPreview={false}
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
