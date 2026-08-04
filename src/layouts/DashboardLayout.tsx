import { Outlet } from "react-router";
import { cn } from "@/lib/utils";
import { Sidebar } from "./components/Sidebar";
import { useUIStore } from "@/store/ui.store";
import type { NavLink } from "@/constants/navigation";

interface DashboardLayoutProps {
  links: NavLink[];
  title?: string;
}

/**
 * Dashboard layout — sidebar + main content area.
 * Used by customer, technician, and admin dashboards.
 */
export function DashboardLayout({ links, title }: DashboardLayoutProps) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex min-h-[calc(100dvh-var(--navbar-height))]">
      <Sidebar links={links} title={title} />

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300 ease-smooth",
          // Push content right when sidebar is visible (desktop only)
          "md:ml-(--sidebar-width)",
          sidebarCollapsed && "md:ml-(--sidebar-collapsed-width)"
        )}
      >
        <div className="container-app py-6 lg:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
