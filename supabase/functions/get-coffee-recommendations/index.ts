
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

// Simple cosine similarity implementation
function calculateSimilarity(
  userPreferences: UserPreferences,
  coffee: Coffee
): number {
  let score = 0;

  // Roast level similarity (0-5 scale)
  const roastLevels = ['light', 'medium-light', 'medium', 'medium-dark', 'dark'];
  const coffeeRoastIndex = roastLevels.indexOf(coffee.roast_level.toLowerCase());
  if (coffeeRoastIndex !== -1) {
    // Convert 1-5 roast level to 0-4 index
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request body
    const { userPreferences } = await req.json()
    const userId = req.headers.get('authorization')?.split('Bearer ')[1]

    // Fetch all active coffees
    const { data: coffees, error: fetchError } = await supabaseClient
      .from('coffees')
      .select('*')

    if (fetchError) throw fetchError

    // Calculate similarity scores
    const predictions = coffees.map((coffee: Coffee) => ({
      coffee_name: coffee.name,
      prediction_score: calculateSimilarity(userPreferences, coffee),
      user_id: userId,
      model_version: '1.0.0-content-based'
    }))

    // Store predictions
    const { error: insertError } = await supabaseClient
      .from('model_predictions')
      .upsert(predictions)

    if (insertError) throw insertError

    // Return top recommendations
    const sortedCoffees = coffees
      .map((coffee: Coffee) => ({
        ...coffee,
        score: predictions.find(p => p.coffee_name === coffee.name)?.prediction_score ?? 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    return new Response(
      JSON.stringify({ recommendations: sortedCoffees }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
