export type InnerMirrorSource = "live" | "rest-fallback";

export type InnerPageMirrorContent = {
  path: string;
  family: string;
  wordpressId: number;
  type: string;
  source: InnerMirrorSource;
  capturedAt: string;
  body: string;
  styles: string;
  cssFiles: string[];
  fontLinks: string[];
  fluentFormIds: string[];
  runPortfolio: boolean;
  needsThemeCss: boolean;
};
