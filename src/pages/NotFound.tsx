import { Link } from "react-router";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-var(--navbar-height))] items-center justify-center px-4">
      <div className="text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative mb-8"
        >
          <span className="text-[10rem] font-extrabold leading-none text-muted select-none md:text-[14rem]">
            404
          </span>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/10 md:h-28 md:w-28">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  repeatDelay: 3,
                  duration: 0.5,
                }}
              >
                <span className="text-5xl md:text-6xl">🔧</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="mb-3 font-heading text-2xl font-bold text-primary md:text-3xl">
            Page Not Found
          </h1>
          <p className="mb-8 max-w-md mx-auto text-foreground-secondary">
            Looks like this page needs fixing! The page you&apos;re looking for
            doesn&apos;t exist or has been moved.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="accent"
              size="lg"
              leftIcon={<Home className="h-5 w-5" />}
              asChild
            >
              <Link to={ROUTES.HOME}>Go Home</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              leftIcon={<ArrowLeft className="h-5 w-5" />}
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
