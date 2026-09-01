import { SiteHeader } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { ChromeProvider } from "@/components/layout/ChromeProvider";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { LetsTalkModal } from "@/components/layout/LetsTalkModal";
import { ConditionalSiteChrome } from "@/components/layout/ConditionalSiteChrome";
import { ScrollProvider } from "@/components/motion/ScrollProvider";

export default function SiteChromeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChromeProvider>
      <ScrollProvider>
        <SkipLink />
        <ConditionalSiteChrome>
          <SiteHeader />
          <SiteMenu />
        </ConditionalSiteChrome>
        <LetsTalkModal />
        {children}
        <ConditionalSiteChrome>
          <SiteFooter />
        </ConditionalSiteChrome>
      </ScrollProvider>
    </ChromeProvider>
  );
}
