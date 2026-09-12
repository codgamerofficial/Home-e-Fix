import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import { logger } from "@/lib/observability/logger";
import { isServiceConfigured } from "@/config/env";
import type { User, UserRole, LoginRequest, RegisterRequest, ForgotPasswordRequest } from "@/types/auth.types";

/**
 * Authoritative Supabase Auth Service.
 * Handles Phone OTP, Email/Password, OAuth, and database profile synchronizations.
 * Never fakes verification or stores credentials in insecure client-side state.
 */
export const authService = {
  /**
   * Listen to Supabase Auth State changes and sync session with Zustand store.
   */
  initAuthListener() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      const authStore = useAuthStore.getState();

      if (session?.user) {
        const user = await this.buildUserFromSession(session);
        authStore.login(user, session.access_token, session.refresh_token);
      } else if (event === "SIGNED_OUT") {
        authStore.logout();
      }
    });
  },

  /**
   * Helper: Resolves database profile & role for a session.
   */
  async buildUserFromSession(session: any): Promise<User> {
    const suUser = session.user;

    // Default metadata fallback
    let role: UserRole = (suUser.user_metadata?.role as UserRole) || "customer";
    let fullName =
      suUser.user_metadata?.full_name ||
      suUser.user_metadata?.name ||
      (suUser.email ? suUser.email.split("@")[0] : "Home-e-Fix User");
    let avatar =
      suUser.user_metadata?.avatar_url ||
      suUser.user_metadata?.picture ||
      "";

    // Attempt to retrieve authoritative profile & role from PostgreSQL
    if (isServiceConfigured("supabase")) {
      try {
        const { data: dbUser } = await supabase
          .from("users")
          .select("role, is_active")
          .eq("id", suUser.id)
          .maybeSingle();

        if (dbUser?.role) {
          role = dbUser.role.toLowerCase() as UserRole;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, avatar_url")
          .eq("user_id", suUser.id)
          .maybeSingle();

        if (profile) {
          fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || fullName;
          if (profile.avatar_url) avatar = profile.avatar_url;
        }
      } catch (err) {
        logger.warn("Could not retrieve extended profile from database, using session claims", { err });
      }
    }

    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
      id: suUser.id,
      email: suUser.email || "",
      phone: suUser.phone || suUser.user_metadata?.phone || "",
      firstName,
      lastName,
      fullName,
      avatar,
      role,
      isVerified: Boolean(suUser.email_confirmed_at || suUser.phone_confirmed_at),
      isActive: true,
      createdAt: suUser.created_at || new Date().toISOString(),
      updatedAt: suUser.updated_at || new Date().toISOString(),
    };
  },

  /**
   * Sign in with Email & Password.
   */
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn("Email sign-in failed", { email });
      throw error;
    }

    if (data.session) {
      const user = await this.buildUserFromSession(data.session);
      useAuthStore.getState().login(user, data.session.access_token, data.session.refresh_token);
    }

    return data;
  },

  /**
   * Alias method for login.
   */
  async login(credentials: LoginRequest) {
    return this.signInWithEmail(credentials.email, credentials.password);
  },

  /**
   * Send Phone SMS OTP via Supabase Auth.
   */
  async sendPhoneOtp(phone: string) {
    // Standardize to E.164 phone format (+91 for India)
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        channel: "sms",
      },
    });

    if (error) {
      logger.warn("Send phone OTP failed", { phone: formattedPhone });
      throw error;
    }

    return data;
  },

  /**
   * Verify Phone SMS OTP via Supabase Auth.
   */
  async verifyPhoneOtp(phone: string, token: string) {
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: "sms",
    });

    if (error) {
      logger.warn("Verify phone OTP failed", { phone: formattedPhone });
      throw error;
    }

    if (data.session) {
      const user = await this.buildUserFromSession(data.session);
      useAuthStore.getState().login(user, data.session.access_token, data.session.refresh_token);
    }

    return data;
  },

  /**
   * Sign in / Sign up with Passwordless Magic Link email.
   */
  async signInWithMagicLink(email: string) {
    const redirectUrl = `${window.location.origin}/auth/profile-setup`;
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      logger.warn("Magic link dispatch failed", { email });
      throw error;
    }

    return data;
  },

  /**
   * Sign in with Google OAuth provider.
   */
  async signInWithGoogle() {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      logger.warn("Google OAuth initialization failed");
      throw error;
    }

    return data;
  },

  /**
   * Register with Email & Password.
   */
  async register(req: RegisterRequest) {
    const { data, error } = await supabase.auth.signUp({
      email: req.email,
      password: req.password,
      options: {
        data: {
          full_name: `${req.firstName} ${req.lastName}`.trim(),
          phone: req.phone,
          role: req.role || "customer",
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Request Password Reset Email.
   */
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return data;
  },

  async forgotPassword(req: ForgotPasswordRequest) {
    return this.resetPassword(req.email);
  },

  /**
   * Sign out user completely and invalidate session.
   */
  async signOut() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      logger.error("Error during Supabase sign out", err);
    } finally {
      useAuthStore.getState().logout();
    }
  },

  async logout() {
    return this.signOut();
  },

  /**
   * Refresh current active session.
   */
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    if (data.session) {
      const user = await this.buildUserFromSession(data.session);
      useAuthStore.getState().login(user, data.session.access_token, data.session.refresh_token);
    }
    return data;
  },
};
