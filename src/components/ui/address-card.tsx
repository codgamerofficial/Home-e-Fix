import { MapPin, Check, Edit2, Trash2, Home, Briefcase, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BookingAddress } from "@/types/booking.types";
import type { Address } from "@/types/address.types";

export interface AddressCardProps {
  address: Partial<BookingAddress> | Address | any;
  selected?: boolean;
  onSelect?: (address: any) => void;
  onEdit?: (address: any) => void;
  onDelete?: (address: any) => void;
  className?: string;
}

export function AddressCard({
  address,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  className,
}: AddressCardProps) {
  const label = address.label || address.title || "Home";
  const landmark = address.landmark || "";
  const floor = (address as any).floor || "";
  const fullAddress =
    address.fullAddress ||
    [
      (address as any).streetAddress || (address as any).address_line_1 || (address as any).house_flat,
      landmark ? `Near ${landmark}` : null,
      (address as any).city,
      (address as any).pincode,
    ]
      .filter(Boolean)
      .join(", ") ||
    "Address details not specified";

  const getTagIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "home":
        return <Home className="h-3.5 w-3.5" />;
      case "office":
      case "work":
        return <Briefcase className="h-3.5 w-3.5" />;
      default:
        return <Building className="h-3.5 w-3.5" />;
    }
  };

  return (
    <Card
      hover={Boolean(onSelect)}
      onClick={() => onSelect?.(address)}
      className={cn(
        "relative overflow-hidden transition-all duration-200 cursor-pointer",
        selected
          ? "border-accent ring-2 ring-accent/20 bg-accent/5"
          : "border-border hover:border-foreground-muted",
        className
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Tag + Actions */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1.5 font-medium">
            {getTagIcon(label)}
            {label}
          </Badge>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {selected && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white shadow-xs mr-1">
                <Check className="h-3 w-3" />
              </div>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-foreground-secondary"
                onClick={() => onEdit(address)}
                aria-label="Edit Address"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-error hover:bg-error-light"
                onClick={() => onDelete(address)}
                aria-label="Delete Address"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Address Body */}
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
            {fullAddress}
          </p>
          {(landmark || floor) && (
            <p className="text-xs text-foreground-muted">
              {[floor, landmark && `Landmark: ${landmark}`]
                .filter(Boolean)
                .join(" • ")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
