import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notification.store";
import { ROUTES } from "@/constants/routes";

export interface NotificationButtonProps {
  className?: string;
}

export function NotificationButton({ className }: NotificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAllAsRead, markAsRead } =
    useNotificationStore();

  // Click outside and Escape key listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Notification Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "h-[42px] w-[42px] rounded-xl flex items-center justify-center shrink-0 cursor-pointer select-none relative",
          "bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80",
          "border border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-200",
          "hover:text-[#FF6A00] dark:hover:text-[#FF6A00] hover:border-[#FF6A00]/50 transition-all duration-150",
          "focus:outline-hidden focus:ring-2 focus:ring-[#FF6A00]/25",
          isOpen && "border-[#FF6A00] text-[#FF6A00]",
          className
        )}
        aria-label="Notifications"
        aria-expanded={isOpen}
        title="Notifications"
      >
        <Bell className="w-4.5 h-4.5" />

        {/* Unread Badge: ONLY shown if unreadCount > 0 */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6A00] px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
              "absolute top-full right-0 mt-2 z-50",
              "w-80 p-2.5 rounded-2xl",
              "bg-white/98 dark:bg-[#091B33]/98 backdrop-blur-md",
              "border border-slate-200/90 dark:border-slate-800/90",
              "shadow-xl shadow-slate-900/10 dark:shadow-black/50",
              "focus:outline-hidden"
            )}
            role="region"
            aria-label="Notifications panel"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-heading text-xs font-bold text-slate-900 dark:text-white">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-[#FF6A00]">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#FF6A00] hover:underline cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notification List */}
            {notifications && notifications.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-1.5 py-2 px-1">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markAsRead(n.id)}
                    className={cn(
                      "p-2.5 rounded-xl text-xs transition-colors cursor-pointer",
                      n.read
                        ? "hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300"
                        : "bg-orange-500/8 dark:bg-orange-500/15 border border-orange-500/20 text-slate-900 dark:text-white font-medium"
                    )}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-semibold truncate leading-tight">
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00] shrink-0 mt-1" />
                      )}
                    </div>
                    {n.message && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-normal">
                        {n.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-7 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1.5">
                <Bell className="w-5 h-5 mx-auto text-slate-300 dark:text-slate-600" />
                <p>No new notifications</p>
              </div>
            )}

            {/* Popover Footer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <Link
                to={ROUTES.APP_NOTIFICATIONS}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-[#FF6A00] dark:hover:text-[#FF6A00] py-1 transition-colors"
              >
                <span>View all notifications</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
