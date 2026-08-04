import { ShieldCheck, MapPin, Briefcase, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { StatusChip } from "@/components/ui/status-chip";
import type { Technician } from "@/types/technician.types";

export interface TechnicianCardProps {
  technician: Partial<Technician>;
  onSelect?: (technician: Partial<Technician>) => void;
  selected?: boolean;
  className?: string;
}

export function TechnicianCard({
  technician,
  onSelect,
  selected = false,
  className,
}: TechnicianCardProps) {
  const {
    displayName = "Rajesh Kumar",
    avatar,
    status = "available",
    experience = 5,
    rating = 4.9,
    reviewCount = 230,
    completedJobs = 450,
    serviceRadius = 10,
    specializations = ["AC Repair", "Wiring"],
    verificationStatus = "verified",
  } = technician;

  return (
    <Card
      hover
      className={cn(
        "overflow-hidden transition-all duration-200",
        selected && "border-accent ring-2 ring-accent/20 bg-accent/5",
        className
      )}
    >
      <CardContent className="p-5 space-y-4">
        {/* Header: Avatar + Info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar size="lg">
                <AvatarImage src={avatar} alt={displayName} />
                <AvatarFallback name={displayName} />
              </Avatar>
              {verificationStatus === "verified" && (
                <div className="absolute -bottom-1 -right-1 rounded-full bg-surface p-0.5 shadow-xs">
                  <ShieldCheck className="h-4 w-4 text-success fill-success/20" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-semibold text-base text-primary">
                  {displayName}
                </h3>
              </div>
              <p className="text-xs text-foreground-secondary flex items-center gap-1 mt-0.5">
                <Briefcase className="h-3 w-3 text-accent" />
                {experience} yrs exp • {completedJobs}+ jobs
              </p>
            </div>
          </div>

          <StatusChip status={status} size="sm" />
        </div>

        {/* Rating & Distance */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <Rating value={rating} reviewCount={reviewCount} size="sm" />
          <span className="flex items-center gap-1 text-foreground-muted">
            <MapPin className="h-3 w-3 text-foreground-muted" />
            Within {serviceRadius} km
          </span>
        </div>

        {/* Specializations Tags */}
        {specializations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {specializations.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="secondary" className="text-[10px]">
                {spec}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Button */}
        {onSelect && (
          <div className="pt-2">
            <Button
              variant={selected ? "accent" : "outline"}
              size="sm"
              className="w-full"
              onClick={() => onSelect(technician)}
            >
              {selected ? "Selected Pro" : "Select Pro"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
