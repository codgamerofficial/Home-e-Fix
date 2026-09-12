import { Bell, Check, Tag, ShieldCheck, Clock, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "@/store/notification.store";
import { formatRelativeTime } from "@/lib/date";

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } =
    useNotificationStore();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Notifications</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Real-time booking updates, dispatch telemetry, and security alerts
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                leftIcon={<Check className="h-4 w-4" />}
              >
                Mark All Read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-rose-600 hover:bg-rose-50"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12 text-center border border-dashed border-border bg-surface space-y-2">
          <Bell className="mx-auto h-8 w-8 text-foreground-muted" />
          <h4 className="font-heading font-bold text-sm text-primary">No notifications</h4>
          <p className="text-xs text-foreground-secondary">
            You are all caught up! You will be notified here when your booking status changes or a technician is dispatched.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 border transition-colors ${
                !n.read ? "border-accent/40 bg-accent/5" : "border-border bg-surface"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading text-xs font-bold text-primary">{n.title}</h4>
                      {!n.read && (
                        <Badge variant="accent" className="text-[9px] px-1.5 py-0">
                          New
                        </Badge>
                      )}
                    </div>
                    {n.message && <p className="text-xs text-foreground-secondary">{n.message}</p>}
                    <span className="text-[10px] text-foreground-muted block mt-1 font-mono">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-foreground-muted hover:text-primary"
                      onClick={() => markAsRead(n.id)}
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => removeNotification(n.id)}
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
