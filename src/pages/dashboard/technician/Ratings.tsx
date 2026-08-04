import { Star, Award, ShieldCheck, ThumbsUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewCard } from "@/components/ui/review-card";

const REVIEWS = [
  {
    id: "r-101",
    userName: "Priya Sharma",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    rating: 5,
    date: "Aug 02, 2026",
    comment: "Suresh did an incredible job with our Split AC foam jet wash. Very polite and punctual!",
    serviceName: "Split AC Foam Jet Wash",
    isVerified: true,
    helpfulCount: 28,
  },
  {
    id: "r-102",
    userName: "Anand Verma",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    rating: 5,
    date: "Jul 28, 2026",
    comment: "Fixed the bathroom tap leak in 20 minutes. Brought genuine spare parts.",
    serviceName: "Bathroom Tap Repair",
    isVerified: true,
    helpfulCount: 14,
  },
];

export default function Ratings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">Ratings & Customer Reviews</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Performance metrics, star ratings, and badge achievements
        </p>
      </div>

      {/* RATING OVERVIEW SCORE CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 border border-border text-center space-y-2">
          <div className="flex items-center justify-center gap-1 text-yellow-400">
            <Star className="h-8 w-8 fill-yellow-400" />
            <span className="font-heading text-4xl font-extrabold text-primary">4.9</span>
          </div>
          <p className="text-xs text-foreground-secondary font-semibold">Average Star Rating (620 Jobs)</p>
        </Card>

        <Card className="p-6 border border-border text-center space-y-2">
          <Award className="mx-auto h-8 w-8 text-accent mb-1" />
          <div className="font-heading text-2xl font-extrabold text-primary">Top 1% Pro</div>
          <p className="text-xs text-foreground-secondary font-semibold">Platform Tier Status</p>
        </Card>

        <Card className="p-6 border border-border text-center space-y-2">
          <ThumbsUp className="mx-auto h-8 w-8 text-emerald-600 mb-1" />
          <div className="font-heading text-2xl font-extrabold text-emerald-600">99.4%</div>
          <p className="text-xs text-foreground-secondary font-semibold">On-Time Arrival Rate</p>
        </Card>
      </div>

      {/* BADGES */}
      <Card className="p-6 border border-border space-y-4">
        <h3 className="font-heading text-base font-bold text-primary pb-2 border-b border-border">
          Earned Achievements
        </h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="accent" className="px-3 py-1.5 text-xs font-bold">⭐ 500+ Jobs Completed</Badge>
          <Badge variant="secondary" className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50">⏱️ Punctuality Master</Badge>
          <Badge variant="secondary" className="px-3 py-1.5 text-xs font-bold text-accent bg-accent/10">🛡️ 100% Safety Certified</Badge>
        </div>
      </Card>

      {/* REVIEWS GRID */}
      <div className="space-y-4">
        <h3 className="font-heading text-base font-bold text-primary">Customer Testimonials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REVIEWS.map((rev) => (
            <ReviewCard key={rev.id} {...rev} />
          ))}
        </div>
      </div>
    </div>
  );
}
