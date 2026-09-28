import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearch } from "@/context/SearchContext";

export interface SearchButtonProps {
  className?: string;
  variant?: "full" | "icon" | "responsive";
  onClick?: () => void;
}

export function SearchButton({
  className,
  variant = "responsive",
  onClick,
}: SearchButtonProps) {
  const { openSearch } = useSearch();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      openSearch();
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "h-[42px] w-[42px] rounded-xl flex items-center justify-center shrink-0 cursor-pointer select-none",
          "bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80",
          "border border-slate-200/90 dark:border-slate-700/80 text-slate-600 dark:text-slate-300",
          "hover:text-[#FF6A00] hover:border-[#FF6A00]/50 transition-all duration-150",
          "focus:outline-hidden focus:ring-2 focus:ring-[#FF6A00]/25",
          className
        )}
        aria-label="Search services"
        title="Search services (⌘K)"
      >
        <Search className="w-4.5 h-4.5" />
      </button>
    );
  }

  return (
    <>
      {/* Icon only on tablet / small screens when responsive */}
      {variant === "responsive" && (
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "lg:hidden h-[42px] w-[42px] rounded-xl flex items-center justify-center shrink-0 cursor-pointer select-none",
            "bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80",
            "border border-slate-200/90 dark:border-slate-700/80 text-slate-600 dark:text-slate-300",
            "hover:text-[#FF6A00] hover:border-[#FF6A00]/50 transition-all duration-150",
            "focus:outline-hidden focus:ring-2 focus:ring-[#FF6A00]/25",
            className
          )}
          aria-label="Search services"
          title="Search services (⌘K)"
        >
          <Search className="w-4.5 h-4.5" />
        </button>
      )}

      {/* Desktop Search Bar (230px–260px, 42px height) */}
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "h-[42px] rounded-xl flex items-center justify-between gap-2 px-3 shrink-0 cursor-pointer select-none group text-left",
          "bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800",
          "border border-slate-200/90 dark:border-slate-700/80 hover:border-[#FF6A00]/60",
          "focus:outline-hidden focus:ring-2 focus:ring-[#FF6A00]/20 focus:border-[#FF6A00]",
          "transition-all duration-150",
          variant === "responsive"
            ? "hidden lg:flex w-48 xl:w-[250px]"
            : "w-[245px]",
          className
        )}
        aria-label="Search services, e.g. AC repair..."
        title="Search services (⌘K)"
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-[#FF6A00] shrink-0 transition-colors" />
          <span className="text-xs xl:text-[13px] font-normal text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 truncate">
            Search services, e.g. AC repair...
          </span>
        </div>
        <kbd className="hidden xl:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 shrink-0 select-none shadow-2xs">
          ⌘K
        </kbd>
      </button>
    </>
  );
}
