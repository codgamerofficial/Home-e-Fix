import { Toaster } from "sonner";

/**
 * Global notification toast container.
 * Place this once in the root layout.
 */
export function NotificationToast() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          fontFamily: "var(--font-body)",
        },
        classNames: {
          toast: "border border-border shadow-lg",
          title: "font-medium",
          description: "text-foreground-secondary",
        },
      }}
    />
  );
}
