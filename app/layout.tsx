import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { FormActivationBoot } from "@/components/forms/FormActivationBoot";
import { isPublicIndexingEnabled } from "@/lib/seo/environment";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dgeniussolutions.com"),
  title: {
    default: "D'Genius Solutions",
    template: "%s",
  },
  description: "Digital marketing agency in Mumbai offering SEO, AEO, GEO, LLM SEO, AI video production, performance marketing, branding and website development.",
  robots: {
    index: isPublicIndexingEnabled(),
    follow: isPublicIndexingEnabled(),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body>
        {children}
        <FormActivationBoot />
      </body>
    </html>
  );
}
