import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertOctagon, RefreshCw, Home, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/observability/logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

/**
 * Top-level application error boundary.
 * Catches runtime crashes cleanly, logs telemetry without sensitive data, and provides recovery routes.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorId = `HEF-ERR-${Date.now().toString(36).toUpperCase()}`;
    return { hasError: true, error, errorId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("GlobalErrorBoundary caught unhandled error", error, {
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-2xl mx-auto flex items-center justify-center mb-5">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              An unexpected system error occurred. We have logged this occurrence and our engineering team is reviewing it.
            </p>

            {this.state.errorId && (
              <div className="mt-4 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono text-gray-500 dark:text-gray-400">
                Incident Reference: <span className="font-semibold text-gray-700 dark:text-gray-300">{this.state.errorId}</span>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" onClick={this.handleReload}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              <Button variant="outline" className="flex-1" onClick={this.handleGoHome}>
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <a
                href="/support"
                className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <LifeBuoy className="w-3.5 h-3.5 mr-1.5" />
                Contact Home-e-Fix 24/7 Support Desk
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
