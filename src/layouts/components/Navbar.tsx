import { useState } from "react";
import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import {
  Search,
  Menu,
  Sun,
  Moon,
  Bell,
  User,
  LogIn,
  LogOut,
  Settings,
  LayoutDashboard,
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
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { useNotificationStore } from "@/store/notification.store";
import { useIsMobile } from "@/hooks/useMediaQuery";

export function Navbar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
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
          <div className="flex items-center gap-2">
            {/* Search (desktop) */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex text-foreground-secondary"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

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
              <div className="relative">
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
              </div>
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
      >
        <SheetHeader onClose={() => setMobileMenuOpen(false)}>
          <Logo size="sm" linkToHome={false} />
        </SheetHeader>
        <SheetContent>
          <div className="flex flex-col gap-1 py-4">
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
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-foreground-secondary hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Auth Buttons */}
          {!isAuthenticated && (
            <div className="mt-auto border-t border-border pt-4 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </Button>
              <Button variant="accent" className="w-full" asChild>
                <Link
                  to={ROUTES.REGISTER}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
