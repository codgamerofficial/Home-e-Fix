import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ShieldCheck, Phone, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OtpInput } from "@/components/ui/otp-input";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";

export default function OtpVerification() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const [otpValue, setOtpValue] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerSeconds]);

  const handleResendOtp = () => {
    setTimerSeconds(60);
    setCanResend(false);
    alert("New 6-digit OTP code sent via SMS!");
  };

  const handleVerify = (code: string) => {
    if (code.length === 6) {
      const mockUser: any = {
        id: "usr-otp-1",
        email: "user@homeefix.com",
        fullName: "Priya Sharma",
        phone: "+91 98765 43210",
        role: "customer",
        isEmailVerified: true,
        isPhoneVerified: true,
      };

      loginStore(mockUser, "mock-otp-token", "mock-refresh-token");
      navigate(ROUTES.HOME);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="accent" className="px-3 py-1 text-xs">
          🔒 Verification Required
        </Badge>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
          Verify Mobile Number
        </h1>
        <p className="text-xs text-foreground-secondary">
          Enter the 6-digit verification code sent to your registered phone
        </p>
      </div>

      <Card className="p-6 sm:p-8 border border-border/80 shadow-xl space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Phone className="h-7 w-7" />
        </div>

        <OtpInput
          value={otpValue}
          onChange={(val) => {
            setOtpValue(val);
            handleVerify(val);
          }}
        />

        <div className="text-xs text-foreground-secondary space-y-2">
          {!canResend ? (
            <p>
              Resend OTP in <span className="font-bold text-accent">{timerSeconds}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              className="inline-flex items-center gap-1.5 font-bold text-accent hover:underline cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Resend OTP Code
            </button>
          )}
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-secondary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>

          <Button
            variant="accent"
            size="sm"
            onClick={() => handleVerify(otpValue)}
            disabled={otpValue.length < 6}
          >
            Verify & Proceed
          </Button>
        </div>
      </Card>
    </div>
  );
}
