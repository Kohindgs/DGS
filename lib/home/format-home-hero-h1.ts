/** Format homepage H1 to match live WordPress line breaks. */
export function formatHomeHeroH1(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (/full service digital marketing agency in mumbai/i.test(normalized)) {
    return "Full Service\nDigital Marketing\nAgency In Mumbai";
  }
  return normalized;
}
