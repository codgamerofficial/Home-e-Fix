import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { notificationService } from "./notification.service";
import type { LoginRequest, RegisterRequest, ForgotPasswordRequest } from "@/types/auth.types";

/**
 * Auth service — business logic layer between API and store.
 */
export const authService = {
  async login(credentials: LoginRequest): Promise<boolean> {
    try {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setError(null);

      const response = await authApi.login(credentials);
      const { user, accessToken, refreshToken } = response.data;

      useAuthStore.getState().login(user, accessToken, refreshToken);
      notificationService.success(`Welcome back, ${user.firstName}!`);
      return true;
    } catch (error) {
      const message =
        (error as { message?: string }).message || "Login failed. Please try again.";
      useAuthStore.getState().setError(message);
      notificationService.error(message);
      return false;
    } finally {
      useAuthStore.getState().setLoading(false);
    }
  },

  async register(data: RegisterRequest): Promise<boolean> {
    try {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setError(null);

      const response = await authApi.register(data);
      const { user, accessToken, refreshToken } = response.data;

      useAuthStore.getState().login(user, accessToken, refreshToken);
      notificationService.success("Account created successfully!");
      return true;
    } catch (error) {
      const message =
        (error as { message?: string }).message || "Registration failed. Please try again.";
      useAuthStore.getState().setError(message);
      notificationService.error(message);
      return false;
    } finally {
      useAuthStore.getState().setLoading(false);
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<boolean> {
    try {
      await authApi.forgotPassword(data);
      notificationService.success(
        "Password reset link sent!",
        "Check your email for instructions."
      );
      return true;
    } catch (error) {
      const message =
        (error as { message?: string }).message || "Failed to send reset link.";
      notificationService.error(message);
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Logout locally even if API fails
    } finally {
      useAuthStore.getState().logout();
      notificationService.info("You have been logged out.");
    }
  },

  async refreshSession(): Promise<boolean> {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) return false;

    try {
      const response = await authApi.refreshToken(refreshToken);
      const { user, accessToken, refreshToken: newRefreshToken } = response.data;
      useAuthStore.getState().login(user, accessToken, newRefreshToken);
      return true;
    } catch {
      useAuthStore.getState().logout();
      return false;
    }
  },
};
