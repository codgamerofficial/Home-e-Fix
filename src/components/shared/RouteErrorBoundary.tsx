import { useRouteError, useNavigate } from "react-router";
import { AlertTriangle, RotateCcw, Home, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function RouteErrorBoundary() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  const errorMessage =
    error?.message ||
    (typeof error === "string" ? error : "An unexpected error occurred while rendering this section.");

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center space-y-6 border border-border shadow-lg rounded-2xl bg-surface">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-xl font-bold text-primary">
            Unable to Load Page
          </h2>
          <p className="text-xs text-foreground-secondary leading-relaxed max-w-sm mx-auto">
            We encountered a temporary issue while loading this section of Home-e-Fix. Your account and data remain safe.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="accent"
            size="sm"
            onClick={() => window.location.reload()}
            leftIcon={<RotateCcw className="h-4 w-4" />}
            className="font-bold shadow-xs"
          >
            Retry Page
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/app/bookings")}
            leftIcon={<Home className="h-4 w-4" />}
          >
            My Account
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/support")}
            leftIcon={<LifeBuoy className="h-4 w-4" />}
          >
            Contact Support
          </Button>
        </div>

        {import.meta.env.DEV && error && (
          <details className="text-left mt-4 p-3 bg-muted/40 rounded-xl border border-border text-[11px] font-mono text-foreground-secondary">
            <summary className="cursor-pointer font-bold text-error mb-1">
              Developer Diagnostics (Visible in DEV only)
            </summary>
            <div className="mt-2 space-y-1 overflow-x-auto max-h-48 whitespace-pre-wrap">
              <p className="font-bold text-error">{errorMessage}</p>
              {error.stack && <p className="text-[10px] text-foreground-muted">{error.stack}</p>}
            </div>
          </details>
        )}
      </Card>
    </div>
  );
}
