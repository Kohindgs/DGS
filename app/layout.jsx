import { Syne, Outfit } from 'next/font/google';
import SiteChrome from '@/app/components/site/SiteChrome';
import './globals.css';

const display = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['500', '600', '700', '800'],
});

const sans = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata = {
  title: 'Digital Marketing Agency in Mumbai | D’Genius Solutions',
  description:
    'D’Genius Solutions is a full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <body className={`${display.variable} ${sans.variable} antialiased`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
