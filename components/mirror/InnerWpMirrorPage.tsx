import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadInnerPageMirror } from "@/lib/wordpress/load-inner-page-mirror";
import { prepareInnerPageMirror } from "@/lib/wordpress/prepare-inner-page-mirror";
import { loadWpExtractedAssets } from "@/lib/wp-exact/load-extracted-assets";
import { DgsWpBoot } from "@/components/wp-exact/DgsWpBoot";
import { JsonLd } from "@/components/seo/JsonLd";
import type { JsonLdValue } from "@/lib/schema/jsonld";

const WP_CDN_ORIGIN = "https://www.dgeniussolutions.com";

async function loadMirrorOverridesCss(): Promise<string> {
  try {
    return await readFile(join(process.cwd(), "lib/wp-exact/inner-mirror-overrides.css"), "utf8");
  } catch {
    return "";
  }
}

type InnerWpMirrorPageProps = {
  path: string;
  wordpressId: number;
  schemaBlocks?: JsonLdValue;
};

export async function InnerWpMirrorPage({ path, wordpressId, schemaBlocks }: InnerWpMirrorPageProps) {
  const [content, assets, mirrorOverrides] = await Promise.all([
    loadInnerPageMirror(path),
    loadWpExtractedAssets(),
    loadMirrorOverridesCss(),
  ]);

  const prepared = prepareInnerPageMirror(content, wordpressId);

  return (
    <>
      <link rel="preconnect" href={WP_CDN_ORIGIN} />
      <link rel="dns-prefetch" href={WP_CDN_ORIGIN} />

      {schemaBlocks ? <JsonLd id="page-jsonld" value={schemaBlocks} /> : null}

      {prepared.fontLinks?.map((linkHtml, index) => (
        <div key={`font-${index}`} dangerouslySetInnerHTML={{ __html: linkHtml }} />
      ))}

      {(content.cssFiles || []).map((file) => (
        <link key={file} rel="stylesheet" href={`/wp-mirror-css/${file}`} />
      ))}

      <style dangerouslySetInnerHTML={{ __html: assets.navStyles }} />
      {prepared.combinedStyles ? <style dangerouslySetInnerHTML={{ __html: prepared.combinedStyles }} /> : null}
      <style dangerouslySetInnerHTML={{ __html: assets.fluentformStyles }} />
      <style dangerouslySetInnerHTML={{ __html: assets.footerStyles }} />
      <style dangerouslySetInnerHTML={{ __html: mirrorOverrides }} />

      <div dangerouslySetInnerHTML={{ __html: assets.navHtml }} />

      <div className="dgs-wp-mirror-inner" dangerouslySetInnerHTML={{ __html: prepared.articleHtml }} />

      <div dangerouslySetInnerHTML={{ __html: assets.footerHtml }} />

      <DgsWpBoot
        bootNav={assets.bootNav}
        bootV1215=""
        bootPortfolio=""
        runV1215={false}
        runPortfolio={false}
      />
    </>
  );
}
