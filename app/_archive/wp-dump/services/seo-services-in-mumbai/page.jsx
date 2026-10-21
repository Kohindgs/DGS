import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'app/services/seo-services-in-mumbai/_wp_data');
const links = fs.readFileSync(path.join(dataDir, 'links.html'), 'utf8');
const styles = fs.readFileSync(path.join(dataDir, 'styles.html'), 'utf8');
let body = fs.readFileSync(path.join(dataDir, 'body.html'), 'utf8');
const { title, desc, canonical, bodyClass, schemas } = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'meta.json'), 'utf8')
);

// Images must be visible always: swap every lazyload data-src placeholder to a
// real src, drop the lazyload class and Smush placeholder style so no image is
// hidden behind a 1x1 transparent gif + opacity:0 waiting on JS.
body = body.replace(/<img\s[^>]*>/g, (tag) => {
  const dataSrc = tag.match(/data-src="([^"]+)"/);
  if (!dataSrc) return tag;
  const url = dataSrc[1];
  let out = tag.replace(/\s+data-src="[^"]*"/, '');
  if (/src="data:image\/(?:gif|svg\+xml);[^"]*"/.test(out)) {
    out = out.replace(/src="data:image\/(?:gif|svg\+xml);[^"]*"/, `src="${url}"`);
  } else {
    out = out.replace(/^<img/, `<img src="${url}"`);
  }
  out = out.replace(/\s+class="lazyload(?: [^"]*)?"/, '');
  out = out.replace(/\s+style="--smush-placeholder[^"]*"/, '');
  return out;
});

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
