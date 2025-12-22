// pwa/PWARegister.tsx
"use client";
import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      navigator.serviceWorker
        .register('/sw.js') // نسجل الـ Service Worker الجديد
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null; // هذا المكوّن لا يعرض شيئًا
}