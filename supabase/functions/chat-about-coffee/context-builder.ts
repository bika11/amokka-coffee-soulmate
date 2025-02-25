import { SupabaseClient, createClient } from 'https://esm.sh/@supabase/supabase-js';
import { ChatError } from './error-handler.ts';
import { ERROR_MESSAGES, HTTP_STATUS } from './constants.ts';

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

export async function buildCoffeeContext(supabase: SupabaseClient): Promise<string> {
  const { data: products, error: dbError } = await supabase
    .from('amokka_products')
    .select('*')
    .eq('is_verified', true); // Only get verified products


  if (dbError) {
    throw new ChatError(ERROR_MESSAGES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, dbError.message);
  }

  if (!products?.length) {
    throw new ChatError(ERROR_MESSAGES.NO_COFFEE_DATA, HTTP_STATUS.NOT_FOUND);
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
