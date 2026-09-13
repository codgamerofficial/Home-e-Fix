import { useState, useEffect } from "react";
import { ReviewCard } from "@/components/ui/review-card";
import { Star, MessageSquare, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dbRepository } from "@/services/db/repository";
import { formatDate } from "@/lib/date";
import { useAuthStore } from "@/store/auth.store";

export default function Reviews() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = () => {
    setReviews(dbRepository.getReviews());
    const userCompleted = dbRepository
      .getBookings(user?.id)
      .filter((b) => b.status === "COMPLETED" || b.status === "SERVICE_COMPLETED");
    setCompletedBookings(userCompleted);
    if (userCompleted.length > 0) {
      setSelectedBookingId(userCompleted[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleOpenWriteModal = () => {
    if (completedBookings.length === 0) {
      setNotice("You do not have any completed bookings yet. Reviews can only be submitted for verified, completed service appointments.");
      setTimeout(() => setNotice(null), 6000);
      return;
    }
    setShowAddModal(true);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment || !selectedBookingId) return;

    const matchedBooking = completedBookings.find((b) => b.id === selectedBookingId);
    if (!matchedBooking) return;

    dbRepository.createReview({
      bookingId: matchedBooking.id,
      customerId: user?.id,
      userName: user?.fullName || matchedBooking.customer_name || "Verified Customer",
      serviceName: matchedBooking.service_name || "Home Service",
      rating: newRating,
      comment: newComment,
    });

    loadData();
    setShowAddModal(false);
    setNewComment("");
    setNotice("Thank you! Your verified rating and feedback has been posted.");
    setTimeout(() => setNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">My Submitted Reviews</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Ratings and feedback submitted for completed Home-e-Fix service appointments
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleOpenWriteModal}
          className="font-bold shadow-xs"
        >
          Write a Review
        </Button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-muted/60 text-primary border border-border text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-accent shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* WRITE REVIEW MODAL */}
      {showAddModal && (
        <Card className="p-6 border border-accent/30 bg-surface space-y-4 shadow-lg max-w-lg">
          <h4 className="font-heading text-sm font-bold text-primary">Share Service Feedback</h4>
          <form onSubmit={handleAddReview} className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">
                Completed Booking Appointment
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full rounded-xl border border-border p-2.5 bg-background text-primary text-xs"
              >
                {completedBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    #{b.booking_number || b.id} — {b.service_name} ({b.scheduled_date})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= newRating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">Comments</label>
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience regarding punctuality, technical skill, and cleanliness..."
                className="w-full rounded-xl border border-border p-3 bg-background text-primary"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" type="submit" className="font-bold">
                Submit Review
              </Button>
            </div>
          </form>
        </Card>
      )}

      {reviews.length === 0 ? (
        <Card className="p-12 text-center border border-dashed border-border bg-surface space-y-2">
          <MessageSquare className="mx-auto h-8 w-8 text-foreground-muted" />
          <h4 className="font-heading font-bold text-sm text-primary">No Reviews Yet</h4>
          <p className="text-xs text-foreground-secondary">
            You haven&apos;t reviewed any completed bookings yet.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              userName={rev.userName}
              userAvatar={rev.userAvatar}
              rating={rev.rating}
              date={formatDate(rev.date)}
              comment={rev.comment}
              serviceName={rev.serviceName}
              isVerified={rev.isVerified}
              helpfulCount={rev.helpfulCount || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
