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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
