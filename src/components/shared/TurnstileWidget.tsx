import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          action?: string;
          cdata?: string;
          callback?: (token: string) => void;
          "error-callback"?: (error: unknown) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export type TurnstileStatus =
  | "idle"
  | "loading"
  | "verified"
  | "error"
  | "expired";

export interface TurnstileWidgetHandle {
  reset: () => void;
  remove: () => void;
  getStatus: () => TurnstileStatus;
  getWidgetId: () => string | null;
}

export interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: (error: unknown) => void;
  onExpired?: () => void;
  onStatusChange?: (status: TurnstileStatus) => void;
  action?: string;
  siteKey?: string;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  TurnstileWidgetProps
>(function TurnstileWidget(
  {
    onSuccess,
    onError,
    onExpired,
    onStatusChange,
    action = "professional_otp",
    siteKey,
    theme = "auto",
    className = "",
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const statusRef = useRef<TurnstileStatus>("loading");
  const [status, setStatus] = useState<TurnstileStatus>("loading");

  // Synchronously stabilize parent callback references to eliminate unnecessary widget re-renders
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onExpiredRef = useRef(onExpired);
  const onStatusChangeRef = useRef(onStatusChange);

  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  onExpiredRef.current = onExpired;
  onStatusChangeRef.current = onStatusChange;

  const updateStatus = (nextStatus: TurnstileStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
    onStatusChangeRef.current?.(nextStatus);
  };

  const activeSiteKey =
    siteKey ||
    (typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.VITE_TURNSTILE_SITE_KEY
      : undefined);

  const isProduction =
    typeof import.meta !== "undefined" && Boolean(import.meta.env?.PROD);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
      updateStatus("idle");
    },
    remove: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
      updateStatus("idle");
    },
    getStatus: () => statusRef.current,
    getWidgetId: () => widgetIdRef.current,
  }));

  const handleRetry = () => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        // ignore
      }
    }
    updateStatus("idle");
  };

  useEffect(() => {
    // 1. In production, real Turnstile is strictly mandatory. Never permit bypass.
    if (!activeSiteKey) {
      if (isProduction) {
        console.error(
          "[Turnstile] Critical: VITE_TURNSTILE_SITE_KEY is missing in production."
        );
        updateStatus("error");
        return;
      }
      // Local development test fallback
      updateStatus("verified");
      onSuccessRef.current("dev_turnstile_bypass_token");
      return;
    }

    // 2. Load Cloudflare Turnstile script once if not already present
    const scriptId = "cf-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return;

      // Prevent duplicate widget initialization
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }

      try {
        updateStatus("loading");
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: activeSiteKey,
          action,
          theme,
          size: "normal",
          callback: (token: string) => {
            // Never log token contents. Stored in memory only.
            updateStatus("verified");
            onSuccessRef.current(token);
          },
          "error-callback": (err: unknown) => {
            updateStatus("error");
            onErrorRef.current?.(err);
          },
          "expired-callback": () => {
            updateStatus("expired");
            onExpiredRef.current?.();
          },
        });
        updateStatus("idle");
      } catch (renderErr) {
        console.warn("[Turnstile] Widget render failure:", renderErr);
        updateStatus("error");
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        renderWidget();
      };
      script.onerror = () => {
        updateStatus("error");
      };
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    } else {
      script.addEventListener("load", renderWidget);
    }

    return () => {
      if (script) {
        script.removeEventListener("load", renderWidget);
      }
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [activeSiteKey, action, theme, isProduction]);

  // Graceful development mode fallback notice when no site key is configured
  if (!activeSiteKey && !isProduction) {
    return (
      <div
        className={`flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 ${className}`}
      >
        <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Cloudflare Turnstile Bot Guard: Active (Development test bypass)</span>
      </div>
    );
  }

  return (
    <div
      className={`my-3 flex flex-col items-center justify-center w-full max-w-sm mx-auto ${className}`}
    >
      {/* Turnstile Container - Explicit natural widget width (300px), centered */}
      <div
        ref={containerRef}
        className={status === "verified" ? "hidden" : "flex justify-center min-h-16.25"}
      />

      {/* Loading state indicator */}
      {status === "loading" && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-1.5 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF6A00]" />
          <span>Verifying security challenge...</span>
        </div>
      )}

      {/* Verified state - Compact, premium success banner */}
      {status === "verified" && (
        <div className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-xs transition-all animate-in fade-in zoom-in-95 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Security check complete</span>
        </div>
      )}

      {/* Error state with retry action */}
      {status === "error" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 w-full p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Security verification failed. Please try again.</span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Try Again
          </button>
        </div>
      )}

      {/* Expired state with refresh action */}
      {status === "expired" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 w-full p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Verification challenge expired. Please verify again.</span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh Challenge
          </button>
        </div>
      )}
    </div>
  );
});
