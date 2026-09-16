/**
 * Canonical Customer Saved Address Domain Model.
 * Consolidates all address interfaces across the application.
 */

export interface Address {
  id: string;
  customer_id?: string;
  user_id: string;
  userId?: string; // Ergonomic alias for user_id
  label: "HOME" | "WORK" | "OTHER" | string;
  title?: string; // Ergonomic alias for label
  type?: string; // 'home' | 'work' | 'other'
  full_name?: string | null;
  recipient_name: string | null;
  recipient_phone?: string | null;
  phone: string | null;
  house_flat?: string;
  building?: string | null;
  street?: string;
  area?: string;
  address_line_1: string;
  streetAddress?: string; // Ergonomic alias for address_line_1
  street_area?: string;
  address_line_2: string | null;
  locality: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postal_code?: string;
  pincode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  place_id: string | null;
  is_default: boolean;
  isDefault?: boolean; // Ergonomic alias for is_default
  formatted_address?: string;
  fullAddress?: string; // Computed readable representation
  created_at: string;
  updated_at: string;
}

export interface AddressSnapshot {
  id?: string;
  full_name: string;
  phone: string;
  house_flat: string;
  building?: string | null;
  street: string;
  area: string;
  landmark?: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude?: number | null;
  longitude?: number | null;
  formatted_address: string;
  label?: string;
}

export type CreateAddressInput = Omit<Address, "id" | "created_at" | "updated_at">;
export type UpdateAddressInput = Partial<Omit<Address, "id" | "user_id" | "created_at">> & { id: string };
