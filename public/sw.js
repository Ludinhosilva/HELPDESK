// FlixSupport Service Worker
// Handles Web Push notifications for browsers that support it

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, message, priority, ticketId } = data;

    const options: NotificationOptions = {
      body: message,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: ticketId,
      data: { ticketId },
      requireInteraction: true,
      vibrate: priority === "URGENT" ? [200, 100, 200, 100, 200] : [200, 100, 200],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    // If data is not JSON, show as plain text
    event.waitUntil(
      self.registration.showNotification("FlixSupport", {
        body: event.data.text(),
        icon: "/icon-192.png",
        badge: "/icon-192.png",
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const ticketId = event.notification.data?.ticketId;
  const urlToOpen = ticketId ? `/tickets/${ticketId}` : "/tickets";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(self.location.origin));
        if (existing) {
          existing.focus();
          existing.postMessage({ type: "NAVIGATE", url: urlToOpen });
        } else {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});
