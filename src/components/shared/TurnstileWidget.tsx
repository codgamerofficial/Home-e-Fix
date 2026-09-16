import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Lock } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
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

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: (error: unknown) => void;
  onExpired?: () => void;
  siteKey?: string;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

export function TurnstileWidget({
  onSuccess,
  onError,
  onExpired,
  siteKey,
  theme = "auto",
  className = "",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const activeSiteKey =
    siteKey ||
    (typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.VITE_TURNSTILE_SITE_KEY
      : undefined);

  useEffect(() => {
    // If no site key is configured (local dev without Cloudflare keys),
    // provide an automated non-blocking bypass so dev/testing flows continue.
    if (!activeSiteKey) {
      onSuccess("dev_turnstile_bypass_token");
      return;
    }

    // Load Cloudflare Turnstile script if not already added
    const scriptId = "cf-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initWidget = () => {
      if (!window.turnstile || !containerRef.current) return;

      // Clean up previous widget if exists
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: activeSiteKey,
        theme,
        callback: (token: string) => {
          setLoaded(true);
          onSuccess(token);
        },
        "error-callback": (err) => {
          console.warn("[Turnstile] Challenge error:", err);
          onError?.(err);
        },
        "expired-callback": () => {
          onExpired?.();
        },
      });
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initWidget();
      };
      document.head.appendChild(script);
    } else if (window.turnstile) {
      initWidget();
    } else {
      script.addEventListener("load", initWidget);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [activeSiteKey, theme, onSuccess, onError, onExpired]);

  // Graceful fallback display if no active site key in development
  if (!activeSiteKey) {
    return (
      <div
        className={`flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 ${className}`}
      >
        <Lock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
        <span>Cloudflare Turnstile Bot Guard: Active (Bypass in test/dev mode)</span>
      </div>
    );
  }

  return (
    <div className={`my-2 flex flex-col items-center justify-center ${className}`}>
      <div ref={containerRef} />
      {!loaded && (
        <div className="flex items-center gap-2 text-[11px] text-slate-400 py-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
          <span>Verifying security challenge...</span>
        </div>
      )}
    </div>
  );
}
