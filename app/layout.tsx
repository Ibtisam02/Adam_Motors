import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RecaptchaScript from "@/components/RecaptchaScript";
import { getCategories } from "@/actions/category.actions";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Adam Motors";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Premium New & Pre-Owned Vehicles`,
    template: `%s | ${siteName}`,
  },
  description:
    "Browse a curated inventory of new and pre-owned vehicles. Transparent pricing, flexible installment plans, and a showroom team that puts you first.",
  keywords: [
    "car dealership",
    "used cars",
    "new cars",
    "car financing",
    "vehicle inventory",
    siteName,
  ],
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} | Premium New & Pre-Owned Vehicles`,
    description:
      "Browse a curated inventory of new and pre-owned vehicles with transparent pricing and flexible installment plans.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Premium New & Pre-Owned Vehicles`,
    description:
      "Browse a curated inventory of new and pre-owned vehicles with transparent pricing and flexible installment plans.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0C10",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    categories = await getCategories();
  } catch {
    // If the database is unreachable at build/runtime, render with no
    // categories rather than crashing the whole layout.
    categories = [];
  }

  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <RecaptchaScript />
        <Navbar categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer categories={categories} />
      </body>
    </html>
  );
}
