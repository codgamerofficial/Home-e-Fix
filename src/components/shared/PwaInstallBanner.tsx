import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const [guideMsg, setGuideMsg] = useState(false);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      setGuideMsg(true);
      setTimeout(() => setGuideMsg(false), 5000);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-sm rounded-2xl border border-accent/40 bg-slate-900/95 text-white p-4 shadow-2xl backdrop-blur-md space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-heading text-xs font-bold text-white">Install Home-e-Fix App</h4>
            <p className="text-[11px] text-slate-300">1-tap offline booking & real-time dispatch alerts</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowBanner(false)}
          className="text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {guideMsg && (
        <div className="p-2.5 rounded-xl bg-accent/20 border border-accent/40 text-[11px] text-accent font-semibold">
          💡 Tap 'Add to Home Screen' in your browser options menu!
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="accent" size="sm" onClick={handleInstall} className="w-full font-bold text-xs shadow-glow">
          Install App
        </Button>
      </div>
    </div>
  );
}
