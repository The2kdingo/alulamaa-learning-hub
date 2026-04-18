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
      annotations: {
        Row: {
          book_id: string
          created_at: string | null
          data: Json | null
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          data?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "annotations_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_replies: {
        Row: {
          announcement_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_replies_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          body: string | null
          created_at: string | null
          created_by: string | null
          id: string
          title: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string | null
        }
        Relationships: []
      }
      attempts: {
        Row: {
          answers: Json | null
          id: string
          quiz_id: string | null
          score: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          id?: string
          quiz_id?: string | null
          score?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          id?: string
          quiz_id?: string | null
          score?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          created_at: string | null
          id: string
          name: string
          path: string
          public: boolean | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          path: string
          public?: boolean | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          path?: string
          public?: boolean | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      duas: {
        Row: {
          arabic: string
          category: string
          created_at: string
          display_order: number
          id: string
          recommended_count: number | null
          reference: string | null
          title: string
          translation: string
          transliteration: string | null
        }
        Insert: {
          arabic: string
          category: string
          created_at?: string
          display_order?: number
          id?: string
          recommended_count?: number | null
          reference?: string | null
          title: string
          translation: string
          transliteration?: string | null
        }
        Update: {
          arabic?: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          recommended_count?: number | null
          reference?: string | null
          title?: string
          translation?: string
          transliteration?: string | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          id: string
          lesson_id: string
          opened_at: string
          quiz_generated: boolean
          user_id: string
        }
        Insert: {
          id?: string
          lesson_id: string
          opened_at?: string
          quiz_generated?: boolean
          user_id: string
        }
        Update: {
          id?: string
          lesson_id?: string
          opened_at?: string
          quiz_generated?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          pdf_path: string
          subject: string
          title: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          pdf_path: string
          subject: string
          title: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          pdf_path?: string
          subject?: string
          title?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      prayer_settings: {
        Row: {
          city: string | null
          country: string | null
          latitude: number | null
          longitude: number | null
          method: number
          notifications_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          method?: number
          notifications_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          method?: number
          notifications_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepted_terms_at: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          interests: string[] | null
          is_admin: boolean | null
          knowledge_level: string | null
          location: string | null
          phone: string | null
        }
        Insert: {
          accepted_terms_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          interests?: string[] | null
          is_admin?: boolean | null
          knowledge_level?: string | null
          location?: string | null
          phone?: string | null
        }
        Update: {
          accepted_terms_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          is_admin?: boolean | null
          knowledge_level?: string | null
          location?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      public_quiz_attempts: {
        Row: {
          answers: Json
          created_at: string
          id: string
          participant_name: string
          quiz_id: string
          score: number
          total: number
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          participant_name: string
          quiz_id: string
          score: number
          total: number
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          participant_name?: string
          quiz_id?: string
          score?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          context: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_manual: boolean
          lesson_id: string | null
          public_slug: string | null
          questions: Json | null
          title: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_manual?: boolean
          lesson_id?: string | null
          public_slug?: string | null
          questions?: Json | null
          title?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_manual?: boolean
          lesson_id?: string | null
          public_slug?: string | null
          questions?: Json | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_highlights: {
        Row: {
          created_at: string
          id: string
          lesson_id: string | null
          selected_text: string
          topic: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          selected_text: string
          topic?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          selected_text?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_highlights_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      tasbih_counters: {
        Row: {
          count: number
          dhikr: string
          id: string
          target: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          dhikr: string
          id?: string
          target?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          dhikr?: string
          id?: string
          target?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_uploads: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          path: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          path?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          path?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      set_accepted_terms: {
        Args: { accepted: boolean; uid: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
