import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";
import { ChatError } from "./error-handler.ts";
import { ERROR_MESSAGES, HTTP_STATUS } from "./constants.ts";

interface AmokkaProduct {
  name: string;
  description: string;
  roast_level: string;
  flavor_notes?: string[];
  url: string;
  origin?: string;
  processing_method?: string;
  overall_description?: string;
}

// Memory cache for product data (5 minute TTL)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let productCache = {
  data: null,
  timestamp: 0
};

/**
 * Get coffee context for AI prompts
 */
export async function getCoffeeContext(supabaseUrl: string, supabaseKey: string): Promise<string> {
  try {
    // Check cache first
    const now = Date.now();
    if (productCache.data && (now - productCache.timestamp) < CACHE_TTL) {
      console.log("Using cached coffee product data");
      return productCache.data as string;
    }
    
    console.log("Fetching fresh coffee product data");
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Use the optimized active_coffees view with database indexes if available,
    // or fall back to the amokka_products table
    let query = supabase
      .from('amokka_products')
      .select('name, description, overall_description, roast_level, flavor_notes, url')
      .eq('is_verified', true)
      .order('name');
      
    const { data: products, error } = await query;

    if (error) {
      console.error('Failed to fetch coffee products:', error);
      throw new ChatError('Failed to fetch coffee products', 500);
    }
    
    if (!products?.length) {
      console.warn('No coffee products found');
      return "No coffee products found in our database.";
    }

    console.log(`Found ${products.length} products in the database`);

    const formattedData = products.map(product => `
Coffee: ${product.name}
Description: ${product.description || product.overall_description || ''}
Roast Level: ${product.roast_level || 'Not specified'}
Flavor Notes: ${Array.isArray(product.flavor_notes) ? product.flavor_notes.join(', ') : 'Not specified'}
URL: ${product.url}
---`).join('\n');
    
    // Update cache
    productCache = {
      data: formattedData,
      timestamp: now
    };
    
    return formattedData;
  } catch (error) {
    console.error('Error in getCoffeeContext:', error);
    return "Unable to retrieve coffee information at this time.";
  }
}

export async function buildCoffeeContext(supabaseUrl: string, supabaseKey: string): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: products, error: dbError } = await supabase
    .from('amokka_products')
    .select('*')
    .eq('is_verified', true); // Only get verified products

  if (dbError) {
    throw new ChatError(ERROR_MESSAGES.GENERAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, dbError.message);
  }

  if (!products?.length) {
    throw new ChatError(ERROR_MESSAGES.GENERAL_ERROR, HTTP_STATUS.NOT_FOUND);
  }

  return formatProductData(products as AmokkaProduct[]);
}

function formatProductData(products: AmokkaProduct[]): string {
  return products.map(product => `
Product: ${product.name}
Description: ${product.overall_description || product.description || ''}
Roast Level: ${product.roast_level || 'Not specified'}
Origin: ${product.origin || 'Not specified'}
Processing Method: ${product.processing_method || 'Not specified'}
Flavor Notes: ${product.flavor_notes?.join(', ') || 'Not specified'}
URL: ${product.url}
---`).join('\n');
}

/**
 * Optimize context to reduce token usage
 */
export function optimizeContext(context: string, maxTokens: number = 2000): string {
  // Simple estimation: ~4 chars per token
  const estimatedMaxChars = maxTokens * 4;
  
  if (context.length <= estimatedMaxChars) {
    return context;
  }
  
  // For product lists, we need to keep the structure but reduce the items
  if (context.includes('Coffee:') && context.includes('---')) {
    const products = context.split('---').filter(p => p.trim().length > 0);
    
    // Keep a subset of products that fit within our token budget
    // We add a bit of buffer for the splitting/joining process
    const bufferChars = 200;
    const availableChars = estimatedMaxChars - bufferChars;
    
    let optimizedProducts: string[] = [];
    let currentLength = 0;
    
    for (const product of products) {
      if (currentLength + product.length + 3 <= availableChars) { // +3 for the "---"
        optimizedProducts.push(product);
        currentLength += product.length + 3;
      } else {
        break;
      }
    }
    
    return optimizedProducts.join('---') + '---';
  }
  
  // For other contexts, truncate with a note
  return context.substring(0, estimatedMaxChars - 100) + 
    "\n\n[Note: Some content has been truncated to optimize performance]";
}
