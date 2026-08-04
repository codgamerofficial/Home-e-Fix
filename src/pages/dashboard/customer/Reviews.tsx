import { useState } from "react";
import { ReviewCard } from "@/components/ui/review-card";
import { Star, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

const INITIAL_REVIEWS = [
  {
    id: "r-1",
    userName: "Priya Sharma",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    rating: 5,
    date: "2026-08-01",
    comment: "The AC foam deep cleaning was unbelievable! Airflow doubled and technician left the room clean.",
    serviceName: "AC Foam Deep Cleaning",
    isVerified: true,
    helpfulCount: 28,
  },
  {
    id: "r-2",
    userName: "Priya Sharma",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    rating: 5,
    date: "2026-07-28",
    comment: "Plumber arrived in 20 minutes! Fixed the leaking wash basin tap quickly.",
    serviceName: "Bathroom Tap Repair",
    isVerified: true,
    helpfulCount: 14,
  },
];

export default function Reviews() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">My Submitted Reviews</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Feedback and star ratings given to verified professionals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev) => (
          <ReviewCard
            key={rev.id}
            userName={rev.userName}
            userAvatar={rev.userAvatar}
            rating={rev.rating}
            date={rev.date}
            comment={rev.comment}
            serviceName={rev.serviceName}
            isVerified={rev.isVerified}
            helpfulCount={rev.helpfulCount}
          />
        ))}
      </div>
    </div>
  );
}
