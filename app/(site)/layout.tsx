import { SiteHeader } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { ChromeProvider } from "@/components/layout/ChromeProvider";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { LetsTalkModal } from "@/components/layout/LetsTalkModal";
import { DgsWebGLBackground } from "@/components/background/DgsWebGLBackground";
import { ScrollProvider } from "@/components/motion/ScrollProvider";

export default function SiteChromeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChromeProvider>
      <DgsWebGLBackground />
      <ScrollProvider>
        <SkipLink />
        <SiteHeader />
        <SiteMenu />
        <LetsTalkModal />
        {children}
        <SiteFooter />
      </ScrollProvider>
    </ChromeProvider>
  );
}
