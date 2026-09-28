import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { Info, ArrowRight } from "lucide-react";

/**
 * Legacy OTP Verification route (/auth/otp).
 * Phone OTP has been temporarily replaced with Google OAuth.
 * Automatically routes users back to /auth/login.
 */
export default function OtpVerification() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(ROUTES.LOGIN, { replace: true });
  }, [navigate]);

  return (
    <div className="w-full max-w-md mx-auto space-y-6 py-12">
      <Card className="p-8 border border-border bg-surface text-center space-y-4 rounded-3xl shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent mx-auto flex items-center justify-center">
          <Info className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-primary">Authentication Notice</h2>
          <p className="text-xs text-foreground-secondary">
            Phone OTP login is temporarily paused. Please sign in with your Google account.
          </p>
        </div>
        <Button asChild variant="accent" className="w-full font-bold gap-2">
          <Link to={ROUTES.LOGIN}>
            Go to Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </Card>
    </div>
  );
}
