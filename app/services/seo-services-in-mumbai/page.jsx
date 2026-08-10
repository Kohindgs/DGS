import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'app/services/seo-services-in-mumbai/_wp_data');
const links = fs.readFileSync(path.join(dataDir, 'links.html'), 'utf8');
const styles = fs.readFileSync(path.join(dataDir, 'styles.html'), 'utf8');
const body = fs.readFileSync(path.join(dataDir, 'body.html'), 'utf8');
const { title, desc, canonical, bodyClass, schemas } = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'meta.json'), 'utf8')
);

export const metadata = {
  title,
  description: desc,
  alternates: { canonical },
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: s }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: links }} />
      <div dangerouslySetInnerHTML={{ __html: styles }} />
      <div className={bodyClass} dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
