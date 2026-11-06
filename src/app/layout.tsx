import type { Metadata, Viewport } from "next";
import "./globals.css";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Digital Business Card Builder",
  description: "Create and share interactive, premium digital business cards with one tap.",
  openGraph: {
    siteName: "InaCard",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#07080a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07080a] text-zinc-100 min-h-screen flex flex-col selection:bg-sky-500 selection:text-zinc-950">
        <header className="border-b border-zinc-800/60 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-bold tracking-tight text-white select-none">
              <span className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center text-xs">
                🪪
              </span>
              <span className="text-sm sm:text-base">Ina SpaceWorks</span>
            </div>
            <span className="text-xs text-zinc-400">Digital Business Card</span>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
