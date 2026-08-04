import { useState, useEffect } from "react";

/**
 * Custom hook that returns true when the given media query matches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/* ─── Convenience hooks ─── */

/** True when viewport >= 640px */
export function useIsSm() {
  return useMediaQuery("(min-width: 640px)");
}

/** True when viewport >= 768px */
export function useIsMd() {
  return useMediaQuery("(min-width: 768px)");
}

/** True when viewport >= 1024px */
export function useIsLg() {
  return useMediaQuery("(min-width: 1024px)");
}

/** True when viewport >= 1280px */
export function useIsXl() {
  return useMediaQuery("(min-width: 1280px)");
}

/** True on mobile (< 768px) */
export function useIsMobile() {
  return !useMediaQuery("(min-width: 768px)");
}
