import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Phone,
  ShieldCheck,
  Download,
  ArrowRight,
  Home,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TechnicianCard } from "@/components/ui/technician-card";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/lib/utils";
import { dbRepository } from "@/services/db/repository";

export default function BookingConfirmed() {
  const { bookingId = "" } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<any>(() => {
    return bookingId
      ? dbRepository.getBookingById(bookingId) || dbRepository.getBookingByReference(bookingId)
      : null;
  });

  useEffect(() => {
    if (bookingId) {
      const b = dbRepository.getBookingById(bookingId) || dbRepository.getBookingByReference(bookingId);
      if (b) setBooking(b);
    }
  }, [bookingId]);

  const assignedTech: any = booking?.technician_name
    ? {
        id: booking.technician_id || "tech-live",
        displayName: booking.technician_name,
        avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&q=80",
        status: "available",
        experience: 5,
        rating: 4.8,
        completedJobs: 120,
        phone: booking.technician_phone || "+91 98300 00000",
        specializations: [booking.service_name || "Home Service"],
        verificationStatus: "verified",
      }
    : null;

  const displayAddress = booking?.address
    ? typeof booking.address === "string"
      ? booking.address
      : `${booking.address.streetAddress || booking.address.street || booking.address.address_line_1 || ""}, ${booking.address.city || "Kolkata"} - ${booking.address.pincode || "700064"}`
    : "Service Location, Kolkata";

  return (
    <div className="min-h-screen bg-background py-12 sm:py-16">
      <div className="container-app max-w-3xl space-y-8">
        {/* CELEBRATION BADGE & HEADER */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-lg">
            <CheckCircle className="h-12 w-12" />
          </div>

          <div>
            <Badge variant="accent" className="mb-2 px-3 py-1 text-xs">
              🎉 Order Successfully Placed
            </Badge>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary">
              Booking Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
              Booking Reference ID: <span className="font-mono font-bold text-accent">{booking?.booking_number || bookingId || "HEF-ORDER"}</span>
            </p>
          </div>
        </motion.div>

        {/* BOOKING DETAILS CARD */}
        <Card className="p-6 sm:p-8 border border-border/80 shadow-lg space-y-6">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent animate-pulse" />
              <div>
                <div className="text-xs font-bold text-primary">Scheduled Arrival</div>
                <div className="text-[11px] text-foreground-secondary">
                  {booking?.scheduled_date || "Today"} • {booking?.scheduled_time_slot || "Within 60-90 Mins"}
                </div>
              </div>
            </div>

            <Badge variant="secondary" className="text-xs font-bold text-emerald-600 bg-emerald-50">
              {booking?.status || "Confirmed & Dispatched"}
            </Badge>
          </div>

          {/* Assigned Technician Card */}
          {assignedTech && (
            <div className="space-y-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-accent" /> Assigned Verified Professional
              </h4>
              <TechnicianCard
                technician={assignedTech}
                onCall={(tech: any) => window.open(`tel:${tech?.phone || "+919830000000"}`)}
              />
            </div>
          )}

          {/* Service Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-foreground-secondary flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-accent" /> Service Location
              </div>
              <p className="text-xs text-primary font-medium">
                {displayAddress}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-foreground-secondary flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Service Warranty
              </div>
              <p className="text-xs text-primary font-medium">
                30-Day Re-work Guarantee Covered
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center gap-3">
            <Button
              variant="accent"
              size="lg"
              className="w-full sm:w-auto font-bold flex-1"
              asChild
            >
              <Link to={ROUTES.HOME}>
                <Home className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto flex-1"
              onClick={() => window.print()}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Download PDF Invoice
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
