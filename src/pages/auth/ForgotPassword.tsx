import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";

/* ─── Validation Schema ─── */

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/* ─── Component ─── */

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // TODO: Implement actual forgot password
    console.log("Forgot Password:", data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={ROUTES.LOGIN}
        className="inline-flex items-center gap-1 text-sm text-foreground-secondary hover:text-accent mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>

      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-primary">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-foreground-secondary">
          No worries. Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {isSubmitSuccessful ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-success-light border border-success/20 p-6 text-center"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
            <Mail className="h-6 w-6 text-success" />
          </div>
          <h3 className="font-heading font-semibold text-primary mb-1">
            Check your email
          </h3>
          <p className="text-sm text-foreground-secondary">
            We&apos;ve sent a password reset link to your email address.
            Please check your inbox.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full"
            isLoading={isSubmitting}
          >
            Send Reset Link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-foreground-secondary">
        Remember your password?{" "}
        <Link
          to={ROUTES.LOGIN}
          className="font-medium text-accent hover:underline"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
