import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  Edit2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { OtpInput } from "@/components/ui/otp-input";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { TurnstileWidget } from "@/components/shared/TurnstileWidget";

type AuthTab = "phone" | "email";

/**
 * Production Home-e-Fix Login Screen.
 * Dual-method (Phone OTP primary, Email/Password secondary, Google OAuth & Magic Link).
 * Zero fake statistics, zero simulated authentication.
 */
export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || ROUTES.APP;

  const [activeTab, setActiveTab] = useState<AuthTab>("phone");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ─── Phone Flow State ───
  const [phone, setPhone] = useState("");
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // ─── Email Flow State ───
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isMagicLinkMode, setIsMagicLinkMode] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Countdown timer for Phone OTP resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isOtpStep && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, resendTimer]);

  /**
   * Post-authentication navigation handler routing by role.
   */
  const handleAuthSuccess = () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      navigate(ROUTES.APP);
      return;
    }

    const roleUpper = (user.role || "").toUpperCase();
    if (roleUpper.includes("ADMIN")) {
      navigate(ROUTES.ADMIN);
    } else if (roleUpper.includes("TECH") || roleUpper.includes("PROF")) {
      navigate(ROUTES.PROFESSIONAL);
    } else {
      navigate(redirectTarget);
    }
  };

  /**
   * Phone Flow Step 1: Request OTP from Supabase.
   */
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);

    try {
      await authService.sendPhoneOtp(cleanPhone);
      setIsOtpStep(true);
      setResendTimer(30);
      setCanResend(false);
    } catch (err: any) {
      const msg =
        err?.message ||
        "Could not send verification code. Please check the number or verify SMS provider configuration.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Phone Flow Step 2: Verify OTP via Supabase.
   */
  const handleVerifyOtp = async (code: string) => {
    if (code.length !== 6) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const cleanPhone = phone.replace(/\D/g, "");
      await authService.verifyPhoneOtp(cleanPhone, code);
      handleAuthSuccess();
    } catch (err: any) {
      const msg =
        err?.message?.includes("Token has expired")
          ? "The verification code has expired. Please request a new one."
          : err?.message || "Invalid verification code. Please check and try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend Phone OTP.
   */
  const handleResendOtp = async () => {
    if (!canResend) return;
    setErrorMessage("");
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, "");
      await authService.sendPhoneOtp(cleanPhone);
      setResendTimer(30);
      setCanResend(false);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email Flow: Email + Password Sign In.
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setLoading(true);

    try {
      await authService.signInWithEmail(email, password);
      handleAuthSuccess();
    } catch (err: any) {
      let friendlyError = "Invalid email or password. Please try again.";
      if (err?.message?.includes("Email not confirmed")) {
        friendlyError = "Your email address is not yet verified. Please check your inbox.";
      } else if (err?.message?.includes("Invalid login credentials")) {
        friendlyError = "Incorrect email or password. Please double-check your credentials.";
      } else if (err?.message) {
        friendlyError = err.message;
      }
      setErrorMessage(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email Flow: Magic Link Passwordless Sign In.
   */
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await authService.signInWithMagicLink(email);
      setMagicLinkSent(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Could not send magic link. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Google OAuth Sign In.
   */
  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setLoading(true);

    try {
      await authService.signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(err?.message || "Google sign-in could not be initiated.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ─── Header Wording ─── */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-white tracking-tight">
          Welcome back to Home-e-Fix
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your home, your bookings, all in one place.
        </p>
      </div>

      {/* ─── Main Authentication Card ─── */}
      <Card className="p-6 sm:p-8 bg-white dark:bg-primary/60 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {/* Method Tab Switcher (Phone | Email) */}
        {!isOtpStep && !magicLinkSent && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab("phone");
                setErrorMessage("");
              }}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "phone"
                  ? "bg-primary text-white shadow-sm dark:bg-[#FF6A00]"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Phone</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("email");
                setErrorMessage("");
              }}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "email"
                  ? "bg-primary text-white shadow-sm dark:bg-[#FF6A00]"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>
          </div>
        )}

        {/* Dynamic Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* ─── PRIMARY TAB: PHONE + OTP FLOW ─── */}
        {activeTab === "phone" && (
          <div>
            {!isOtpStep ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 focus-within:ring-2 focus-within:ring-[#FF6A00] focus-within:border-transparent transition-all overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3.5 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold border-r border-slate-200 dark:border-slate-700 select-none">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      autoComplete="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="98765 43210"
                      className="flex-1 px-4 py-3.5 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base font-medium outline-none"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    We will send a 6-digit verification code to this number.
                  </p>
                </div>

                <TurnstileWidget onSuccess={() => {}} className="py-1" />

                <Button
                  type="submit"
                  disabled={loading || phone.replace(/\D/g, "").length < 10}
                  className="w-full h-13 bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-base rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending OTP...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              /* OTP Step 2 */
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-primary dark:text-white">
                    Enter the 6-digit code
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span>
                      Sent to +91 ******{phone.slice(-4) || "••••"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpStep(false);
                        setOtpValue("");
                        setErrorMessage("");
                      }}
                      className="text-[#FF6A00] font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <Edit2 className="w-3 h-3" /> Change
                    </button>
                  </div>
                </div>

                {/* 6-box OTP Input */}
                <div className="py-2 flex justify-center">
                  <OtpInput
                    length={6}
                    value={otpValue}
                    onChange={setOtpValue}
                    onComplete={handleVerifyOtp}
                    disabled={loading}
                    autoFocus={true}
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => handleVerifyOtp(otpValue)}
                  disabled={loading || otpValue.length < 6}
                  className="w-full h-13 bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-base rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>

                {/* Resend Cooldown */}
                <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-[#FF6A00] font-semibold hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span>Resend code in {resendTimer}s</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── SECONDARY TAB: EMAIL FLOW ─── */}
        {activeTab === "email" && (
          <div>
            {!magicLinkSent ? (
              <form
                onSubmit={isMagicLinkMode ? handleSendMagicLink : handleEmailLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="h-13 text-base"
                  />
                </div>

                {!isMagicLinkMode ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Password
                      </label>
                      <Link
                        to={ROUTES.FORGOT_PASSWORD}
                        className="text-xs font-semibold text-[#FF6A00] hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="h-13 text-base pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    We will email you a secure, passwordless sign-in link directly to your inbox.
                  </p>
                )}

                <TurnstileWidget onSuccess={() => {}} className="py-1" />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-base rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.99] transition-all cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {isMagicLinkMode ? "Sending Magic Link..." : "Signing in..."}
                    </span>
                  ) : isMagicLinkMode ? (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" /> Send Magic Link
                    </span>
                  ) : (
                    "Sign In with Password"
                  )}
                </Button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMagicLinkMode(!isMagicLinkMode);
                      setErrorMessage("");
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium hover:underline cursor-pointer"
                  >
                    {isMagicLinkMode
                      ? "Sign in with password instead"
                      : "Prefer passwordless? Sign in with Magic Link"}
                  </button>
                </div>
              </form>
            ) : (
              /* Magic Link Sent Confirmation */
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-primary dark:text-white">
                    Check your inbox
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    We have sent a login link to{" "}
                    <span className="font-semibold text-slate-900 dark:text-white">{email}</span>. Click the link to complete sign-in.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-4 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setMagicLinkSent(false)}
                    className="text-[#FF6A00] hover:underline"
                  >
                    Change Email
                  </button>
                  <span className="text-slate-300">&bull;</span>
                  <button
                    type="button"
                    onClick={handleSendMagicLink}
                    disabled={loading}
                    className="text-slate-600 dark:text-slate-300 hover:underline"
                  >
                    Resend Link
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── GOOGLE OAUTH OPTION ─── */}
        <div className="space-y-4 pt-1">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
            <span className="bg-white dark:bg-primary px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Or continue with
            </span>
            <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-13 flex items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all shadow-xs active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </button>
        </div>

        {/* ─── Footer Action: Register ─── */}
        <div className="pt-2 text-center text-sm text-slate-600 dark:text-slate-300">
          Don't have a Home-e-Fix account?{" "}
          <Link
            to={ROUTES.REGISTER}
            className="font-bold text-[#FF6A00] hover:underline"
          >
            Register Now
          </Link>
        </div>
      </Card>

      {/* ─── Legal Consent Footnote ─── */}
      <p className="text-[11px] text-center text-slate-400 max-w-sm mx-auto leading-relaxed">
        By continuing, you agree to Home-e-Fix's{" "}
        <Link to={ROUTES.TERMS} className="text-slate-600 dark:text-slate-300 underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to={ROUTES.PRIVACY} className="text-slate-600 dark:text-slate-300 underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
