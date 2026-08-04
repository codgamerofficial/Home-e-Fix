import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/store/ui.store";
import type { NavLink } from "@/constants/navigation";

interface SidebarProps {
  links: NavLink[];
  title?: string;
}

export function Sidebar({ links, title }: SidebarProps) {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-(--navbar-height) bottom-0 z-(--z-fixed)",
        "hidden md:flex flex-col",
        "border-r border-border bg-surface",
        "transition-all duration-300 ease-smooth",
        sidebarCollapsed
          ? "w-(--sidebar-collapsed-width)"
          : "w-(--sidebar-width)"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center border-b border-border p-4",
          sidebarCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider"
          >
            {title || "Menu"}
          </motion.span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebarCollapsed}
          className="h-8 w-8 text-foreground-muted"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            location.pathname === link.href ||
            (link.href !== "/" && location.pathname.startsWith(link.href));

          const navItem = (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5",
                "transition-all duration-200",
                sidebarCollapsed && "justify-center px-2",
                isActive
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-foreground-secondary hover:bg-muted hover:text-foreground"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-accent")} />

              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate text-sm"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Badge */}
              {link.badge && !sidebarCollapsed && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
                  {link.badge}
                </span>
              )}
            </Link>
          );

          // Wrap in tooltip when collapsed
          if (sidebarCollapsed) {
            return (
              <Tooltip key={link.href} content={link.label} side="right">
                {navItem}
              </Tooltip>
            );
          }

          return <div key={link.href}>{navItem}</div>;
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        {sidebarCollapsed ? (
          <Logo size="sm" variant="icon" />
        ) : (
          <Logo size="sm" />
        )}
      </div>
    </aside>
  );
}
