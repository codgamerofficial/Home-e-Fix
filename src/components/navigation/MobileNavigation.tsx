import { Link, useLocation } from "react-router";
import {
  X,
  Wrench,
  Sparkles,
  Award,
  Briefcase,
  HelpCircle,
  LogIn,
  LogOut,
  Sun,
  Moon,
  MapPin,
  CalendarCheck,
  User,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetHeader, SheetContent } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SERVICE_CATEGORIES } from "@/constants/services";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { useUIStore } from "@/store/ui.store";
import { useLocationStore, formatHeaderLocation } from "@/store/location.store";

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLocation?: () => void;
}

const MOBILE_PRIMARY_LINKS = [
  { label: "Services", href: ROUTES.SERVICES, icon: Wrench },
  { label: "How It Works", href: ROUTES.HOW_IT_WORKS, icon: Sparkles },
  { label: "Home-e-Fix PLUS", href: ROUTES.MEMBERSHIP, icon: Award, badge: "PLUS" },
  { label: "Become a Professional", href: ROUTES.BECOME_A_PROFESSIONAL, icon: Briefcase },
  { label: "Support", href: ROUTES.SUPPORT, icon: HelpCircle },
];

export function MobileNavigation({
  isOpen,
  onClose,
  onOpenLocation,
}: MobileNavigationProps) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const { locality, city } = useLocationStore();
  const headerLoc = formatHeaderLocation({ locality, city });

  const handleLogout = async () => {
    try {
      onClose();
      await authService.signOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <Sheet
      open={isOpen}
      onClose={onClose}
      side="right"
      className="bg-[#07172E] text-white border-l border-white/15 w-full sm:max-w-md p-0"
    >
      {/* Drawer Header */}
      <SheetHeader className="border-b border-white/10 px-5 py-4 text-white" onClose={onClose}>
        <Logo size="sm" textColor="light" linkToHome={false} />
      </SheetHeader>

      <SheetContent className="overflow-y-auto px-5 py-5 space-y-6 pb-20">
        {/* User Status / Login Banner */}
        {isAuthenticated && user ? (
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar size="md" className="ring-2 ring-[#FF6A00]">
                {user.avatar && (
                  <AvatarImage
                    src={user.avatar}
                    alt={user.fullName || "User"}
                    className="h-full w-full object-cover rounded-full"
                  />
                )}
                <AvatarFallback
                  name={user.fullName || "User"}
                  className="bg-orange-500/20 text-[#FF6A00] font-bold"
                />
              </Avatar>
              <div className="truncate">
                <h4 className="font-heading text-sm font-bold text-white truncate">
                  {user.fullName}
                </h4>
                <p className="text-xs text-white/60 truncate">
                  {user.email || user.phone}
                </p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-orange-500/20 text-[#FF6A00]">
                  {user.role === "super_admin"
                    ? "Super Admin"
                    : user.role === "admin"
                    ? "Administrator"
                    : user.role === "technician" || user.role === "professional"
                    ? "Professional"
                    : "Customer"}
                </span>
              </div>
            </div>

            {/* Quick action shortcuts */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
              <Link
                to={
                  user.role === "super_admin" || user.role === "admin"
                    ? ROUTES.ADMIN_DASHBOARD
                    : user.role === "technician" || user.role === "professional"
                    ? ROUTES.PROFESSIONAL
                    : ROUTES.CUSTOMER_BOOKINGS
                }
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 flex items-center gap-2 text-white hover:bg-white/10 transition-colors"
              >
                <CalendarCheck className="h-4 w-4 text-[#FF6A00] shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-white/60 block">Dashboard</span>
                  <span className="font-bold text-white">Manage</span>
                </div>
              </Link>

              <Link
                to={ROUTES.MEMBERSHIP}
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 flex items-center gap-2 text-white hover:bg-white/10 transition-colors"
              >
                <Award className="h-4 w-4 text-amber-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-white/60 block">Membership</span>
                  <span className="font-bold text-amber-400">PLUS</span>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <p className="text-xs text-white/80 leading-relaxed">
              Sign in to manage bookings, track verified professionals live, and unlock exclusive discounts.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white bg-transparent hover:bg-white/10 font-bold"
                asChild
              >
                <Link to={ROUTES.LOGIN} onClick={onClose}>
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Login
                </Link>
              </Button>
              <Button
                size="sm"
                className="bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold"
                asChild
              >
                <Link to={ROUTES.REGISTER} onClick={onClose}>
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Location selector trigger */}
        {onOpenLocation && (
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1 mb-1.5">
              Service Location
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLocation();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 truncate">
                <MapPin className="w-4 h-4 text-[#FF6A00] shrink-0" />
                <div className="truncate">
                  <span className="text-xs font-semibold block truncate">
                    {headerLoc.display}
                  </span>
                  <span className="text-[10px] text-white/60 block truncate">
                    {headerLoc.full}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#FF6A00] shrink-0">
                Change
              </span>
            </button>
          </div>
        )}

        {/* Main Navigation Links */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1 mb-1.5">
            Navigation
          </span>
          {MOBILE_PRIMARY_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  isActive
                    ? "bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/40"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-[#FF6A00]" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Popular Service Categories */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Categories
            </span>
            <Link
              to={ROUTES.SERVICES}
              onClick={onClose}
              className="text-[10px] font-bold text-[#FF6A00] hover:underline"
            >
              All Services →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SERVICE_CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat.slug}
                to={`/services/${cat.slug}`}
                onClick={onClose}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all truncate"
              >
                <span className="text-sm shrink-0">{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Theme Setting */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span className="font-semibold text-white/90">Appearance</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer text-xs"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-slate-300" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Logout if authenticated */}
        {isAuthenticated && (
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
