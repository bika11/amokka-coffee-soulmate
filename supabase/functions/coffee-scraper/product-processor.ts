import { createSupabaseAdmin } from "../_shared/supabase-admin.ts";
import { scrapeProductPage } from "./product-scraper.ts";

const supabaseAdmin = createSupabaseAdmin();

export async function saveProductToDatabase(productData: any) {
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

export async function processBulkUrls(urls: string[]) {
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
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`Bulk processing complete. Success: ${results.successful}, Failed: ${results.failed}`);
  return results;
}
