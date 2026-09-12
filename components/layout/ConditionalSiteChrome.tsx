"use client";

type Props = {
  children?: React.ReactNode;
};

/** Inner pages and homepage supply extracted WordPress nav/footer; hide Next chrome. */
export function ConditionalSiteChrome(props: Props) {
  void props.children;
  return null;
}
