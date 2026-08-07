import { useState } from "react";
import { Link, useLocation } from "react-router";
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
  ShoppingBag,
  Wallet,
  Crown,
  Tag,
  MapPin,
  Star,
  Info,
  FileText,
  ShieldCheck,
  Phone,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MAIN_NAV_LINKS } from "@/constants/navigation";
import { SERVICE_CATEGORIES } from "@/constants/services";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { useNotificationStore } from "@/store/notification.store";
import { useIsMobile } from "@/hooks/useMediaQuery";

export function Navbar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme, setSearchOpen } = useUIStore();
  const { unreadCount } = useNotificationStore();

  return (
    <>
      <header className="sticky top-0 z-(--z-sticky) w-full border-b border-border/50">
        {/* Glass background */}
        <div className="absolute inset-0 bg-surface/80 backdrop-blur-xl" />

        <nav className="container-app relative flex h-(--navbar-height) items-center justify-between gap-4">
          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Logo size={isMobile ? "sm" : "md"} />

            {/* Desktop Nav Links */}
            <div className="hidden items-center gap-1 md:flex">
              {MAIN_NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "text-accent"
                        : "text-foreground-secondary hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active"
                        className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-accent"
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
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">


            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground-secondary"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Notifications (if authenticated) */}
            {isAuthenticated && (
              <Link to="/dashboard/notifications" className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground-secondary"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </Button>
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth / Profile */}
            {isAuthenticated && user ? (
              <DropdownMenu
                trigger={
                  <Avatar size="sm" className="cursor-pointer ring-2 ring-border hover:ring-accent transition-all">
                    <AvatarFallback name={user.fullName} />
                  </Avatar>
                }
              >
                <DropdownMenuLabel>
                  {user.fullName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem icon={<LayoutDashboard className="h-4 w-4" />}>
                  <Link to={ROUTES.CUSTOMER_DASHBOARD}>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem icon={<User className="h-4 w-4" />}>
                  <Link to={ROUTES.CUSTOMER_PROFILE}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem icon={<Settings className="h-4 w-4" />}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  icon={<LogOut className="h-4 w-4" />}
                  destructive
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={ROUTES.LOGIN}>
                    <LogIn className="mr-1.5 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button variant="accent" size="sm" asChild>
                  <Link to={ROUTES.REGISTER}>Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground-secondary"
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


          {/* User Profile Summary & Quick Stats */}
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
                  to="/dashboard/wallet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/5 flex items-center gap-2 text-white hover:bg-white/10"
                >
                  <Wallet className="h-4 w-4 text-accent shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-white/60 block">Wallet</span>
                    <span className="font-bold text-accent">₹500.00</span>
                  </div>
                </Link>
                <Link
                  to="/dashboard/membership"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/5 flex items-center gap-2 text-white hover:bg-white/10"
                >
                  <Crown className="h-4 w-4 text-amber-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-white/60 block">VIP Pass</span>
                    <span className="font-bold text-amber-400">ACTIVE</span>
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

          {/* All 15 Service Categories Grid */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider block">
                All 15 Service Categories
              </span>
              <Link
                to="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[10px] font-bold text-accent hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/services/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-all truncate"
                >
                  <span className="text-sm shrink-0">{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Dashboard Quick Access */}
          <div className="space-y-1 pt-2 border-t border-white/10">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider block px-1 mb-1">
              Customer Account & Orders
            </span>
            {[
              { label: "My Bookings & Orders", href: "/dashboard/orders", icon: LayoutDashboard },
              { label: "Wallet & Cashbacks", href: "/dashboard/wallet", icon: Wallet },
              { label: "VIP Membership Pass", href: "/dashboard/membership", icon: Crown },
              { label: "Coupons & Discounts", href: "/dashboard/coupons", icon: Tag },
              { label: "Saved Delivery Addresses", href: "/dashboard/addresses", icon: MapPin },
              { label: "Rate & Review Services", href: "/dashboard/reviews", icon: Star },
              { label: "Notifications & Alerts", href: "/dashboard/notifications", icon: Bell },
              { label: "Profile & Settings", href: "/dashboard/profile", icon: Settings },
              { label: "Help & Support Center", href: "/dashboard/help-center", icon: HelpCircle },
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
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Support & Legal Links */}
          <div className="space-y-1 pt-2 border-t border-white/10">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider block px-1 mb-1">
              Company & Legal
            </span>
            {[
              { label: "About Home-e-Fix", href: "/about", icon: Info },
              { label: "Contact Us & Support", href: "/contact", icon: Phone },
              { label: "Terms of Service", href: "/terms", icon: FileText },
              { label: "Privacy Policy", href: "/privacy", icon: ShieldCheck },
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
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Role Switcher Shortcuts */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider block px-1">
              Portals & App Switchers
            </span>
            <Link
              to="/technician/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-3.5 py-2.5 bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all"
            >
              <span>👨‍🔧 Technician App</span>
              <Badge variant="secondary" className="text-[10px]">PRO</Badge>
            </Link>
            <Link
              to="/admin/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-3.5 py-2.5 bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all"
            >
              <span>⚡ Admin Control Panel</span>
              <Badge variant="accent" className="text-[10px]">ADMIN</Badge>
            </Link>
          </div>

          {/* Appearance & Session Controls */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between font-semibold border-white/20 text-white bg-[#07172E]"
            >
              <span className="flex items-center gap-2">
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-400" />}
                Theme: <span className="capitalize font-bold text-accent">{theme}</span>
              </span>
              <span className="text-[10px] text-white/50">Toggle</span>
            </Button>

            {isAuthenticated && (
              <Button
                variant="destructive"
                className="w-full font-bold"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Log Out Account
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
