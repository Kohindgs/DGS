import type { Metadata } from "next";
import { isPublicIndexingEnabled } from "@/lib/seo/environment";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
