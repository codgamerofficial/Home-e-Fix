import { z } from "zod";

/**
 * Zod validation schema for customer address creation and editing.
 * Enforces Indian mobile number (10 digits) and Indian PIN code (6 digits).
 */
export const addressFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number (e.g. 9830012345)"),
  houseFlat: z
    .string()
    .trim()
    .min(1, "House / Flat / Apartment is required")
    .max(128, "House / Flat must be less than 128 characters"),
  building: z
    .string()
    .trim()
    .max(128, "Building / Society must be less than 128 characters")
    .optional()
    .or(z.literal("")),
  street: z
    .string()
    .trim()
    .min(3, "Street / Road must be at least 3 characters")
    .max(255, "Street / Road must be less than 255 characters"),
  areaLocality: z
    .string()
    .trim()
    .min(2, "Area / Locality is required (e.g. Salt Lake, Ballygunge)")
    .max(128, "Area / Locality must be less than 128 characters"),
  landmark: z
    .string()
    .trim()
    .max(128, "Landmark must be less than 128 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .min(2, "City is required"),
  state: z
    .string()
    .trim()
    .min(2, "State is required"),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "PIN code must be a 6-digit Indian postal code (e.g. 700091)"),
  addressType: z.enum(["HOME", "WORK", "OTHER"]),
  isDefault: z.boolean(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;
