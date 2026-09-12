import { z } from "zod";

/**
 * Shared validation schemas using Zod
 */

export const phoneSchema = z
  .string()
  .min(10, "Phone number must be 10 digits")
  .max(10, "Phone number must be 10 digits")
  .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number");

export const emailSchema = z
  .string()
  .email("Please enter a valid email address");

export const pincodeSchema = z
  .string()
  .length(6, "PIN code must be 6 digits")
  .regex(/^\d{6}$/, "Invalid PIN code");

export const addressSchema = z.object({
  id: z.string().optional(),
  label: z.enum(["Home", "Work", "Other"]),
  addressLine1: z.string().min(3, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().default("Kolkata"),
  pincode: pincodeSchema,
  isDefault: z.boolean().default(false),
});

export const bookingDraftSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  addressId: z.string().min(1, "Please select a service address"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTimeSlot: z.string().min(1, "Please select a time slot"),
  problemDescription: z.string().optional(),
  mediaUrls: z.array(z.string()).default([]),
  couponCode: z.string().optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
export type BookingDraftFormData = z.infer<typeof bookingDraftSchema>;
