import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { MoreMenu } from "./MoreMenu";

export interface DesktopNavigationProps {
  className?: string;
}

const PRIMARY_NAV_ITEMS = [
  { label: "Services", href: ROUTES.SERVICES },
  { label: "How It Works", href: ROUTES.HOW_IT_WORKS },
];

export function DesktopNavigation({ className }: DesktopNavigationProps) {
  const location = useLocation();

  return (
    <nav
      aria-label="Main Navigation"
      className={cn("flex items-center gap-1 xl:gap-2", className)}
    >
      {PRIMARY_NAV_ITEMS.map((item) => {
        const isActive = location.pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "relative px-3 py-2 text-[15px] font-medium transition-colors select-none rounded-lg",
              isActive
                ? "text-[#FF6A00] font-semibold"
                : "text-slate-700 dark:text-slate-200 hover:text-[#FF6A00] dark:hover:text-[#FF6A00]"
            )}
          >
            <span>{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="header-active-indicator"
                className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#FF6A00]"
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 35,
                }}
              />
            )}
          </Link>
        );
      })}

      {/* Modern Compact More Dropdown */}
      <MoreMenu />
    </nav>
  );
}
