type Props = {
  children: React.ReactNode;
};

/** Site chrome is always shown — native homepage uses Header/Footer, not WP mirror nav. */
export function ConditionalSiteChrome({ children }: Props) {
  return <>{children}</>;
}
