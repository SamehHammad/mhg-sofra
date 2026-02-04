"use client";

import { useEffect } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PWARegister({ username }: { username?: string | null }) {
  useEffect(() => {
    async function registerAndSubscribe() {
      if ("serviceWorker" in navigator && typeof window !== "undefined" && "PushManager" in window) {
        try {
          // Register Service Worker
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("Service Worker registered with scope:", registration.scope);

          // Check if already subscribed
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            console.log("Already subscribed");
            // Always update subscription to ensure fresh user association
            await saveSubscription(subscription);
            return;
          }

          // Request Permission
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            console.log("Notification permission denied");
            return;
          }

          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!vapidKey) {
            console.error("No VAPID key found");
            return;
          }

          const convertedVapidKey = urlBase64ToUint8Array(vapidKey);

          const newSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
          });

          await saveSubscription(newSubscription);
          console.log("Subscribed successfully");

        } catch (error) {
          console.error("Error in PWARegister:", error);
        }
      }
    }

    async function saveSubscription(subscription: PushSubscription) {
      await fetch("/api/web-push/subscribe", {
        method: "POST",
        body: JSON.stringify({ ...subscription.toJSON(), username }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    registerAndSubscribe();
  }, [username]);

  return null;
}