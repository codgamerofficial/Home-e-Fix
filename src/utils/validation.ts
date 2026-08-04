import { z } from "zod";

/**
 * Common validation schemas reusable across forms.
 */

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Must include uppercase, lowercase, and a number"
  );

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number");

export const nameSchema = z
  .string()
  .min(2, "Must be at least 2 characters")
  .max(50, "Must be at most 50 characters")
  .regex(/^[a-zA-Z\s]+$/, "Only letters and spaces allowed");

export const pincodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Please enter a valid 6-digit pincode");

export const otpSchema = z
  .string()
  .regex(/^\d{6}$/, "OTP must be 6 digits");
