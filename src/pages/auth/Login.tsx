import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { authService } from "@/services/auth.service";

/**
 * Customer & General Login Page.
 * Uses Google OAuth as the primary authentication authority with optional Email/Password fallback.
 * Temporarily removes Phone OTP to streamline sign-in.
 */
export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || ROUTES.APP;

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  /**
   * Primary: Google OAuth Sign In.
   */
  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setLoading(true);

    try {
      await authService.signInWithGoogle("customer", redirectTarget);
    } catch (err: any) {
      setErrorMessage(err?.message || "Google sign-in could not be initiated. Please try again.");
      setLoading(false);
    }
  };

  /**
   * Secondary: Email/Password Sign In.
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await authService.signInWithEmail(email, password);
      navigate(redirectTarget, { replace: true });
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 py-6">
      {/* ─── Header ─── */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-white tracking-tight">
          Welcome back to Home-e-Fix
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your home, your bookings, all in one place.
        </p>
      </div>

      {/* ─── Main Card ─── */}
      <Card className="p-6 sm:p-8 bg-white dark:bg-primary/60 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2.5 text-xs text-destructive"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* ─── PRIMARY ACTION: GOOGLE SIGN IN ─── */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            aria-label="Continue with Google"
            className="w-full h-13 flex items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all shadow-xs active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
          </button>

          <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
            Fast, secure, one-click sign in with your Google account.
          </p>
        </div>

        {/* ─── DIVIDER ─── */}
        <div className="relative flex items-center justify-center pt-1">
          <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
          <span className="bg-white dark:bg-primary px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Or sign in with email
          </span>
          <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
        </div>

        {/* ─── SECONDARY: EMAIL / PASSWORD OPTION ─── */}
        {!showEmailForm ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowEmailForm(true)}
            className="w-full text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            Use Email & Password
          </Button>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                className="h-12 text-sm bg-slate-50/50 dark:bg-slate-900/40"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-xs text-[#FF6A00] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                className="h-12 text-sm bg-slate-50/50 dark:bg-slate-900/40"
              />
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              disabled={loading}
              className="w-full h-12 font-bold gap-2 cursor-pointer shadow-md"
            >
              {loading ? "Signing in..." : "Sign in with Email"} <ArrowRight className="w-4 h-4" />
            </Button>

            <button
              type="button"
              onClick={() => setShowEmailForm(false)}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Hide Email Form
            </button>
          </form>
        )}

        {/* ─── FOOTER NAVIGATION ─── */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <p>
            Don&apos;t have an account?{" "}
            <Link to={ROUTES.REGISTER} className="font-bold text-[#FF6A00] hover:underline">
              Create an account with Google
            </Link>
          </p>
          <p className="text-[11px] text-slate-400">
            Are you a skilled technician or tradesperson?{" "}
            <Link
              to={ROUTES.PROFESSIONAL_ONBOARDING}
              className="font-bold text-primary dark:text-white hover:text-[#FF6A00] hover:underline"
            >
              Join as a Professional Partner →
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
