"use client";

type Props = {
  children?: React.ReactNode;
};

/** Public pages now supply the captured DGS chrome directly where required. */
export function ConditionalSiteChrome({ children }: Props) {
  void children;
  return null;
}
