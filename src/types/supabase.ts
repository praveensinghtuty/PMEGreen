export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          created_at: string;
          district: string;
          full_name: string;
          id: string;
          is_default: boolean;
          label: string;
          landmark: string | null;
          phone: string;
          postal_code: string;
          state: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          created_at?: string;
          district: string;
          full_name: string;
          id?: string;
          is_default?: boolean;
          label: string;
          landmark?: string | null;
          phone: string;
          postal_code: string;
          state?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          created_at?: string;
          district?: string;
          full_name?: string;
          id?: string;
          is_default?: boolean;
          label?: string;
          landmark?: string | null;
          phone?: string;
          postal_code?: string;
          state?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      banners: {
        Row: {
          created_at: string;
          ends_at: string | null;
          id: string;
          image_path: string;
          is_active: boolean;
          link_type: Database["public"]["Enums"]["banner_link_type"];
          link_value: string | null;
          sort_order: number;
          starts_at: string | null;
          subtitle: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          image_path: string;
          is_active?: boolean;
          link_type?: Database["public"]["Enums"]["banner_link_type"];
          link_value?: string | null;
          sort_order?: number;
          starts_at?: string | null;
          subtitle?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          image_path?: string;
          is_active?: boolean;
          link_type?: Database["public"]["Enums"]["banner_link_type"];
          link_value?: string | null;
          sort_order?: number;
          starts_at?: string | null;
          subtitle?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          cart_id: string;
          created_at: string;
          id: string;
          quantity: number;
          updated_at: string;
          variant_id: string;
        };
        Insert: {
          cart_id: string;
          created_at?: string;
          id?: string;
          quantity: number;
          updated_at?: string;
          variant_id: string;
        };
        Update: {
          cart_id?: string;
          created_at?: string;
          id?: string;
          quantity?: number;
          updated_at?: string;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey";
            columns: ["cart_id"];
            isOneToOne: false;
            referencedRelation: "carts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      carts: {
        Row: {
          created_at: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_path: string | null;
          is_active: boolean;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_path?: string | null;
          is_active?: boolean;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      homepage_sections: {
        Row: {
          configuration: Json;
          created_at: string;
          id: string;
          is_enabled: boolean;
          section_type: Database["public"]["Enums"]["homepage_section_type"];
          sort_order: number;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          configuration?: Json;
          created_at?: string;
          id?: string;
          is_enabled?: boolean;
          section_type: Database["public"]["Enums"]["homepage_section_type"];
          sort_order?: number;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          configuration?: Json;
          created_at?: string;
          id?: string;
          is_enabled?: boolean;
          section_type?: Database["public"]["Enums"]["homepage_section_type"];
          sort_order?: number;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          line_total: number;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          sku: string | null;
          unit_price: number;
          variant_id: string | null;
          variant_name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          line_total: number;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          sku?: string | null;
          unit_price: number;
          variant_id?: string | null;
          variant_name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          line_total?: number;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          sku?: string | null;
          unit_price?: number;
          variant_id?: string | null;
          variant_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      order_status_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          from_status: Database["public"]["Enums"]["order_status"] | null;
          id: string;
          note: string | null;
          order_id: string;
          to_status: Database["public"]["Enums"]["order_status"];
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["order_status"] | null;
          id?: string;
          note?: string | null;
          order_id: string;
          to_status: Database["public"]["Enums"]["order_status"];
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["order_status"] | null;
          id?: string;
          note?: string | null;
          order_id?: string;
          to_status?: Database["public"]["Enums"]["order_status"];
        };
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          admin_notes: string | null;
          courier_name: string | null;
          created_at: string;
          customer_email: string | null;
          customer_name: string;
          customer_notes: string | null;
          customer_phone: string;
          discount_amount: number;
          id: string;
          order_number: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          payment_status: Database["public"]["Enums"]["payment_status"];
          payment_verified_at: string | null;
          payment_verified_by: string | null;
          placed_at: string;
          shipping_address: Json;
          shipping_charge: number;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total_amount: number;
          tracking_number: string | null;
          tracking_url: string | null;
          updated_at: string;
          upi_transaction_reference: string | null;
          user_id: string;
        };
        Insert: {
          admin_notes?: string | null;
          courier_name?: string | null;
          created_at?: string;
          customer_email?: string | null;
          customer_name: string;
          customer_notes?: string | null;
          customer_phone: string;
          discount_amount?: number;
          id?: string;
          order_number: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          payment_status?: Database["public"]["Enums"]["payment_status"];
          payment_verified_at?: string | null;
          payment_verified_by?: string | null;
          placed_at?: string;
          shipping_address: Json;
          shipping_charge: number;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total_amount: number;
          tracking_number?: string | null;
          tracking_url?: string | null;
          updated_at?: string;
          upi_transaction_reference?: string | null;
          user_id: string;
        };
        Update: {
          admin_notes?: string | null;
          courier_name?: string | null;
          created_at?: string;
          customer_email?: string | null;
          customer_name?: string;
          customer_notes?: string | null;
          customer_phone?: string;
          discount_amount?: number;
          id?: string;
          order_number?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          payment_status?: Database["public"]["Enums"]["payment_status"];
          payment_verified_at?: string | null;
          payment_verified_by?: string | null;
          placed_at?: string;
          shipping_address?: Json;
          shipping_charge?: number;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total_amount?: number;
          tracking_number?: string | null;
          tracking_url?: string | null;
          updated_at?: string;
          upi_transaction_reference?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_payment_verified_by_fkey";
            columns: ["payment_verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          alt_text: string | null;
          created_at: string;
          id: string;
          is_primary: boolean;
          product_id: string;
          sort_order: number;
          storage_path: string;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          product_id: string;
          sort_order?: number;
          storage_path: string;
        };
        Update: {
          alt_text?: string | null;
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          product_id?: string;
          sort_order?: number;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          compare_at_price: number | null;
          created_at: string;
          id: string;
          is_active: boolean;
          is_default: boolean;
          name: string;
          price: number;
          product_id: string;
          sku: string | null;
          sort_order: number;
          stock_quantity: number;
          track_inventory: boolean;
          unit: Database["public"]["Enums"]["variant_unit"] | null;
          updated_at: string;
          value: number | null;
        };
        Insert: {
          compare_at_price?: number | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          name: string;
          price: number;
          product_id: string;
          sku?: string | null;
          sort_order?: number;
          stock_quantity?: number;
          track_inventory?: boolean;
          unit?: Database["public"]["Enums"]["variant_unit"] | null;
          updated_at?: string;
          value?: number | null;
        };
        Update: {
          compare_at_price?: number | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          name?: string;
          price?: number;
          product_id?: string;
          sku?: string | null;
          sort_order?: number;
          stock_quantity?: number;
          track_inventory?: boolean;
          unit?: Database["public"]["Enums"]["variant_unit"] | null;
          updated_at?: string;
          value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          benefits: string | null;
          category_id: string;
          created_at: string;
          description: string | null;
          id: string;
          ingredients: string | null;
          is_bestseller: boolean;
          is_featured: boolean;
          name: string;
          shelf_life: string | null;
          short_description: string | null;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["product_status"];
          storage_instructions: string | null;
          updated_at: string;
          usage_instructions: string | null;
        };
        Insert: {
          benefits?: string | null;
          category_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          ingredients?: string | null;
          is_bestseller?: boolean;
          is_featured?: boolean;
          name: string;
          shelf_life?: string | null;
          short_description?: string | null;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["product_status"];
          storage_instructions?: string | null;
          updated_at?: string;
          usage_instructions?: string | null;
        };
        Update: {
          benefits?: string | null;
          category_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          ingredients?: string | null;
          is_bestseller?: boolean;
          is_featured?: boolean;
          name?: string;
          shelf_life?: string | null;
          short_description?: string | null;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["product_status"];
          storage_instructions?: string | null;
          updated_at?: string;
          usage_instructions?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          is_active: boolean;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          is_active?: boolean;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          is_active?: boolean;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          description: string | null;
          id: string;
          is_public: boolean;
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          description?: string | null;
          id?: string;
          is_public?: boolean;
          key: string;
          updated_at?: string;
          value: Json;
        };
        Update: {
          description?: string | null;
          id?: string;
          is_public?: boolean;
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      wishlist_items: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          wishlist_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          wishlist_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          wishlist_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey";
            columns: ["wishlist_id"];
            isOneToOne: false;
            referencedRelation: "wishlists";
            referencedColumns: ["id"];
          },
        ];
      };
      wishlists: {
        Row: {
          created_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["app_role"] };
        Returns: boolean;
      };
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      app_role: "customer" | "admin";
      banner_link_type: "product" | "category" | "external" | "none";
      homepage_section_type:
        | "hero"
        | "categories"
        | "featured_products"
        | "best_sellers"
        | "product_category"
        | "why_choose_us"
        | "brand_story"
        | "faq"
        | "contact";
      order_status:
        | "placed"
        | "confirmed"
        | "packed"
        | "shipped"
        | "delivered"
        | "cancelled";
      payment_method: "cod" | "upi";
      payment_status: "pending" | "paid" | "failed" | "refunded";
      product_status: "draft" | "active" | "inactive";
      variant_unit: "ml" | "l" | "g" | "kg" | "piece" | "pack" | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "admin"],
      banner_link_type: ["product", "category", "external", "none"],
      homepage_section_type: [
        "hero",
        "categories",
        "featured_products",
        "best_sellers",
        "product_category",
        "why_choose_us",
        "brand_story",
        "faq",
        "contact",
      ],
      order_status: [
        "placed",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_method: ["cod", "upi"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      product_status: ["draft", "active", "inactive"],
      variant_unit: ["ml", "l", "g", "kg", "piece", "pack", "other"],
    },
  },
} as const;
