import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import type { User, LoginRequest, RegisterRequest, ForgotPasswordRequest } from "@/types/auth.types";

/**
 * Supabase Auth Service handling Sign Up, Sign In, OAuth, OTP, Magic Link, and Session Sync.
 */
export const authService = {
  /**
   * Listen to Supabase Auth State changes and sync with Zustand auth store.
   */
  initAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      const authStore = useAuthStore.getState();

      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || "",
          phone: session.user.phone || "",
          firstName: session.user.user_metadata?.full_name?.split(" ")[0] || "User",
          lastName: session.user.user_metadata?.full_name?.split(" ")[1] || "",
          fullName: session.user.user_metadata?.full_name || "User",
          avatar: session.user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
          role: (session.user.user_metadata?.role as any) || "customer",
          isVerified: true,
          isActive: true,
          createdAt: session.user.created_at,
          updatedAt: session.user.created_at,
        };

        authStore.login(user, session.access_token, session.refresh_token);
      } else if (event === "SIGNED_OUT") {
        authStore.logout();
      }
    });
  },

  /**
   * Sign up user with Email & Password.
   */
  async signUp(email: string, password: string, fullName: string, phone: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role: "customer",
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Alias method for register.
   */
  async register(req: RegisterRequest) {
    return this.signUp(req.email, req.password, `${req.firstName} ${req.lastName}`, req.phone);
  },

  /**
   * Sign in with Email & Password.
   */
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Alias method for login.
   */
  async login(credentials: LoginRequest) {
    return this.signInWithEmail(credentials.email, credentials.password);
  },

  /**
   * Sign in / Sign up with Passwordless Magic Link email.
   */
  async signInWithMagicLink(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/profile-setup`,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Trigger Mobile SMS OTP.
   */
  async signInWithOtp(phone: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with Google OAuth provider.
   */
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
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

  /**
   * Alias method for forgotPassword.
   */
  async forgotPassword(req: ForgotPasswordRequest) {
    return this.resetPassword(req.email);
  },

  /**
   * Sign out user.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    useAuthStore.getState().logout();
  },

  /**
   * Alias method for logout.
   */
  async logout() {
    return this.signOut();
  },

  /**
   * Refresh session method.
   */
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  },
};
