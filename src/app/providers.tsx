import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { GlobalErrorBoundary } from "../components/shared/GlobalErrorBoundary";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * All context providers wrapped in one component.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}
