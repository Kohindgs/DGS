import './globals.css';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';

export const metadata = {
  metadataBase: new URL('https://www.dgeniussolutions.com'),
  title: {
    default: "D'Genius Solutions — Digital Marketing Agency in Mumbai",
    template: "%s | D'Genius Solutions",
  },
  description:
    "Mumbai's digital marketing agency for SEO, AEO, GEO, LLM search, AI video production, websites, social media, and performance marketing.",
  openGraph: {
    siteName: "D'Genius Solutions",
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
