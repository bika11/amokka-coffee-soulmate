
export const SUPABASE_TABLES = {
  COFFEE_CLICKS: 'coffee_clicks',
  MODEL_PREDICTIONS: 'model_predictions',
  COFFEE_RECOMMENDATIONS: 'coffee_recommendations',
  USER_INTERACTIONS: 'user_interactions',
  AMOKKA_PRODUCTS: 'amokka_products',
} as const;

export const CACHE_KEYS = {
  COFFEE_PRODUCTS: 'coffee-products',
  COFFEE_CONTEXT: 'coffee-context',
  RECOMMENDATIONS: 'recommendations',
  USER_PREFERENCES: 'user-preferences',
} as const;

export const CACHE_TTL = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  DAY: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Default page sizes for different entities
export const PAGE_SIZES = {
  COFFEES: 10,
  RECOMMENDATIONS: 5,
  INTERACTIONS: 20,
} as const;

// Database indexes configuration (for reference only)
export const DB_INDEXES = {
  AMOKKA_PRODUCTS: {
    IS_VERIFIED_IDX: 'amokka_products_is_verified_idx',
    ROAST_LEVEL_IDX: 'amokka_products_roast_level_idx',
    DESCRIPTION_TSV_IDX: 'amokka_products_description_tsv_idx'
  },
  COFFEE_CLICKS: {
    COFFEE_NAME_IDX: 'coffee_clicks_coffee_name_idx',
    CREATED_AT_IDX: 'coffee_clicks_created_at_idx'
  },
  USER_INTERACTIONS: {
    USER_ID_IDX: 'user_interactions_user_id_idx',
    SELECTED_ROAST_LEVEL_IDX: 'user_interactions_selected_roast_level_idx'
  }
} as const;
