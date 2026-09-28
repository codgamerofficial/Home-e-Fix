import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Crown, Briefcase, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

interface MoreMenuItem {
  title: string;
  description: string;
  href: string;
  icon: typeof Crown;
  badge?: string;
  iconColor: string;
  iconBg: string;
}

const MORE_ITEMS: MoreMenuItem[] = [
  {
    title: "Home-e-Fix PLUS",
    description: "Membership & benefits",
    href: ROUTES.MEMBERSHIP,
    icon: Crown,
    badge: "PLUS",
    iconColor: "text-amber-500 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-400/10",
  },
  {
    title: "Become a Professional",
    description: "Join our partner network",
    href: ROUTES.BECOME_A_PROFESSIONAL,
    icon: Briefcase,
    iconColor: "text-[#FF6A00]",
    iconBg: "bg-orange-500/10 dark:bg-orange-500/15",
  },
  {
    title: "Support",
    description: "Help with bookings & services",
    href: ROUTES.SUPPORT,
    icon: HelpCircle,
    iconColor: "text-blue-500 dark:text-blue-400",
    iconBg: "bg-blue-500/10 dark:bg-blue-400/10",
  },
];

export function MoreMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if any sub-link is active
  const isAnyActive = MORE_ITEMS.some((item) =>
    location.pathname.startsWith(item.href)
  );

  // Click outside and Escape key listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div ref={menuRef} className="relative inline-flex items-center">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="More navigation links"
        className={cn(
          "flex items-center gap-1 px-3 py-2 text-[15px] font-medium rounded-lg transition-colors cursor-pointer select-none",
          "hover:text-[#FF6A00] dark:hover:text-[#FF6A00]",
          isAnyActive
            ? "text-[#FF6A00] font-semibold"
            : isOpen
            ? "text-[#FF6A00]"
            : "text-slate-700 dark:text-slate-200"
        )}
      >
        <span>More</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-150 text-slate-400 group-hover:text-[#FF6A00]",
            isOpen && "rotate-180 text-[#FF6A00]"
          )}
        />
      </button>

      {/* Modern Compact Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
              "absolute top-full left-0 mt-1.5 z-50",
              "w-60 p-2 rounded-2xl",
              "bg-white/98 dark:bg-[#091B33]/98 backdrop-blur-md",
              "border border-slate-200/90 dark:border-slate-800/90",
              "shadow-lg shadow-slate-900/10 dark:shadow-black/40",
              "focus:outline-hidden"
            )}
            role="menu"
            aria-orientation="vertical"
          >
            <div className="space-y-1">
              {MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className={cn(
                      "flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-150 group h-12",
                      isActive
                        ? "bg-orange-500/10 text-[#FF6A00] font-medium"
                        : "hover:bg-slate-100/80 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        item.iconBg,
                        item.iconColor
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-none truncate block mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
