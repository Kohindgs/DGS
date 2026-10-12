import { siteConfig } from "@/lib/seo/site";

export type PublishVerificationResult = {
  ok: boolean;
  error?: string;
  blogStatus: number;
  imageStatus?: number;
  verifiedAt: string;
};

export async function verifyPublishedBlogWithRetries(
  slug: string,
  featuredImageUrl: string | null | undefined,
  origin: string
): Promise<PublishVerificationResult> {
  const delays = [1000, 2000, 2000];
  const publicBlogUrl = `${siteConfig.url}/blogs/${slug}/`;
  const internalBlogUrl = `${origin}/blogs/${slug}/`;

  let lastError = "";
  let lastBlogStatus = 0;
  let lastImageStatus: number | undefined;

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, delays[attempt - 1]));
    }

    try {
      // 1. Try public URL, fallback to internal origin
      let blogRes: Response | null = null;
      try {
        blogRes = await fetch(publicBlogUrl, {
          cache: "no-store",
          headers: { "User-Agent": "DGS-Publish-Verification/1.0" },
        });
      } catch {
        // If public fetch has network / self-signed / hairpin error, use internal origin
        blogRes = await fetch(internalBlogUrl, {
          cache: "no-store",
          headers: { "User-Agent": "DGS-Publish-Verification/1.0" },
        });
      }

      lastBlogStatus = blogRes.status;
      if (blogRes.status !== 200) {
        lastError = `Public blog route returned HTTP ${blogRes.status} instead of 200`;
        continue;
      }

      // 2. Check featured image if present
      if (featuredImageUrl) {
        let fullImageUrl = featuredImageUrl;
        if (fullImageUrl.startsWith("/")) {
          fullImageUrl = `${siteConfig.url}${fullImageUrl}`;
        }

        let imgRes: Response | null = null;
        try {
          imgRes = await fetch(fullImageUrl, {
            method: "HEAD",
            cache: "no-store",
            headers: { "User-Agent": "DGS-Publish-Verification/1.0" },
          });
        } catch {
          if (featuredImageUrl.startsWith("/")) {
            imgRes = await fetch(`${origin}${featuredImageUrl}`, {
              method: "HEAD",
              cache: "no-store",
              headers: { "User-Agent": "DGS-Publish-Verification/1.0" },
            });
          }
        }

        if (imgRes) {
          lastImageStatus = imgRes.status;
          const contentType = imgRes.headers.get("content-type") || "";
          if (imgRes.status < 200 || imgRes.status >= 400) {
            lastError = `Featured image returned HTTP ${imgRes.status}`;
            continue;
          }
          if (contentType && !contentType.startsWith("image/")) {
            lastError = `Featured image returned Content-Type "${contentType}" instead of image/*`;
            continue;
          }
        }
      }

      // Passed all checks!
      return {
        ok: true,
        blogStatus: lastBlogStatus,
        imageStatus: lastImageStatus,
        verifiedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      lastError = err?.message || "Verification request failed";
    }
  }

  return {
    ok: false,
    error: lastError,
    blogStatus: lastBlogStatus,
    imageStatus: lastImageStatus,
    verifiedAt: new Date().toISOString(),
  };
}
