import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MOBILE_NAV_LINKS } from "@/constants/navigation";

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-(--z-fixed) md:hidden">
      {/* Glass background */}
      <div className="absolute inset-0 border-t border-white/10 bg-primary-dark/95 backdrop-blur-xl shadow-2xl" />

      <div className="relative flex h-(--bottom-nav-height) items-center justify-around px-2">
        {MOBILE_NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5",
                "transition-colors duration-200",
                isActive
                  ? "text-accent font-bold"
                  : "text-white/70 hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute -top-1 h-0.5 w-8 rounded-full bg-accent shadow-glow"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold tracking-wide">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Safe area padding for notched devices */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
