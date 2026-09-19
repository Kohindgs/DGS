import { SiteHeader } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { ChromeProvider } from "@/components/layout/ChromeProvider";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { LetsTalkModal } from "@/components/layout/LetsTalkModal";
import { ConditionalSiteChrome } from "@/components/layout/ConditionalSiteChrome";

export default function SiteChromeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChromeProvider>
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
    </ChromeProvider>
  );
}
