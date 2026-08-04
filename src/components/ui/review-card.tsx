import { ThumbsUp, ShieldCheck } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";

export interface ReviewCardProps {
  userName?: string;
  userAvatar?: string;
  rating?: number;
  date?: string;
  comment?: string;
  serviceName?: string;
  isVerified?: boolean;
  helpfulCount?: number;
  onHelpful?: () => void;
  reply?: {
    author: string;
    comment: string;
    date: string;
  };
  className?: string;
}

export function ReviewCard({
  userName = "Ananya Sharma",
  userAvatar,
  rating = 5,
  date = new Date().toISOString(),
  comment = "The technician arrived right on time and did a fantastic job deep cleaning our AC. Very polite and thorough service!",
  serviceName = "AC Deep Cleaning",
  isVerified = true,
  helpfulCount = 14,
  onHelpful,
  reply,
  className,
}: ReviewCardProps) {
  return (
    <Card className={cn("overflow-hidden border border-border bg-surface", className)}>
      <CardContent className="p-5 space-y-3">
        {/* User Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar size="md">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback name={userName} />
            </Avatar>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-heading font-semibold text-sm text-primary">
                  {userName}
                </h4>
                {isVerified && (
                  <span
                    className="inline-flex items-center text-[10px] text-success font-medium gap-0.5"
                    title="Verified Customer"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-foreground-muted">
                {serviceName} • {formatDate(date)}
              </p>
            </div>
          </div>

          <Rating value={rating} size="sm" />
        </div>

        {/* Comment Body */}
        <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
          {comment}
        </p>

        {/* Helpful Counter */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-foreground-muted hover:text-foreground"
            leftIcon={<ThumbsUp className="h-3.5 w-3.5" />}
            onClick={onHelpful}
          >
            Helpful ({helpfulCount})
          </Button>
        </div>

        {/* Technician Reply */}
        {reply && (
          <div className="mt-2 rounded-xl bg-muted/60 p-3.5 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-primary">{reply.author}</span>
              <span className="text-[10px] text-foreground-muted">
                {formatDate(reply.date)}
              </span>
            </div>
            <p className="text-foreground-secondary leading-relaxed">
              {reply.comment}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
