import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, MessageSquare, ShieldCheck, Clock, X, Navigation, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface LiveTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingRef?: string;
  serviceName?: string;
  technicianName?: string;
  technicianPhone?: string;
}

export function LiveTrackingModal({
  isOpen,
  onClose,
  bookingRef = "HEF-894102",
  serviceName = "AC Deep Cleaning & Servicing",
  technicianName = "Suresh Reddy",
  technicianPhone = "+91 98300 12345",
}: LiveTrackingModalProps) {
  const [etaSeconds, setEtaSeconds] = useState(740); // 12 mins 20 secs

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setEtaSeconds((prev) => (prev > 10 ? prev - 1 : 10));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const mins = Math.floor(etaSeconds / 60);
  const secs = etaSeconds % 60;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#07172E] border border-white/20 text-white shadow-2xl space-y-0"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-heading text-sm font-bold text-white">Live GPS Dispatch Tracker</span>
              <Badge variant="accent" className="text-[10px]"># {bookingRef}</Badge>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Animated Map Graphic Preview */}
          <div className="relative h-48 w-full bg-[#0a1b36] overflow-hidden flex items-center justify-center border-b border-white/10">
            {/* Map Grid Pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[16px_16px]" />

            {/* Hub & Destination Lines */}
            <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 60 120 Q 200 40 380 120"
                fill="none"
                stroke="#FF6A00"
                strokeWidth="3"
                strokeDasharray="6 6"
                className="animate-pulse"
              />
            </svg>

            {/* Hub Marker */}
            <div className="absolute left-10 bottom-8 flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-400">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-bold text-white/70 mt-1">Salt Lake Hub</span>
            </div>

            {/* Destination Marker */}
            <div className="absolute right-10 bottom-8 flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-emerald-600/30 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-bold text-white/70 mt-1">Your Location</span>
            </div>

            {/* Moving Pro Marker */}
            <motion.div
              animate={{
                x: [-100, 100, -100],
                y: [-20, 10, -20],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="px-2.5 py-1 rounded-full bg-accent text-white font-extrabold text-[11px] shadow-glow flex items-center gap-1.5 mb-1">
                <Navigation className="h-3 w-3 animate-spin" />
                <span>ETA {mins}m {secs}s</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent border-2 border-white flex items-center justify-center text-white shadow-xl">
                <span className="text-lg">👨‍🔧</span>
              </div>
            </motion.div>
          </div>

          {/* Pro & Booking Info */}
          <div className="p-5 space-y-4">
            {/* Pro Card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <Avatar size="lg" className="ring-2 ring-accent">
                  <AvatarFallback name={technicianName} />
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-heading text-sm font-bold text-white">{technicianName}</h4>
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="text-xs text-white/70">Verified Tradesman • ⭐ 4.9 (850+ Jobs)</p>
                  <span className="text-[10px] text-accent font-semibold block mt-0.5">
                    {serviceName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${technicianPhone}`}
                  className="p-2.5 rounded-xl bg-accent text-white hover:bg-accent-light transition-all shadow-glow flex items-center justify-center"
                  title="Call Pro"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href={`https://wa.me/${technicianPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center justify-center"
                  title="WhatsApp Pro"
                >
                  <MessageSquare className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Timeline Progress */}
            <div className="space-y-2.5 text-xs border-t border-white/10 pt-3">
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider block">
                Dispatch Progress Status
              </span>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>10:00 AM — Booking Confirmed & Verified</span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>10:15 AM — Suresh Reddy Dispatched from Salt Lake Hub</span>
                </div>
                <div className="flex items-center gap-2.5 text-amber-400 font-bold animate-pulse">
                  <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>En Route to your address (Arriving in ~{mins} mins)</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="default"
              onClick={onClose}
              className="w-full font-bold border-white/20 text-white bg-white/5 hover:bg-white/10"
            >
              Close Live Map
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
