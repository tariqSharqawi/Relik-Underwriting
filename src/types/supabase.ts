export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_analysis_log: {
        Row: {
          analysis_type: string
          created_at: string
          deal_id: number
          id: number
          input_tokens: number | null
          model: string | null
          output_tokens: number | null
          prompt: string | null
          response: string | null
        }
        Insert: {
          analysis_type: string
          created_at?: string
          deal_id: number
          id?: never
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          prompt?: string | null
          response?: string | null
        }
        Update: {
          analysis_type?: string
          created_at?: string
          deal_id?: number
          id?: never
          input_tokens?: number | null
          model?: string | null
          output_tokens?: number | null
          prompt?: string | null
          response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_log_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      comparables: {
        Row: {
          cap_rate: number | null
          city: string | null
          comp_name: string
          created_at: string
          deal_id: number
          id: number
          notes: string | null
          price_per_unit: number | null
          sale_date: string | null
          sale_price: number | null
          source: string | null
          state: string | null
          units: number | null
          updated_at: string
        }
        Insert: {
          cap_rate?: number | null
          city?: string | null
          comp_name: string
          created_at?: string
          deal_id: number
          id?: never
          notes?: string | null
          price_per_unit?: number | null
          sale_date?: string | null
          sale_price?: number | null
          source?: string | null
          state?: string | null
          units?: number | null
          updated_at?: string
        }
        Update: {
          cap_rate?: number | null
          city?: string | null
          comp_name?: string
          created_at?: string
          deal_id?: number
          id?: never
          notes?: string | null
          price_per_unit?: number | null
          sale_date?: string | null
          sale_price?: number | null
          source?: string | null
          state?: string | null
          units?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparables_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          acquisition_fee_pct: number | null
          ai_recommendation: string | null
          ai_risk_score: number | null
          ai_summary: string | null
          asking_price: number | null
          asset_mgmt_fee_pct: number | null
          cap_rate_exit: number | null
          cap_rate_purchase: number | null
          city: string | null
          created_at: string
          created_by: string | null
          down_payment_pct: number | null
          equity_multiple: number | null
          exit_fee_pct: number | null
          expense_ratio: number | null
          final_offer_price: number | null
          id: number
          interest_rate: number | null
          irr: number | null
          licensed_beds: number | null
          loan_term_years: number | null
          max_offer_price: number | null
          name: string
          noi_current: number | null
          noi_stabilized: number | null
          property_type: string | null
          refi_fee_pct: number | null
          state: string | null
          status: string
          total_units: number | null
          updated_at: string
        }
        Insert: {
          acquisition_fee_pct?: number | null
          ai_recommendation?: string | null
          ai_risk_score?: number | null
          ai_summary?: string | null
          asking_price?: number | null
          asset_mgmt_fee_pct?: number | null
          cap_rate_exit?: number | null
          cap_rate_purchase?: number | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          down_payment_pct?: number | null
          equity_multiple?: number | null
          exit_fee_pct?: number | null
          expense_ratio?: number | null
          final_offer_price?: number | null
          id?: never
          interest_rate?: number | null
          irr?: number | null
          licensed_beds?: number | null
          loan_term_years?: number | null
          max_offer_price?: number | null
          name: string
          noi_current?: number | null
          noi_stabilized?: number | null
          property_type?: string | null
          refi_fee_pct?: number | null
          state?: string | null
          status?: string
          total_units?: number | null
          updated_at?: string
        }
        Update: {
          acquisition_fee_pct?: number | null
          ai_recommendation?: string | null
          ai_risk_score?: number | null
          ai_summary?: string | null
          asking_price?: number | null
          asset_mgmt_fee_pct?: number | null
          cap_rate_exit?: number | null
          cap_rate_purchase?: number | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          down_payment_pct?: number | null
          equity_multiple?: number | null
          exit_fee_pct?: number | null
          expense_ratio?: number | null
          final_offer_price?: number | null
          id?: never
          interest_rate?: number | null
          irr?: number | null
          licensed_beds?: number | null
          loan_term_years?: number | null
          max_offer_price?: number | null
          name?: string
          noi_current?: number | null
          noi_stabilized?: number | null
          property_type?: string | null
          refi_fee_pct?: number | null
          state?: string | null
          status?: string
          total_units?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      proforma: {
        Row: {
          capital_returned: number | null
          cash_flow: number | null
          created_at: string
          deal_id: number
          debt_service: number | null
          exit_sale_price: number | null
          expense_inflation_rate: number | null
          id: number
          is_exit_year: boolean | null
          is_refi_year: boolean | null
          projected_expenses: number | null
          projected_noi: number | null
          projected_revenue: number | null
          refi_loan_amount: number | null
          rent_growth_rate: number | null
          target_occupancy: number | null
          updated_at: string
          year: number
        }
        Insert: {
          capital_returned?: number | null
          cash_flow?: number | null
          created_at?: string
          deal_id: number
          debt_service?: number | null
          exit_sale_price?: number | null
          expense_inflation_rate?: number | null
          id?: never
          is_exit_year?: boolean | null
          is_refi_year?: boolean | null
          projected_expenses?: number | null
          projected_noi?: number | null
          projected_revenue?: number | null
          refi_loan_amount?: number | null
          rent_growth_rate?: number | null
          target_occupancy?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          capital_returned?: number | null
          cash_flow?: number | null
          created_at?: string
          deal_id?: number
          debt_service?: number | null
          exit_sale_price?: number | null
          expense_inflation_rate?: number | null
          id?: never
          is_exit_year?: boolean | null
          is_refi_year?: boolean | null
          projected_expenses?: number | null
          projected_noi?: number | null
          projected_revenue?: number | null
          refi_loan_amount?: number | null
          rent_growth_rate?: number | null
          target_occupancy?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "proforma_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      t12_financials: {
        Row: {
          admin: number | null
          created_at: string
          deal_id: number
          dietary: number | null
          gross_revenue: number | null
          id: number
          insurance: number | null
          level_of_care_fees: number | null
          maintenance: number | null
          management_fee: number | null
          marketing: number | null
          month: string
          noi: number | null
          occupancy_rate: number | null
          occupied_units: number | null
          other_expenses: number | null
          other_income: number | null
          payroll: number | null
          room_rent: number | null
          total_expenses: number | null
          updated_at: string
          utilities: number | null
        }
        Insert: {
          admin?: number | null
          created_at?: string
          deal_id: number
          dietary?: number | null
          gross_revenue?: number | null
          id?: never
          insurance?: number | null
          level_of_care_fees?: number | null
          maintenance?: number | null
          management_fee?: number | null
          marketing?: number | null
          month: string
          noi?: number | null
          occupancy_rate?: number | null
          occupied_units?: number | null
          other_expenses?: number | null
          other_income?: number | null
          payroll?: number | null
          room_rent?: number | null
          total_expenses?: number | null
          updated_at?: string
          utilities?: number | null
        }
        Update: {
          admin?: number | null
          created_at?: string
          deal_id?: number
          dietary?: number | null
          gross_revenue?: number | null
          id?: never
          insurance?: number | null
          level_of_care_fees?: number | null
          maintenance?: number | null
          management_fee?: number | null
          marketing?: number | null
          month?: string
          noi?: number | null
          occupancy_rate?: number | null
          occupied_units?: number | null
          other_expenses?: number | null
          other_income?: number | null
          payroll?: number | null
          room_rent?: number | null
          total_expenses?: number | null
          updated_at?: string
          utilities?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "t12_financials_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_mix: {
        Row: {
          avg_loc_fee: number | null
          created_at: string
          current_rent: number | null
          deal_id: number
          id: number
          market_rent: number | null
          unit_count: number
          unit_type: string
          updated_at: string
        }
        Insert: {
          avg_loc_fee?: number | null
          created_at?: string
          current_rent?: number | null
          deal_id: number
          id?: never
          market_rent?: number | null
          unit_count?: number
          unit_type: string
          updated_at?: string
        }
        Update: {
          avg_loc_fee?: number | null
          created_at?: string
          current_rent?: number | null
          deal_id?: number
          id?: never
          market_rent?: number | null
          unit_count?: number
          unit_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_mix_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
