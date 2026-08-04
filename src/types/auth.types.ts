import type { BaseEntity } from "./common.types";

/* ─── User Roles ─── */

export type UserRole = "customer" | "technician" | "admin";

/* ─── User ─── */

export interface User extends BaseEntity {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  metadata?: Record<string, unknown>;
}

/* ─── Auth State ─── */

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

/* ─── Auth Requests ─── */

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginWithPhoneRequest {
  phone: string;
  otp: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  acceptTerms: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/* ─── Auth Responses ─── */

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

/* ─── Social Auth ─── */

export type SocialProvider = "google" | "facebook" | "apple";

export interface SocialAuthRequest {
  provider: SocialProvider;
  token: string;
}
