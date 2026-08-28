export function isPublicIndexingEnabled() {
  return process.env.DGS_PUBLIC_INDEXING === "true";
}

export function requirePublicIndexingConfirmation() {
  if (!isPublicIndexingEnabled()) {
    throw new Error(
      "Public indexing is disabled. Set DGS_PUBLIC_INDEXING=true only for an explicitly approved production cutover.",
    );
  }
}
