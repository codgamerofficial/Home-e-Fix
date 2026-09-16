import { Link, useNavigate } from "react-router";
import {
  MapPin,
  ChevronDown,
  Search,
  Bell,
  User,
  Sun,
  Moon,
  LogIn,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocationStore } from "@/store/location.store";
import { useSearch } from "@/context/SearchContext";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { useNotificationStore } from "@/store/notification.store";
import { ROUTES } from "@/constants/routes";

interface MobileHeaderProps {
  onOpenLocation: () => void;
}

/**
 * Dedicated Mobile Header for Home-e-Fix (Section 4)
 * - Row 1: [Logo] [Theme] [Bell] [Profile]
 * - Row 2: [📍 Kolkata, WB ▼]
 * - Row 3: [🔍 What service do you need?]
 * Completely replaces desktop navigation wrapping.
 */
export function MobileHeader({ onOpenLocation }: MobileHeaderProps) {
  const navigate = useNavigate();
  const { locality, city } = useLocationStore();
  const { openSearch } = useSearch();
  const { user, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const { unreadCount } = useNotificationStore();

  return (
    <header className="sticky top-0 z-(--z-sticky) md:hidden bg-white/95 dark:bg-[#071525]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs pt-safe">
      <div className="px-4 pt-2.5 pb-3 space-y-2.5">
        {/* ─── Row 1: Logo & Action Icons ─── */}
        <div className="flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center shrink-0">
            <Logo size="sm" textColor="auto" />
          </Link>

          <div className="flex items-center gap-1.5">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                to={ROUTES.APP_NOTIFICATIONS}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute 1 top-1 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6A00] px-1 text-[9px] font-extrabold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Profile Avatar or Login */}
            {isAuthenticated && user ? (
              <Link to={ROUTES.APP_PROFILE} aria-label="Customer Profile">
                <Avatar size="sm" className="h-8 w-8 ring-1 ring-slate-200 dark:ring-slate-700">
                  <AvatarFallback name={user.fullName} />
                </Avatar>
              </Link>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FF6A00] text-white shadow-xs hover:bg-[#E55F00] transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* ─── Row 2: Location Selector Pill ─── */}
        <div>
          <button
            type="button"
            onClick={onOpenLocation}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/70 transition-colors cursor-pointer max-w-full"
            aria-label="Select service location"
          >
            <MapPin className="h-3.5 w-3.5 text-[#FF6A00] shrink-0" />
            <span className="truncate max-w-56 font-bold text-slate-800 dark:text-white">
              {locality ? `${locality}, ${city}` : "Kolkata"}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* ─── Row 3: Full-width Interactive Search Pill ─── */}
        <div>
          <button
            type="button"
            onClick={openSearch}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-left text-slate-400 hover:border-accent/40 active:scale-[0.99] transition-all cursor-pointer shadow-inner"
            aria-label="Search home services"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-[#FF6A00] shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-300">
                What service do you need today?
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#FF6A00] bg-orange-500/10 dark:bg-orange-500/20 px-2 py-0.5 rounded-lg shrink-0">
              Quick Fix
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
