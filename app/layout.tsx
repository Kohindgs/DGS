import type { Metadata } from "next";
import Script from "next/script";
import { Manrope, Space_Grotesk } from "next/font/google";
import { FormActivationBoot } from "@/components/forms/FormActivationBoot";
import "./globals.css";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-601FNG2NZP";

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
  icons: {
    icon: [
      { url: "/wp-content/uploads/2025/11/cropped-DGS-LOGO-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/wp-content/uploads/2025/11/cropped-DGS-LOGO-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/wp-content/uploads/2025/11/cropped-DGS-LOGO-180x180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        {children}
        <FormActivationBoot />
      </body>
    </html>
  );
}
