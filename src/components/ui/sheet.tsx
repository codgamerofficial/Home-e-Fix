import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/* ─── Sheet (Slide-out Panel) ─── */

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
}

const slideVariants = {
  left: {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  },
  right: {
    hidden: { x: "100%" },
    visible: { x: 0 },
  },
  top: {
    hidden: { y: "-100%" },
    visible: { y: 0 },
  },
  bottom: {
    hidden: { y: "100%" },
    visible: { y: 0 },
  },
};

const positionClasses = {
  left: "inset-y-0 left-0 h-full w-[85vw] max-w-sm border-r",
  right: "inset-y-0 right-0 h-full w-[85vw] max-w-sm border-l",
  top: "inset-x-0 top-0 w-full border-b",
  bottom: "inset-x-0 bottom-0 w-full border-t",
};

function Sheet({
  open,
  onClose,
  children,
  side = "left",
  className,
}: SheetProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-(--z-modal)">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={slideVariants[side]}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "absolute bg-surface text-foreground shadow-2xl flex flex-col",
              positionClasses[side],
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── SheetHeader ─── */

function SheetHeader({
  className,
  onClose,
  children,
}: {
  className?: string;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border p-4",
        className
      )}
    >
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-foreground-secondary hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

/* ─── SheetContent ─── */

function SheetContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex-1 overflow-y-auto p-4", className)}>
      {children}
    </div>
  );
}

export { Sheet, SheetHeader, SheetContent };
