export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      amokka_products: {
        Row: {
          acidity: string | null
          aftertaste: string | null
          altitude: string | null
          aroma: string | null
          background: string | null
          batch_size: string | null
          body: string | null
          brewing_methods: string[] | null
          country: string | null
          created_at: string | null
          crop_year: string | null
          description: string | null
          description_tsv: unknown | null
          end_temperature: string | null
          flavor_appreciation: string | null
          flavor_notes: string[] | null
          general_information: string | null
          id: string
          is_verified: boolean | null
          last_scraped_at: string | null
          milk_recommendation: string | null
          name: string
          origin: string | null
          origin_preference: string | null
          overall_description: string | null
          processing_method: string | null
          recommended_methods: string[] | null
          region: string | null
          roast_level: Database["public"]["Enums"]["roast_level"] | null
          roaster: string | null
          roasting_time: string | null
          single_origin_blend: string | null
          source: string | null
          sweetness: string | null
          updated_at: string | null
          url: string
          variety: string | null
        }
        Insert: {
          acidity?: string | null
          aftertaste?: string | null
          altitude?: string | null
          aroma?: string | null
          background?: string | null
          batch_size?: string | null
          body?: string | null
          brewing_methods?: string[] | null
          country?: string | null
          created_at?: string | null
          crop_year?: string | null
          description?: string | null
          description_tsv?: unknown | null
          end_temperature?: string | null
          flavor_appreciation?: string | null
          flavor_notes?: string[] | null
          general_information?: string | null
          id?: string
          is_verified?: boolean | null
          last_scraped_at?: string | null
          milk_recommendation?: string | null
          name: string
          origin?: string | null
          origin_preference?: string | null
          overall_description?: string | null
          processing_method?: string | null
          recommended_methods?: string[] | null
          region?: string | null
          roast_level?: Database["public"]["Enums"]["roast_level"] | null
          roaster?: string | null
          roasting_time?: string | null
          single_origin_blend?: string | null
          source?: string | null
          sweetness?: string | null
          updated_at?: string | null
          url: string
          variety?: string | null
        }
        Update: {
          acidity?: string | null
          aftertaste?: string | null
          altitude?: string | null
          aroma?: string | null
          background?: string | null
          batch_size?: string | null
          body?: string | null
          brewing_methods?: string[] | null
          country?: string | null
          created_at?: string | null
          crop_year?: string | null
          description?: string | null
          description_tsv?: unknown | null
          end_temperature?: string | null
          flavor_appreciation?: string | null
          flavor_notes?: string[] | null
          general_information?: string | null
          id?: string
          is_verified?: boolean | null
          last_scraped_at?: string | null
          milk_recommendation?: string | null
          name?: string
          origin?: string | null
          origin_preference?: string | null
          overall_description?: string | null
          processing_method?: string | null
          recommended_methods?: string[] | null
          region?: string | null
          roast_level?: Database["public"]["Enums"]["roast_level"] | null
          roaster?: string | null
          roasting_time?: string | null
          single_origin_blend?: string | null
          source?: string | null
          sweetness?: string | null
          updated_at?: string | null
          url?: string
          variety?: string | null
        }
        Relationships: []
      }
      coffee_clicks: {
        Row: {
          coffee_name: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          coffee_name: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          coffee_name?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      coffee_recommendations: {
        Row: {
          created_at: string | null
          id: string
          input_preferences: string
          rating: number | null
          recommendation: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          input_preferences: string
          rating?: number | null
          recommendation: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          input_preferences?: string
          rating?: number | null
          recommendation?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coffees: {
        Row: {
          created_at: string
          description: string
          espresso_compatible: boolean
          flavor_notes: string[]
          id: string
          image_link: string
          milk_compatible: boolean
          name: string
          notes: string | null
          priority: number
          product_link: string
          roast_level: Database["public"]["Enums"]["roast_level"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          espresso_compatible?: boolean
          flavor_notes: string[]
          id?: string
          image_link: string
          milk_compatible?: boolean
          name: string
          notes?: string | null
          priority: number
          product_link: string
          roast_level: Database["public"]["Enums"]["roast_level"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          espresso_compatible?: boolean
          flavor_notes?: string[]
          id?: string
          image_link?: string
          milk_compatible?: boolean
          name?: string
          notes?: string | null
          priority?: number
          product_link?: string
          roast_level?: Database["public"]["Enums"]["roast_level"]
          updated_at?: string
        }
        Relationships: []
      }
      model_predictions: {
        Row: {
          coffee_name: string
          created_at: string
          id: string
          model_version: string
          prediction_score: number
          user_id: string | null
        }
        Insert: {
          coffee_name: string
          created_at?: string
          id?: string
          model_version: string
          prediction_score: number
          user_id?: string | null
        }
        Update: {
          coffee_name?: string
          created_at?: string
          id?: string
          model_version?: string
          prediction_score?: number
          user_id?: string | null
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          created_at: string
          id: string
          recommended_coffee_id: string | null
          selected_brew_method: string
          selected_flavors: string[]
          selected_roast_level: Database["public"]["Enums"]["roast_level"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          recommended_coffee_id?: string | null
          selected_brew_method: string
          selected_flavors: string[]
          selected_roast_level: Database["public"]["Enums"]["roast_level"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          recommended_coffee_id?: string | null
          selected_brew_method?: string
          selected_flavors?: string[]
          selected_roast_level?: Database["public"]["Enums"]["roast_level"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interactions_recommended_coffee_id_fkey"
            columns: ["recommended_coffee_id"]
            isOneToOne: false
            referencedRelation: "active_coffees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interactions_recommended_coffee_id_fkey"
            columns: ["recommended_coffee_id"]
            isOneToOne: false
            referencedRelation: "coffees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_coffees: {
        Row: {
          description: string | null
          flavor_notes: string[] | null
          id: string | null
          image_link: string | null
          interaction_count: number | null
          name: string | null
          priority: number | null
          product_link: string | null
          roast_level: Database["public"]["Enums"]["roast_level"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      clean_old_predictions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      roast_level: "light" | "medium-light" | "medium" | "medium-dark" | "dark"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      roast_level: ["light", "medium-light", "medium", "medium-dark", "dark"],
    },
  },
} as const
