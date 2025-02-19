
import { SupabaseClient } from '@supabase/supabase-js';
import { ChatError } from './error-handler.ts';
import { ERROR_MESSAGES, HTTP_STATUS } from './constants.ts';

interface Coffee {
  name: string;
  description: string;
  roast_level: string;
  flavor_notes?: string[];
  product_link: string;
}

export async function buildCoffeeContext(supabase: SupabaseClient): Promise<string> {
  const { data: coffees, error: dbError } = await supabase
    .from('coffees')
    .select('*');

  if (dbError) {
    throw new ChatError(ERROR_MESSAGES.DATABASE_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, dbError.message);
  }

  if (!coffees?.length) {
    throw new ChatError(ERROR_MESSAGES.NO_COFFEE_DATA, HTTP_STATUS.NOT_FOUND);
  }

  return formatCoffeeData(coffees as Coffee[]);
}

function formatCoffeeData(coffees: Coffee[]): string {
  return coffees.map(coffee => `
Product: ${coffee.name}
Description: ${coffee.description}
Roast Level: ${coffee.roast_level}
Flavor Notes: ${coffee.flavor_notes?.join(', ')}
URL: ${coffee.product_link}
---`).join('\n');
}
