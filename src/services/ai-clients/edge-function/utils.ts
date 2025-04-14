
/**
 * Extracts a coffee name from completion text
 */
export function extractCoffeeName(text: string): string {
  // Simple extraction - get the first term that looks like a coffee name
  // This is a simplistic approach and might need refinement
  const sentences = text.split(/[.!?]/);
  for (const sentence of sentences) {
    const words = sentence.split(' ');
    for (let i = 0; i < words.length - 1; i++) {
      // Look for sequences that might be coffee names (2-3 words with some capitalization)
      const term = words.slice(i, i + 3).join(' ').trim();
      if (/[A-Z]/.test(term) && term.length > 4) {
        return term;
      }
    }
  }
  return "Unknown Coffee";
}
