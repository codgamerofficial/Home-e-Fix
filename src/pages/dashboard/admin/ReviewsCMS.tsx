import { useState } from "react";
import { Star, CheckCircle2, ShieldAlert, Eye, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReviewsCMS() {
  const reviews = [
    {
      id: "REV-101",
      customer: "Priya Banerjee",
      service: "Split AC Jet Deep Cleaning",
      technician: "Subhashish Karmakar",
      rating: 5,
      comment: "Arrived right on time, explained the drain pipe blockage clearly, and cleaned up thoroughly after finishing!",
      date: "Sep 11, 2026",
      status: "PUBLISHED",
    },
    {
      id: "REV-102",
      customer: "Amitava Ghosh",
      service: "Distribution Board Repair",
      technician: "Rajiv Naskar",
      rating: 4,
      comment: "Very knowledgeable electrician. Fixed the tripping MCB promptly. Would definitely recommend.",
      date: "Sep 10, 2026",
      status: "PUBLISHED",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Reviews & Ratings Moderation</h1>
        <p className="text-sm text-foreground-secondary">
          Monitor verified customer feedback, service ratings, and flagged testimonials.
        </p>
      </div>

      <div className="space-y-3">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-primary">{rev.customer}</span>
                <span className="text-xs text-foreground-muted">reviewed</span>
                <span className="text-xs font-semibold text-accent">{rev.technician}</span>
              </div>

              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < rev.rating ? "fill-amber-500" : "text-border"}`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-foreground-secondary italic">"{rev.comment}"</p>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
              <span>{rev.service} • {rev.date}</span>
              <span className="px-2 py-0.5 rounded-full bg-success/10 text-success font-bold">
                {rev.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
