import { Outlet, useLocation, Link, useNavigate } from "react-router";
import { Bell, ArrowLeft, LogOut, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./components/Sidebar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { TechMobileBottomNav } from "./components/TechMobileBottomNav";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { useNotificationStore } from "@/store/notification.store";
import { ROUTES } from "@/constants/routes";
import type { NavLink } from "@/constants/navigation";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { RouteErrorBoundary } from "@/components/shared/RouteErrorBoundary";
import { NotificationToast } from "@/components/shared/NotificationToast";
import { PwaInstallBanner } from "@/components/shared/PwaInstallBanner";

interface DashboardLayoutProps {
  links: NavLink[];
  title?: string;
}

/**
 * Mobile-First Dashboard Layout.
 * - Desktop: Collapsible sidebar + spacious container.
 * - Mobile: Dedicated top mobile app bar + persistent role-aware bottom navigation.
 */
export function DashboardLayout({ links, title }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, theme, toggleTheme } = useUIStore();
  const { logout, user } = useAuthStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const isCustomer = location.pathname.startsWith("/app") || location.pathname.startsWith("/dashboard");
  const isProfessional = location.pathname.startsWith("/professional") || location.pathname.startsWith("/technician");
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* ─── Dedicated Mobile Top Bar (< md) ─── */}
      <header className="sticky top-0 z-(--z-sticky) flex md:hidden h-14 items-center justify-between border-b border-border bg-white/95 dark:bg-[#071525]/95 px-4 backdrop-blur-md shadow-xs pt-safe">
        <div className="flex items-center gap-3">
          <Logo size="sm" textColor="auto" />
          <span className="h-4 w-px bg-border" />
          <span className="text-xs font-bold text-foreground-secondary truncate max-w-32">
            {title || (isProfessional ? "Partner Portal" : isAdmin ? "Admin Center" : "My Account")}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-foreground-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Notifications link */}
          <Link
            to={isProfessional ? ROUTES.PROFESSIONAL_SUPPORT : ROUTES.APP_NOTIFICATIONS}
            className="relative p-1.5 text-foreground-muted hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute 0 top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6A00] px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Logout shortcut */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              logout();
              navigate(ROUTES.HOME);
            }}
            className="h-8 w-8 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* ─── Main Body Container ─── */}
      <div className="flex flex-1">
        {/* Desktop Sidebar (hidden on mobile) */}
        <Sidebar links={links} title={title} />

        {/* Main Content Area */}
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-smooth w-full",
            // Push content right when sidebar is visible on desktop
            "md:ml-(--sidebar-width)",
            sidebarCollapsed && "md:ml-(--sidebar-collapsed-width)",
            // Add padding bottom for mobile bottom navigation so content is never covered
            "pb-24 md:pb-8"
          )}
        >
          <div className="container-app py-4 sm:py-6 lg:py-8">
            <ErrorBoundary fallback={<RouteErrorBoundary />}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* ─── Role-Aware Mobile Bottom Navigation (< md) ─── */}
      {isCustomer && <MobileBottomNav />}
      {isProfessional && <TechMobileBottomNav />}

      <PwaInstallBanner />
      <NotificationToast />
    </div>
  );
}
