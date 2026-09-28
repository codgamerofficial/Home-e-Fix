import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  User,
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  Crown,
  HelpCircle,
  Briefcase,
  Calendar,
  Wallet,
  Settings,
  LogOut,
  LogIn,
  Users,
  Layers,
  FileText,
  DollarSign,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/constants/routes";

export interface ProfileMenuProps {
  className?: string;
}

interface MenuItemConfig {
  label: string;
  href: string;
  icon: typeof User;
  iconColor?: string;
  badge?: string;
}

export function ProfileMenu({ className }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Click outside and Escape key listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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

  const handleLogout = async () => {
    try {
      setIsOpen(false);
      await authService.signOut();
      navigate(ROUTES.HOME);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Loading session skeleton
  if (isLoading) {
    return (
      <div
        className="h-10.5 w-10.5 rounded-xl bg-slate-200/80 dark:bg-slate-700/60 animate-pulse shrink-0"
        aria-label="Loading session"
      />
    );
  }

  // Not authenticated: Clean Login Button
  if (!isAuthenticated || !user) {
    return (
      <Link
        to={ROUTES.LOGIN}
        className={cn(
          "h-10.5 px-3.5 sm:px-4 rounded-xl inline-flex items-center gap-1.5 shrink-0 select-none",
          "bg-[#FF6A00] text-white hover:bg-[#E55F00] shadow-xs hover:shadow-sm",
          "text-xs sm:text-[13px] font-semibold transition-all duration-150 cursor-pointer",
          "focus:outline-hidden focus:ring-2 focus:ring-[#FF6A00]/40",
          className
        )}
      >
        <LogIn className="w-3.5 h-3.5 shrink-0" />
        <span>Login</span>
      </Link>
    );
  }

  // Determine Role-Based Navigation Items strictly according to specifications:
  // 1. Super Admin
  // 2. Admin
  // 3. Professional / Technician
  // 4. Customer
  const role = user.role;

  let menuItems: MenuItemConfig[] = [];
  let roleTitle = "Customer";

  if (role === "super_admin") {
    roleTitle = "Super Admin";
    menuItems = [
      { label: "Admin Control Center", href: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
      { label: "Operations", href: ROUTES.ADMIN_OPERATIONS, icon: Layers },
      { label: "Professionals", href: ROUTES.ADMIN_PROFESSIONALS, icon: Briefcase },
      { label: "Customers", href: ROUTES.ADMIN_CUSTOMERS, icon: Users },
      { label: "Finance", href: ROUTES.ADMIN_PAYMENTS, icon: DollarSign },
      { label: "Settings", href: ROUTES.ADMIN_SETTINGS, icon: Settings },
      { label: "Audit Logs", href: ROUTES.ADMIN_AUDIT_LOGS, icon: FileText },
    ];
  } else if (role === "admin") {
    roleTitle = "Administrator";
    menuItems = [
      { label: "Admin Dashboard", href: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
      { label: "Operations", href: ROUTES.ADMIN_OPERATIONS, icon: Layers },
      { label: "Bookings", href: ROUTES.ADMIN_BOOKINGS, icon: CalendarCheck },
      { label: "Professionals", href: ROUTES.ADMIN_PROFESSIONALS, icon: Briefcase },
      { label: "Customers", href: ROUTES.ADMIN_CUSTOMERS, icon: Users },
      { label: "Settings", href: ROUTES.ADMIN_SETTINGS, icon: Settings },
    ];
  } else if (role === "technician" || role === "professional") {
    roleTitle = "Professional";
    menuItems = [
      { label: "Professional Dashboard", href: ROUTES.PROFESSIONAL, icon: LayoutDashboard },
      { label: "My Jobs", href: ROUTES.PROFESSIONAL_JOBS, icon: Briefcase },
      { label: "Earnings", href: ROUTES.PROFESSIONAL_EARNINGS, icon: Wallet },
      { label: "Availability", href: ROUTES.PROFESSIONAL_CALENDAR, icon: Calendar },
      { label: "Profile", href: ROUTES.PROFESSIONAL_PROFILE, icon: User },
      { label: "Support", href: ROUTES.PROFESSIONAL_SUPPORT, icon: HelpCircle },
    ];
  } else {
    // Customer
    roleTitle = "Customer";
    menuItems = [
      { label: "My Profile", href: ROUTES.CUSTOMER_PROFILE, icon: User },
      { label: "My Bookings", href: ROUTES.CUSTOMER_BOOKINGS, icon: CalendarCheck },
      { label: "Saved Addresses", href: ROUTES.APP_ADDRESSES, icon: MapPin },
      {
        label: "Home-e-Fix PLUS",
        href: ROUTES.APP_MEMBERSHIP,
        icon: Crown,
        iconColor: "text-amber-500",
        badge: "PLUS",
      },
      { label: "Support", href: ROUTES.SUPPORT, icon: HelpCircle },
    ];
  }

  // Display user first name where space permits
  const firstName = user.fullName?.trim().split(" ")[0] || "Account";

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Trigger: Avatar + Name + Chevron */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "h-10.5 px-2 rounded-xl flex items-center gap-2 shrink-0 cursor-pointer select-none",
          "bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80",
          "border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-200",
          "transition-all duration-150 group focus:outline-hidden focus:ring-2 focus:ring-[#FF6A00]/25",
          isOpen && "border-[#FF6A00]",
          className
        )}
        aria-label="Open profile menu"
        aria-expanded={isOpen}
      >
        <div className="h-7.5 w-7.5 rounded-lg overflow-hidden shrink-0 ring-1 ring-slate-300 dark:ring-slate-600 group-hover:ring-[#FF6A00] transition-colors">
          <Avatar size="sm" className="h-full w-full rounded-lg border-0 ring-0">
            {user.avatar && (
              <AvatarImage
                src={user.avatar}
                alt={user.fullName || "User"}
                className="h-full w-full object-cover rounded-lg"
              />
            )}
            <AvatarFallback
              name={user.fullName || "User"}
              className="text-[11px] font-bold rounded-lg bg-orange-500/15 text-[#FF6A00]"
            />
          </Avatar>
        </div>

        <span className="hidden md:inline-block text-xs xl:text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate max-w-20 lg:max-w-24 xl:max-w-28 text-left">
          {firstName}
        </span>

        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 transition-transform duration-150",
            isOpen && "rotate-180 text-[#FF6A00]"
          )}
        />
      </button>

      {/* Role-Specific Account Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
              "absolute top-full right-0 mt-2 z-50",
              "w-56 sm:w-60 p-1.5 rounded-2xl",
              "bg-white/98 dark:bg-[#091B33]/98 backdrop-blur-md",
              "border border-slate-200/90 dark:border-slate-800/90",
              "shadow-xl shadow-slate-900/10 dark:shadow-black/50",
              "focus:outline-hidden"
            )}
            role="menu"
            aria-orientation="vertical"
          >
            {/* User Profile Header */}
            <div className="px-2.5 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="font-heading text-xs font-bold text-slate-900 dark:text-white truncate">
                {user.fullName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {user.email || user.phone}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider",
                    role === "super_admin"
                      ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                      : role === "admin"
                      ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                      : role === "technician" || role === "professional"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-orange-500/15 text-[#FF6A00]"
                  )}
                >
                  {roleTitle}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1 space-y-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={cn(
                          "w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0",
                          item.iconColor
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Logout Item */}
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
