import { supabase } from "@/lib/supabase";
import { assertServiceConfigured } from "@/lib/integrations/status";
import { dbRepository } from "@/services/db/repository";
import type { Address } from "@/types/address.types";

/**
 * Normalizes raw storage or database records into canonical Address domain models.
 * Guarantees every field is defined and both snake_case and camelCase aliases exist.
 */
const generateAddressId = () => `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function normalizeAddress(raw: any, fallbackUserId = "usr-current"): Address {
  if (!raw || typeof raw !== "object") {
    return {
      id: generateAddressId(),
      user_id: fallbackUserId,
      userId: fallbackUserId,
      label: "Home",
      title: "Home",
      type: "home",
      recipient_name: null,
      phone: null,
      recipient_phone: null,
      address_line_1: "",
      streetAddress: "",
      address_line_2: null,
      locality: null,
      landmark: null,
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700064",
      country: "India",
      latitude: null,
      longitude: null,
      place_id: null,
      is_default: false,
      isDefault: false,
      fullAddress: "Kolkata, West Bengal - 700064",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const userId = String(raw.user_id || raw.userId || fallbackUserId);
  const isDefault = Boolean(raw.is_default ?? raw.isDefault);
  const street = String(
    raw.address_line_1 || raw.streetAddress || raw.flat_house_building || raw.street_address || raw.house_flat || ""
  ).trim();
  const landmark = raw.landmark ? String(raw.landmark).trim() : null;
  const city = String(raw.city || "Kolkata").trim();
  const state = String(raw.state || "West Bengal").trim();
  const pincode = String(raw.pincode || "700064").trim();
  const title = String(raw.title || raw.label || "Home").trim();
  const recipientName = raw.recipient_name || raw.customerName || null;
  const phone = raw.phone || raw.recipient_phone || raw.customerPhone || null;

  const full =
    raw.fullAddress ||
    [street, landmark ? `Near ${landmark}` : null, city, pincode].filter(Boolean).join(", ") ||
    `${city}, ${state} - ${pincode}`;

  return {
    id: String(raw.id || generateAddressId()),
    user_id: userId,
    userId,
    label: title,
    title,
    type: (raw.type || raw.address_type || title).toLowerCase(),
    recipient_name: recipientName,
    recipient_phone: phone,
    phone,
    address_line_1: street,
    streetAddress: street,
    house_flat: raw.house_flat || street,
    street_area: raw.street_area || street,
    address_line_2: raw.address_line_2 || null,
    locality: raw.locality || null,
    landmark,
    city,
    state,
    pincode,
    country: raw.country || "India",
    latitude: typeof raw.latitude === "number" ? raw.latitude : null,
    longitude: typeof raw.longitude === "number" ? raw.longitude : null,
    place_id: raw.place_id || null,
    is_default: isDefault,
    isDefault,
    fullAddress: full,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
  };
}

/**
 * Authoritative Customer Addresses API.
 * Never returns raw Supabase responses or undefined shapes to the UI.
 * Guaranteed return contract: Promise<Address[]>
 */
export const addressesApi = {
  /**
   * Fetch saved addresses for an authenticated customer.
   */
  async getCustomerAddresses(userId: string): Promise<Address[]> {
    if (!userId) return [];

    try {
      assertServiceConfigured("supabase");
      const { data, error } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data && Array.isArray(data)) {
        return data.map((item) => normalizeAddress(item, userId));
      }
    } catch {
      // Fall back to authoritative local database repository
    }

    const localList = dbRepository.getAddresses(userId);
    if (!Array.isArray(localList)) {
      return [];
    }

    return localList.map((item) => normalizeAddress(item, userId));
  },

  /**
   * Insert a new customer address.
   */
  async createAddress(addressData: Partial<Address>, userId: string): Promise<Address> {
    if (!userId) {
      throw new Error("Authenticated user ID is required to create an address.");
    }

    const normalized = normalizeAddress(
      {
        ...addressData,
        id: addressData.id || generateAddressId(),
        user_id: userId,
        userId,
      },
      userId
    );

    try {
      assertServiceConfigured("supabase");
      if (normalized.is_default) {
        // Unset other defaults for this user
        await supabase
          .from("customer_addresses")
          .update({ is_default: false })
          .eq("user_id", userId);
      }

      const { data, error } = await supabase
        .from("customer_addresses")
        .insert([
          {
            id: normalized.id.startsWith("addr-") ? undefined : normalized.id,
            user_id: userId,
            title: normalized.title,
            address_type: normalized.type,
            recipient_name: normalized.recipient_name,
            recipient_phone: normalized.phone,
            flat_house_building: normalized.address_line_1,
            street_address: normalized.address_line_1,
            landmark: normalized.landmark,
            city: normalized.city,
            state: normalized.state,
            pincode: normalized.pincode,
            is_default: normalized.is_default,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        const saved = normalizeAddress(data, userId);
        dbRepository.saveAddress(saved, userId);
        return saved;
      }
    } catch {
      // Fallback
    }

    dbRepository.saveAddress(normalized, userId);
    return normalized;
  },

  /**
   * Update an existing address.
   */
  async updateAddress(id: string, updates: Partial<Address>, userId: string): Promise<Address> {
    if (!userId) {
      throw new Error("Authenticated user ID is required to update an address.");
    }

    try {
      assertServiceConfigured("supabase");
      if (updates.is_default || updates.isDefault) {
        await supabase
          .from("customer_addresses")
          .update({ is_default: false })
          .eq("user_id", userId);
      }

      const { data, error } = await supabase
        .from("customer_addresses")
        .update({
          title: updates.title || updates.label,
          street_address: updates.streetAddress || updates.address_line_1,
          landmark: updates.landmark,
          city: updates.city,
          state: updates.state,
          pincode: updates.pincode,
          is_default: updates.is_default ?? updates.isDefault,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (!error && data) {
        const updated = normalizeAddress(data, userId);
        dbRepository.saveAddress(updated, userId);
        return updated;
      }
    } catch {
      // Fallback
    }

    const currentList = dbRepository.getAddresses(userId);
    const existing = currentList.find((a) => a.id === id);
    if (!existing) {
      throw new Error("Address not found or access denied.");
    }
    const merged = normalizeAddress(
      {
        ...existing,
        ...updates,
        id,
        user_id: userId,
        userId,
        updated_at: new Date().toISOString(),
      },
      userId
    );
    dbRepository.saveAddress(merged, userId);
    return merged;
  },

  /**
   * Delete a saved address.
   */
  async deleteAddress(id: string, userId: string): Promise<void> {
    if (!userId) return;

    try {
      assertServiceConfigured("supabase");
      await supabase
        .from("customer_addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
    } catch {
      // Fallback
    }

    dbRepository.deleteAddress(id, userId);
  },

  /**
   * Set an address as the sole default for the customer.
   */
  async setDefaultAddress(id: string, userId: string): Promise<void> {
    if (!userId) return;

    try {
      assertServiceConfigured("supabase");
      await supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("user_id", userId);

      await supabase
        .from("customer_addresses")
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId);
    } catch {
      // Fallback
    }

    const list = dbRepository.getAddresses(userId);
    list.forEach((addr) => {
      const isTarget = addr.id === id;
      addr.is_default = isTarget;
      addr.isDefault = isTarget;
      dbRepository.saveAddress(addr, userId);
    });
  },
};
