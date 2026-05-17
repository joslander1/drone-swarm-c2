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
      alerts: {
        Row: {
          acknowledged: boolean
          acknowledged_at: string | null
          drone_id: string | null
          id: string
          message: string
          occurred_at: string
          severity: Database["public"]["Enums"]["alert_severity"]
          type: string
        }
        Insert: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          drone_id?: string | null
          id?: string
          message: string
          occurred_at?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          type: string
        }
        Update: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          drone_id?: string | null
          id?: string
          message?: string
          occurred_at?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_drone_id_fkey"
            columns: ["drone_id"]
            isOneToOne: false
            referencedRelation: "drones"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          details: Json
          entity_id: string | null
          entity_type: string | null
          id: string
          occurred_at: string
        }
        Insert: {
          action: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          occurred_at?: string
        }
        Update: {
          action?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          occurred_at?: string
        }
        Relationships: []
      }
      drones: {
        Row: {
          altitude_ft: number
          battery: number
          callsign: string
          config: Json
          created_at: string
          current_mission_id: string | null
          group_class: Database["public"]["Enums"]["drone_group"]
          id: string
          latitude: number
          longitude: number
          signal: number
          speed_mph: number
          status: Database["public"]["Enums"]["drone_status"]
          type: string
          updated_at: string
        }
        Insert: {
          altitude_ft?: number
          battery?: number
          callsign: string
          config?: Json
          created_at?: string
          current_mission_id?: string | null
          group_class: Database["public"]["Enums"]["drone_group"]
          id?: string
          latitude?: number
          longitude?: number
          signal?: number
          speed_mph?: number
          status?: Database["public"]["Enums"]["drone_status"]
          type: string
          updated_at?: string
        }
        Update: {
          altitude_ft?: number
          battery?: number
          callsign?: string
          config?: Json
          created_at?: string
          current_mission_id?: string | null
          group_class?: Database["public"]["Enums"]["drone_group"]
          id?: string
          latitude?: number
          longitude?: number
          signal?: number
          speed_mph?: number
          status?: Database["public"]["Enums"]["drone_status"]
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drones_current_mission_fk"
            columns: ["current_mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          assigned_drone_ids: string[]
          created_at: string
          description: string | null
          ended_at: string | null
          id: string
          name: string
          started_at: string | null
          status: Database["public"]["Enums"]["mission_status"]
          updated_at: string
        }
        Insert: {
          assigned_drone_ids?: string[]
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          name: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          updated_at?: string
        }
        Update: {
          assigned_drone_ids?: string[]
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          name?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          updated_at?: string
        }
        Relationships: []
      }
      swarm_formations: {
        Row: {
          active: boolean
          created_at: string
          drone_ids: string[]
          formation_type: Database["public"]["Enums"]["formation_type"]
          id: string
          name: string
          parameters: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          drone_ids?: string[]
          formation_type?: Database["public"]["Enums"]["formation_type"]
          id?: string
          name: string
          parameters?: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          drone_ids?: string[]
          formation_type?: Database["public"]["Enums"]["formation_type"]
          id?: string
          name?: string
          parameters?: Json
          updated_at?: string
        }
        Relationships: []
      }
      telemetry: {
        Row: {
          altitude_ft: number
          battery: number | null
          drone_id: string
          heading_deg: number
          id: string
          latitude: number
          longitude: number
          recorded_at: string
          signal: number | null
          speed_mph: number
        }
        Insert: {
          altitude_ft?: number
          battery?: number | null
          drone_id: string
          heading_deg?: number
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string
          signal?: number | null
          speed_mph?: number
        }
        Update: {
          altitude_ft?: number
          battery?: number | null
          drone_id?: string
          heading_deg?: number
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string
          signal?: number | null
          speed_mph?: number
        }
        Relationships: [
          {
            foreignKeyName: "telemetry_drone_id_fkey"
            columns: ["drone_id"]
            isOneToOne: false
            referencedRelation: "drones"
            referencedColumns: ["id"]
          },
        ]
      }
      waypoints: {
        Row: {
          action: string | null
          altitude_ft: number
          created_at: string
          id: string
          latitude: number
          longitude: number
          mission_id: string
          sequence: number
        }
        Insert: {
          action?: string | null
          altitude_ft?: number
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          mission_id: string
          sequence: number
        }
        Update: {
          action?: string | null
          altitude_ft?: number
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          mission_id?: string
          sequence?: number
        }
        Relationships: [
          {
            foreignKeyName: "waypoints_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
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
      alert_severity: "info" | "warning" | "critical"
      drone_group: "group_1" | "group_2"
      drone_status:
        | "active"
        | "standby"
        | "returning"
        | "maintenance"
        | "offline"
        | "emergency"
      formation_type:
        | "line"
        | "wedge"
        | "diamond"
        | "circle"
        | "grid"
        | "custom"
      mission_status: "planned" | "active" | "paused" | "completed" | "aborted"
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
      alert_severity: ["info", "warning", "critical"],
      drone_group: ["group_1", "group_2"],
      drone_status: [
        "active",
        "standby",
        "returning",
        "maintenance",
        "offline",
        "emergency",
      ],
      formation_type: ["line", "wedge", "diamond", "circle", "grid", "custom"],
      mission_status: ["planned", "active", "paused", "completed", "aborted"],
    },
  },
} as const
