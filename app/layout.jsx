import './globals.css';
import { siteConfig } from './data/homepageData';

export const metadata = {
  title: "Digital Marketing Agency in Mumbai | D'Genius Solutions",
  description: "D'Genius Solutions is a full-service digital marketing agency in Mumbai offering Enterprise SEO, AEO, GEO, LLM SEO, Next.js web development, performance marketing, branding and AI-led creative production.",
  metadataBase: new URL('https://www.dgeniussolutions.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Digital Marketing Agency in Mumbai | D'Genius Solutions",
    description: "Full-service digital marketing agency in Mumbai offering Enterprise SEO, AEO, GEO, LLM SEO, Next.js web development, performance marketing, branding and AI-led creative production.",
    url: 'https://www.dgeniussolutions.com/',
    siteName: "D'Genius Solutions",
    images: [
      {
        url: 'https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp',
        width: 1200,
        height: 630,
        alt: "D'Genius Solutions - Digital Marketing & AI Growth Studio Mumbai",
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Digital Marketing Agency in Mumbai | D'Genius Solutions",
    description: "Full-service digital marketing agency in Mumbai offering SEO, AEO, GEO, LLM SEO, Next.js development, and AI-led production.",
    images: ['https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  themeColor: '#04060a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.dgeniussolutions.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
