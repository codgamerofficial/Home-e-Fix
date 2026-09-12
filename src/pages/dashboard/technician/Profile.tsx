import { useState } from "react";
import { User, Award, Star, Phone, Mail, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfessionalProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Professional Profile & Skills</h1>
        <p className="text-sm text-foreground-secondary">
          Manage your verified credentials, trade specializations, and service coverage areas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-surface p-6 text-center space-y-4 shadow-sm">
          <div className="h-20 w-20 rounded-full bg-accent text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
            SK
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary">Subhashish Karmakar</h3>
            <p className="text-xs text-foreground-muted">Master HVAC & Electrical Technician</p>
          </div>
          <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-sm">
            <Star className="h-4 w-4 fill-amber-500" />
            <span>4.92 (380+ completed jobs)</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" /> Police Verified Pro
          </span>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 space-y-6 shadow-sm">
          <h3 className="font-bold text-base text-primary">Skills & Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Inverter AC Repair",
              "Copper Pipe Brazing",
              "Distribution Board & MCB",
              "Smart Home Wiring",
              "Ceiling Fan Balancing",
              "Geyser Heating Coil Replacement",
            ].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-primary border border-border flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                {skill}
              </span>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <h4 className="font-bold text-sm text-primary">Assigned Service Hub</h4>
            <p className="text-xs text-foreground-secondary flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-accent" />
              Salt Lake Sector V, New Town Action Area 1-3, Rajarhat Hub (Radius 8 km)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
