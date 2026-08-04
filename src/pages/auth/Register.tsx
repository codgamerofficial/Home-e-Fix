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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OtpInput } from "@/components/ui/otp-input";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";

export default function Register() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const [step, setStep] = useState<"form" | "otp">("form");
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
                <div className="flex items-center px-3 rounded-xl border border-border bg-surface text-xs font-semibold text-primary">
                  +91
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
                <a href="#" className="text-accent underline font-semibold">Terms of Service</a> and{" "}
                <a href="#" className="text-accent underline font-semibold">Privacy Policy</a>.
              </label>
            </div>

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
          </form>
        ) : (
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
