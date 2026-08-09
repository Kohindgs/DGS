import './globals.css';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export const metadata = {
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

export default function SiteLayout({ children }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600&display=swap"
      />
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
