
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { scrapeProductPage } from "../chat-about-coffee/product-scraper.ts";
import { isValidAmokkaUrl } from "./url-validator.ts";
import { saveProductToDatabase, processBulkUrls } from "./product-processor.ts";

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
    // Check authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Parse request
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
