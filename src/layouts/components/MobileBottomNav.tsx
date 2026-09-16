import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MOBILE_NAV_LINKS } from "@/constants/navigation";
import { useNotificationStore } from "@/store/notification.store";
import { ROUTES } from "@/constants/routes";

/**
 * Mobile Bottom Navigation for Customers (Section 3)
 * Pure white surface, subtle top shadow, Home-e-Fix orange accent,
 * safe-area bottom padding, and 44x44px touch targets.
 */
export function MobileBottomNav() {
  const location = useLocation();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <nav
      aria-label="Customer Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-(--z-fixed) md:hidden bg-white/95 dark:bg-[#071525]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-4px_20px_rgba(11,35,65,0.06)] pb-safe"
    >
      <div className="flex h-15 items-center justify-around px-1 max-w-lg mx-auto">
        {MOBILE_NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(link.href);

          const isAccount = link.href === ROUTES.APP_PROFILE;
          const showBadge = isAccount && unreadCount > 0;

          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full min-touch-target rounded-xl px-1 py-1",
                "transition-all duration-200 select-none",
                isActive
                  ? "text-[#FF6A00]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              {/* Active Tab Accent Bar */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 h-1 w-8 rounded-full bg-[#FF6A00] shadow-[0_2px_8px_rgba(255,106,0,0.4)]"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 32,
                  }}
                />
              )}

              <div className="relative flex items-center justify-center">
                <Icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "scale-110")} />
                {showBadge && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6A00] px-1 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-[#071525]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "text-[11px] font-medium tracking-tight mt-0.5",
                  isActive ? "font-bold text-[#FF6A00]" : "text-slate-500 dark:text-slate-400"
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
