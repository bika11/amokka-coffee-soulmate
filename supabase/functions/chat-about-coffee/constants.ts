
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  INVALID_MESSAGE: 'Message must be a string',
  INVALID_HISTORY: 'History must be an array',
  NO_COFFEE_DATA: 'No coffee data available',
  TOO_MANY_REQUESTS: 'Too many requests',
  DATABASE_ERROR: 'Database error',
} as const;
