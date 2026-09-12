import { useState } from "react";
import { FileText, Image, Sparkles, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContentCMS() {
  const banners = [
    { title: "Monsoon Wiring & Surge Safety Promo Banner", status: "ACTIVE", location: "Homepage Hero Strip" },
    { title: "Home-e-Fix PLUS Annual Membership 20% Off", status: "ACTIVE", location: "Category Sidebar" },
    { title: "Emergency Geyser & Water Motor Repair Card", status: "SCHEDULED", location: "Mobile Home Drawer" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Content & Marketing CMS</h1>
        <p className="text-sm text-foreground-secondary">
          Manage promotional banners, announcements, and marketing carousels.
        </p>
      </div>

      <div className="space-y-3">
        {banners.map((b) => (
          <div
            key={b.title}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Image className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-primary">{b.title}</h4>
                <p className="text-xs text-foreground-muted">{b.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-success/10 text-success font-bold">
                {b.status}
              </span>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
