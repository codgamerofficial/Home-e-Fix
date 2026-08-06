import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
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

export default function Register() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const [step, setStep] = useState<"form" | "otp" | "magic_sent">("form");
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [otpValue, setOtpValue] = useState("");

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) return;
    setStep("otp");
  };

  const handleMagicLinkRegister = async () => {
    if (email) {
      try {
        await authService.signInWithMagicLink(email);
      } catch {
        // Fallback for demo
      }
      setStep("magic_sent");
    } else {
      alert("Please enter your email address first!");
    }
  };

  const handleVerifyOtp = (code: string) => {
    if (code.length === 6) {
      const mockUser: any = {
        id: `usr-${Date.now()}`,
        email,
        fullName,
        phone: `+91 ${phone}`,
        role: "customer",
        isEmailVerified: true,
        isPhoneVerified: true,
      };

      loginStore(mockUser, "mock-register-token", "mock-refresh-token");
      navigate("/auth/profile-setup");
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await authService.signInWithGoogle();
    } catch {
      const mockUser: any = {
        id: `usr-google-${Date.now()}`,
        email: "google.user@gmail.com",
        fullName: "Anand Kumar",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
        role: "customer",
        isEmailVerified: true,
        isPhoneVerified: false,
      };
      loginStore(mockUser, "mock-google-token", "mock-refresh-token");
      navigate("/auth/profile-setup");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="accent" className="px-3 py-1 text-xs">
          ✨ Join 100,000+ Homeowners
        </Badge>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
          Create Your Account
        </h1>
        <p className="text-xs text-foreground-secondary">
          Book verified professionals with upfront fixed pricing and 30-day warranty
        </p>
      </div>

      <Card className="p-6 sm:p-8 border border-border/80 shadow-xl space-y-6">
        {step === "form" ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Priya Sharma"
                required
                leftIcon={<User className="h-4 w-4 text-foreground-muted" />}
              />
            </div>

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

            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                Create Password
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
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

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded border-border text-accent focus:ring-accent cursor-pointer"
              />
              <label htmlFor="terms" className="text-[11px] text-foreground-secondary leading-relaxed cursor-pointer">
                I agree to Home-e-Fix&apos;s{" "}
                <Link to={ROUTES.TERMS} className="text-accent underline font-semibold">Terms of Service</Link> and{" "}
                <Link to={ROUTES.PRIVACY} className="text-accent underline font-semibold">Privacy Policy</Link>.
              </label>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                variant="accent"
                size="lg"
                type="submit"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full font-bold shadow-glow"
                disabled={!agreedTerms}
              >
                Continue to Verify Mobile
              </Button>

              <Button
                variant="outline"
                size="lg"
                type="button"
                onClick={handleMagicLinkRegister}
                leftIcon={<Wand2 className="h-4 w-4 text-accent" />}
                className="w-full font-bold text-xs border-white/20 bg-[#07172E] text-white hover:bg-white/10"
              >
                Register Passwordless via Magic Link ✨
              </Button>

              {/* DIVIDER */}
              <div className="relative flex items-center justify-center pt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <span className="relative bg-background px-3 text-[11px] font-semibold text-foreground-muted uppercase">
                  Or sign up with
                </span>
              </div>

              {/* GOOGLE REGISTER */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleGoogleRegister}
                className="w-full flex items-center justify-center gap-2.5 border-white/20 bg-[#07172E] text-white hover:bg-white/10 hover:border-accent font-bold cursor-pointer transition-all shadow-md py-3"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-white font-bold text-sm">Continue with Google</span>
              </Button>
            </div>
          </form>
        ) : step === "otp" ? (
          <div className="space-y-6 text-center">
            <div>
              <h3 className="font-heading text-lg font-bold text-primary">
                Verify Mobile Number
              </h3>
              <p className="text-xs text-foreground-secondary mt-1">
                Enter the 6-digit code sent to <span className="font-bold text-primary">+91 {phone}</span>
              </p>
            </div>

            <OtpInput
              value={otpValue}
              onChange={(val) => {
                setOtpValue(val);
                handleVerifyOtp(val);
              }}
            />

            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("form")}
                className="text-xs text-accent hover:underline"
              >
                Change Registration Details
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 p-4 rounded-2xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <div className="space-y-1">
              <h4 className="font-heading text-base font-bold">Magic Link Sent!</h4>
              <p className="text-xs text-emerald-600">
                We sent a passwordless registration link to <span className="font-bold text-emerald-800">{email}</span>. Click the link in your inbox to complete your account setup.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep("form")}
              className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            >
              Back to Form
            </Button>
          </div>
        )}

        {/* LOGIN FOOTER */}
        <p className="text-center text-xs text-foreground-secondary pt-2 border-t border-border">
          Already have an account?{" "}
          <Link to={ROUTES.LOGIN} className="font-bold text-accent hover:underline">
            Sign In Here
          </Link>
        </p>
      </Card>
    </div>
  );
}
