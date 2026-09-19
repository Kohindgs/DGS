import type { ReactNode } from "react";
import { loadWpExtractedAssets } from "@/lib/wp-exact/load-extracted-assets";
import { DgsWpBoot } from "@/components/wp-exact/DgsWpBoot";

export async function BlogWpChrome({ children }: { children: ReactNode }) {
  const assets = await loadWpExtractedAssets();
  return (
    <>
      <link rel="preconnect" href="https://www.dgeniussolutions.com" />
      <style dangerouslySetInnerHTML={{ __html: assets.navStyles }} />
      <style dangerouslySetInnerHTML={{ __html: assets.fluentformStyles }} />
      <style dangerouslySetInnerHTML={{ __html: assets.footerStyles }} />
      <div dangerouslySetInnerHTML={{ __html: assets.navHtml }} />
      {children}
      <div dangerouslySetInnerHTML={{ __html: assets.footerHtml }} />
      <DgsWpBoot
        bootNav={assets.bootNav}
        bootV1215=""
        bootPortfolio=""
        bootFooter={assets.bootFooter}
        runV1215={false}
        runPortfolio={false}
      />
    </>
  );
}
