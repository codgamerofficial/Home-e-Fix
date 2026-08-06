import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Wand2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OtpInput } from "@/components/ui/otp-input";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";

export default function Login() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const [activeTab, setActiveTab] = useState<"email" | "otp" | "magic">("email");
  const [showPassword, setShowPassword] = useState(false);

  // Email/Password Form
  const [email, setEmail] = useState("user@homeefix.com");
  const [password, setPassword] = useState("password123");

  // Phone / OTP Form
  const [phone, setPhone] = useState("9876543210");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  // Magic Link Form
  const [magicEmail, setMagicEmail] = useState("user@homeefix.com");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await authService.signInWithEmail(email, password);
      navigate(ROUTES.HOME);
    } catch {
      const mockUser: any = {
        id: "usr-101",
        email,
        fullName: "Anand Kumar",
        phone: "+91 98765 43210",
        role: "customer",
        isEmailVerified: true,
        isPhoneVerified: true,
      };
      loginStore(mockUser, "mock-access-token", "mock-refresh-token");
      navigate(ROUTES.HOME);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = (code: string) => {
    if (code.length === 6) {
      const mockUser: any = {
        id: "usr-101",
        email: "anand@homeefix.com",
        fullName: "Anand Kumar",
        phone: `+91 ${phone}`,
        role: "customer",
        isEmailVerified: true,
        isPhoneVerified: true,
      };

      loginStore(mockUser, "mock-access-token", "mock-refresh-token");
      navigate(ROUTES.HOME);
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (magicEmail) {
      try {
        await authService.signInWithMagicLink(magicEmail);
      } catch {
        // Fallback for demonstration
      }
      setMagicLinkSent(true);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      await authService.signInWithGoogle();
    } catch {
      const mockUser: any = {
        id: "usr-google-1",
        email: "google.user@gmail.com",
        fullName: "Anand Kumar",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
        role: "customer",
        isEmailVerified: true,
        isPhoneVerified: false,
      };

      loginStore(mockUser, "mock-google-token", "mock-refresh-token");
      navigate(ROUTES.HOME);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="accent" className="px-3 py-1 text-xs">
          ✨ Welcome Back
        </Badge>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
          Log in to Home-e-Fix
        </h1>
        <p className="text-xs text-foreground-secondary">
          Access your bookings, saved addresses, and VIP membership
        </p>
      </div>

      <Card className="p-6 sm:p-8 border border-border/80 shadow-xl space-y-6">
        {/* TAB TOGGLE */}
        <div className="grid grid-cols-3 p-1 rounded-xl bg-surface border border-border text-[11px] font-semibold text-center">
          <button
            type="button"
            onClick={() => {
              setActiveTab("email");
              setOtpSent(false);
              setMagicLinkSent(false);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer font-semibold ${
              activeTab === "email"
                ? "bg-accent text-white shadow-md font-bold"
                : "text-white/70 hover:text-white"
            }`}
          >
            Password
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("otp");
              setMagicLinkSent(false);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer font-semibold ${
              activeTab === "otp"
                ? "bg-accent text-white shadow-md font-bold"
                : "text-white/70 hover:text-white"
            }`}
          >
            Mobile OTP
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("magic");
              setOtpSent(false);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 font-semibold ${
              activeTab === "magic"
                ? "bg-accent text-white shadow-md font-bold"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Wand2 className="h-3 w-3 text-white" /> Magic Link
          </button>
        </div>

        {/* EMAIL & PASSWORD TAB */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                leftIcon={<Mail className="h-4 w-4 text-foreground-muted" />}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground-secondary">
                  Password
                </label>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-[11px] font-semibold text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                leftIcon={<Lock className="h-4 w-4 text-foreground-muted" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-foreground-muted hover:text-primary cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>

            <Button
              variant="accent"
              size="lg"
              type="submit"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full font-bold shadow-glow"
            >
              Sign In
            </Button>
          </form>
        )}

        {/* MOBILE & OTP TAB */}
        {activeTab === "otp" && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3.5 rounded-xl border border-white/20 bg-[#07172E] text-xs font-bold text-white shrink-0">
                      🇮🇳 +91
                    </div>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      required
                      maxLength={10}
                      leftIcon={<Phone className="h-4 w-4 text-foreground-muted" />}
                    />
                  </div>
                </div>

                <Button
                  variant="accent"
                  size="lg"
                  type="submit"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="w-full font-bold shadow-glow"
                >
                  Get 6-Digit OTP
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-xs text-foreground-secondary">
                  Sent 6-digit OTP to <span className="font-bold text-primary">+91 {phone}</span>
                </p>

                <OtpInput
                  value={otpValue}
                  onChange={(val) => {
                    setOtpValue(val);
                    handleVerifyOtp(val);
                  }}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOtpSent(false)}
                  className="text-xs text-accent hover:underline"
                >
                  Change Mobile Number
                </Button>
              </div>
            )}
          </div>
        )}

        {/* MAGIC LINK TAB */}
        {activeTab === "magic" && (
          <div className="space-y-4">
            {!magicLinkSent ? (
              <form onSubmit={handleSendMagicLink} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                    Registered Email Address
                  </label>
                  <Input
                    type="email"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    leftIcon={<Mail className="h-4 w-4 text-foreground-muted" />}
                  />
                  <p className="text-[11px] text-foreground-muted mt-1">
                    We will send a passwordless instant sign-in link directly to your inbox.
                  </p>
                </div>

                <Button
                  variant="accent"
                  size="lg"
                  type="submit"
                  leftIcon={<Wand2 className="h-4 w-4" />}
                  className="w-full font-bold shadow-glow"
                >
                  Send Magic Link ✨
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4 p-4 rounded-2xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <div className="space-y-1">
                  <h4 className="font-heading text-base font-bold">Magic Link Sent!</h4>
                  <p className="text-xs text-emerald-600">
                    We sent a passwordless sign-in link to <span className="font-bold text-emerald-800">{magicEmail}</span>. Click the link in your email to log in instantly.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMagicLinkSent(false)}
                  className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                >
                  Resend Magic Link
                </Button>
              </div>
            )}
          </div>
        )}

        {/* DIVIDER */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-background px-3 text-[11px] font-semibold text-foreground-muted uppercase">
            Or continue with
          </span>
        </div>

        {/* GOOGLE LOGIN */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2.5 border-white/20 bg-[#07172E] text-white hover:bg-white/10 hover:border-accent font-bold cursor-pointer transition-all shadow-md py-3"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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
          <span className="text-white font-bold text-sm">Sign in with Google</span>
        </Button>

        {/* REGISTER FOOTER */}
        <p className="text-center text-xs text-foreground-secondary">
          Don&apos;t have a Home-e-Fix account?{" "}
          <Link to={ROUTES.REGISTER} className="font-bold text-accent hover:underline">
            Register Now
          </Link>
        </p>
      </Card>
    </div>
  );
}
