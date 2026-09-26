import { addressesApi } from "@/services/api/addresses.api";
import type { Address, CreateAddressInput } from "@/types/address.types";

export interface NormalizedAddressData {
  raw: string;
  normalized: string;
  pincode: string;
}

export class AddressService {
  /**
   * Normalizes an address string for deduplication comparison.
   * Strips punctuation, collapses excess whitespace, and lowercases.
   */
  normalizeAddressString(addressStr: string): string {
    return addressStr
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Generates a canonical fingerprint for duplicate detection.
   */
  getFingerprint(addr: {
    houseFlat?: string;
    street?: string;
    area?: string;
    locality?: string;
    pincode: string;
  }): string {
    const raw = `${addr.houseFlat || ""} ${addr.street || ""} ${
      addr.locality || addr.area || ""
    } ${addr.pincode}`;
    return this.normalizeAddressString(raw);
  }

  /**
   * Validates if an Indian Postal Index Number (PIN) is compliant.
   * Format: exactly 6 digits, first digit 1-9.
   */
  isValidPincode(pin?: string): boolean {
    if (!pin) return false;
    const clean = pin.trim();
    return /^[1-9][0-9]{5}$/.test(clean);
  }

  /**
   * Checks whether a customer already has an identical address saved.
   */
  async findDuplicate(
    userId: string,
    newAddress: {
      houseFlat?: string;
      street?: string;
      locality?: string;
      pincode: string;
      latitude?: number | null;
      longitude?: number | null;
    }
  ): Promise<Address | null> {
    const existing = await addressesApi.getCustomerAddresses(userId);
    const targetFingerprint = this.getFingerprint(newAddress);

    for (const saved of existing) {
      // 1. Check coordinates if available (within ~20 meters: ~0.0002 deg)
      if (
        newAddress.latitude &&
        newAddress.longitude &&
        saved.latitude &&
        saved.longitude
      ) {
        const dLat = Math.abs(newAddress.latitude - saved.latitude);
        const dLng = Math.abs(newAddress.longitude - saved.longitude);
        if (dLat < 0.0002 && dLng < 0.0002 && saved.pincode === newAddress.pincode) {
          return saved;
        }
      }

      // 2. Check normalized address string fingerprint
      const savedFingerprint = this.getFingerprint({
        houseFlat: saved.house_flat,
        street: saved.street,
        locality: saved.locality || saved.area || undefined,
        pincode: saved.pincode,
      });

      if (
        savedFingerprint.length > 5 &&
        savedFingerprint === targetFingerprint &&
        saved.pincode === newAddress.pincode
      ) {
        return saved;
      }
    }

    return null;
  }

  /**
   * Retrieves saved addresses strictly for the authenticated user.
   */
  async getSavedAddresses(userId: string): Promise<Address[]> {
    if (!userId) return [];
    return addressesApi.getCustomerAddresses(userId);
  }

  /**
   * Saves a new address after verifying deduplication.
   */
  async saveAddress(
    userId: string,
    addressInput: Partial<Address> & { pincode: string }
  ): Promise<{ address: Address; isExisting: boolean }> {
    const duplicate = await this.findDuplicate(userId, {
      houseFlat: addressInput.house_flat,
      street: addressInput.street,
      locality: addressInput.locality || addressInput.area || undefined,
      pincode: addressInput.pincode,
      latitude: addressInput.latitude,
      longitude: addressInput.longitude,
    });

    if (duplicate) {
      return { address: duplicate, isExisting: true };
    }

    const saved = await addressesApi.createAddress(addressInput, userId);
    return { address: saved, isExisting: false };
  }
}

export const addressService = new AddressService();
