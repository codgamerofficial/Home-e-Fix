import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import type { User, UserRole } from "@/types/auth.types";

/**
 * Listens to Supabase Auth state changes (e.g. Google OAuth redirect, token refresh)
 * and syncs session data with Zustand useAuthStore.
 */
export function useAuthListener() {
  useEffect(() => {
    // 1. Check initial session on mount (handles OAuth redirect hash)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserSession(session);
      }
    });

    // 2. Subscribe to auth state changes (OAuth login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")) {
        syncUserSession(session);
      } else if (event === "SIGNED_OUT") {
        useAuthStore.getState().logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
}

function syncUserSession(session: any) {
  const suUser = session.user;
  const fullName =
    suUser.user_metadata?.full_name ||
    suUser.user_metadata?.name ||
    (suUser.email ? suUser.email.split("@")[0] : "User");
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0] || "User";
  const lastName = nameParts.slice(1).join(" ") || "";

  const user: User = {
    id: suUser.id,
    email: suUser.email || "",
    phone: suUser.phone || suUser.user_metadata?.phone || "",
    firstName,
    lastName,
    fullName,
    avatar:
      suUser.user_metadata?.avatar_url ||
      suUser.user_metadata?.picture ||
      "",
    role: (suUser.user_metadata?.role as UserRole) || "customer",
    isVerified: true,
    isActive: true,
    createdAt: suUser.created_at || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  useAuthStore
    .getState()
    .login(user, session.access_token, session.refresh_token || "");
}
