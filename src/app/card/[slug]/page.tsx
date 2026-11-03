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

  return {
    title: `${card.name} — ${card.companyName} | Digital Business Card`,
    description: `${card.name}, ${card.designation} at ${card.companyName}. Connect via Call, WhatsApp, Location, and Share.`,
    openGraph: {
      title: `${card.name} — ${card.companyName}`,
      description: `${card.designation} at ${card.companyName}`,
      images: card.photoUrl ? [{ url: card.photoUrl }] : [],
    },
  };
}

export default async function PublicCardPage({ params }: CardPageProps) {
  const card = await getCardBySlug(params.slug);

  if (!card) {
    notFound();
  }

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
          isPreview={false}
        />

        {/* Footer actions for the public view */}
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-zinc-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Create your card</span>
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
