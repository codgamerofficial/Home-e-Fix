import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PROFESSIONAL_MOBILE_NAV_LINKS } from "@/constants/navigation";
import { dbRepository } from "@/services/db/repository";
import { useState, useEffect } from "react";

/**
 * Mobile Bottom Navigation for Professionals (Section 32)
 * Jobs, Calendar, Earnings, Support, Profile
 * Safe-area aware, touch-friendly 44x44px targets.
 */
export function TechMobileBottomNav() {
  const location = useLocation();
  const [pendingJobsCount, setPendingJobsCount] = useState(0);

  useEffect(() => {
    const asgs = dbRepository.getAssignments();
    const pending = asgs.filter((a) => a.status === "PENDING").length;
    setPendingJobsCount(pending);
  }, [location.pathname]);

  return (
    <nav
      aria-label="Professional Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-(--z-fixed) md:hidden bg-white/95 dark:bg-[#071525]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-4px_20px_rgba(11,35,65,0.06)] pb-safe"
    >
      <div className="flex h-15 items-center justify-around px-1 max-w-lg mx-auto">
        {PROFESSIONAL_MOBILE_NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.href);
          const isJobs = link.label === "Jobs";

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
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="tech-mobile-nav-indicator"
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
                {isJobs && pendingJobsCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6A00] px-1 text-[9px] font-extrabold text-white animate-pulse">
                    {pendingJobsCount}
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
