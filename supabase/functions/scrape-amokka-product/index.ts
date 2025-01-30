import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@1.35.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url || !url.includes('amokka.com')) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing Amokka.com URL' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Fetching product data from:', url);

    // Fetch the product page
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch product page: ${response.statusText}`);
    }
    
    const html = await response.text();

    // Extract product data using regex patterns
    const name = html.match(/<h1[^>]*class="[^"]*product-single__title[^"]*"[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() 
      || html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() 
      || 'Unknown Product';

    const description = html.match(/<div[^>]*class="[^"]*product-description[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1]?.trim()
      ?.replace(/<[^>]+>/g, '') 
      || html.match(/<div[^>]*class="[^"]*product__description[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1]?.trim()
      ?.replace(/<[^>]+>/g, '')
      || 'No description available';
    
    // Extract roast level from description
    let roastLevel = 'medium';
    const roastLevelText = description.toLowerCase();
    if (roastLevelText.includes('light roast')) roastLevel = 'light';
    else if (roastLevelText.includes('dark roast')) roastLevel = 'dark';
    else if (roastLevelText.includes('medium-light')) roastLevel = 'medium-light';
    else if (roastLevelText.includes('medium-dark')) roastLevel = 'medium-dark';

    // Extract flavor notes
    const flavorNotes = [];
    const commonNotes = [
      'chocolate', 'nutty', 'fruity', 'floral', 'citrus', 'caramel', 'berry',
      'sweet', 'spicy', 'earthy', 'woody', 'vanilla', 'honey', 'maple'
    ];
    
    for (const note of commonNotes) {
      if (description.toLowerCase().includes(note)) {
        flavorNotes.push(note);
      }
    }

    // Extract brewing methods
    const brewingMethods = [];
    const commonMethods = [
      'espresso', 'filter', 'french press', 'pour over', 'aeropress',
      'moka pot', 'cold brew', 'drip'
    ];
    
    for (const method of commonMethods) {
      if (description.toLowerCase().includes(method)) {
        brewingMethods.push(method);
      }
    }

    // Extract origin if available
    const origin = description.match(/(?:from|origin:?\s*)([\w\s,]+)(?=\.|\n|$)/i)?.[1]?.trim() || null;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Storing product data:', { name, roastLevel, flavorNotes, brewingMethods });

    // Store the product data
    const { data, error } = await supabase
      .from('amokka_products')
      .upsert({
        url,
        name,
        description,
        roast_level: roastLevel,
        flavor_notes: flavorNotes,
        brewing_methods: brewingMethods,
        origin,
        last_scraped_at: new Date().toISOString(),
      }, {
        onConflict: 'url'
      });

    if (error) {
      console.error('Error storing product data:', error);
      throw error;
    }

    console.log('Successfully stored product data for:', name);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Product data scraped and stored successfully',
        data: {
          name,
          description,
          roast_level: roastLevel,
          flavor_notes: flavorNotes,
          brewing_methods: brewingMethods,
          origin
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in scrape-amokka-product function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});