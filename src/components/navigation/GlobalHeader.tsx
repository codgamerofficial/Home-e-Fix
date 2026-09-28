import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Sun, Moon, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { useUIStore } from "@/store/ui.store";
import { MobileLocationSheet } from "@/components/shared/MobileLocationSheet";
import { LocationSelector } from "./LocationSelector";
import { DesktopNavigation } from "./DesktopNavigation";
import { SearchButton } from "./SearchButton";
import { NotificationButton } from "./NotificationButton";
import { ProfileMenu } from "./ProfileMenu";
import { MobileNavigation } from "./MobileNavigation";

export function GlobalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { theme, toggleTheme } = useUIStore();

  // Scroll detection for subtle shadow elevation transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-200 md:h-[74px] flex flex-col justify-center",
          isScrolled
            ? "bg-white/95 dark:bg-[#07172E]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 shadow-xs shadow-slate-900/5"
            : "bg-white/90 dark:bg-[#07172E]/90 backdrop-blur-sm border-b border-slate-200/70 dark:border-slate-800/70"
        )}
      >
        {/* ─── DESKTOP & TABLET SINGLE-LINE HEADER (>= 768px, md:flex) ─── */}
        <div className="hidden md:flex h-[74px] w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 items-center justify-between gap-3 lg:gap-4">
          {/* LEFT: Logo + Location Selector */}
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            <Logo size="header" textColor="auto" hideTaglineBelow="xl" />
            <LocationSelector
              onClick={() => setLocationSheetOpen(true)}
              className="hidden sm:flex"
            />
          </div>

          {/* CENTER: Services | How It Works | More ▾ */}
          <div className="flex items-center justify-center shrink-0">
            <DesktopNavigation />
          </div>

          {/* RIGHT: Search | Theme toggle | Notifications | Profile */}
          <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
            {/* Search: responsive full bar on >= 1200px, icon button on tablet */}
            <SearchButton variant="responsive" />

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={cn(
                "h-[42px] w-[42px] rounded-xl flex items-center justify-center shrink-0 cursor-pointer select-none",
                "bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80",
                "border border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-200",
                "hover:text-[#FF6A00] dark:hover:text-[#FF6A00] transition-colors duration-150",
                "focus:outline-hidden focus:ring-2 focus:ring-[#FF6A00]/25"
              )}
              aria-label="Toggle theme"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-600" />
              )}
            </button>

            {/* Notification Popover Button */}
            <NotificationButton />

            {/* Role-Based Profile Menu */}
            <ProfileMenu />
          </div>
        </div>

        {/* ─── MOBILE COMPACT HEADER (< 768px, md:hidden) ─── */}
        <div className="md:hidden px-4 pt-2.5 pb-2.5 space-y-2">
          {/* Row 1: Logo | Search icon | Theme | Notifications | Profile / Hamburger */}
          <div className="flex items-center justify-between gap-2">
            <Logo size="sm" textColor="auto" hideTaglineBelow="always" />

            <div className="flex items-center gap-1.5">
              {/* Search icon */}
              <SearchButton variant="icon" className="h-[38px] w-[38px]" />

              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="h-[38px] w-[38px] rounded-xl flex items-center justify-center shrink-0 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 text-slate-600 dark:text-slate-300"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {/* Notification icon */}
              <NotificationButton className="h-[38px] w-[38px]" />

              {/* Profile Menu / Quick Avatar */}
              <ProfileMenu className="h-[38px]" />

              {/* Mobile Drawer Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="h-[38px] w-[38px] rounded-xl flex items-center justify-center shrink-0 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-[#FF6A00] transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Row 2: Location selector pill */}
          <div>
            <LocationSelector
              onClick={() => setLocationSheetOpen(true)}
              isMobileCompact={false}
              className="h-[38px] w-full justify-between"
            />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Sheet */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenLocation={() => setLocationSheetOpen(true)}
      />

      {/* Global Location Selection Modal / Sheet */}
      <MobileLocationSheet
        isOpen={locationSheetOpen}
        onClose={() => setLocationSheetOpen(false)}
      />
    </>
  );
}
