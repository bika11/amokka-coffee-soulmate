
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

// Collaborative filtering score calculation
async function calculateCollaborativeScore(
  coffeeName: string, 
  userPreferences: UserPreferences,
  supabaseClient: any
): Promise<number> {
  try {
    // Get click data for this coffee
    const { data: clickData, error: clickError } = await supabaseClient
      .from('coffee_clicks')
      .select('user_id')
      .eq('coffee_name', coffeeName);

    if (clickError) throw clickError;

    // Get user interactions for users who clicked this coffee
    const { data: userInteractions, error: interactionsError } = await supabaseClient
      .from('user_interactions')
      .select('*')
      .in('user_id', clickData.map((click: any) => click.user_id));

    if (interactionsError) throw interactionsError;

    if (!userInteractions.length) return 0;

    // Calculate similarity between current user preferences and other users who clicked this coffee
    const similarityScores = userInteractions.map((interaction: any) => {
      let score = 0;

      // Roast level similarity
      const roastDiff = Math.abs(interaction.selected_roast_level - userPreferences.roastLevel);
      score += 1 - (roastDiff / 4);

      // Flavor preferences similarity
      const flavorMatch = interaction.selected_flavors.filter((flavor: string) =>
        userPreferences.selectedFlavors.includes(flavor)
      ).length;
      score += flavorMatch / Math.max(userPreferences.selectedFlavors.length, interaction.selected_flavors.length);

      // Brew method similarity
      if (interaction.selected_brew_method === userPreferences.brewMethod) {
        score += 1;
      }

      return score / 3; // Normalize to 0-1 range
    });

    // Return average similarity score
    return similarityScores.reduce((a: number, b: number) => a + b, 0) / similarityScores.length;
  } catch (error) {
    console.error('Error calculating collaborative score:', error);
    return 0;
  }
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

    // Calculate hybrid scores
    const predictions = await Promise.all(coffees.map(async (coffee: Coffee) => {
      const contentScore = calculateContentSimilarity(userPreferences, coffee);
      const collaborativeScore = await calculateCollaborativeScore(coffee.name, userPreferences, supabaseClient);
      
      // Hybrid score: 70% content-based, 30% collaborative
      const hybridScore = (contentScore * 0.7) + (collaborativeScore * 0.3);

      return {
        coffee_name: coffee.name,
        prediction_score: hybridScore,
        user_id: userId,
        model_version: '2.0.0-hybrid'
      };
    }));

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
