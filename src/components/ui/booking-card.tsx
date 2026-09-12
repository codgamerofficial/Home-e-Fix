import { Link } from "react-router";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronRight,
  Receipt,
  RotateCcw,
  Star,
  ShieldCheck,
  Truck,
  Phone,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface BookingCardProps {
  booking: any;
  onTrack?: (booking: any) => void;
  onCancel?: (booking: any) => void;
  onReschedule?: (booking: any) => void;
  onReview?: (booking: any) => void;
  onInvoice?: (booking: any) => void;
  className?: string;
}

export function BookingCard({
  booking,
  onTrack,
  onCancel,
  onReschedule,
  onReview,
  onInvoice,
  className,
}: BookingCardProps) {
  const bookingNumber = booking.booking_number || booking.bookingNumber || "HEF-2026-000000";
  const status = (booking.status || "CONFIRMED").toUpperCase();
  const serviceName = booking.service_name || booking.serviceName || booking.service?.name || "Home Service";
  const scheduledDate = booking.scheduled_date || booking.scheduledDate || new Date().toISOString();
  const scheduledTime = booking.scheduled_time_slot || booking.scheduledTimeSlot || booking.scheduledSlot?.startTime || "10:00 AM - 11:00 AM";
  const totalAmount = Number(booking.total_amount || booking.totalAmount || booking.total || 0);

  // Address
  const addressText = typeof booking.address === "string"
    ? booking.address
    : booking.address?.street
      ? `${booking.address.street}, ${booking.address.city || "Kolkata"}`
      : booking.address?.fullAddress || "Salt Lake Sector 1, Kolkata";

  // Pro info
  const proName = booking.technician_name || booking.technicianName || booking.technician?.fullName;
  const proPhone = booking.technician_phone || booking.technicianPhone || "+91 98765 43210";

  // Categorize status group
  const isUpcoming = ["CONFIRMED", "MATCHING", "ASSIGNMENT_PENDING", "PENDING_PAYMENT", "PENDING"].includes(status);
  const isActive = ["PROFESSIONAL_ACCEPTED", "PROFESSIONAL_ASSIGNED", "PROFESSIONAL_ON_THE_WAY", "PROFESSIONAL_ARRIVED", "SERVICE_STARTED", "IN_PROGRESS"].includes(status);
  const isCompleted = ["SERVICE_COMPLETED", "CUSTOMER_CONFIRMED", "COMPLETED"].includes(status);
  const isCancelled = ["CANCELLED", "REFUND_PENDING", "REFUNDED"].includes(status);

  return (
    <Card hover className={cn("overflow-hidden border border-border bg-surface", className)}>
      <CardContent className="p-5 space-y-4">
        {/* Top Header: Booking # & Status */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-foreground-muted block tracking-wider">
                Booking Reference
              </span>
              <h4 className="text-sm font-extrabold text-primary font-mono">
                #{bookingNumber}
              </h4>
            </div>
            {booking.is_dev_seed && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-300 bg-amber-50 text-amber-800 font-bold">
                DEV SEED
              </Badge>
            )}
          </div>
          <StatusChip status={status} />
        </div>

        {/* Service Title & Details */}
        <div className="space-y-2">
          <h3 className="font-heading text-base font-bold text-primary line-clamp-1">
            {serviceName}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground-secondary">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="font-medium">{formatDate(scheduledDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>{scheduledTime}</span>
            </div>
            {proName && (
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-accent shrink-0" />
                <span>
                  Pro: <strong className="text-primary font-semibold">{proName}</strong>
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 col-span-full">
              <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="truncate">{addressText}</span>
            </div>
          </div>
        </div>

        {/* Footer: Amount & State-Dependent Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-border/60 gap-3">
          <div>
            <span className="text-[10px] text-foreground-muted block font-semibold uppercase tracking-wider">
              Total Amount
            </span>
            <span className="font-heading text-lg font-extrabold text-accent">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            {/* ACTIVE STATE ACTIONS */}
            {isActive && (
              <>
                {onTrack && (
                  <Button
                    size="sm"
                    variant="accent"
                    leftIcon={<Truck className="h-3.5 w-3.5" />}
                    onClick={() => onTrack(booking)}
                    className="font-bold shadow-xs"
                  >
                    Track Dispatch
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Phone className="h-3.5 w-3.5" />}
                  onClick={() => window.open(`tel:${proPhone}`)}
                >
                  Call Pro
                </Button>
              </>
            )}

            {/* UPCOMING STATE ACTIONS */}
            {isUpcoming && (
              <>
                {onReschedule && (
                  <Button size="sm" variant="outline" onClick={() => onReschedule(booking)}>
                    Reschedule
                  </Button>
                )}
                {onCancel && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50"
                    onClick={() => onCancel(booking)}
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}

            {/* COMPLETED STATE ACTIONS */}
            {isCompleted && (
              <>
                {onInvoice && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Receipt className="h-3.5 w-3.5" />}
                    onClick={() => onInvoice(booking)}
                  >
                    Invoice
                  </Button>
                )}
                {onReview && (
                  <Button
                    size="sm"
                    variant="accent"
                    leftIcon={<Star className="h-3.5 w-3.5 fill-current" />}
                    onClick={() => onReview(booking)}
                    className="font-bold"
                  >
                    Review
                  </Button>
                )}
              </>
            )}

            {/* CANCELLED STATE ACTIONS */}
            {isCancelled && (
              <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                <RotateCcw className="h-3.5 w-3.5" /> Refund to Wallet
              </span>
            )}

            {/* ALWAYS: VIEW DETAILS LINK */}
            <Button
              size="sm"
              variant="ghost"
              asChild
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              <Link to={`/app/bookings/${booking.id || bookingNumber}`}>
                Details
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
