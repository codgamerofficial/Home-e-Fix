import { MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocationStore, formatHeaderLocation } from "@/store/location.store";

export interface LocationSelectorProps {
  onClick?: () => void;
  className?: string;
  isMobileCompact?: boolean;
}

export function LocationSelector({
  onClick,
  className,
  isMobileCompact = false,
}: LocationSelectorProps) {
  const { locality, city } = useLocationStore();
  const headerLoc = formatHeaderLocation({ locality, city });

  // On desktop: prefer full locality name (e.g. "Behala & Thakurpukur" or "Salt Lake, Kolkata")
  // On mobile compact: show first locality token or short name (e.g. "Behala")
  const primaryDisplay = locality || headerLoc.display || "Select location";
  const mobileShort = headerLoc.short || locality?.split(" ")[0] || "Select";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-[42px] px-3 rounded-xl flex items-center gap-1.5 shrink-0 select-none cursor-pointer",
        "bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80",
        "border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100",
        "transition-colors duration-150 group focus:outline-hidden focus:ring-2 focus:ring-[#FF6A00]/25",
        className
      )}
      title={headerLoc.full}
      aria-label={`Select location. Current area: ${headerLoc.full}`}
    >
      <MapPin className="w-3.5 h-3.5 text-[#FF6A00] shrink-0 transition-transform group-hover:scale-110" />
      
      {isMobileCompact ? (
        <span className="text-xs font-semibold truncate max-w-36 text-slate-800 dark:text-slate-100">
          {mobileShort}
        </span>
      ) : (
        <>
          {/* Desktop display */}
          <span className="hidden sm:inline-block text-xs xl:text-[13px] font-semibold truncate max-w-44 md:max-w-48 lg:max-w-56 xl:max-w-64 text-slate-800 dark:text-slate-100">
            {primaryDisplay}
          </span>
          {/* Mobile display */}
          <span className="sm:hidden text-xs font-semibold truncate max-w-36 text-slate-800 dark:text-slate-100">
            {mobileShort}
          </span>
        </>
      )}

      <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 transition-transform duration-150" />
    </button>
  );
}
