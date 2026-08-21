import HomeView from '@/app/components/site/HomeView';
import { HOME_SEO, HOME_FAQS, organizationSchema } from '@/lib/content';

export const metadata = {
  title: HOME_SEO.title,
  description: HOME_SEO.description,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
};

export default function Page() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HomeView />
    </>
  );
}
