
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1'
import { corsHeaders } from '../_shared/cors.ts'

interface Coffee {
  name: string;
  description: string;
  roastLevel: string;
  flavorNotes: string[];
}

interface UserPreferences {
  drinkStyle: string;
  roastLevel: number;
  selectedFlavors: string[];
  brewMethod: string;
}

function calculateContentSimilarity(
  userPreferences: UserPreferences,
  coffee: Coffee
): number {
  let score = 0;

  // Roast level matching (0-4 scale)
  const roastLevels = { LIGHT: 1, MEDIUM: 2, MEDIUM_DARK: 3, DARK: 4 };
  const coffeeRoastLevel = roastLevels[coffee.roastLevel as keyof typeof roastLevels] || 2;
  const roastDiff = Math.abs(coffeeRoastLevel - userPreferences.roastLevel);
  score += 1 - (roastDiff / 4);

  // Flavor notes matching
  const flavorMatch = coffee.flavorNotes.filter(note =>
    userPreferences.selectedFlavors.includes(note)
  ).length;
  score += flavorMatch / Math.max(userPreferences.selectedFlavors.length, coffee.flavorNotes.length);

  return score / 2; // Normalize to 0-1 range
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with admin privileges
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

    // Get user ID from JWT token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { userPreferences } = await req.json();

    // Get all coffees
    // Validate user preferences
    if (!userPreferences || typeof userPreferences !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: 'User preferences are required and must be an object.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (typeof userPreferences.drinkStyle !== 'string' || userPreferences.drinkStyle.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: 'drinkStyle must be a string with a maximum length of 50 characters.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (typeof userPreferences.brewMethod !== 'string' || userPreferences.brewMethod.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: 'brewMethod must be a string with a maximum length of 50 characters.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (typeof userPreferences.roastLevel !== 'number' || userPreferences.roastLevel < 1 || userPreferences.roastLevel > 4) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: 'roastLevel must be a number between 1 and 4.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    if (!Array.isArray(userPreferences.selectedFlavors) || userPreferences.selectedFlavors.length > 10 || !userPreferences.selectedFlavors.every(flavor => typeof flavor === 'string' && flavor.length <= 30)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: 'selectedFlavors must be an array of strings, with a maximum of 10 elements and each string having a maximum length of 30 characters.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    const { data: coffees, error: dbError } = await supabaseAdmin
      .from('coffees')
      .select('*');

    if (dbError) throw dbError;

    console.log(`Found ${coffees?.length ?? 0} coffees`);

    // Calculate content-based scores and store user interaction
    const recommendations = coffees
      .map((coffee: Coffee) => ({
        ...coffee,
        score: calculateContentSimilarity(userPreferences, coffee)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Store user interaction
    await supabaseAdmin
      .from('user_interactions')
      .insert({
        user_id: user.id,
        selected_roast_level: userPreferences.roastLevel,
        selected_flavors: userPreferences.selectedFlavors,
        selected_brew_method: userPreferences.brewMethod
      });

    console.log('Returning recommendations:', recommendations.map(c => c.name));

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error.message, error.stack);
    const status = error.message === 'Invalid user token' ? 401 : 500;
    const errorResponse = {
      error: error.message,
      details: error.stack,
    };
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status,
      }
    );
  }
});
