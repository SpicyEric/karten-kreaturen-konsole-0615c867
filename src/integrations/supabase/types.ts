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
      card_instances: {
        Row: {
          active_skills: string[] | null
          battles_fought: number
          created_at: string
          creature_id: string
          current_skill_points: number
          id: string
          last_trained_at: string | null
          nfc_card_id: string
          skill_points: number
          training_sessions: number
          unlocked_skills: string[] | null
        }
        Insert: {
          active_skills?: string[] | null
          battles_fought?: number
          created_at?: string
          creature_id: string
          current_skill_points?: number
          id?: string
          last_trained_at?: string | null
          nfc_card_id: string
          skill_points?: number
          training_sessions?: number
          unlocked_skills?: string[] | null
        }
        Update: {
          active_skills?: string[] | null
          battles_fought?: number
          created_at?: string
          creature_id?: string
          current_skill_points?: number
          id?: string
          last_trained_at?: string | null
          nfc_card_id?: string
          skill_points?: number
          training_sessions?: number
          unlocked_skills?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "card_instances_creature_id_fkey"
            columns: ["creature_id"]
            isOneToOne: false
            referencedRelation: "creatures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_instances_nfc_card_id_fkey"
            columns: ["nfc_card_id"]
            isOneToOne: true
            referencedRelation: "nfc_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      creature_skills: {
        Row: {
          creature_id: string
          id: string
          skill_id: string
          unlock_order: number
        }
        Insert: {
          creature_id: string
          id?: string
          skill_id: string
          unlock_order?: number
        }
        Update: {
          creature_id?: string
          id?: string
          skill_id?: string
          unlock_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "creature_skills_creature_id_fkey"
            columns: ["creature_id"]
            isOneToOne: false
            referencedRelation: "creatures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creature_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      creatures: {
        Row: {
          base_intelligence: number
          base_speed: number
          base_strength: number
          created_at: string
          description: string | null
          form: Database["public"]["Enums"]["creature_form"]
          id: string
          max_active_skills: number
          max_skill_points: number
          name: string
          rarity: Database["public"]["Enums"]["creature_rarity"]
          sprite_attack_frames: number | null
          sprite_attack_url: string | null
          sprite_die_frames: number | null
          sprite_die_url: string | null
          sprite_fps: number
          sprite_frame_size: number
          sprite_hit_frames: number | null
          sprite_hit_url: string | null
          sprite_idle_frames: number | null
          sprite_idle_url: string | null
          type: Database["public"]["Enums"]["creature_type"]
        }
        Insert: {
          base_intelligence?: number
          base_speed?: number
          base_strength?: number
          created_at?: string
          description?: string | null
          form?: Database["public"]["Enums"]["creature_form"]
          id?: string
          max_active_skills?: number
          max_skill_points?: number
          name: string
          rarity?: Database["public"]["Enums"]["creature_rarity"]
          sprite_attack_frames?: number | null
          sprite_attack_url?: string | null
          sprite_die_frames?: number | null
          sprite_die_url?: string | null
          sprite_fps?: number
          sprite_frame_size?: number
          sprite_hit_frames?: number | null
          sprite_hit_url?: string | null
          sprite_idle_frames?: number | null
          sprite_idle_url?: string | null
          type: Database["public"]["Enums"]["creature_type"]
        }
        Update: {
          base_intelligence?: number
          base_speed?: number
          base_strength?: number
          created_at?: string
          description?: string | null
          form?: Database["public"]["Enums"]["creature_form"]
          id?: string
          max_active_skills?: number
          max_skill_points?: number
          name?: string
          rarity?: Database["public"]["Enums"]["creature_rarity"]
          sprite_attack_frames?: number | null
          sprite_attack_url?: string | null
          sprite_die_frames?: number | null
          sprite_die_url?: string | null
          sprite_fps?: number
          sprite_frame_size?: number
          sprite_hit_frames?: number | null
          sprite_hit_url?: string | null
          sprite_idle_frames?: number | null
          sprite_idle_url?: string | null
          type?: Database["public"]["Enums"]["creature_type"]
        }
        Relationships: []
      }
      nfc_cards: {
        Row: {
          created_at: string
          creature_id: string
          first_scanned_at: string | null
          id: string
          uid: string
        }
        Insert: {
          created_at?: string
          creature_id: string
          first_scanned_at?: string | null
          id?: string
          uid: string
        }
        Update: {
          created_at?: string
          creature_id?: string
          first_scanned_at?: string | null
          id?: string
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfc_cards_creature_id_fkey"
            columns: ["creature_id"]
            isOneToOne: false
            referencedRelation: "creatures"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_folders: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          applies_stun: boolean
          applies_weakness: boolean
          area_damage_value: number | null
          cooldown_turns: number
          created_at: string
          description: string | null
          folder_id: string | null
          heal_value: number | null
          id: string
          is_area_damage: boolean
          kind: string
          name: string
          stat_affected: string | null
          support_type: string | null
          tier: Database["public"]["Enums"]["skill_tier"]
          type: string
        }
        Insert: {
          applies_stun?: boolean
          applies_weakness?: boolean
          area_damage_value?: number | null
          cooldown_turns?: number
          created_at?: string
          description?: string | null
          folder_id?: string | null
          heal_value?: number | null
          id?: string
          is_area_damage?: boolean
          kind?: string
          name: string
          stat_affected?: string | null
          support_type?: string | null
          tier?: Database["public"]["Enums"]["skill_tier"]
          type: string
        }
        Update: {
          applies_stun?: boolean
          applies_weakness?: boolean
          area_damage_value?: number | null
          cooldown_turns?: number
          created_at?: string
          description?: string | null
          folder_id?: string | null
          heal_value?: number | null
          id?: string
          is_area_damage?: boolean
          kind?: string
          name?: string
          stat_affected?: string | null
          support_type?: string | null
          tier?: Database["public"]["Enums"]["skill_tier"]
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "skill_folders"
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
      creature_form: "standard" | "spezial"
      creature_rarity: "gewoehnlich" | "selten" | "episch" | "legendaer"
      creature_type:
        | "feuer"
        | "wasser"
        | "stein"
        | "luft"
        | "blitz"
        | "eis"
        | "gift"
        | "licht"
        | "schatten"
      skill_tier: "standard" | "selten" | "super" | "episch"
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
      creature_form: ["standard", "spezial"],
      creature_rarity: ["gewoehnlich", "selten", "episch", "legendaer"],
      creature_type: [
        "feuer",
        "wasser",
        "stein",
        "luft",
        "blitz",
        "eis",
        "gift",
        "licht",
        "schatten",
      ],
      skill_tier: ["standard", "selten", "super", "episch"],
    },
  },
} as const
