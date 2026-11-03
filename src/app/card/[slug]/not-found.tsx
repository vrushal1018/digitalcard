import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function CardNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        Digital Card Not Found
      </h1>
      <p className="text-sm text-zinc-400 max-w-md mt-2 mb-8">
        The digital business card you are looking for does not exist or may have been removed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors border border-zinc-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Create a New Card</span>
      </Link>
    </div>
  );
}

