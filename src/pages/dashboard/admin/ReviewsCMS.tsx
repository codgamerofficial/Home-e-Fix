import { useState, useEffect } from "react";
import { Star, CheckCircle2, ShieldAlert, Eye, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dbRepository } from "@/services/db/repository";
import { formatDate } from "@/lib/date";

export default function ReviewsCMS() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    setReviews(dbRepository.getReviews());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Reviews & Ratings Moderation</h1>
          <p className="text-sm text-foreground-secondary">
            Monitor verified customer feedback, service ratings, and flagged testimonials.
          </p>
        </div>
        <div className="text-xs text-foreground-muted font-medium">
          Total Reviews: <span className="font-bold text-primary">{reviews.length}</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-12 border border-border text-center space-y-3">
          <MessageSquare className="h-10 w-10 text-foreground-muted mx-auto" />
          <h3 className="font-heading text-base font-bold text-primary">No Customer Reviews Yet</h3>
          <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
            Reviews will appear here automatically when verified homeowners submit feedback on their completed bookings.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-primary">{rev.userName || "Customer"}</span>
                  <span className="text-xs text-foreground-muted">reviewed</span>
                  <span className="text-xs font-semibold text-accent">{rev.serviceName || "Service"}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < (rev.rating || 5) ? "fill-amber-500" : "text-border"}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-foreground-secondary italic">&ldquo;{rev.comment}&rdquo;</p>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
                <span>{rev.serviceName || "Home Service"} • {rev.created_at ? formatDate(rev.created_at) : (rev.date || "Recent")}</span>
                <span className="px-2 py-0.5 rounded-full bg-success/10 text-success font-bold text-[10px]">
                  VERIFIED
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
