import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * All context providers wrapped in one component.
 * Add new providers here (e.g., ThemeProvider, AuthProvider).
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
