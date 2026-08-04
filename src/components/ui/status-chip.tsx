import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/booking.types";
import type { TechnicianStatus } from "@/types/technician.types";

export type ChipType = BookingStatus | TechnicianStatus | "paid" | "unpaid" | "active" | "inactive";

interface StatusConfig {
  label: string;
  className: string;
  dotColor?: string;
}

const statusMap: Record<ChipType, StatusConfig> = {
  // Booking Statuses
  pending: {
    label: "Pending",
    className: "bg-warning-light text-warning border-warning/20",
    dotColor: "bg-warning",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-info-light text-info border-info/20",
    dotColor: "bg-info",
  },
  assigned: {
    label: "Pro Assigned",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-500",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-accent/10 text-accent border-accent/20",
    dotColor: "bg-accent animate-pulse",
  },
  completed: {
    label: "Completed",
    className: "bg-success-light text-success border-success/20",
    dotColor: "bg-success",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-error-light text-error border-error/20",
    dotColor: "bg-error",
  },
  refunded: {
    label: "Refunded",
    className: "bg-muted text-foreground-secondary border-border",
    dotColor: "bg-muted-foreground",
  },

  // Technician Statuses
  available: {
    label: "Available",
    className: "bg-success-light text-success border-success/20",
    dotColor: "bg-success animate-pulse",
  },
  busy: {
    label: "On Job",
    className: "bg-accent/10 text-accent border-accent/20",
    dotColor: "bg-accent",
  },
  offline: {
    label: "Offline",
    className: "bg-muted text-foreground-muted border-border",
    dotColor: "bg-foreground-muted",
  },
  on_leave: {
    label: "On Leave",
    className: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    dotColor: "bg-purple-500",
  },

  // Generic
  paid: {
    label: "Paid",
    className: "bg-success-light text-success border-success/20",
    dotColor: "bg-success",
  },
  unpaid: {
    label: "Unpaid",
    className: "bg-error-light text-error border-error/20",
    dotColor: "bg-error",
  },
  active: {
    label: "Active",
    className: "bg-success-light text-success border-success/20",
    dotColor: "bg-success",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-foreground-muted border-border",
    dotColor: "bg-foreground-muted",
  },
};

export interface StatusChipProps {
  status: ChipType;
  label?: string;
  showDot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function StatusChip({
  status,
  label,
  showDot = true,
  size = "md",
  className,
}: StatusChipProps) {
  const config = statusMap[status] || {
    label: status,
    className: "bg-muted text-foreground-secondary border-border",
    dotColor: "bg-muted-foreground",
  };

  const displayText = label || config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        config.className,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotColor)}
        />
      )}
      {displayText}
    </span>
  );
}
