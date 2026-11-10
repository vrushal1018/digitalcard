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
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
