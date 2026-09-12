import React from "react";
import { AlertTriangle, Settings, ExternalLink } from "lucide-react";
import { INTEGRATION_SERVICES } from "@/lib/integrations/status";
import { Button } from "@/components/ui/button";

interface IntegrationNoticeProps {
  serviceKey: "supabase" | "razorpay" | "maps" | "google_oauth" | "otp";
  compact?: boolean;
  onRetry?: () => void;
}

/**
 * Explicit visual indicator displayed when a required external service is not configured.
 * Adheres to the non-negotiable rule: NEVER simulate fake success when an external dependency is missing.
 */
export const IntegrationNotice: React.FC<IntegrationNoticeProps> = ({
  serviceKey,
  compact = false,
  onRetry,
}) => {
  const service = INTEGRATION_SERVICES[serviceKey];
  if (!service || service.isConfigured) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <span>{service.unconfiguredMessage}</span>
      </div>
    );
  }

  return (
    <div className="p-6 my-4 border border-amber-200 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-900/50 rounded-2xl">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-600 dark:text-amber-400">
          <Settings className="w-6 h-6 animate-spin-slow" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">
              Integration Setup Required: {service.name}
            </h4>
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 dark:bg-amber-900/80 dark:text-amber-300 rounded-full">
              Unconfigured
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {service.unconfiguredMessage}
          </p>

          <div className="mt-3 p-3 bg-white/80 dark:bg-gray-900/80 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Required Environment Variables in <code className="text-orange-600 font-mono">.env</code>:
            </p>
            <ul className="mt-1 space-y-1">
              {service.requiredEnvVars.map((envVar) => (
                <li key={envVar} className="text-xs font-mono text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {envVar}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {service.setupInstructionsUrl && (
              <a
                href={service.setupInstructionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <span>Documentation & Keys</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                Check Again
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
