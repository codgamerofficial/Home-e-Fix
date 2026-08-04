import { Outlet, useLocation } from "react-router";
import { Navbar, MobileBottomNav, Footer } from "./components";
import { NotificationToast } from "@/components/shared/NotificationToast";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

/**
 * Root layout — wraps all public pages with Navbar + Footer.
 */
export function RootLayout() {
  const location = useLocation();

  // Don't show footer/mobile nav on dashboard routes
  const isDashboard =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/technician") ||
    location.pathname.startsWith("/admin");

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <main className="flex-1 pb-(--bottom-nav-height) md:pb-0">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {!isDashboard && <Footer />}

      <MobileBottomNav />
      <NotificationToast />
    </div>
  );
}
