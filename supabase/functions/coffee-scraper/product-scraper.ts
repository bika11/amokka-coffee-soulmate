

export async function scrapeProductPage(url: string) {
  console.log('Fetching product data from:', url);
  
  try {
    const response = await fetch(url);
    const html = await response.text();

    const name = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() || 'Unknown Product';
    const description = html.match(/<div[^>]*class="[^"]*product-description[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1]?.trim() 
      ?.replace(/<[^>]+>/g, '') || 'No description available';
    
    let roastLevel = 'medium';
    if (description.toLowerCase().includes('light roast')) roastLevel = 'light';
    if (description.toLowerCase().includes('dark roast')) roastLevel = 'dark';
    if (description.toLowerCase().includes('medium-light')) roastLevel = 'medium-light';
    if (description.toLowerCase().includes('medium-dark')) roastLevel = 'medium-dark';

    const flavorNotes = extractFlavorNotes(description);
    const brewingMethods = extractBrewingMethods(description);
    const origin = extractOrigin(description);
    const now = new Date().toISOString();

    return {
      url,
      name,
      description,
      roast_level: roastLevel,
      flavor_notes: flavorNotes,
      brewing_methods: brewingMethods,
      origin,
      last_scraped_at: now,
      is_verified: true,
      created_at: now,
      updated_at: now
    };
  } catch (error) {
    console.error('Error scraping product:', error);
    return null;
  }
}

function extractFlavorNotes(description: string): string[] {
  const commonNotes = [
    'chocolate', 'nutty', 'fruity', 'floral', 'citrus', 'caramel', 'berry',
    'sweet', 'spicy', 'earthy', 'woody', 'vanilla', 'honey', 'maple',
    'tobacco', 'wine', 'cocoa', 'almond', 'hazelnut', 'toffee'
  ];
  return commonNotes.filter(note => description.toLowerCase().includes(note));
}

function extractBrewingMethods(description: string): string[] {
  const commonMethods = [
    'espresso', 'filter', 'french press', 'pour over', 'aeropress',
    'moka pot', 'chemex', 'drip', 'cold brew', 'siphon'
  ];
  return commonMethods.filter(method => description.toLowerCase().includes(method));
}

function extractOrigin(description: string): string | null {
  const originPatterns = [
    /from\s+([A-Za-z\s]+)(?:,|\.|$)/i,
    /(?:grown|produced)\s+in\s+([A-Za-z\s]+)(?:,|\.|$)/i,
    /([A-Za-z\s]+)\s+(?:coffee|beans|origin)/i
  ];

  for (const pattern of originPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}
