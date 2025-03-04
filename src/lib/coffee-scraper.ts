
import { supabase } from "../integrations/supabase/client";

/**
 * Interface representing a coffee product
 */
export interface CoffeeProduct {
  name: string;
  description: string;
  roast_level: string;
  flavor_notes?: string[];
  url: string;
  origin?: string;
  processing_method?: string;
  brewing_methods?: string[];
  overall_description?: string;
  last_scraped_at?: string;
  created_at?: string;
  updated_at?: string;
  is_verified?: boolean;
}

/**
 * Scrape a single Amokka product URL
 * @param url The Amokka product URL to scrape
 * @returns Promise with the scraped product data
 */
export async function scrapeAmokkaProduct(url: string): Promise<CoffeeProduct | null> {
  try {
    const { data, error } = await supabase.functions.invoke('coffee-scraper', {
      body: { url }
    });

    if (error) {
      console.error('Error scraping product:', error);
      throw new Error(`Failed to scrape product: ${error.message}`);
    }

    if (!data?.success || !data?.product) {
      console.error('No product data returned:', data);
      return null;
    }

    return data.product as CoffeeProduct;
  } catch (error) {
    console.error('Exception in scrapeAmokkaProduct:', error);
    return null;
  }
}

/**
 * Scrape multiple Amokka product URLs
 * @param urls Array of Amokka product URLs to scrape
 * @returns Promise with a success message
 */
export async function scrapeMultipleProducts(urls: string[]): Promise<{success: boolean, message: string}> {
  try {
    if (!urls.length) {
      return { success: false, message: 'No URLs provided' };
    }
    
    const { data, error } = await supabase.functions.invoke('coffee-scraper', {
      body: { urls }
    });

    if (error) {
      console.error('Error scraping multiple products:', error);
      throw new Error(`Failed to scrape products: ${error.message}`);
    }

    if (!data?.success) {
      console.error('Failed bulk scraping operation:', data);
      return { success: false, message: data?.error || 'Unknown error occurred' };
    }

    return { 
      success: true, 
      message: data.message || `Successfully started scraping ${urls.length} products` 
    };
  } catch (error) {
    console.error('Exception in scrapeMultipleProducts:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Fetch all verified products from the database
 * @returns Promise with array of products
 */
export async function getAllVerifiedProducts(): Promise<CoffeeProduct[]> {
  try {
    const { data, error } = await supabase
      .from('amokka_products')
      .select('*')
      .eq('is_verified', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching verified products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
    
    return data as CoffeeProduct[];
  } catch (error) {
    console.error('Exception in getAllVerifiedProducts:', error);
    return [];
  }
}
