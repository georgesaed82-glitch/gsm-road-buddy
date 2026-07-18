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
      achievement_rules: {
        Row: {
          badge_asset_id: string | null
          code: string
          created_at: string
          criteria: Json
          description: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          badge_asset_id?: string | null
          code: string
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          badge_asset_id?: string | null
          code?: string
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_rules_badge_asset_id_fkey"
            columns: ["badge_asset_id"]
            isOneToOne: false
            referencedRelation: "learning_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_alert_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          notify_on_enquiry_spike: boolean
          notify_on_system_critical: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notify_on_enquiry_spike?: boolean
          notify_on_system_critical?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notify_on_enquiry_spike?: boolean
          notify_on_system_critical?: boolean
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_table: string | null
          id: string
          ip: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_table?: string | null
          id?: string
          ip?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_table?: string | null
          id?: string
          ip?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_login_events: {
        Row: {
          admin_id: string | null
          created_at: string
          email: string | null
          event: string
          id: string
          ip: string | null
          mfa_used: boolean
          user_agent: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          email?: string | null
          event: string
          id?: string
          ip?: string | null
          mfa_used?: boolean
          user_agent?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          email?: string | null
          event?: string
          id?: string
          ip?: string | null
          mfa_used?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          description: string
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          description?: string
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          description?: string
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      admin_role_permissions: {
        Row: {
          can_edit: boolean
          can_view: boolean
          permission_key: string
          role_slug: string
          updated_at: string
        }
        Insert: {
          can_edit?: boolean
          can_view?: boolean
          permission_key: string
          role_slug: string
          updated_at?: string
        }
        Update: {
          can_edit?: boolean
          can_view?: boolean
          permission_key?: string
          role_slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "admin_permissions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "admin_role_permissions_role_slug_fkey"
            columns: ["role_slug"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["slug"]
          },
        ]
      }
      admin_roles: {
        Row: {
          created_at: string
          description: string
          is_system: boolean
          label: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          is_system?: boolean
          label: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          is_system?: boolean
          label?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_videos: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["ai_video_difficulty"]
          duration_seconds: number | null
          external_url: string | null
          id: string
          is_premium: boolean
          lesson_ids: string[]
          poster_url: string | null
          provider: Database["public"]["Enums"]["ai_video_provider"]
          rejection_reason: string | null
          status: Database["public"]["Enums"]["ai_video_status"]
          storage_path: string | null
          tags: string[]
          title: string
          topic_ids: string[]
          transmission: Database["public"]["Enums"]["ai_video_transmission"]
          updated_at: string
          uploaded_by: string | null
          view_count: number
          youtube_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["ai_video_difficulty"]
          duration_seconds?: number | null
          external_url?: string | null
          id?: string
          is_premium?: boolean
          lesson_ids?: string[]
          poster_url?: string | null
          provider: Database["public"]["Enums"]["ai_video_provider"]
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["ai_video_status"]
          storage_path?: string | null
          tags?: string[]
          title: string
          topic_ids?: string[]
          transmission?: Database["public"]["Enums"]["ai_video_transmission"]
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number
          youtube_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["ai_video_difficulty"]
          duration_seconds?: number | null
          external_url?: string | null
          id?: string
          is_premium?: boolean
          lesson_ids?: string[]
          poster_url?: string | null
          provider?: Database["public"]["Enums"]["ai_video_provider"]
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["ai_video_status"]
          storage_path?: string | null
          tags?: string[]
          title?: string
          topic_ids?: string[]
          transmission?: Database["public"]["Enums"]["ai_video_transmission"]
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number
          youtube_id?: string | null
        }
        Relationships: []
      }
      areas: {
        Row: {
          area: string
          created_at: string
          enabled: boolean
          faqs: Json
          highlights: Json
          id: string
          intro: string
          nearby_postcodes: Json
          order_index: number
          postcode: string
          routes_text: string
          slug: string
          updated_at: string
        }
        Insert: {
          area: string
          created_at?: string
          enabled?: boolean
          faqs?: Json
          highlights?: Json
          id?: string
          intro?: string
          nearby_postcodes?: Json
          order_index?: number
          postcode: string
          routes_text?: string
          slug: string
          updated_at?: string
        }
        Update: {
          area?: string
          created_at?: string
          enabled?: boolean
          faqs?: Json
          highlights?: Json
          id?: string
          intro?: string
          nearby_postcodes?: Json
          order_index?: number
          postcode?: string
          routes_text?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      assess_hazard_runs: {
        Row: {
          clip_id: string | null
          id: string
          meta: Json
          score: number | null
          student_id: string
          taken_at: string
        }
        Insert: {
          clip_id?: string | null
          id?: string
          meta?: Json
          score?: number | null
          student_id: string
          taken_at?: string
        }
        Update: {
          clip_id?: string | null
          id?: string
          meta?: Json
          score?: number | null
          student_id?: string
          taken_at?: string
        }
        Relationships: []
      }
      assess_mock_tests: {
        Row: {
          created_at: string
          dangerous: number
          id: string
          meta: Json
          minors: number
          notes: string | null
          pass_probability: number | null
          readiness_score: number | null
          result: Database["public"]["Enums"]["mock_result"] | null
          serious: number
          student_id: string
          taken_at: string
        }
        Insert: {
          created_at?: string
          dangerous?: number
          id?: string
          meta?: Json
          minors?: number
          notes?: string | null
          pass_probability?: number | null
          readiness_score?: number | null
          result?: Database["public"]["Enums"]["mock_result"] | null
          serious?: number
          student_id: string
          taken_at?: string
        }
        Update: {
          created_at?: string
          dangerous?: number
          id?: string
          meta?: Json
          minors?: number
          notes?: string | null
          pass_probability?: number | null
          readiness_score?: number | null
          result?: Database["public"]["Enums"]["mock_result"] | null
          serious?: number
          student_id?: string
          taken_at?: string
        }
        Relationships: []
      }
      assess_review_queue: {
        Row: {
          id: string
          last_wrong_at: string
          mastered_at: string | null
          meta: Json
          question_id: string | null
          section: Database["public"]["Enums"]["theory_section"] | null
          student_id: string
          wrong_count: number
        }
        Insert: {
          id?: string
          last_wrong_at?: string
          mastered_at?: string | null
          meta?: Json
          question_id?: string | null
          section?: Database["public"]["Enums"]["theory_section"] | null
          student_id: string
          wrong_count?: number
        }
        Update: {
          id?: string
          last_wrong_at?: string
          mastered_at?: string | null
          meta?: Json
          question_id?: string | null
          section?: Database["public"]["Enums"]["theory_section"] | null
          student_id?: string
          wrong_count?: number
        }
        Relationships: []
      }
      assess_theory_runs: {
        Row: {
          id: string
          meta: Json
          mistakes: Json
          score: number
          section: Database["public"]["Enums"]["theory_section"]
          student_id: string
          taken_at: string
          total: number
        }
        Insert: {
          id?: string
          meta?: Json
          mistakes?: Json
          score?: number
          section: Database["public"]["Enums"]["theory_section"]
          student_id: string
          taken_at?: string
          total?: number
        }
        Update: {
          id?: string
          meta?: Json
          mistakes?: Json
          score?: number
          section?: Database["public"]["Enums"]["theory_section"]
          student_id?: string
          taken_at?: string
          total?: number
        }
        Relationships: []
      }
      auth_attempts: {
        Row: {
          captcha_verified: boolean
          created_at: string
          id: string
          identifier: string
          ip_hash: string | null
          kind: string
          success: boolean
          user_agent: string | null
        }
        Insert: {
          captcha_verified?: boolean
          created_at?: string
          id?: string
          identifier: string
          ip_hash?: string | null
          kind: string
          success: boolean
          user_agent?: string | null
        }
        Update: {
          captcha_verified?: boolean
          created_at?: string
          id?: string
          identifier?: string
          ip_hash?: string | null
          kind?: string
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          order_index: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string
          body_md: string
          category_id: string | null
          cover_image_path: string | null
          created_at: string
          excerpt: string
          id: string
          order_index: number
          published: boolean
          published_at: string | null
          related_slugs: string[]
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string
          body_md?: string
          category_id?: string | null
          cover_image_path?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          order_index?: number
          published?: boolean
          published_at?: string | null
          related_slugs?: string[]
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          body_md?: string
          category_id?: string | null
          cover_image_path?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          order_index?: number
          published?: boolean
          published_at?: string | null
          related_slugs?: string[]
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_assets: {
        Row: {
          created_at: string
          created_by: string | null
          height: number | null
          id: string
          kind: string
          name: string
          tags: string[]
          updated_at: string
          url: string
          width: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          height?: number | null
          id?: string
          kind?: string
          name: string
          tags?: string[]
          updated_at?: string
          url: string
          width?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          height?: number | null
          id?: string
          kind?: string
          name?: string
          tags?: string[]
          updated_at?: string
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          instructor_id: string | null
          kind: Database["public"]["Enums"]["calendar_event_kind"]
          location: string | null
          meta: Json
          notes: string | null
          starts_at: string
          status: Database["public"]["Enums"]["calendar_event_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          instructor_id?: string | null
          kind?: Database["public"]["Enums"]["calendar_event_kind"]
          location?: string | null
          meta?: Json
          notes?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["calendar_event_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          instructor_id?: string | null
          kind?: Database["public"]["Enums"]["calendar_event_kind"]
          location?: string | null
          meta?: Json
          notes?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["calendar_event_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          id: string
          issued_at: string
          kind: Database["public"]["Enums"]["certificate_kind"]
          meta: Json
          pdf_asset_id: string | null
          student_id: string
          title: string
        }
        Insert: {
          id?: string
          issued_at?: string
          kind: Database["public"]["Enums"]["certificate_kind"]
          meta?: Json
          pdf_asset_id?: string | null
          student_id: string
          title: string
        }
        Update: {
          id?: string
          issued_at?: string
          kind?: Database["public"]["Enums"]["certificate_kind"]
          meta?: Json
          pdf_asset_id?: string | null
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_pdf_asset_id_fkey"
            columns: ["pdf_asset_id"]
            isOneToOne: false
            referencedRelation: "learning_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_clicks: {
        Row: {
          channel: string
          created_at: string
          id: string
          package: string | null
          page: string | null
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          id?: string
          package?: string | null
          page?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          package?: string | null
          page?: string | null
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      content_overrides: {
        Row: {
          created_at: string
          data: Json | null
          description: string | null
          enabled: boolean
          group_slug: string | null
          image_path: string | null
          item_id: string
          key_points: string[] | null
          kind: string
          name: string | null
          sort_order: number
          topics: string[] | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          description?: string | null
          enabled?: boolean
          group_slug?: string | null
          image_path?: string | null
          item_id: string
          key_points?: string[] | null
          kind: string
          name?: string | null
          sort_order?: number
          topics?: string[] | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          description?: string | null
          enabled?: boolean
          group_slug?: string | null
          image_path?: string | null
          item_id?: string
          key_points?: string[] | null
          kind?: string
          name?: string | null
          sort_order?: number
          topics?: string[] | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          created_at: string
          created_by: string | null
          entity_id: string
          entity_table: string
          id: string
          kind: string
          label: string | null
          snapshot: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_table: string
          id?: string
          kind?: string
          label?: string | null
          snapshot: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_table?: string
          id?: string
          kind?: string
          label?: string | null
          snapshot?: Json
        }
        Relationships: []
      }
      downloads: {
        Row: {
          category: string | null
          created_at: string
          description: string
          enabled: boolean
          id: string
          mime_type: string | null
          order_index: number
          size_bytes: number | null
          storage_path: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          mime_type?: string | null
          order_index?: number
          size_bytes?: number | null
          storage_path: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          mime_type?: string | null
          order_index?: number
          size_bytes?: number | null
          storage_path?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          provider_http_status: number | null
          provider_message_id: string | null
          provider_request_id: string | null
          provider_response: Json | null
          provider_status: string | null
          provider_workflow_id: string | null
          recipient_email: string
          status: string
          template_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          provider_http_status?: number | null
          provider_message_id?: string | null
          provider_request_id?: string | null
          provider_response?: Json | null
          provider_status?: string | null
          provider_workflow_id?: string | null
          recipient_email: string
          status: string
          template_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          provider_http_status?: number | null
          provider_message_id?: string | null
          provider_request_id?: string | null
          provider_response?: Json | null
          provider_status?: string | null
          provider_workflow_id?: string | null
          recipient_email?: string
          status?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      error_alert_state: {
        Row: {
          count: number
          fingerprint: string
          last_alert_at: string
        }
        Insert: {
          count?: number
          fingerprint: string
          last_alert_at?: string
        }
        Update: {
          count?: number
          fingerprint?: string
          last_alert_at?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          alert_sent: boolean
          created_at: string
          extra: Json
          fingerprint: string | null
          id: string
          level: string
          mechanism: string | null
          message: string
          route: string | null
          source: string
          stack: string | null
          url: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          alert_sent?: boolean
          created_at?: string
          extra?: Json
          fingerprint?: string | null
          id?: string
          level?: string
          mechanism?: string | null
          message: string
          route?: string | null
          source?: string
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          alert_sent?: boolean
          created_at?: string
          extra?: Json
          fingerprint?: string | null
          id?: string
          level?: string
          mechanism?: string | null
          message?: string
          route?: string | null
          source?: string
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          enabled: boolean
          id: string
          order_index: number
          question: string
          updated_at: string
        }
        Insert: {
          answer?: string
          category?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          order_index?: number
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          order_index?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      hazard_clip_videos: {
        Row: {
          clip_slug: string
          poster_path: string | null
          updated_at: string
          updated_by: string | null
          video_path: string
        }
        Insert: {
          clip_slug: string
          poster_path?: string | null
          updated_at?: string
          updated_by?: string | null
          video_path: string
        }
        Update: {
          clip_slug?: string
          poster_path?: string | null
          updated_at?: string
          updated_by?: string | null
          video_path?: string
        }
        Relationships: []
      }
      hazard_clips: {
        Row: {
          created_at: string
          developing_hazard: string
          difficulty: string
          duration_seconds: number
          enabled: boolean
          id: string
          order_index: number
          scenario: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          developing_hazard?: string
          difficulty?: string
          duration_seconds?: number
          enabled?: boolean
          id?: string
          order_index?: number
          scenario?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          developing_hazard?: string
          difficulty?: string
          duration_seconds?: number
          enabled?: boolean
          id?: string
          order_index?: number
          scenario?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hazard_perception_attempts: {
        Row: {
          clip_slug: string
          created_at: string
          id: string
          reaction_ms: number | null
          score: number
          user_id: string
        }
        Insert: {
          clip_slug: string
          created_at?: string
          id?: string
          reaction_ms?: number | null
          score: number
          user_id: string
        }
        Update: {
          clip_slug?: string
          created_at?: string
          id?: string
          reaction_ms?: number | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      home_sections: {
        Row: {
          background: string
          body: string
          created_at: string
          cta_primary_href: string
          cta_primary_label: string
          cta_secondary_href: string
          cta_secondary_label: string
          deleted_at: string | null
          extra: Json
          eyebrow: string
          id: string
          image_url: string
          layout: string
          section_key: string
          section_type: string
          show_app: boolean
          show_web: boolean
          sort_order: number
          status: string
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          background?: string
          body?: string
          created_at?: string
          cta_primary_href?: string
          cta_primary_label?: string
          cta_secondary_href?: string
          cta_secondary_label?: string
          deleted_at?: string | null
          extra?: Json
          eyebrow?: string
          id?: string
          image_url?: string
          layout?: string
          section_key: string
          section_type?: string
          show_app?: boolean
          show_web?: boolean
          sort_order?: number
          status?: string
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Update: {
          background?: string
          body?: string
          created_at?: string
          cta_primary_href?: string
          cta_primary_label?: string
          cta_secondary_href?: string
          cta_secondary_label?: string
          deleted_at?: string | null
          extra?: Json
          eyebrow?: string
          id?: string
          image_url?: string
          layout?: string
          section_key?: string
          section_type?: string
          show_app?: boolean
          show_web?: boolean
          sort_order?: number
          status?: string
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      instructors: {
        Row: {
          badges: string[]
          bio: string
          color: string
          created_at: string
          cta_href: string
          enabled: boolean
          id: string
          image_path: string | null
          initials: string
          location: string | null
          name: string
          order_index: number
          rating: number | null
          reviews: number | null
          role: string
          updated_at: string
        }
        Insert: {
          badges?: string[]
          bio?: string
          color?: string
          created_at?: string
          cta_href?: string
          enabled?: boolean
          id?: string
          image_path?: string | null
          initials?: string
          location?: string | null
          name: string
          order_index?: number
          rating?: number | null
          reviews?: number | null
          role?: string
          updated_at?: string
        }
        Update: {
          badges?: string[]
          bio?: string
          color?: string
          created_at?: string
          cta_href?: string
          enabled?: boolean
          id?: string
          image_path?: string | null
          initials?: string
          location?: string | null
          name?: string
          order_index?: number
          rating?: number | null
          reviews?: number | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_assets: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          credit: string | null
          duration_ms: number | null
          height: number | null
          id: string
          kind: Database["public"]["Enums"]["learning_asset_kind"]
          meta: Json
          mime: string | null
          storage_path: string
          tags: string[] | null
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          credit?: string | null
          duration_ms?: number | null
          height?: number | null
          id?: string
          kind: Database["public"]["Enums"]["learning_asset_kind"]
          meta?: Json
          mime?: string | null
          storage_path: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          credit?: string | null
          duration_ms?: number | null
          height?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["learning_asset_kind"]
          meta?: Json
          mime?: string | null
          storage_path?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      learning_lessons: {
        Row: {
          body_richtext: Json | null
          created_at: string
          id: string
          is_published: boolean
          meta: Json
          order_index: number
          seo: Json
          slug: string
          title: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          body_richtext?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean
          meta?: Json
          order_index?: number
          seo?: Json
          slug: string
          title: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          body_richtext?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean
          meta?: Json
          order_index?: number
          seo?: Json
          slug?: string
          title?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "learning_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_modules: {
        Row: {
          cover_asset_id: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          meta: Json
          module_number: number
          order_index: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_asset_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          meta?: Json
          module_number: number
          order_index?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_asset_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          meta?: Json
          module_number?: number
          order_index?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_modules_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "learning_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_topics: {
        Row: {
          category: string | null
          created_at: string
          estimated_minutes: number | null
          id: string
          is_published: boolean
          meta: Json
          module_id: string
          order_index: number
          slug: string
          summary: string | null
          teaching_method_tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          is_published?: boolean
          meta?: Json
          module_id: string
          order_index?: number
          slug: string
          summary?: string | null
          teaching_method_tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          is_published?: boolean
          meta?: Json
          module_id?: string
          order_index?: number
          slug?: string
          summary?: string | null
          teaching_method_tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learning_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_pages: {
        Row: {
          body_markdown: string
          created_at: string
          enabled: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body_markdown?: string
          created_at?: string
          enabled?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body_markdown?: string
          created_at?: string
          enabled?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      lesson_block_videos: {
        Row: {
          block_id: string
          created_at: string
          position: number
          video_id: string
        }
        Insert: {
          block_id: string
          created_at?: string
          position?: number
          video_id: string
        }
        Update: {
          block_id?: string
          created_at?: string
          position?: number
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_block_videos_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "lesson_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_block_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "ai_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_blocks: {
        Row: {
          asset_id: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["lesson_block_kind"]
          lesson_id: string
          order_index: number
          payload: Json
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["lesson_block_kind"]
          lesson_id: string
          order_index?: number
          payload?: Json
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["lesson_block_kind"]
          lesson_id?: string
          order_index?: number
          payload?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_blocks_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "learning_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_blocks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_bookings: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          instructor_name: string
          instructor_notes: string | null
          pickup_location: string | null
          rating: number | null
          scheduled_at: string
          skills_covered: string[]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          instructor_name?: string
          instructor_notes?: string | null
          pickup_location?: string | null
          rating?: number | null
          scheduled_at: string
          skills_covered?: string[]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          instructor_name?: string
          instructor_notes?: string | null
          pickup_location?: string | null
          rating?: number | null
          scheduled_at?: string
          skills_covered?: string[]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_plans: {
        Row: {
          calendar_event_id: string | null
          created_at: string
          created_by: string | null
          id: string
          objectives: string | null
          planned_topic_ids: string[]
          route_plan: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          calendar_event_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          objectives?: string | null
          planned_topic_ids?: string[]
          route_plan?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          calendar_event_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          objectives?: string | null
          planned_topic_ids?: string[]
          route_plan?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plans_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_quizzes: {
        Row: {
          created_at: string
          id: string
          lesson_id: string | null
          meta: Json
          pass_threshold: number
          title: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          meta?: Json
          pass_threshold?: number
          title: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          meta?: Json
          pass_threshold?: number
          title?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "learning_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_quizzes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "learning_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          duration_minutes: number | null
          id: string
          image_url: string
          pdf_url: string
          show_app: boolean
          show_web: boolean
          slug: string
          sort_order: number
          status: string
          subtitle: string
          tags: string[]
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          duration_minutes?: number | null
          id?: string
          image_url?: string
          pdf_url?: string
          show_app?: boolean
          show_web?: boolean
          slug: string
          sort_order?: number
          status?: string
          subtitle?: string
          tags?: string[]
          title: string
          updated_at?: string
          video_url?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          duration_minutes?: number | null
          id?: string
          image_url?: string
          pdf_url?: string
          show_app?: boolean
          show_web?: boolean
          slug?: string
          sort_order?: number
          status?: string
          subtitle?: string
          tags?: string[]
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      manoeuvre_status: {
        Row: {
          attempts: number
          id: string
          last_result: string | null
          manoeuvre_key: string
          stage: Database["public"]["Enums"]["progress_stage"]
          student_id: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          id?: string
          last_result?: string | null
          manoeuvre_key: string
          stage?: Database["public"]["Enums"]["progress_stage"]
          student_id: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          id?: string
          last_result?: string | null
          manoeuvre_key?: string
          stage?: Database["public"]["Enums"]["progress_stage"]
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      nav_items: {
        Row: {
          enabled: boolean
          href: string
          icon: string | null
          id: string
          label: string
          location: string
          order_index: number
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          href: string
          icon?: string | null
          id?: string
          label: string
          location: string
          order_index?: number
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          href?: string
          icon?: string | null
          id?: string
          label?: string
          location?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          created_at: string
          cta_label: string
          description: string
          duration: string
          enabled: boolean
          features: string[]
          id: string
          name: string
          order_index: number
          popular: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string
          description?: string
          duration?: string
          enabled?: boolean
          features?: string[]
          id?: string
          name: string
          order_index?: number
          popular?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string
          description?: string
          duration?: string
          enabled?: boolean
          features?: string[]
          id?: string
          name?: string
          order_index?: number
          popular?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      page_seo: {
        Row: {
          canonical_override: string | null
          description: string | null
          noindex: boolean
          og_description: string | null
          og_image_path: string | null
          og_title: string | null
          route: string
          title: string | null
          updated_at: string
        }
        Insert: {
          canonical_override?: string | null
          description?: string | null
          noindex?: boolean
          og_description?: string | null
          og_image_path?: string | null
          og_title?: string | null
          route: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          canonical_override?: string | null
          description?: string | null
          noindex?: boolean
          og_description?: string | null
          og_image_path?: string | null
          og_title?: string | null
          route?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          path: string
          platform: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          platform?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          platform?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_pence: number
          created_at: string
          currency: string
          hours_purchased: number
          id: string
          method: string | null
          package_name: string
          paid_at: string | null
          reference: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_pence: number
          created_at?: string
          currency?: string
          hours_purchased?: number
          id?: string
          method?: string | null
          package_name: string
          paid_at?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_pence?: number
          created_at?: string
          currency?: string
          hours_purchased?: number
          id?: string
          method?: string | null
          package_name?: string
          paid_at?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portal_access_codes: {
        Row: {
          code: string
          created_at: string
          email: string | null
          expires_at: string | null
          id: string
          kind: string
          label: string | null
          last_used_at: string | null
          revoked: boolean
          updated_at: string
          use_count: number
        }
        Insert: {
          code: string
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          kind: string
          label?: string | null
          last_used_at?: string | null
          revoked?: boolean
          updated_at?: string
          use_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          kind?: string
          label?: string | null
          last_used_at?: string | null
          revoked?: boolean
          updated_at?: string
          use_count?: number
        }
        Relationships: []
      }
      portal_access_uses: {
        Row: {
          code_id: string
          id: string
          ip_hash: string | null
          mode: string
          used_at: string
          user_agent: string | null
        }
        Insert: {
          code_id: string
          id?: string
          ip_hash?: string | null
          mode: string
          used_at?: string
          user_agent?: string | null
        }
        Update: {
          code_id?: string
          id?: string
          ip_hash?: string | null
          mode?: string
          used_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_access_uses_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "portal_access_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_launch_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_role_slug: string | null
          created_at: string
          disabled_at: string | null
          failed_login_count: number
          full_name: string | null
          id: string
          is_master_owner: boolean
          last_login_at: string | null
          last_login_ip: string | null
          last_login_ua: string | null
          license_number: string | null
          locked_until: string | null
          must_change_password: boolean
          phone: string | null
          postcode: string | null
          session_timeout_minutes: number
          target_test_date: string | null
          totp_enabled: boolean
          totp_secret_encrypted: string | null
          transmission: string
          updated_at: string
          username: string | null
        }
        Insert: {
          admin_role_slug?: string | null
          created_at?: string
          disabled_at?: string | null
          failed_login_count?: number
          full_name?: string | null
          id: string
          is_master_owner?: boolean
          last_login_at?: string | null
          last_login_ip?: string | null
          last_login_ua?: string | null
          license_number?: string | null
          locked_until?: string | null
          must_change_password?: boolean
          phone?: string | null
          postcode?: string | null
          session_timeout_minutes?: number
          target_test_date?: string | null
          totp_enabled?: boolean
          totp_secret_encrypted?: string | null
          transmission?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          admin_role_slug?: string | null
          created_at?: string
          disabled_at?: string | null
          failed_login_count?: number
          full_name?: string | null
          id?: string
          is_master_owner?: boolean
          last_login_at?: string | null
          last_login_ip?: string | null
          last_login_ua?: string | null
          license_number?: string | null
          locked_until?: string | null
          must_change_password?: boolean
          phone?: string | null
          postcode?: string | null
          session_timeout_minutes?: number
          target_test_date?: string | null
          totp_enabled?: boolean
          totp_secret_encrypted?: string | null
          transmission?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_admin_role_slug_fkey"
            columns: ["admin_role_slug"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["slug"]
          },
        ]
      }
      progress_achievements: {
        Row: {
          awarded_at: string
          code: string
          id: string
          meta: Json
          student_id: string
          title: string
        }
        Insert: {
          awarded_at?: string
          code: string
          id?: string
          meta?: Json
          student_id: string
          title: string
        }
        Update: {
          awarded_at?: string
          code?: string
          id?: string
          meta?: Json
          student_id?: string
          title?: string
        }
        Relationships: []
      }
      progress_lesson_entries: {
        Row: {
          ai_summary: string | null
          ai_summary_generated_at: string | null
          created_at: string
          duration_minutes: number | null
          homework: string | null
          id: string
          improvements: string | null
          instructor_id: string | null
          instructor_notes: string | null
          lesson_date: string
          meta: Json
          mood: string | null
          next_objectives: string | null
          route: string | null
          strengths: string | null
          student_id: string
          updated_at: string
          weather: string | null
        }
        Insert: {
          ai_summary?: string | null
          ai_summary_generated_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          homework?: string | null
          id?: string
          improvements?: string | null
          instructor_id?: string | null
          instructor_notes?: string | null
          lesson_date?: string
          meta?: Json
          mood?: string | null
          next_objectives?: string | null
          route?: string | null
          strengths?: string | null
          student_id: string
          updated_at?: string
          weather?: string | null
        }
        Update: {
          ai_summary?: string | null
          ai_summary_generated_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          homework?: string | null
          id?: string
          improvements?: string | null
          instructor_id?: string | null
          instructor_notes?: string | null
          lesson_date?: string
          meta?: Json
          mood?: string | null
          next_objectives?: string | null
          route?: string | null
          strengths?: string | null
          student_id?: string
          updated_at?: string
          weather?: string | null
        }
        Relationships: []
      }
      progress_lesson_topics: {
        Row: {
          created_at: string
          id: string
          lesson_entry_id: string
          note: string | null
          stage_after: Database["public"]["Enums"]["progress_stage"] | null
          stage_before: Database["public"]["Enums"]["progress_stage"] | null
          topic_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_entry_id: string
          note?: string | null
          stage_after?: Database["public"]["Enums"]["progress_stage"] | null
          stage_before?: Database["public"]["Enums"]["progress_stage"] | null
          topic_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_entry_id?: string
          note?: string | null
          stage_after?: Database["public"]["Enums"]["progress_stage"] | null
          stage_before?: Database["public"]["Enums"]["progress_stage"] | null
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_lesson_topics_lesson_entry_id_fkey"
            columns: ["lesson_entry_id"]
            isOneToOne: false
            referencedRelation: "progress_lesson_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_lesson_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "learning_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_snapshots: {
        Row: {
          captured_at: string
          id: string
          meta: Json
          module_scores: Json
          overall_score: number | null
          pass_probability: number | null
          readiness_score: number | null
          student_id: string
        }
        Insert: {
          captured_at?: string
          id?: string
          meta?: Json
          module_scores?: Json
          overall_score?: number | null
          pass_probability?: number | null
          readiness_score?: number | null
          student_id: string
        }
        Update: {
          captured_at?: string
          id?: string
          meta?: Json
          module_scores?: Json
          overall_score?: number | null
          pass_probability?: number | null
          readiness_score?: number | null
          student_id?: string
        }
        Relationships: []
      }
      progress_student_topics: {
        Row: {
          count: number
          created_at: string
          id: string
          last_worked_at: string | null
          notes: string | null
          stage: Database["public"]["Enums"]["progress_stage"]
          student_id: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          last_worked_at?: string | null
          notes?: string | null
          stage?: Database["public"]["Enums"]["progress_stage"]
          student_id: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          last_worked_at?: string | null
          notes?: string | null
          stage?: Database["public"]["Enums"]["progress_stage"]
          student_id?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_student_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "learning_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_uploads: {
        Row: {
          asset_id: string | null
          caption: string | null
          created_at: string
          id: string
          kind: string
          lesson_entry_id: string | null
          student_id: string
          topic_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          asset_id?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          kind?: string
          lesson_entry_id?: string | null
          student_id: string
          topic_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          asset_id?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          kind?: string
          lesson_entry_id?: string | null
          student_id?: string
          topic_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_uploads_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "learning_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_uploads_lesson_entry_id_fkey"
            columns: ["lesson_entry_id"]
            isOneToOne: false
            referencedRelation: "progress_lesson_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_uploads_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "learning_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      pwa_events: {
        Row: {
          created_at: string
          event: string
          id: string
          platform: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          platform?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          platform?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          created_at: string
          explanation: string | null
          id: string
          kind: Database["public"]["Enums"]["quiz_question_kind"]
          order_index: number
          payload: Json
          prompt: string
          quiz_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["quiz_question_kind"]
          order_index?: number
          payload?: Json
          prompt: string
          quiz_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explanation?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["quiz_question_kind"]
          order_index?: number
          payload?: Json
          prompt?: string
          quiz_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "lesson_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          name: string
          note: string
          order_index: number
          quote: string
          rating: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          note?: string
          order_index?: number
          quote: string
          rating?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          note?: string
          order_index?: number
          quote?: string
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      skill_rating_history: {
        Row: {
          changed_at: string
          id: string
          previous_rating: number | null
          rating: number
          skill_key: string
          user_id: string
        }
        Insert: {
          changed_at?: string
          id?: string
          previous_rating?: number | null
          rating: number
          skill_key: string
          user_id: string
        }
        Update: {
          changed_at?: string
          id?: string
          previous_rating?: number | null
          rating?: number
          skill_key?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          skill_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating?: number
          skill_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          skill_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_pass_photos: {
        Row: {
          caption: string
          created_at: string
          enabled: boolean
          id: string
          image_path: string | null
          image_url: string | null
          order_index: number
          updated_at: string
        }
        Insert: {
          caption?: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_path?: string | null
          image_url?: string | null
          order_index?: number
          updated_at?: string
        }
        Update: {
          caption?: string
          created_at?: string
          enabled?: boolean
          id?: string
          image_path?: string | null
          image_url?: string | null
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          draft: Json
          id: number
          published: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          draft?: Json
          id: number
          published?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          draft?: Json
          id?: number
          published?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      theory_progress: {
        Row: {
          attempts: number
          best_score_pct: number
          category_slug: string
          completed_at: string | null
          created_at: string
          id: string
          last_score_pct: number
          last_studied_at: string
          questions_answered: number
          questions_correct: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          best_score_pct?: number
          category_slug: string
          completed_at?: string | null
          created_at?: string
          id?: string
          last_score_pct?: number
          last_studied_at?: string
          questions_answered?: number
          questions_correct?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          best_score_pct?: number
          category_slug?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          last_score_pct?: number
          last_studied_at?: string
          questions_answered?: number
          questions_correct?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      theory_question_overrides: {
        Row: {
          correct_index: number
          created_at: string
          explanation: string
          option_explanations: Json
          options: Json
          question: string
          question_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          correct_index: number
          created_at?: string
          explanation: string
          option_explanations: Json
          options: Json
          question: string
          question_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          correct_index?: number
          created_at?: string
          explanation?: string
          option_explanations?: Json
          options?: Json
          question?: string
          question_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      theory_questions: {
        Row: {
          category: string
          correct_index: number
          created_at: string
          difficulty: string
          explanation: string
          id: string
          image_path: string | null
          is_published: boolean
          option_explanations: string[]
          options: string[]
          question: string
          sort_order: number
          source_id: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          category: string
          correct_index?: number
          created_at?: string
          difficulty?: string
          explanation?: string
          id?: string
          image_path?: string | null
          is_published?: boolean
          option_explanations?: string[]
          options: string[]
          question: string
          sort_order?: number
          source_id?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          category?: string
          correct_index?: number
          created_at?: string
          difficulty?: string
          explanation?: string
          id?: string
          image_path?: string | null
          is_published?: boolean
          option_explanations?: string[]
          options?: string[]
          question?: string
          sort_order?: number
          source_id?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      user_mistakes: {
        Row: {
          created_at: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          question_id?: string
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
      vrp_status: {
        Row: {
          id: string
          ref_point_key: string
          stage: Database["public"]["Enums"]["progress_stage"]
          student_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          ref_point_key: string
          stage?: Database["public"]["Enums"]["progress_stage"]
          student_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          ref_point_key?: string
          stage?: Database["public"]["Enums"]["progress_stage"]
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_permission: {
        Args: { _mode?: string; _perm_key: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_ai_video_view: {
        Args: { _video_id: string }
        Returns: undefined
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      profile_update_allowed: {
        Args: { _new: Database["public"]["Tables"]["profiles"]["Row"] }
        Returns: boolean
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      ai_video_difficulty:
        | "beginner"
        | "intermediate"
        | "advanced"
        | "test_ready"
      ai_video_provider: "youtube" | "upload" | "external"
      ai_video_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "rejected"
        | "archived"
      ai_video_transmission: "any" | "manual" | "automatic"
      app_role: "admin" | "instructor" | "student" | "senior_instructor"
      calendar_event_kind: "lesson" | "mock_test" | "theory" | "test" | "other"
      calendar_event_status: "scheduled" | "completed" | "cancelled" | "no_show"
      certificate_kind: "module" | "test_ready" | "passed"
      learning_asset_kind:
        | "image"
        | "diagram"
        | "animation"
        | "video"
        | "voice"
        | "pdf"
        | "other"
      lesson_block_kind:
        | "text"
        | "image"
        | "diagram"
        | "animation"
        | "video"
        | "voice"
        | "quiz"
        | "instructor_note"
        | "homework"
        | "reference_point"
        | "gsm_method_callout"
        | "ai_video"
        | "interactive_animation"
        | "quiz_true_false"
        | "drag_drop"
        | "hotspot"
        | "scenario_challenge"
        | "callout"
        | "highway_code_rule"
        | "road_sign"
        | "road_marking"
        | "vehicle_controls"
        | "hazard_clip"
        | "driving_test_tip"
        | "summary"
        | "progress_check"
        | "downloadable_pdf"
      mock_result: "pass" | "fail"
      progress_stage:
        | "not_started"
        | "introduced"
        | "practised"
        | "developing"
        | "independent"
        | "test_standard"
        | "completed"
      quiz_question_kind: "mcq" | "truefalse" | "image_pick" | "hazard_click"
      theory_section:
        | "highway_code"
        | "road_signs"
        | "road_markings"
        | "show_me_tell_me"
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
      ai_video_difficulty: [
        "beginner",
        "intermediate",
        "advanced",
        "test_ready",
      ],
      ai_video_provider: ["youtube", "upload", "external"],
      ai_video_status: [
        "draft",
        "pending_review",
        "approved",
        "rejected",
        "archived",
      ],
      ai_video_transmission: ["any", "manual", "automatic"],
      app_role: ["admin", "instructor", "student", "senior_instructor"],
      calendar_event_kind: ["lesson", "mock_test", "theory", "test", "other"],
      calendar_event_status: ["scheduled", "completed", "cancelled", "no_show"],
      certificate_kind: ["module", "test_ready", "passed"],
      learning_asset_kind: [
        "image",
        "diagram",
        "animation",
        "video",
        "voice",
        "pdf",
        "other",
      ],
      lesson_block_kind: [
        "text",
        "image",
        "diagram",
        "animation",
        "video",
        "voice",
        "quiz",
        "instructor_note",
        "homework",
        "reference_point",
        "gsm_method_callout",
        "ai_video",
        "interactive_animation",
        "quiz_true_false",
        "drag_drop",
        "hotspot",
        "scenario_challenge",
        "callout",
        "highway_code_rule",
        "road_sign",
        "road_marking",
        "vehicle_controls",
        "hazard_clip",
        "driving_test_tip",
        "summary",
        "progress_check",
        "downloadable_pdf",
      ],
      mock_result: ["pass", "fail"],
      progress_stage: [
        "not_started",
        "introduced",
        "practised",
        "developing",
        "independent",
        "test_standard",
        "completed",
      ],
      quiz_question_kind: ["mcq", "truefalse", "image_pick", "hazard_click"],
      theory_section: [
        "highway_code",
        "road_signs",
        "road_markings",
        "show_me_tell_me",
      ],
    },
  },
} as const
