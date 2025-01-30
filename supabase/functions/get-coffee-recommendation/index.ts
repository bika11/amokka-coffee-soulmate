import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Rate limiting implementation
const ipRequests = new Map<string, { count: number; timestamp: number }>();
const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requestData = ipRequests.get(ip);

  if (!requestData) {
    ipRequests.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (now - requestData.timestamp > WINDOW_MS) {
    // Reset if window has passed
    ipRequests.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (requestData.count >= MAX_REQUESTS) {
    return false;
  }

  requestData.count++;
  return true;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ 
          error: "Too many requests",
          details: "Please wait a minute before trying again"
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { preferences } = await req.json();
    
    if (!preferences) {
      throw new Error('No preferences provided');
    }

    console.log('Received preferences:', preferences);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse preferences
    const preferenceText = preferences.toLowerCase();
    let roastLevel = 'medium'; // default
    if (preferenceText.includes('roast level 1') || preferenceText.includes('roast level 2')) {
      roastLevel = 'light';
    } else if (preferenceText.includes('roast level 5') || preferenceText.includes('roast level 6')) {
      roastLevel = 'dark';
    } else if (preferenceText.includes('roast level 3')) {
      roastLevel = 'medium-light';
    } else if (preferenceText.includes('roast level 4')) {
      roastLevel = 'medium';
    }

    // Extract flavor preferences
    const flavorKeywords = ['chocolate', 'dried fruits', 'nuts', 'roasted', 'spices', 'fruity', 'sweet', 'floral'];
    const preferredFlavors = flavorKeywords.filter(flavor => preferenceText.includes(flavor));

    console.log('Parsed preferences:', { roastLevel, preferredFlavors });

    // Query the database for matching coffees
    const { data: coffees, error: dbError } = await supabase
      .from('coffees')
      .select('*')
      .eq('roast_level', roastLevel);

    if (dbError) {
      throw dbError;
    }

    if (!coffees || coffees.length === 0) {
      throw new Error('No matching coffees found');
    }

    console.log('Found coffees:', coffees);

    // Score each coffee based on flavor matches
    const scoredCoffees = coffees.map(coffee => {
      let score = 0;
      preferredFlavors.forEach(flavor => {
        if (coffee.flavor_notes.includes(flavor)) {
          score += 1;
        }
      });
      return { ...coffee, score };
    });

    // Sort by score and then by priority
    scoredCoffees.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.priority - b.priority;
    });

    console.log('Recommended coffee:', scoredCoffees[0].name);

    return new Response(
      JSON.stringify({ recommendation: scoredCoffees[0].name }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});