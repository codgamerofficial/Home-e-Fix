import { useState } from "react";
import { Bell, Send, Users, Smartphone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NotificationsCMS() {
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Notification Broadcast Center</h1>
        <p className="text-sm text-foreground-secondary">
          Dispatch transactional SMS, WhatsApp updates, and real-time push announcements.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 max-w-2xl shadow-sm">
        <h3 className="font-bold text-base text-primary flex items-center gap-2">
          <Send className="h-4 w-4 text-accent" /> Compose System Broadcast
        </h3>

        <div className="space-y-3 text-sm">
          <div>
            <label className="text-xs font-bold text-foreground-secondary block mb-1">
              Target Audience
            </label>
            <select className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-primary">
              <option>All Registered Customers (Kolkata)</option>
              <option>Active Verified Professionals</option>
              <option>Home-e-Fix PLUS Members Only</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground-secondary block mb-1">
              Announcement Title
            </label>
            <Input
              placeholder="e.g. Monsoon Home Health Check Special Offer"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground-secondary block mb-1">
              Message Content
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-primary"
              placeholder="Type notification message..."
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
            />
          </div>

          <Button
            variant="accent"
            className="w-full shadow-glow"
            onClick={() => {
              alert("Broadcast dispatched!");
              setBroadcastTitle("");
              setBroadcastBody("");
            }}
          >
            Send Push & WhatsApp Notification
          </Button>
        </div>
      </div>
    </div>
  );
}
