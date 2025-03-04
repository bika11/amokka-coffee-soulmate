
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";
import { corsHeaders } from "../_shared/cors.ts";
import { scrapeProductPage } from "../chat-about-coffee/product-scraper.ts";

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper function to validate URL
function isValidAmokkaUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'amokka.com' && 
           urlObj.pathname.includes('/products/');
  } catch {
    return false;
  }
}

serve(async (req) => {
  console.log(`${req.method} request to ${req.url}`);
  const origin = req.headers.get('origin') || '*';

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': origin,
      }
    });
  }

  try {
    // Check authorization (implement proper auth check based on your requirements)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Parse request - expecting { url: string } or { urls: string[] }
    const requestData = await req.json();
    
    if (!requestData.url && !requestData.urls) {
      return new Response(
        JSON.stringify({ error: "Missing url or urls parameter" }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Process single URL
    if (requestData.url) {
      const url = requestData.url;
      
      if (!isValidAmokkaUrl(url)) {
        return new Response(
          JSON.stringify({ error: "Invalid URL, only Amokka product URLs are allowed" }),
          { 
            status: 400,
            headers: {
              ...corsHeaders,
              'Access-Control-Allow-Origin': origin,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      console.log(`Scraping URL: ${url}`);
      const productData = await scrapeProductPage(url);
      
      if (!productData) {
        return new Response(
          JSON.stringify({ error: "Failed to scrape product" }),
          { 
            status: 500,
            headers: {
              ...corsHeaders,
              'Access-Control-Allow-Origin': origin,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Save to database as background task
      EdgeRuntime.waitUntil(saveProductToDatabase(productData));

      return new Response(
        JSON.stringify({ success: true, product: productData }),
        { 
          headers: {
            ...corsHeaders,
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Process multiple URLs
    if (requestData.urls && Array.isArray(requestData.urls)) {
      const urls = requestData.urls;
      const invalidUrls = urls.filter(url => !isValidAmokkaUrl(url));
      
      if (invalidUrls.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: "Invalid URLs detected, only Amokka product URLs are allowed",
            invalidUrls 
          }),
          { 
            status: 400,
            headers: {
              ...corsHeaders,
              'Access-Control-Allow-Origin': origin,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      console.log(`Scraping ${urls.length} URLs`);
      
      // Process URLs in background to avoid timeout
      EdgeRuntime.waitUntil(processBulkUrls(urls));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Processing ${urls.length} URLs in the background` 
        }),
        { 
          headers: {
            ...corsHeaders,
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid request format" }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    console.error('Error in coffee-scraper function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    );
  }
});

// Helper function to save product to database
async function saveProductToDatabase(productData: any) {
  try {
    const { error } = await supabaseAdmin
      .from('amokka_products')
      .upsert(
        [productData],
        { 
          onConflict: 'url',
          ignoreDuplicates: false 
        }
      );
    
    if (error) {
      console.error('Error saving product to database:', error);
    } else {
      console.log(`Product "${productData.name}" saved successfully`);
    }
  } catch (error) {
    console.error('Exception saving product to database:', error);
  }
}

// Helper function to process multiple URLs in background
async function processBulkUrls(urls: string[]) {
  console.log(`Starting background processing of ${urls.length} URLs`);
  const results = { successful: 0, failed: 0, errors: [] };
  
  for (const url of urls) {
    try {
      console.log(`Processing URL: ${url}`);
      const productData = await scrapeProductPage(url);
      
      if (productData) {
        await saveProductToDatabase(productData);
        results.successful++;
      } else {
        results.failed++;
        results.errors.push({ url, error: "Failed to scrape product" });
      }
    } catch (error) {
      console.error(`Error processing URL ${url}:`, error);
      results.failed++;
      results.errors.push({ url, error: error.message });
    }
    
    // Add a small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`Bulk processing complete. Success: ${results.successful}, Failed: ${results.failed}`);
  return results;
}
