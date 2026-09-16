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
      customer_id: fallbackUserId,
      user_id: fallbackUserId,
      userId: fallbackUserId,
      label: "HOME",
      title: "HOME",
      type: "home",
      full_name: "Valued Customer",
      recipient_name: "Valued Customer",
      phone: null,
      recipient_phone: null,
      house_flat: "",
      building: null,
      street: "",
      address_line_1: "",
      streetAddress: "",
      street_area: "",
      address_line_2: null,
      area: "Salt Lake",
      locality: "Salt Lake",
      landmark: null,
      city: "Kolkata",
      state: "West Bengal",
      postal_code: "700064",
      pincode: "700064",
      country: "India",
      latitude: null,
      longitude: null,
      place_id: null,
      is_default: false,
      isDefault: false,
      formatted_address: "Kolkata, West Bengal - 700064",
      fullAddress: "Kolkata, West Bengal - 700064",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const userId = String(raw.customer_id || raw.user_id || raw.userId || fallbackUserId);
  const isDefault = Boolean(raw.is_default ?? raw.isDefault);

  const fullName = String(raw.full_name || raw.recipient_name || raw.customerName || "Valued Customer").trim();
  const phone = raw.phone || raw.recipient_phone || raw.customerPhone || null;

  const houseFlat = String(raw.house_flat || raw.flat_house_building || raw.flat_no || "").trim();
  const building = raw.building || raw.apartment_name || null;
  const street = String(raw.street || raw.street_address || raw.address_line_1 || raw.streetAddress || houseFlat || "").trim();
  const area = String(raw.area || raw.locality || raw.street_area || "Kolkata").trim();
  const landmark = raw.landmark ? String(raw.landmark).trim() : null;
  const city = String(raw.city || "Kolkata").trim();
  const state = String(raw.state || "West Bengal").trim();
  const postalCode = String(raw.postal_code || raw.pincode || "700064").trim();
  const country = String(raw.country || "India").trim();

  const rawTitle = String(raw.title || raw.label || raw.tag || "Home").trim();
  const label = rawTitle;
  const title = rawTitle;
  const type = (raw.type || raw.address_type || rawTitle).toLowerCase();

  // Construct readable formatted address
  const addressParts = [
    houseFlat,
    building,
    street !== houseFlat ? street : null,
    area,
    landmark ? `Near ${landmark}` : null,
    `${city}, ${state} - ${postalCode}`,
  ].filter(Boolean);

  const formattedAddress = raw.formatted_address || raw.fullAddress || addressParts.join(", ") || `${city}, ${state} - ${postalCode}`;

  return {
    id: String(raw.id || generateAddressId()),
    customer_id: userId,
    user_id: userId,
    userId,
    label,
    title,
    type,
    full_name: fullName,
    recipient_name: fullName,
    recipient_phone: phone,
    phone,
    house_flat: houseFlat,
    building,
    street,
    address_line_1: street || houseFlat,
    streetAddress: street || houseFlat,
    street_area: area,
    address_line_2: raw.address_line_2 || null,
    area,
    locality: area,
    landmark,
    city,
    state,
    postal_code: postalCode,
    pincode: postalCode,
    country,
    latitude: typeof raw.latitude === "number" ? raw.latitude : null,
    longitude: typeof raw.longitude === "number" ? raw.longitude : null,
    place_id: raw.place_id || null,
    is_default: isDefault,
    isDefault,
    formatted_address: formattedAddress,
    fullAddress: formattedAddress,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
  };
}

/**
 * Authoritative Customer Addresses API.
 * Communicates with Supabase PostgreSQL `saved_addresses` table with strict customer isolation.
 * Automatically fails over to `dbRepository` if network or credentials are unavailable.
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
      // Query primary saved_addresses table
      const { data, error } = await supabase
        .from("saved_addresses")
        .select("*")
        .eq("customer_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data && Array.isArray(data) && data.length > 0) {
        return data.map((item) => normalizeAddress(item, userId));
      }

      // Fallback query to legacy customer_addresses table if saved_addresses is empty
      if (!data || data.length === 0) {
        const legacyRes = await supabase
          .from("customer_addresses")
          .select("*")
          .eq("user_id", userId)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false });

        if (!legacyRes.error && legacyRes.data && Array.isArray(legacyRes.data) && legacyRes.data.length > 0) {
          return legacyRes.data.map((item) => normalizeAddress(item, userId));
        }
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
   * Insert a new customer address into Supabase `saved_addresses`.
   */
  async createAddress(addressData: Partial<Address>, userId: string): Promise<Address> {
    if (!userId) {
      throw new Error("Authenticated user ID is required to create an address.");
    }

    const normalized = normalizeAddress(
      {
        ...addressData,
        id: addressData.id || generateAddressId(),
        customer_id: userId,
        user_id: userId,
        userId,
      },
      userId
    );

    try {
      assertServiceConfigured("supabase");

      // Insert into saved_addresses
      const { data, error } = await supabase
        .from("saved_addresses")
        .insert([
          {
            id: normalized.id.startsWith("addr-") ? undefined : normalized.id,
            customer_id: userId,
            label: normalized.label,
            full_name: normalized.full_name || normalized.recipient_name || "Customer",
            phone: normalized.phone || "9830000000",
            house_flat: normalized.house_flat || normalized.address_line_1,
            building: normalized.building,
            street: normalized.street || normalized.address_line_1,
            area: normalized.area || normalized.locality || "Kolkata",
            landmark: normalized.landmark,
            city: normalized.city || "Kolkata",
            state: normalized.state || "West Bengal",
            country: normalized.country || "India",
            postal_code: normalized.postal_code || normalized.pincode || "700064",
            latitude: normalized.latitude,
            longitude: normalized.longitude,
            formatted_address: normalized.formatted_address || normalized.fullAddress,
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

    // Local repository handling
    if (normalized.is_default) {
      const list = dbRepository.getAddresses(userId);
      list.forEach((a) => {
        a.is_default = false;
        a.isDefault = false;
        dbRepository.saveAddress(a, userId);
      });
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

      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.label || updates.title) updatePayload.label = updates.label || updates.title;
      if (updates.full_name || updates.recipient_name) updatePayload.full_name = updates.full_name || updates.recipient_name;
      if (updates.phone) updatePayload.phone = updates.phone;
      if (updates.house_flat) updatePayload.house_flat = updates.house_flat;
      if (updates.building !== undefined) updatePayload.building = updates.building;
      if (updates.street || updates.address_line_1) updatePayload.street = updates.street || updates.address_line_1;
      if (updates.area || updates.locality) updatePayload.area = updates.area || updates.locality;
      if (updates.landmark !== undefined) updatePayload.landmark = updates.landmark;
      if (updates.city) updatePayload.city = updates.city;
      if (updates.state) updatePayload.state = updates.state;
      if (updates.postal_code || updates.pincode) updatePayload.postal_code = updates.postal_code || updates.pincode;
      if (updates.formatted_address || updates.fullAddress) updatePayload.formatted_address = updates.formatted_address || updates.fullAddress;
      if (updates.is_default !== undefined || updates.isDefault !== undefined) {
        updatePayload.is_default = updates.is_default ?? updates.isDefault;
      }

      const { data, error } = await supabase
        .from("saved_addresses")
        .update(updatePayload)
        .eq("id", id)
        .eq("customer_id", userId)
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
        customer_id: userId,
        user_id: userId,
        userId,
        updated_at: new Date().toISOString(),
      },
      userId
    );

    if (merged.is_default) {
      currentList.forEach((a) => {
        if (a.id !== id) {
          a.is_default = false;
          a.isDefault = false;
          dbRepository.saveAddress(a, userId);
        }
      });
    }

    dbRepository.saveAddress(merged, userId);
    return merged;
  },

  /**
   * Delete a saved address safely.
   */
  async deleteAddress(id: string, userId: string): Promise<void> {
    if (!userId) return;

    try {
      assertServiceConfigured("supabase");
      await supabase
        .from("saved_addresses")
        .delete()
        .eq("id", id)
        .eq("customer_id", userId);
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
        .from("saved_addresses")
        .update({ is_default: false })
        .eq("customer_id", userId);

      await supabase
        .from("saved_addresses")
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("customer_id", userId);
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
