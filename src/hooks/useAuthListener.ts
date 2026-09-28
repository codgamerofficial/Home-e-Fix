import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import type { UserRole } from "@/types/auth.types";

/**
 * Listens to Supabase Auth state changes (e.g. Google OAuth redirect, token refresh)
 * and syncs session data with Zustand useAuthStore and PostgreSQL profiles.
 */
export function useAuthListener() {
  useEffect(() => {
    // 1. Check initial session on mount (handles OAuth redirect hash)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await syncUserSession(session);
      }
    });

    // 2. Subscribe to auth state changes (OAuth login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION")) {
        await syncUserSession(session);
      } else if (event === "SIGNED_OUT") {
        useAuthStore.getState().logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
}

async function syncUserSession(session: any) {
  try {
    const user = await authService.buildUserFromSession(session);
    useAuthStore
      .getState()
      .login(user, session.access_token, session.refresh_token || "");
  } catch {
    const suUser = session.user;
    const fullName =
      suUser.user_metadata?.full_name ||
      suUser.user_metadata?.name ||
      (suUser.email ? suUser.email.split("@")[0] : "Home-e-Fix User");
    const nameParts = fullName.split(" ");

    const appRole = (suUser.app_metadata?.role || "").toLowerCase();
    const appRoles: string[] = Array.isArray(suUser.app_metadata?.roles)
      ? suUser.app_metadata.roles.map((r: string) => r.toLowerCase())
      : [];
    const userMetaRole = (suUser.user_metadata?.role || "").toLowerCase();
    const bootstrapUserId =
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_ADMIN_BOOTSTRAP_USER_ID) ||
      "f3e5b3dd-24d3-46e0-9793-f54a26f48bd2";
    const isSuperAdmin =
      suUser.id === bootstrapUserId ||
      suUser.id === "f3e5b3dd-24d3-46e0-9793-f54a26f48bd2" ||
      appRole === "super_admin" ||
      appRoles.includes("super_admin") ||
      userMetaRole === "super_admin";

    let role: UserRole = "customer";
    if (isSuperAdmin) {
      role = "super_admin";
    } else if (appRole === "admin" || appRoles.includes("admin") || userMetaRole === "admin") {
      role = "admin";
    } else if (appRole === "professional" || appRole === "technician" || userMetaRole === "professional" || userMetaRole === "technician") {
      role = (appRole || userMetaRole) as UserRole;
    } else if (userMetaRole) {
      role = userMetaRole as UserRole;
    }

    const user = {
      id: suUser.id,
      email: suUser.email || "",
      phone: suUser.phone || suUser.user_metadata?.phone || "",
      firstName: nameParts[0] || "User",
      lastName: nameParts.slice(1).join(" ") || "",
      fullName,
      avatar:
        suUser.user_metadata?.avatar_url ||
        suUser.user_metadata?.picture ||
        "",
      role,
      isVerified: true,
      isActive: true,
      createdAt: suUser.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useAuthStore
      .getState()
      .login(user, session.access_token, session.refresh_token || "");
  }
}
