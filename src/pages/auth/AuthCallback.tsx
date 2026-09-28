import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/constants/routes";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/auth.types";

/**
 * Authoritative Supabase OAuth Callback Handler (/auth/callback).
 * Processes Google OAuth exchange, creates/syncs PostgreSQL profile,
 * determines role and routes to the appropriate dashboard or onboarding.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        // 1. Retrieve session from Supabase (exchanges hash fragment / code automatically)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          // If no session immediate, wait for onAuthStateChange SIGNED_IN event
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
              if (event === "SIGNED_IN" && currentSession?.user) {
                authListener.subscription.unsubscribe();
                await processUserSession(currentSession);
              }
            }
          );

          // Fallback timeout in case OAuth was cancelled or failed
          setTimeout(() => {
            if (isMounted && !useAuthStore.getState().isAuthenticated) {
              setErrorMessage("Google sign-in was cancelled or timed out. Please try again.");
            }
          }, 6000);
          return;
        }

        await processUserSession(session);
      } catch (err: any) {
        if (!isMounted) return;
        const msg =
          err?.message?.toLowerCase().includes("access_denied") ||
          err?.message?.toLowerCase().includes("cancelled")
            ? "Google sign-in was cancelled."
            : err?.message || "We couldn't complete Google sign-in. Please try again.";
        setErrorMessage(msg);
      }
    }

    async function processUserSession(session: any) {
      if (!isMounted) return;

      // Retrieve stored intent from sessionStorage
      let roleIntent: UserRole = "customer";
      let redirectTarget: string | null = null;
      try {
        const storedRole = sessionStorage.getItem("hef_oauth_intent_role");
        if (storedRole === "professional" || storedRole === "customer" || storedRole === "technician") {
          roleIntent = storedRole as UserRole;
        }
        redirectTarget = sessionStorage.getItem("hef_oauth_redirect_target");
        sessionStorage.removeItem("hef_oauth_intent_role");
        sessionStorage.removeItem("hef_oauth_redirect_target");
      } catch {
        // Ignore storage exceptions
      }

      // 2. Ensure authoritative profile in database
      const user = await authService.ensureProfile(session.user, roleIntent);

      // 3. Update Zustand Auth Store
      useAuthStore
        .getState()
        .login(user, session.access_token, session.refresh_token || "");

      // 4. Role-based deterministic routing
      const userRole = (user.role || "").toLowerCase();
      if (userRole === "super_admin" || userRole === "admin") {
        navigate(ROUTES.ADMIN, { replace: true });
      } else if (userRole === "professional" || userRole === "technician") {
        navigate(redirectTarget || ROUTES.PROFESSIONAL, { replace: true });
      } else {
        navigate(redirectTarget || ROUTES.APP, { replace: true });
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (errorMessage) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-surface border border-border rounded-3xl shadow-xl text-center space-y-5">
          <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-2xl mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-primary">Authentication Notice</h2>
            <p className="text-xs text-foreground-secondary leading-relaxed">{errorMessage}</p>
          </div>
          <Button
            variant="outline"
            className="w-full gap-2 cursor-pointer"
            onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
          >
            <ArrowLeft className="w-4 h-4" /> Return to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-primary">Completing Google Sign-In</h2>
        <p className="text-xs text-foreground-secondary">
          Securely synchronizing your Home-e-Fix account...
        </p>
      </div>
    </div>
  );
}
