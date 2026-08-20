import fs from 'fs';
import path from 'path';
import HomepageClient from './components/homepage/HomepageClient';

const dataDir = path.join(process.cwd(), 'app/_wp_data');
let pageMeta = {
  title: "Digital Marketing Agency in Mumbai | D'Genius Solutions",
  desc: "D'Genius Solutions is a full service digital marketing agency in Mumbai offering connected search, website development, social media, performance marketing, branding and AI-led creative production.",
  canonical: "/",
  schemas: []
};

try {
  const metaRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'meta.json'), 'utf8'));
  pageMeta.title = metaRaw.title || pageMeta.title;
  pageMeta.desc = metaRaw.desc || pageMeta.desc;
  pageMeta.canonical = metaRaw.canonical || pageMeta.canonical;
  pageMeta.schemas = metaRaw.schemas || [];
} catch (e) {
  // fallback
}

export const metadata = {
  title: pageMeta.title,
  description: pageMeta.desc,
  alternates: { canonical: pageMeta.canonical },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <>
      <link 
        rel="preload" 
        href="https://www.dgeniussolutions.com/wp-content/uploads/2026/01/thoughtful-logo-concept-featuring-ai-meaningful-way.webp" 
        as="image" 
        fetchPriority="high" 
      />
      {pageMeta.schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: s }} />
      ))}
      <HomepageClient />
    </>
  );
}
