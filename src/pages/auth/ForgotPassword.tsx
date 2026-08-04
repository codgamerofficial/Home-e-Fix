import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowLeft, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="accent" className="px-3 py-1 text-xs">
          🔑 Password Reset
        </Badge>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
          Reset Your Password
        </h1>
        <p className="text-xs text-foreground-secondary">
          Enter your registered email address and we&apos;ll send you a password reset link
        </p>
      </div>

      <Card className="p-6 sm:p-8 border border-border/80 shadow-xl space-y-6">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                Registered Email Address
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

            <Button
              variant="accent"
              size="lg"
              type="submit"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full font-bold shadow-glow"
            >
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading text-lg font-bold text-primary">
                Check Your Inbox
              </h3>
              <p className="text-xs text-foreground-secondary">
                We sent a password reset link to <span className="font-bold text-primary">{email}</span>. Click the link in the email to set a new password.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSubmitted(false)}
              className="text-xs"
            >
              Didn&apos;t receive email? Resend
            </Button>
          </div>
        )}

        <div className="pt-2 border-t border-border text-center">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}
