import { useState } from "react";
import { Bell, Check, Tag, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const INITIAL_NOTIFS = [
  {
    id: "n-1",
    title: "Technician Dispatched!",
    message: "Suresh Reddy is on the way for Split AC Foam Jet Deep Servicing. ETA 25 mins.",
    type: "booking",
    date: "10 mins ago",
    read: false,
  },
  {
    id: "n-2",
    title: "₹100 Wallet Credit Added",
    message: "On-time arrival guarantee credit of ₹100 added to your wallet balance.",
    type: "promo",
    date: "2 hours ago",
    read: false,
  },
  {
    id: "n-3",
    title: "Booking Confirmed #HEF-894102",
    message: "Your service booking for tomorrow 10:00 AM has been confirmed.",
    type: "booking",
    date: "Yesterday",
    read: true,
  },
];

export default function Notifications() {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);

  const handleMarkAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Notifications</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Real-time booking updates, promotional offers, and security alerts
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleMarkAllRead} leftIcon={<Check className="h-4 w-4" />}>
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifs.map((n) => (
          <Card
            key={n.id}
            className={`p-4 border transition-colors ${
              !n.read ? "border-accent/40 bg-accent/5" : "border-border bg-surface"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading text-xs font-bold text-primary">{n.title}</h4>
                    {!n.read && <Badge variant="accent" className="text-[9px] px-1.5 py-0">New</Badge>}
                  </div>
                  <p className="text-xs text-foreground-secondary mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-foreground-muted block mt-1">{n.date}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
