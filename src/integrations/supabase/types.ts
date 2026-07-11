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
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
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
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
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
      app_role: "admin" | "instructor" | "student"
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
      app_role: ["admin", "instructor", "student"],
    },
  },
} as const
