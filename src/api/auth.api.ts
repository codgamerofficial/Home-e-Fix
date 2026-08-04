import { apiClient } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  LoginWithPhoneRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
} from "@/types/auth.types";

const AUTH_BASE = "/auth";

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>(`${AUTH_BASE}/login`, data),

  loginWithPhone: (data: LoginWithPhoneRequest) =>
    apiClient.post<AuthResponse>(`${AUTH_BASE}/login/phone`, data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>(`${AUTH_BASE}/register`, data),

  logout: () =>
    apiClient.post<void>(`${AUTH_BASE}/logout`),

  refreshToken: (refreshToken: string) =>
    apiClient.post<AuthResponse>(`${AUTH_BASE}/refresh`, { refreshToken }),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<{ message: string }>(`${AUTH_BASE}/forgot-password`, data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<{ message: string }>(`${AUTH_BASE}/reset-password`, data),

  getProfile: () =>
    apiClient.get<User>(`${AUTH_BASE}/profile`),

  updateProfile: (data: Partial<User>) =>
    apiClient.patch<User>(`${AUTH_BASE}/profile`, data),

  sendOtp: (phone: string) =>
    apiClient.post<{ message: string }>(`${AUTH_BASE}/send-otp`, { phone }),

  verifyEmail: (token: string) =>
    apiClient.post<{ message: string }>(`${AUTH_BASE}/verify-email`, { token }),
};
