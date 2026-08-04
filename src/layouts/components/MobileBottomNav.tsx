import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MOBILE_NAV_LINKS } from "@/constants/navigation";

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-(--z-fixed) md:hidden">
      {/* Glass background */}
      <div className="absolute inset-0 border-t border-border/50 bg-surface/90 backdrop-blur-xl" />

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
                  ? "text-accent"
                  : "text-foreground-muted hover:text-foreground-secondary"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute -top-1 h-0.5 w-8 rounded-full bg-accent"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Safe area padding for notched devices */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
