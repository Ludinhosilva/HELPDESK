"use client";

import { useEffect, useCallback } from "react";
import { isNativePlatform, getPlatform } from "@/lib/capacitor";

interface CapacitorBridge {
  Capacitor?: {
    isNativePlatform?: () => boolean;
    Plugins?: {
      PushNotifications?: {
        requestPermissions: () => Promise<{ receive: string }>;
        register: () => Promise<void>;
        addListener: (event: string, cb: (data: unknown) => void) => void;
      };
    };
  };
}

function getCapacitorPush() {
  if (typeof window === "undefined") return null;
  const win = window as typeof window & CapacitorBridge;
  return win.Capacitor?.Plugins?.PushNotifications || null;
}

export function usePushNotifications() {
  const registerToken = useCallback(async (token: string, platform: string) => {
    try {
      await fetch("/api/push/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, platform }),
      });
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const native = isNativePlatform();

    if (native) {
      const Push = getCapacitorPush();
      if (Push) {
        Push.requestPermissions().then((result: { receive: string }) => {
          if (result.receive === "granted") {
            Push.register();
          }
        });

        Push.addListener("registration", (token: unknown) => {
          const t = token as { value: string };
          if (t?.value) registerToken(t.value, getPlatform());
        });

        Push.addListener("pushNotificationReceived", (notification: unknown) => {
          const n = notification as { data?: Record<string, string> };
          if (n?.data?.ticketId) {
            window.open(`/tickets/${n.data.ticketId}`, "_self");
          }
        });

        Push.addListener("pushNotificationActionPerformed", (notification: unknown) => {
          const n = notification as { notification?: { data?: Record<string, string> } };
          if (n?.notification?.data?.ticketId) {
            window.open(`/tickets/${n.notification.data.ticketId}`, "_self");
          }
        });
      }
    } else if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager
          .subscribe({
            userVisibleOnly: true,
            applicationServerKey: (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
              ? urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
              : new Uint8Array(65)) as unknown as BufferSource,
          })
          .then((subscription) => {
            const token = JSON.stringify(subscription.toJSON());
            registerToken(token, "web");
          })
          .catch(() => {});
      });
    }
  }, [registerToken]);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
