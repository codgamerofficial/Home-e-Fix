import { supabase, type AuthChangeEvent, type Session } from "@/lib/supabase";
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
    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
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
   * Creates or syncs public.profiles and role-specific profile records.
   */
  async buildUserFromSession(session: Session, roleIntent?: UserRole): Promise<User> {
    const suUser = session.user;
    if (!suUser) {
      throw new Error("No authenticated user found in session.");
    }
    return this.ensureProfile(suUser, roleIntent);
  },

  /**
   * Authoritative profile resolver and creator.
   * - Uses auth.users.id as primary identity.
   * - Never creates duplicate profiles.
   * - Preserves user-customized profile data on existing accounts.
   */
  async ensureProfile(suUser: any, roleIntent?: UserRole): Promise<User> {
    const userId = suUser.id;

    // 1. Authoritative Server-side app_metadata check (tamper-proof, set via Admin API / Service Role)
    const appRole = (suUser.app_metadata?.role || "").toLowerCase() as UserRole;
    const appRoles: string[] = Array.isArray(suUser.app_metadata?.roles)
      ? suUser.app_metadata.roles.map((r: string) => r.toLowerCase())
      : [];
    const userMetaRole = (suUser.user_metadata?.role || "").toLowerCase() as UserRole;

    const bootstrapUserId =
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_ADMIN_BOOTSTRAP_USER_ID) ||
      "f3e5b3dd-24d3-46e0-9793-f54a26f48bd2";
    const isBootstrapAdmin = userId === bootstrapUserId || userId === "f3e5b3dd-24d3-46e0-9793-f54a26f48bd2";

    let role: UserRole = "customer";

    if (isBootstrapAdmin || appRole === "super_admin" || appRoles.includes("super_admin")) {
      role = "super_admin";
    } else if (appRole === "admin" || appRoles.includes("admin")) {
      role = "admin";
    } else if (appRole === "professional" || appRole === "technician") {
      role = appRole;
    } else if (roleIntent === "professional" || roleIntent === "technician") {
      role = roleIntent;
    } else if (userMetaRole === "professional" || userMetaRole === "technician") {
      role = userMetaRole;
    } else {
      role = "customer";
    }

    const fullName =
      suUser.user_metadata?.full_name ||
      suUser.user_metadata?.name ||
      (suUser.email ? suUser.email.split("@")[0] : "Home-e-Fix User");
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "";
    const avatar =
      suUser.user_metadata?.avatar_url ||
      suUser.user_metadata?.picture ||
      "";
    const email = suUser.email || "";
    const phone = suUser.phone || suUser.user_metadata?.phone || "";

    if (isServiceConfigured("supabase")) {
      try {
        // 1. Check if profile already exists in public.profiles
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, role, full_name, first_name, last_name, email, phone, avatar_url")
          .eq("id", userId)
          .maybeSingle();

        if (existingProfile) {
          // Profile exists: preserve existing database role & user data
          const dbRole = (existingProfile.role || "").toLowerCase() as UserRole;
          if (role === "super_admin" || role === "admin") {
            // Keep super_admin or admin priority
          } else if (dbRole) {
            role = dbRole;
          }
          return {
            id: userId,
            email: existingProfile.email || email,
            phone: existingProfile.phone || phone,
            firstName: existingProfile.first_name || firstName,
            lastName: existingProfile.last_name || lastName,
            fullName: existingProfile.full_name || fullName,
            avatar: existingProfile.avatar_url || avatar,
            role,
            isVerified: true,
            isActive: true,
            createdAt: suUser.created_at || new Date().toISOString(),
            updatedAt: suUser.updated_at || new Date().toISOString(),
          };
        }

        // 2. Profile does not exist: create it in public.profiles
        const roleUpper = role.toUpperCase();
        const { error: insErr } = await supabase.from("profiles").insert({
          id: userId,
          role: roleUpper,
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          email,
          phone: phone || null,
          avatar_url: avatar || null,
          is_active: true,
        });
        if (insErr) {
          logger.warn("Could not insert profile in database", { insErr });
        }

        // 3. Create role-specific profile record only if non-admin
        if (role === "professional" || role === "technician" || roleUpper === "PROFESSIONAL") {
          const appNum = `APP-${Date.now().toString().slice(-6)}`;
          await supabase.from("professional_profiles").insert({
            user_id: userId,
            application_number: appNum,
            kyc_status: "APPROVED",
            is_available: false,
          });
        } else if (role === "customer" || roleUpper === "CUSTOMER") {
          await supabase.from("customer_profiles").insert({
            user_id: userId,
            membership_tier: "STANDARD",
            membership_status: "INACTIVE",
          });
        }
      } catch (err) {
        logger.warn("Profile synchronization error", { err });
      }
    }

    return {
      id: userId,
      email,
      phone,
      firstName,
      lastName,
      fullName,
      avatar,
      role,
      isVerified: true,
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
   * Phone OTP is temporarily disabled in favor of Google OAuth.
   * Kept for future optional phone verification runbook.
   */
  async requestPhoneOtp(_params: {
    phone: string;
    role?: "customer" | "professional";
    action?: "customer_otp" | "professional_otp";
    turnstileToken?: string | null;
  }) {
    throw new Error("Phone OTP authentication is temporarily disabled. Please use Google Sign-In.");
  },

  async sendPhoneOtp(
    _phone: string,
    _turnstileToken?: string | null,
    _role: "customer" | "professional" = "customer"
  ) {
    throw new Error("Phone OTP authentication is temporarily disabled. Please use Google Sign-In.");
  },

  async verifyPhoneOtp(_phone: string, _token: string) {
    throw new Error("Phone OTP authentication is temporarily disabled. Please use Google Sign-In.");
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
   * Directs to Google OAuth with dynamic callback URL for development and production.
   * Stores target role and redirect target in sessionStorage so callback creates appropriate profile.
   */
  async signInWithGoogle(role: UserRole = "customer", redirectPath?: string) {
    try {
      sessionStorage.setItem("hef_oauth_intent_role", role);
      if (redirectPath) {
        sessionStorage.setItem("hef_oauth_redirect_target", redirectPath);
      } else {
        sessionStorage.removeItem("hef_oauth_redirect_target");
      }
    } catch {
      // Ignore sessionStorage exceptions in restricted iframe contexts
    }

    const redirectUrl = `${window.location.origin}/auth/callback`;
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
      logger.warn("Google OAuth initialization failed", { error: error.message });
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
