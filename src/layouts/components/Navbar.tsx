import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  User,
  LogIn,
  LogOut,
  Settings,
  LayoutDashboard,
  HelpCircle,
  Wallet,
  Crown,
  MapPin,
  ShieldCheck,
  Search,
  ChevronDown,
  Briefcase,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetHeader, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MAIN_NAV_LINKS } from "@/constants/navigation";
import { SERVICE_CATEGORIES } from "@/constants/services";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { useUIStore } from "@/store/ui.store";
import { useNotificationStore } from "@/store/notification.store";
import { useSearch } from "@/context/SearchContext";
import { MobileHeader } from "@/components/shared/MobileHeader";
import { MobileLocationSheet } from "@/components/shared/MobileLocationSheet";
import { useLocationStore, formatHeaderLocation } from "@/store/location.store";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const { locality, city } = useLocationStore();
  const { openSearch } = useSearch();
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();

  const headerLocation = formatHeaderLocation({ locality, city });

  // Detect scroll to transition header to clean glass surface with subtle shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigate(ROUTES.HOME);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Split navigation for responsive priority collapsing:
  // Primary (shown on lg & xl): Services, How It Works
  // Secondary (shown inline on xl, inside 'More' on lg): PLUS, Become a Pro, Support
  const primaryLinks = MAIN_NAV_LINKS.slice(0, 2);
  const secondaryLinks = MAIN_NAV_LINKS.slice(2);

  return (
    <>
      {/* ─── DEDICATED MOBILE SMARTPHONE HEADER (< md) ─── */}
      <MobileHeader onOpenLocation={() => setShowLocationModal(true)} />

      {/* ─── DESKTOP & TABLET HEADER (hidden md:block) ─── */}
      <header
        className={cn(
          "sticky top-0 z-(--z-sticky) w-full transition-all duration-300 hidden md:block",
          scrolled
            ? "bg-white/95 dark:bg-[#07172E]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm shadow-slate-900/5"
            : "bg-white/80 dark:bg-[#07172E]/80 backdrop-blur-md border-b border-slate-200/40 dark:border-white/10"
        )}
      >
        <nav className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 relative flex h-(--navbar-height) items-center justify-between gap-2.5 lg:gap-3 xl:gap-4 min-w-0">
          {/* Left: Brand Logo + Location Selector */}
          <div className="flex items-center gap-3 lg:gap-5 shrink-0">
            <Logo size="md" textColor="auto" />

            {/* Desktop Location Selector Indicator */}
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60 shrink-0"
              title={headerLocation.full}
              aria-label={`Current location: ${headerLocation.full}. Click to change location.`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />
              <span className="truncate max-w-35 md:max-w-45 xl:max-w-55 font-bold">
                {headerLocation.display}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Center: Desktop Nav Links (Responsive Priority Collapsing) */}
          <div className="hidden lg:flex items-center gap-1 min-w-0 shrink">
            {/* Primary links: Always visible on lg & xl */}
            {primaryLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "relative rounded-lg px-2 xl:px-2.5 2xl:px-3 py-2 text-xs xl:text-[13px] 2xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0",
                    isActive
                      ? "text-[#FF6A00] font-bold"
                      : "text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-white"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[#FF6A00]"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Secondary links on wide screens (>= 1380px): Visible inline */}
            <div className="hidden min-[1380px]:flex items-center gap-1">
              {secondaryLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "relative rounded-lg px-2 xl:px-2.5 2xl:px-3 py-2 text-xs xl:text-[13px] 2xl:text-sm font-semibold transition-colors whitespace-nowrap shrink-0",
                      isActive
                        ? "text-[#FF6A00] font-bold"
                        : "text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-white"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[#FF6A00]"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Secondary links on LG to XL (< 1380px): Collapsed into More menu */}
            <div className="min-[1380px]:hidden">
              <DropdownMenu
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-1 px-2 xl:px-2.5 py-2 text-xs xl:text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                    aria-label="More navigation links"
                  >
                    <span>More</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                }
              >
                {secondaryLinks.map((link) => (
                  <DropdownMenuItem
                    key={link.href}
                    icon={<link.icon className="h-4 w-4 text-[#FF6A00]" />}
                    onClick={() => navigate(link.href)}
                  >
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenu>
            </div>
          </div>

          {/* Right: Search + Theme + Notifications + Profile / Login */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2 shrink-0">
            {/* Global Search Input (desktop) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={openSearch}
              className="hidden lg:flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/70 dark:bg-slate-800/70 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 w-32 xl:w-40 2xl:w-52 shrink-0 cursor-pointer"
              aria-label="Search services"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Search services...</span>
              </div>
              <kbd className="hidden 2xl:inline-block text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-slate-400 shrink-0">
                ⌘K
              </kbd>
            </Button>

            {/* Mobile/Tablet Search Icon button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={openSearch}
              className="lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9 shrink-0 cursor-pointer"
              aria-label="Search services"
            >
              <Search className="h-4.5 w-4.5" />
            </Button>

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9 shrink-0 cursor-pointer"
              aria-label="Theme"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-slate-600" />
              )}
            </Button>

            {/* Notification Bell with Dynamic Popover */}
            <DropdownMenu
              trigger={
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9 shrink-0 cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell className="h-4.5 w-4.5" />
                  </Button>
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6A00] px-1 text-[10px] font-bold text-white pointer-events-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
              }
            >
              <div className="w-72 p-2">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/80">
                  <span className="font-heading text-xs font-bold text-primary dark:text-white">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllAsRead()}
                      className="text-[10px] font-bold text-[#FF6A00] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-1 py-1.5">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "p-2 rounded-xl text-xs transition-colors",
                          n.read
                            ? "hover:bg-muted/50 text-slate-600 dark:text-slate-300"
                            : "bg-orange-500/5 dark:bg-orange-500/10 font-medium text-primary dark:text-white"
                        )}
                      >
                        <p className="font-semibold truncate">{n.title}</p>
                        {n.message && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground space-y-1">
                    <Bell className="w-5 h-5 mx-auto text-muted-foreground/40" />
                    <p>No new notifications</p>
                  </div>
                )}

                <div className="pt-1.5 border-t border-border/80 text-center">
                  <Link
                    to={ROUTES.APP_NOTIFICATIONS}
                    className="text-[11px] font-bold text-primary dark:text-white hover:text-[#FF6A00] block py-1"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            </DropdownMenu>

            {/* Profile / Account Control */}
            {isLoading ? (
              <div
                className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0"
                aria-label="Loading session"
              />
            ) : isAuthenticated && user ? (
              <DropdownMenu
                trigger={
                  <div className="flex items-center gap-1.5 cursor-pointer p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
                    <div className="h-10 w-10 sm:h-10.5 sm:w-10.5 rounded-full overflow-hidden ring-2 ring-border hover:ring-[#FF6A00] transition-all shrink-0 p-0 flex items-center justify-center">
                      <Avatar size="md" className="h-full w-full rounded-full overflow-hidden border-0 ring-0">
                        {user.avatar && <AvatarImage src={user.avatar} alt={user.fullName || "User"} className="h-full w-full object-cover rounded-full" />}
                        <AvatarFallback name={user.fullName || "User"} />
                      </Avatar>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
                  </div>
                }
              >
                <div className="w-56 p-1">
                  <DropdownMenuLabel>
                    <div className="truncate">
                      <p className="font-heading text-xs font-bold text-primary dark:text-white truncate">
                        {user.fullName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {user.email || user.phone}
                      </p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-500/10 text-[#FF6A00]">
                        {user.role === "technician"
                          ? "Professional"
                          : user.role === "admin"
                          ? "Administrator"
                          : "Customer"}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Admin Specific Links */}
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuItem
                        icon={<LayoutDashboard className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.ADMIN)}
                      >
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<User className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.CUSTOMER_PROFILE)}
                      >
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<Bell className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.ADMIN_NOTIFICATIONS)}
                      >
                        Notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<Settings className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.ADMIN_SETTINGS)}
                      >
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Professional Specific Links */}
                  {user.role === "technician" && (
                    <>
                      <DropdownMenuItem
                        icon={<LayoutDashboard className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.PROFESSIONAL)}
                      >
                        Professional Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<Briefcase className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.PROFESSIONAL_JOBS)}
                      >
                        My Jobs
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<Calendar className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.PROFESSIONAL_CALENDAR)}
                      >
                        Availability
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<Wallet className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.PROFESSIONAL_EARNINGS)}
                      >
                        Earnings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<User className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.PROFESSIONAL_PROFILE)}
                      >
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<ShieldCheck className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.PROFESSIONAL_KYC)}
                      >
                        Documents / KYC
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<Bell className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.APP_NOTIFICATIONS)}
                      >
                        Notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<Settings className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.PROFESSIONAL_SETTINGS)}
                      >
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Customer Specific Links */}
                  {(!user.role || user.role === "customer") && (
                    <>
                      <DropdownMenuItem
                        icon={<User className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.CUSTOMER_PROFILE)}
                      >
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<LayoutDashboard className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.CUSTOMER_BOOKINGS)}
                      >
                        My Bookings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<MapPin className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.APP_ADDRESSES)}
                      >
                        Saved Addresses
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<Bell className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.APP_NOTIFICATIONS)}
                      >
                        Notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<Crown className="h-4 w-4 text-amber-500" />}
                        onClick={() => navigate(ROUTES.APP_MEMBERSHIP)}
                      >
                        Home-e-Fix PLUS
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={<Settings className="h-4 w-4" />}
                        onClick={() => navigate(ROUTES.APP_SETTINGS)}
                      >
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem
                    icon={<LogOut className="h-4 w-4" />}
                    destructive
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </div>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="font-semibold text-slate-700 dark:text-slate-200 h-9 px-3 text-xs sm:text-sm shrink-0 hover:text-primary dark:hover:text-white"
              >
                <Link to={ROUTES.LOGIN}>
                  <LogIn className="mr-1.5 h-3.5 w-3.5 text-[#FF6A00] shrink-0" />
                  Login
                </Link>
              </Button>
            )}

            {/* Mobile / Tablet Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9 shrink-0 cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Sheet */}
      <Sheet
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        side="right"
        className="bg-[#07172E] text-white border-l border-white/20"
      >
        <SheetHeader className="border-b border-white/10" onClose={() => setMobileMenuOpen(false)}>
          <Logo size="sm" textColor="light" linkToHome={false} />
        </SheetHeader>
        <SheetContent className="overflow-y-auto space-y-6 pb-16">
          {/* User Profile Summary */}
          {isAuthenticated && user ? (
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar size="md" className="ring-2 ring-accent">
                  <AvatarFallback name={user.fullName} />
                </Avatar>
                <div className="truncate">
                  <h4 className="font-heading text-sm font-bold text-white truncate">{user.fullName}</h4>
                  <p className="text-xs text-white/60 truncate">{user.email || user.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                <Link
                  to={ROUTES.CUSTOMER_DASHBOARD}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/5 flex items-center gap-2 text-white hover:bg-white/10"
                >
                  <LayoutDashboard className="h-4 w-4 text-accent shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-white/60 block">Bookings</span>
                    <span className="font-bold text-white">Manage</span>
                  </div>
                </Link>
                <Link
                  to={ROUTES.APP_MEMBERSHIP}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/5 flex items-center gap-2 text-white hover:bg-white/10"
                >
                  <Crown className="h-4 w-4 text-amber-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-white/60 block">Membership</span>
                    <span className="font-bold text-amber-400">PLUS</span>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-radial from-[#07172E] to-primary-dark border border-white/15 text-center space-y-3">
              <span className="text-xs text-white/80 font-medium block">
                Sign in to manage bookings, track pros live, and access VIP discounts!
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="font-bold border-white/20 text-white bg-[#07172E]" asChild>
                  <Link to={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button variant="accent" size="sm" className="font-bold shadow-glow" asChild>
                  <Link to={ROUTES.REGISTER} onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Main Navigation Links */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider block px-1 mb-1">
              Main Pages
            </span>
            {MAIN_NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all",
                    isActive
                      ? "bg-accent/20 text-accent border border-accent/40"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-accent" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Service Categories Grid */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider block">
                Service Categories
              </span>
              <Link
                to={ROUTES.SERVICES}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[10px] font-bold text-accent hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/services/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-all truncate"
                >
                  <span className="text-sm shrink-0">{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Account & Settings Links */}
          {isAuthenticated && (
            <div className="space-y-1 pt-2 border-t border-white/10">
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider block px-1 mb-1">
                Account & Settings
              </span>
              {[
                { label: "My Bookings", href: ROUTES.CUSTOMER_BOOKINGS, icon: LayoutDashboard },
                { label: "Saved Addresses", href: ROUTES.APP_ADDRESSES, icon: MapPin },
                { label: "Home-e-Fix PLUS", href: ROUTES.APP_MEMBERSHIP, icon: Crown },
                { label: "Notifications", href: ROUTES.APP_NOTIFICATIONS, icon: Bell },
                { label: "Profile & Settings", href: ROUTES.CUSTOMER_PROFILE, icon: Settings },
                { label: "Help & Support", href: ROUTES.SUPPORT, icon: HelpCircle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-white/60" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer mt-2"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Theme & Appearance Setting */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="font-semibold text-white/90">Appearance</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer text-xs"
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
        </SheetContent>
      </Sheet>

      {/* Global Location Selection Modal */}
      <MobileLocationSheet
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </>
  );
}
