import { Calendar, Clock, MapPin, User, ChevronRight } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types/booking.types";

export interface BookingCardProps {
  booking: Partial<Booking>;
  onTrack?: (booking: Partial<Booking>) => void;
  onCancel?: (booking: Partial<Booking>) => void;
  onReschedule?: (booking: Partial<Booking>) => void;
  onViewDetails?: (booking: Partial<Booking>) => void;
  className?: string;
}

export function BookingCard({
  booking,
  onTrack,
  onCancel,
  onReschedule,
  onViewDetails,
  className,
}: BookingCardProps) {
  const {
    bookingNumber = "HEF-89234",
    status = "confirmed",
    scheduledDate = new Date().toISOString(),
    scheduledSlot = { startTime: "10:00 AM", endTime: "11:00 AM", id: "1", isAvailable: true },
    service = { name: "AC Deep Cleaning & Servicing" },
    technician = { fullName: "Rajesh Kumar" },
    address = { fullAddress: "Flat 402, Sunshine Apartments, Hitech City, Hyderabad" },
    total = 899,
  } = booking;

  return (
    <Card hover className={cn("overflow-hidden border border-border", className)}>
      <CardContent className="p-5 space-y-4">
        {/* Top Header: Booking # & Status */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <span className="text-xs text-foreground-muted">Booking Ref</span>
            <h4 className="font-heading text-sm font-semibold text-primary">
              #{bookingNumber}
            </h4>
          </div>
          <StatusChip status={status} />
        </div>

        {/* Service Title & Details */}
        <div className="space-y-2">
          <h3 className="font-heading text-base font-semibold text-primary line-clamp-1">
            {service.name}
          </h3>

          <div className="grid grid-cols-1 gap-2 text-xs text-foreground-secondary sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-accent" />
              <span>{formatDate(scheduledDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-accent" />
              <span>{scheduledSlot.startTime}</span>
            </div>
            {technician?.fullName && (
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-accent" />
                <span>Pro: {technician.fullName}</span>
              </div>
            )}
            <div className="flex items-center gap-2 col-span-full">
              <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="truncate">{address.fullAddress}</span>
            </div>
          </div>
        </div>

        {/* Footer: Amount & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <div>
            <span className="text-[11px] text-foreground-muted block font-medium">Total Amount</span>
            <span className="font-heading text-lg font-extrabold text-accent">
              {formatCurrency(total)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(status === "assigned" || status === "in_progress") && onTrack && (
              <Button size="sm" variant="accent" onClick={() => onTrack(booking)}>
                Track Pro
              </Button>
            )}

            {(status === "pending" || status === "confirmed") && (
              <>
                {onReschedule && (
                  <Button size="sm" variant="outline" onClick={() => onReschedule(booking)}>
                    Reschedule
                  </Button>
                )}
                {onCancel && (
                  <Button size="sm" variant="ghost" className="text-error hover:bg-error-light" onClick={() => onCancel(booking)}>
                    Cancel
                  </Button>
                )}
              </>
            )}

            {onViewDetails && (
              <Button
                size="sm"
                variant="ghost"
                rightIcon={<ChevronRight className="h-4 w-4" />}
                onClick={() => onViewDetails(booking)}
              >
                Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
