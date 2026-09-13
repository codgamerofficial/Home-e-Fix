import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useLocation } from "react-router";
import { useUIStore } from "@/store/ui.store";

export interface SearchContextValue {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  searchTriggerRef: React.RefObject<HTMLElement | null>;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

/**
 * Authoritative Global Search Provider for Home-e-Fix
 *
 * Implements:
 * - Single source of truth for global search overlay state
 * - Synchronized with Zustand UI store for backwards-compatibility
 * - Global Ctrl+K / Cmd+K toggle handler
 * - Global Escape key capture listener
 * - Automatic route-change closing safety
 * - Body scroll lock management with safe cleanup
 * - Focus preservation and restoration
 */
export function SearchProvider({ children }: SearchProviderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const searchTriggerRef = useRef<HTMLElement | null>(null);
  const setStoreSearchOpen = useUIStore((s) => s.setSearchOpen);

  const openSearch = useCallback(() => {
    // Record current active element to restore focus when closing
    if (document.activeElement instanceof HTMLElement) {
      searchTriggerRef.current = document.activeElement;
    }
    setIsSearchOpen(true);
    setStoreSearchOpen(true);
  }, [setStoreSearchOpen]);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setStoreSearchOpen(false);

    // Restore focus to previously active element
    if (searchTriggerRef.current && typeof searchTriggerRef.current.focus === "function") {
      try {
        searchTriggerRef.current.focus();
      } catch (err) {
        // Element might be unmounted
      }
    }
  }, [setStoreSearchOpen]);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => {
      const next = !prev;
      setStoreSearchOpen(next);
      if (!next && searchTriggerRef.current) {
        searchTriggerRef.current.focus?.();
      } else if (next && document.activeElement instanceof HTMLElement) {
        searchTriggerRef.current = document.activeElement;
      }
      return next;
    });
  }, [setStoreSearchOpen]);

  // Sync state from UI store if changed externally
  const storeSearchOpen = useUIStore((s) => s.searchOpen);
  useEffect(() => {
    if (storeSearchOpen !== isSearchOpen) {
      setIsSearchOpen(storeSearchOpen);
    }
  }, [storeSearchOpen, isSearchOpen]);

  // 1. ROUTE CHANGE SAFETY: Automatically close modal when route changes
  useEffect(() => {
    if (isSearchOpen) {
      closeSearch();
    }
  }, [location.pathname, closeSearch]);

  // 2. KEYBOARD SHORTCUT: Ctrl+K / Cmd+K to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        e.stopPropagation();
        toggleSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSearch]);

  // 3. RELIABLE GLOBAL ESCAPE KEY HANDLER
  useEffect(() => {
    if (!isSearchOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeSearch();
      }
    };

    // Use capture phase (true) so Escape closes modal before any child swallows it
    window.addEventListener("keydown", handleEscape, true);
    return () => window.removeEventListener("keydown", handleEscape, true);
  }, [isSearchOpen, closeSearch]);

  // 4. BODY SCROLL LOCK: Prevent page scrolling behind the active modal
  useEffect(() => {
    if (!isSearchOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [isSearchOpen]);

  return (
    <SearchContext.Provider
      value={{
        isSearchOpen,
        openSearch,
        closeSearch,
        toggleSearch,
        searchTriggerRef,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

/**
 * Access the authoritative global search context.
 */
export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
