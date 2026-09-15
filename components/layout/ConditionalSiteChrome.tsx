"use client";

import { usePathname } from "next/navigation";

type Props = {
  children?: React.ReactNode;
};

/** Mirror pages supply captured WP chrome; native blog pages need Next chrome. */
export function ConditionalSiteChrome({ children }: Props) {
  const pathname = usePathname();
  const isBlog = pathname === "/blogs" || pathname?.startsWith("/blogs/");
  return isBlog ? <>{children}</> : null;
}
