import { useState } from "react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { authService } from "@/services/auth.service";
import { ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Customer Registration Page.
 * Direct Google OAuth authentication with Supabase Auth session authority.
 * Eliminates upfront password and phone OTP friction.
 */
export default function Register() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleRegister = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await authService.signInWithGoogle("customer");
    } catch (err: any) {
      setErrorMessage(err?.message || "We couldn't initiate Google sign-in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 py-6">
      <div className="text-center space-y-2">
        <Badge variant="accent" className="px-3 py-1 text-xs font-semibold">
          Home-e-Fix Verified Homeowner Account
        </Badge>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
          Create Your Account
        </h1>
        <p className="text-xs sm:text-sm text-foreground-secondary max-w-sm mx-auto">
          Book verified professionals with upfront fixed pricing and 30-day warranty.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border border-border/80 bg-surface shadow-xl space-y-6 rounded-3xl">
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={loading}
            onClick={handleGoogleRegister}
            aria-label="Continue with Google"
            className="w-full h-13 flex items-center justify-center gap-3 border border-border bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm rounded-xl transition-all shadow-sm active:scale-[0.99] cursor-pointer"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
          </Button>

          <p className="text-[11px] text-center text-foreground-muted leading-relaxed">
            By continuing, you agree to Home-e-Fix&apos;s{" "}
            <Link to={ROUTES.TERMS} className="text-accent underline font-semibold hover:text-accent-hover">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to={ROUTES.PRIVACY} className="text-accent underline font-semibold hover:text-accent-hover">
              Privacy Policy
            </Link>.
          </p>
        </div>

        {/* Benefits list */}
        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex items-center gap-2 text-xs text-foreground-secondary">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Instant booking with upfront fixed pricing</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground-secondary">
            <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
            <span>30-day post-service warranty on all repairs</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground-secondary">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Verified Kolkata technicians with background checks</span>
          </div>
        </div>

        {/* Links */}
        <div className="text-center text-xs text-foreground-secondary pt-2 border-t border-border space-y-2">
          <p>
            Already have an account?{" "}
            <Link to={ROUTES.LOGIN} className="font-bold text-accent hover:underline">
              Sign in with Google
            </Link>
          </p>
          <p className="text-[11px] text-foreground-muted">
            Are you a skilled technician or tradesperson?{" "}
            <Link
              to={ROUTES.PROFESSIONAL_ONBOARDING}
              className="font-bold text-primary dark:text-white hover:text-accent hover:underline"
            >
              Join as a Professional Partner →
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
