
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface UserPreferences {
  drinkStyle: string;
  roastLevel: number;
  selectedFlavors: string[];
  brewMethod: string;
}

interface Coffee {
  name: string;
  roast_level: string;
  flavor_notes: string[];
  priority: number;
}

// Content-based similarity calculation
function calculateContentSimilarity(
  userPreferences: UserPreferences,
  coffee: Coffee
): number {
  let score = 0;

  // Roast level similarity (0-5 scale)
  const roastLevels = ['light', 'medium-light', 'medium', 'medium-dark', 'dark'];
  const coffeeRoastIndex = roastLevels.indexOf(coffee.roast_level.toLowerCase());
  if (coffeeRoastIndex !== -1) {
    const userRoastIndex = Math.max(0, Math.min(4, userPreferences.roastLevel - 1));
    score += 1 - (Math.abs(coffeeRoastIndex - userRoastIndex) / 4);
  }

  // Flavor notes similarity
  const flavorMatch = coffee.flavor_notes.filter(note => 
    userPreferences.selectedFlavors.includes(note.toLowerCase())
  ).length;
  score += flavorMatch / Math.max(userPreferences.selectedFlavors.length, coffee.flavor_notes.length);

  return score / 2; // Normalize to 0-1 range
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request body
    const { userPreferences } = await req.json();

    console.log('Received user preferences:', userPreferences);

    // Fetch all active coffees
    const { data: coffees, error: fetchError } = await supabaseAdmin
      .from('coffees')
      .select('*');

    if (fetchError) {
      console.error('Error fetching coffees:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${coffees?.length ?? 0} coffees`);

    // Calculate content-based scores
    const recommendations = coffees
      .map((coffee: Coffee) => ({
        ...coffee,
        score: calculateContentSimilarity(userPreferences, coffee)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    console.log('Returning recommendations:', recommendations.map(c => c.name));

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in get-coffee-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
