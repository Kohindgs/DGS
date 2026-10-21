import { SiteHeader } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/Footer";

export default function SiteChromeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <div id="main-content">{children}</div>
      <SiteFooter />
    </>
  );
}
