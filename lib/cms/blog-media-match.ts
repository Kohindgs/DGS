export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export type MediaMatchConfidence = "EXACT" | "HIGH" | "MEDIUM" | "LOW" | "UNMATCHED";

export type MediaMatchResult = {
  matched: boolean;
  confidence: MediaMatchConfidence;
  score: number;
  reason: string;
  blogSlug: string;
  filename: string;
  isFeaturedCandidate: boolean;
  sequenceNumber: number | null;
};

export function evaluateMediaMatch(
  imageFilename: string,
  blogSlug: string,
  blogTitle?: string
): MediaMatchResult {
  const filename = imageFilename.trim();
  const cleanImageStem = slugify(filename.replace(/\.[^.]+$/, ""));
  const cleanBlogSlug = slugify(blogSlug);

  // Check for featured indicator
  const isFeaturedCandidate = /-(?:featured|hero|cover|banner|thumbnail|thumb)(?:-\d+)?$/i.test(cleanImageStem);

  // Check for sequence indicator
  const seqMatch = cleanImageStem.match(/(?:-(?:inline|img|image|figure|photo))?-?0*(\d+)$/i);
  const sequenceNumber = seqMatch ? parseInt(seqMatch[1], 10) : null;

  // Stripped stem removing roles and numbers
  const strippedStem = cleanImageStem
    .replace(/-(?:featured|hero|cover|banner|thumb|thumbnail|image|img|inline|figure|photo)(?:-\d+)?$/i, "")
    .replace(/-\d+$/i, "");

  // 1. EXACT: Direct equality or equality after role suffix removal
  if (cleanImageStem === cleanBlogSlug) {
    return {
      matched: true,
      confidence: "EXACT",
      score: 100,
      reason: "Exact filename match to blog slug",
      blogSlug: cleanBlogSlug,
      filename,
      isFeaturedCandidate,
      sequenceNumber,
    };
  }

  if (strippedStem === cleanBlogSlug && strippedStem.length > 0) {
    return {
      matched: true,
      confidence: "EXACT",
      score: 95,
      reason: "Exact slug match with media role or sequence suffix",
      blogSlug: cleanBlogSlug,
      filename,
      isFeaturedCandidate,
      sequenceNumber,
    };
  }

  // 2. HIGH: Strong prefix / substring alignment or >=80% token overlap
  if (
    strippedStem.length >= 8 &&
    cleanBlogSlug.length >= 8 &&
    (cleanBlogSlug.startsWith(strippedStem) || strippedStem.startsWith(cleanBlogSlug))
  ) {
    return {
      matched: true,
      confidence: "HIGH",
      score: 85,
      reason: "Strong stem prefix alignment with blog slug",
      blogSlug: cleanBlogSlug,
      filename,
      isFeaturedCandidate,
      sequenceNumber,
    };
  }

  const imageTokens = cleanImageStem.split("-").filter((t) => t.length > 2);
  const blogTokens = cleanBlogSlug.split("-").filter((t) => t.length > 2);
  const blogTokenSet = new Set(blogTokens);

  let tokenMatches = 0;
  for (const token of imageTokens) {
    if (blogTokenSet.has(token)) tokenMatches++;
  }

  const tokenRatio = blogTokens.length > 0 ? tokenMatches / blogTokens.length : 0;
  const imageTokenRatio = imageTokens.length > 0 ? tokenMatches / imageTokens.length : 0;

  if (tokenMatches >= 3 && (tokenRatio >= 0.75 || imageTokenRatio >= 0.75)) {
    return {
      matched: true,
      confidence: "HIGH",
      score: 80,
      reason: `High token overlap (${tokenMatches} common terms)`,
      blogSlug: cleanBlogSlug,
      filename,
      isFeaturedCandidate,
      sequenceNumber,
    };
  }

  // 3. MEDIUM: >= 50% overlap of image tokens or >= 40% of blog tokens and >= 2 significant tokens, or title token match
  if (tokenMatches >= 2 && (imageTokenRatio >= 0.5 || tokenRatio >= 0.4 || tokenMatches >= 3)) {
    return {
      matched: true,
      confidence: "MEDIUM",
      score: 65,
      reason: `Moderate token overlap (${tokenMatches} matching terms)`,
      blogSlug: cleanBlogSlug,
      filename,
      isFeaturedCandidate,
      sequenceNumber,
    };
  }

  if (blogTitle) {
    const cleanTitleTokens = slugify(blogTitle).split("-").filter((t) => t.length > 2);
    const titleTokenSet = new Set(cleanTitleTokens);
    let titleMatches = 0;
    for (const token of imageTokens) {
      if (titleTokenSet.has(token)) titleMatches++;
    }
    const imageTitleRatio = imageTokens.length > 0 ? titleMatches / imageTokens.length : 0;
    if (titleMatches >= 2 && (imageTitleRatio >= 0.5 || titleMatches >= cleanTitleTokens.length * 0.3)) {
      return {
        matched: true,
        confidence: "MEDIUM",
        score: 60,
        reason: `Matched via blog title tokens (${titleMatches} terms)`,
        blogSlug: cleanBlogSlug,
        filename,
        isFeaturedCandidate,
        sequenceNumber,
      };
    }
  }

  // 4. LOW: 1 match or low overlap (< 50%)
  if (tokenMatches >= 1) {
    return {
      matched: false,
      confidence: "LOW",
      score: 35,
      reason: `Weak keyword overlap (${tokenMatches} term) — manual assignment required`,
      blogSlug: cleanBlogSlug,
      filename,
      isFeaturedCandidate,
      sequenceNumber,
    };
  }

  // 5. UNMATCHED
  return {
    matched: false,
    confidence: "UNMATCHED",
    score: 0,
    reason: "No meaningful alignment with blog slug or title",
    blogSlug: cleanBlogSlug,
    filename,
    isFeaturedCandidate,
    sequenceNumber,
  };
}

export function imageMatchesSlug(imageFilename: string, blogSlug: string): boolean {
  return evaluateMediaMatch(imageFilename, blogSlug).matched;
}
