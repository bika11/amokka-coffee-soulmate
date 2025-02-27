
export function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin || '*', // Use origin if available, otherwise allow all
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
}
