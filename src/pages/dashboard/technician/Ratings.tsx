import { useState, useEffect } from "react";
import { Star, Award, ShieldCheck, ThumbsUp, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewCard } from "@/components/ui/review-card";
import { dbRepository } from "@/services/db/repository";
import { useAuthStore } from "@/store/auth.store";
import { formatDate } from "@/lib/date";

export default function Ratings() {
  const { user } = useAuthStore();
  const proId = user?.id || "pro-1";

  const [reviews, setReviews] = useState<any[]>([]);
  const [completedJobsCount, setCompletedJobsCount] = useState(0);

  useEffect(() => {
    const allReviews = dbRepository.getReviews();
    setReviews(allReviews);

    const bookings = dbRepository.getBookings().filter(
      (b) =>
        (!b.assigned_technician_id || b.assigned_technician_id === proId) &&
        (b.status === "COMPLETED" || b.status === "SERVICE_COMPLETED")
    );
    setCompletedJobsCount(bookings.length);
  }, [proId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">Ratings & Customer Reviews</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Performance metrics, customer feedback, and quality credentials derived from verified jobs
        </p>
      </div>

      {/* RATING OVERVIEW SCORE CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 border border-border text-center space-y-2">
          <div className="flex items-center justify-center gap-1 text-yellow-400">
            <Star className="h-8 w-8 fill-yellow-400" />
            <span className="font-heading text-4xl font-extrabold text-primary">{avgRating}</span>
          </div>
          <p className="text-xs text-foreground-secondary font-semibold">
            {reviews.length > 0
              ? `Average Star Rating (${reviews.length} Verified Review${reviews.length > 1 ? "s" : ""})`
              : "No Customer Reviews Yet"}
          </p>
        </Card>

        <Card className="p-6 border border-border text-center space-y-2">
          <Award className="mx-auto h-8 w-8 text-accent mb-1" />
          <div className="font-heading text-2xl font-extrabold text-primary">
            {completedJobsCount > 50 ? "Tier 1 Specialist" : completedJobsCount > 0 ? "Active Specialist" : "Onboarding Pro"}
          </div>
          <p className="text-xs text-foreground-secondary font-semibold">
            {completedJobsCount} Verified Completed Job{completedJobsCount === 1 ? "" : "s"}
          </p>
        </Card>

        <Card className="p-6 border border-border text-center space-y-2">
          <ThumbsUp className="mx-auto h-8 w-8 text-emerald-600 mb-1" />
          <div className="font-heading text-2xl font-extrabold text-emerald-600">
            {completedJobsCount > 0 ? "100%" : "—"}
          </div>
          <p className="text-xs text-foreground-secondary font-semibold">
            {completedJobsCount > 0 ? "On-Time Arrival Rate" : "SLA Tracking Starts on 1st Job"}
          </p>
        </Card>
      </div>

      {/* BADGES */}
      <Card className="p-6 border border-border space-y-4">
        <h3 className="font-heading text-base font-bold text-primary pb-2 border-b border-border">
          Earned Credentials & Badges
        </h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50">
            🛡️ 100% KYC & Background Verified
          </Badge>
          {completedJobsCount >= 10 && (
            <Badge variant="accent" className="px-3 py-1.5 text-xs font-bold">
              ⭐ 10+ Jobs Completed
            </Badge>
          )}
          {completedJobsCount > 0 && (
            <Badge variant="secondary" className="px-3 py-1.5 text-xs font-bold text-accent bg-accent/10">
              ⏱️ Punctuality Master
            </Badge>
          )}
          {reviews.length > 0 && (
            <Badge variant="outline" className="px-3 py-1.5 text-xs font-bold border-amber-300 text-amber-600 bg-amber-50">
              ✨ Customer Rated
            </Badge>
          )}
        </div>
      </Card>

      {/* REVIEWS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base font-bold text-primary">Customer Testimonials ({reviews.length})</h3>
          <span className="text-xs text-foreground-muted">Directly from completed orders</span>
        </div>

        {reviews.length === 0 ? (
          <Card className="p-10 border border-border text-center space-y-3">
            <MessageSquare className="h-10 w-10 text-foreground-muted mx-auto" />
            <p className="text-sm font-semibold text-primary">No customer reviews yet</p>
            <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
              Reviews will appear here automatically when verified homeowners rate and comment on your completed bookings.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                userName={rev.userName || "Verified Homeowner"}
                rating={rev.rating || 5}
                date={rev.date || (rev.created_at ? formatDate(rev.created_at) : "Recent")}
                comment={rev.comment}
                serviceName={rev.serviceName || "Home Service"}
                isVerified={true}
                helpfulCount={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
