import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import type { LoginRequest, RegisterRequest, ForgotPasswordRequest } from "@/types/auth.types";

/**
 * Custom hook for authentication state and actions.
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    hasRole,
    isCustomer,
    isTechnician,
    isAdmin,
  } = useAuthStore();

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Role checks
    hasRole,
    isCustomer: isCustomer(),
    isTechnician: isTechnician(),
    isAdmin: isAdmin(),

    // Actions
    login: (credentials: LoginRequest) => authService.login(credentials),
    register: (data: RegisterRequest) => authService.register(data),
    forgotPassword: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
    logout: () => authService.logout(),
    refreshSession: () => authService.refreshSession(),
  };
}
