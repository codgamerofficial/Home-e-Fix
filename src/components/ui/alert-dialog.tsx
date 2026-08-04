import React from "react";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type AlertType = "info" | "success" | "warning" | "error";

export interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: AlertType;
  actionLabel?: string;
  onAction?: () => void;
}

const alertConfig: Record<
  AlertType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  info: { icon: Info, color: "text-info", bg: "bg-info-light" },
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success-light" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning-light" },
  error: { icon: XCircle, color: "text-error", bg: "bg-error-light" },
};

export function AlertDialog({
  open,
  onClose,
  title,
  description,
  type = "info",
  actionLabel = "Understand",
  onAction,
}: AlertDialogProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  const handleAction = () => {
    onAction?.();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg}`}
          >
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          <DialogTitle>{title}</DialogTitle>
        </div>
      </DialogHeader>

      {description && (
        <DialogContent className="pt-2 pb-4">
          <p className="text-sm text-foreground-secondary leading-relaxed">
            {description}
          </p>
        </DialogContent>
      )}

      <DialogFooter>
        <Button variant="accent" onClick={handleAction}>
          {actionLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
