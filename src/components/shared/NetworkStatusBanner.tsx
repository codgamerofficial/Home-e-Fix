import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Global Network Status banner.
 * Alerts users immediately when internet connectivity drops to prevent phantom actions or unconfirmed submissions.
 */
export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-9999 bg-red-600 text-white px-4 py-3 shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-300"
    >
      <div className="flex items-center gap-3 max-w-5xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2.5">
          <WifiOff className="w-5 h-5 animate-pulse shrink-0" />
          <p className="text-sm font-medium">
            Connection lost. Your action has not been confirmed. Please check your internet connection before retrying.
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white text-red-700 hover:bg-red-50 text-xs shrink-0"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry
        </Button>
      </div>
    </div>
  );
};
