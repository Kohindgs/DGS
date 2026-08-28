"use client";

import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

/** Hides default site chrome on the homepage — WP mirror supplies its own nav/footer. */
export function ConditionalSiteChrome({ children }: Props) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <>{children}</>;
}
