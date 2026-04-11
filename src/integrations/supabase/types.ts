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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      email_queue: {
        Row: {
          created_at: string | null
          email_type: string | null
          html_body: string
          id: string
          status: string | null
          subject: string
          to_email: string
        }
        Insert: {
          created_at?: string | null
          email_type?: string | null
          html_body: string
          id?: string
          status?: string | null
          subject: string
          to_email: string
        }
        Update: {
          created_at?: string | null
          email_type?: string | null
          html_body?: string
          id?: string
          status?: string | null
          subject?: string
          to_email?: string
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean | null
          participant_name: string
          question_index: number
          quiz_id: string | null
          selected_answer: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          participant_name: string
          question_index: number
          quiz_id?: string | null
          selected_answer?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          participant_name?: string
          question_index?: number
          quiz_id?: string | null
          selected_answer?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_participants: {
        Row: {
          completed_at: string | null
          id: string
          name: string
          percentage: number | null
          quiz_id: string | null
          score: number
          total_questions: number
        }
        Insert: {
          completed_at?: string | null
          id?: string
          name: string
          percentage?: number | null
          quiz_id?: string | null
          score?: number
          total_questions: number
        }
        Update: {
          completed_at?: string | null
          id?: string
          name?: string
          percentage?: number | null
          quiz_id?: string | null
          score?: number
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_participants_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          content: string
          created_at: string | null
          created_by_email: string
          id: string
          question_count: number
          questions: Json
          share_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by_email: string
          id?: string
          question_count: number
          questions: Json
          share_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by_email?: string
          id?: string
          question_count?: number
          questions?: Json
          share_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          timestamp: string | null
          user_email: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          timestamp?: string | null
          user_email?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          timestamp?: string | null
          user_email?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          interests: string[] | null
          location: string | null
          name: string
          phone: string | null
          phone_verified: boolean | null
          profession_level: string | null
          profile_picture_url: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id: string
          interests?: string[] | null
          location?: string | null
          name: string
          phone?: string | null
          phone_verified?: boolean | null
          profession_level?: string | null
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          interests?: string[] | null
          location?: string | null
          name?: string
          phone?: string | null
          phone_verified?: boolean | null
          profession_level?: string | null
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
