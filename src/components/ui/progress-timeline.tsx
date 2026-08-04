import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status: "completed" | "current" | "upcoming";
}

export interface ProgressTimelineProps {
  steps: TimelineStep[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function ProgressTimeline({
  steps,
  orientation = "horizontal",
  className,
}: ProgressTimelineProps) {
  if (orientation === "vertical") {
    return (
      <div className={cn("space-y-6 relative pl-6", className)}>
        {/* Continuous Line */}
        <div className="absolute left-2.75 top-2 bottom-2 w-0.5 bg-border -z-10" />

        {steps.map((step, index) => {
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";

          return (
            <div key={step.id} className="relative flex items-start gap-4">
              {/* Step Marker */}
              <div
                className={cn(
                  "absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-all duration-200",
                  isCompleted
                    ? "border-success bg-success text-white shadow-xs"
                    : isCurrent
                    ? "border-accent bg-accent text-white ring-4 ring-accent/20 animate-pulse"
                    : "border-border bg-surface text-foreground-muted"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isCurrent ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4
                    className={cn(
                      "font-heading text-sm font-semibold",
                      isCompleted || isCurrent
                        ? "text-primary"
                        : "text-foreground-muted"
                    )}
                  >
                    {step.title}
                  </h4>
                  {step.timestamp && (
                    <span className="text-xs text-foreground-muted">
                      • {step.timestamp}
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal Stepper
  return (
    <div className={cn("w-full py-2", className)}>
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Bar */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-border -z-10" />

        {steps.map((step, index) => {
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";

          return (
            <div
              key={step.id}
              className="flex flex-col items-center text-center space-y-2 flex-1"
            >
              {/* Step Icon Container */}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-200",
                  isCompleted
                    ? "border-success bg-success text-white shadow-xs"
                    : isCurrent
                    ? "border-accent bg-accent text-white ring-4 ring-accent/20"
                    : "border-border bg-surface text-foreground-muted"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Title */}
              <div className="space-y-0.5">
                <p
                  className={cn(
                    "text-xs font-medium max-w-22.5 mx-auto truncate",
                    isCompleted || isCurrent
                      ? "text-primary font-semibold"
                      : "text-foreground-muted"
                  )}
                >
                  {step.title}
                </p>
                {step.timestamp && (
                  <p className="text-[10px] text-foreground-muted">
                    {step.timestamp}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
