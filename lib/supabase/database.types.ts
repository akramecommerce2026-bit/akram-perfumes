/**
 * Supabase database types.
 *
 * Hand-authored to match `supabase/migrations/*.sql` exactly and shaped like the
 * output of `supabase gen types typescript`, so it can be regenerated with that
 * command once the project is linked:
 *
 *   supabase gen types typescript --linked > lib/supabase/database.types.ts
 *
 * Every query in the data layer is typed against this, giving end-to-end type
 * safety with no `any`.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Gender = "men" | "women" | "unisex";
export type FragranceFamily = "oriental" | "woody" | "floral" | "fresh" | "musk" | "oud";
export type Occasion = "everyday" | "office" | "evening" | "festive" | "signature";
export type Season = "spring" | "summer" | "autumn" | "winter";
export type VariantStatusEnum = "active" | "inactive";
export type WeightUnitEnum = "g" | "kg" | "ml" | "l";
export type NoteTypeEnum = "top" | "heart" | "base";
export type OrderStatusEnum =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatusEnum = "pending" | "paid" | "failed" | "refunded";

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          display_order: number;
          image_url: string | null;
          meta_title: string | null;
          meta_description: string | null;
          active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          slug: string;
          description?: string | null;
          display_order?: number;
          image_url?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category_id: string;
          short_description: string;
          description: string;
          featured_image: string;
          gender: Gender;
          fragrance_family: FragranceFamily;
          occasions: Occasion[];
          concentration: string;
          longevity: number;
          projection: number;
          seasons: Season[];
          rating: number;
          review_count: number;
          is_featured: boolean;
          is_signature: boolean;
          active: boolean;
          brand: string;
          meta_title: string | null;
          meta_description: string | null;
          keywords: string[];
          og_image: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          slug: string;
          category_id: string;
          short_description?: string;
          description?: string;
          featured_image?: string;
          gender?: Gender;
          fragrance_family?: FragranceFamily;
          occasions?: Occasion[];
          concentration?: string;
          longevity?: number;
          projection?: number;
          seasons?: Season[];
          rating?: number;
          review_count?: number;
          is_featured?: boolean;
          is_signature?: boolean;
          active?: boolean;
          brand?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          keywords?: string[];
          og_image?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          variant_name: string;
          price: number;
          compare_price: number | null;
          currency: string;
          sku: string;
          stock: number;
          low_stock_threshold: number;
          weight_value: number | null;
          weight_unit: WeightUnitEnum | null;
          status: VariantStatusEnum;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          product_id: string;
          variant_name: string;
          price: number;
          compare_price?: number | null;
          currency?: string;
          sku: string;
          stock?: number;
          low_stock_threshold?: number;
          weight_value?: number | null;
          weight_unit?: WeightUnitEnum | null;
          status?: VariantStatusEnum;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string;
          is_primary: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt?: string;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      fragrance_notes: {
        Row: {
          id: string;
          product_id: string;
          note_type: NoteTypeEnum;
          note: string;
          display_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          note_type: NoteTypeEnum;
          note: string;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["fragrance_notes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fragrance_notes_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          profile_id: string | null;
          email: string;
          full_name: string;
          phone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          email: string;
          full_name: string;
          phone: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      addresses: {
        Row: {
          id: string;
          customer_id: string;
          line1: string;
          line2: string | null;
          landmark: string | null;
          city: string;
          state: string;
          pincode: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          line1: string;
          line2?: string | null;
          landmark?: string | null;
          city: string;
          state: string;
          pincode: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "addresses_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          ship_line1: string;
          ship_line2: string | null;
          ship_landmark: string | null;
          ship_city: string;
          ship_state: string;
          ship_pincode: string;
          ship_country: string;
          delivery_method: string;
          subtotal: number;
          shipping: number;
          tax: number;
          discount: number;
          total: number;
          currency: string;
          status: OrderStatusEnum;
          payment_status: PaymentStatusEnum;
          payment_method: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          payment_timestamp: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          contact_name: string;
          contact_email: string;
          contact_phone: string;
          ship_line1: string;
          ship_line2?: string | null;
          ship_landmark?: string | null;
          ship_city: string;
          ship_state: string;
          ship_pincode: string;
          ship_country?: string;
          delivery_method?: string;
          subtotal: number;
          shipping?: number;
          tax?: number;
          discount?: number;
          total: number;
          currency?: string;
          status?: OrderStatusEnum;
          payment_status?: PaymentStatusEnum;
          payment_method?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          payment_timestamp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name: string;
          product_slug: string;
          variant_name: string;
          sku: string;
          featured_image: string;
          unit_price: number;
          quantity: number;
          line_total: number;
          currency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          product_slug?: string;
          variant_name: string;
          sku: string;
          featured_image?: string;
          unit_price: number;
          quantity: number;
          line_total: number;
          currency?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      gender: Gender;
      fragrance_family: FragranceFamily;
      occasion: Occasion;
      season: Season;
      variant_status: VariantStatusEnum;
      weight_unit: WeightUnitEnum;
      note_type: NoteTypeEnum;
      order_status: OrderStatusEnum;
      payment_status: PaymentStatusEnum;
    };
    CompositeTypes: Record<string, never>;
  };
}

/** Convenience row-type helpers. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
