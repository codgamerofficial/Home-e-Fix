/**
 * Notifications service handling SMS alerts & Web Push browser notifications.
 */
export const notificationsService = {
  /**
   * Request Web Push Notification permissions from user's browser.
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;

    if (Notification.permission === "granted") return true;

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  },

  /**
   * Dispatch a Web Push Notification alert to the user.
   */
  async sendPushNotification(title: string, body: string, icon = "/favicon.ico") {
    const hasPermission = await this.requestNotificationPermission();
    if (hasPermission && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon,
          badge: icon,
        });
      });
    }
  },

  /**
   * Send SMS notification via Fast2SMS / Twilio backend API.
   */
  async sendSmsAlert(phone: string, message: string) {
    // Simulated SMS gateway call
    console.log(`[SMS DISPATCHED] To: ${phone} | Content: ${message}`);
    return { success: true, timestamp: new Date().toISOString() };
  },
};
