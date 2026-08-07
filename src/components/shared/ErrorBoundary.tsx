import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
    
    // Auto reload on stale chunk import failure after new deployment
    if (
      error.message?.includes("Failed to fetch dynamically imported module") ||
      error.message?.includes("Importing a module script failed")
    ) {
      const hasReloaded = sessionStorage.getItem("chunk_reload");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk_reload", "true");
        window.location.reload();
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-100 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-error-light">
            <AlertTriangle className="h-8 w-8 text-error" />
          </div>
          <h2 className="mb-2 font-heading text-xl font-semibold text-primary">
            Something went wrong
          </h2>
          <p className="mb-6 max-w-md text-sm text-foreground-secondary">
            An unexpected error occurred. Please try refreshing the page or
            contact support if the problem persists.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mb-6 max-w-lg overflow-auto rounded-lg bg-muted p-4 text-left text-xs text-error">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh Page
            </Button>
            <Button variant="accent" onClick={this.handleRetry}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
