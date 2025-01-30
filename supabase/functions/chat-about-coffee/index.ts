import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function scrapeProductPage(url: string) {
  console.log('Fetching product data from:', url);
  
  try {
    const response = await fetch(url);
    const html = await response.text();

    // Basic parsing of product data using string manipulation
    const name = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() || 'Unknown Product';
    const description = html.match(/<div[^>]*class="[^"]*product-description[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1]?.trim() 
      ?.replace(/<[^>]+>/g, '') || 'No description available';
    
    // Extract roast level from description or default to medium
    let roastLevel = 'medium';
    if (description.toLowerCase().includes('light roast')) roastLevel = 'light';
    if (description.toLowerCase().includes('dark roast')) roastLevel = 'dark';
    if (description.toLowerCase().includes('medium-light')) roastLevel = 'medium-light';
    if (description.toLowerCase().includes('medium-dark')) roastLevel = 'medium-dark';

    // Extract flavor notes with expanded common notes
    const flavorNotes = [];
    const commonNotes = [
      'chocolate', 'nutty', 'fruity', 'floral', 'citrus', 'caramel', 'berry',
      'sweet', 'spicy', 'earthy', 'woody', 'vanilla', 'honey', 'maple',
      'tobacco', 'wine', 'cocoa', 'almond', 'hazelnut', 'toffee'
    ];
    for (const note of commonNotes) {
      if (description.toLowerCase().includes(note)) {
        flavorNotes.push(note);
      }
    }

    // Extract brewing methods with expanded methods
    const brewingMethods = [];
    const commonMethods = [
      'espresso', 'filter', 'french press', 'pour over', 'aeropress',
      'moka pot', 'chemex', 'drip', 'cold brew', 'siphon'
    ];
    for (const method of commonMethods) {
      if (description.toLowerCase().includes(method)) {
        brewingMethods.push(method);
      }
    }

    // Extract origin information
    let origin = null;
    const originPatterns = [
      /from\s+([A-Za-z\s]+)(?:,|\.|$)/i,
      /(?:grown|produced)\s+in\s+([A-Za-z\s]+)(?:,|\.|$)/i,
      /([A-Za-z\s]+)\s+(?:coffee|beans|origin)/i
    ];

    for (const pattern of originPatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        origin = match[1].trim();
        break;
      }
    }

    // Current timestamp for tracking
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    if (!message) {
      throw new Error('No message provided');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all products first
    const { data: products, error: dbError } = await supabase
      .from('amokka_products')
      .select('*')
      .eq('is_verified', true);

    if (dbError) throw dbError;

    // If a product is mentioned but not verified, try to scrape it
    const productNames = products?.map(p => p.name.toLowerCase()) || [];
    const messageWords = message.toLowerCase().split(' ');
    
    for (const product of products || []) {
      if (messageWords.includes(product.name.toLowerCase()) && !product.is_verified) {
        console.log(`Product ${product.name} mentioned but not verified, attempting to scrape`);
        const scrapedData = await scrapeProductPage(product.url);
        
        if (scrapedData) {
          const { data: updatedProduct, error: updateError } = await supabase
            .from('amokka_products')
            .update(scrapedData)
            .eq('id', product.id)
            .select()
            .single();

          if (!updateError && updatedProduct) {
            console.log(`Successfully updated product: ${product.name}`);
            if (products) {
              const index = products.findIndex(p => p.id === product.id);
              if (index !== -1) {
                products[index] = updatedProduct;
              }
            }
          }
        }
      }
    }

    if (!products || products.length === 0) {
      throw new Error('No verified products found in the database');
    }

    // Create context from product data
    const context = products
      .map(p => `Product: ${p.name}\nDescription: ${p.description}\nRoast Level: ${p.roast_level}\nFlavor Notes: ${p.flavor_notes.join(', ')}\nBrewing Methods: ${p.brewing_methods.join(', ')}\nOrigin: ${p.origin || 'Unknown'}\n\n`)
      .join('\n');

    // Call OpenAI with context
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a coffee expert who helps customers learn about Amokka's coffee selection. Use the following product information to provide accurate and helpful responses. Only reference products mentioned in the context. If you don't have information about something, be honest about it. Keep your responses concise and friendly.\n\nAvailable Products:\n${context}`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await openAIResponse.json();
    const response = data.choices[0].message.content;

    // Store the interaction
    await supabase
      .from('coffee_recommendations')
      .insert([
        {
          input_preferences: message,
          recommendation: response,
        }
      ]);

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-about-coffee function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'If you see this error, please make sure there are verified products in the database.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});