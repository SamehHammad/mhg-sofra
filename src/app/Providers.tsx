'use client';

import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { PWARegister } from "../../pwa/PWARegister";
import { PWAInstallBanner } from "../../pwa/PWAInstallBanner";
import AppHeader from "@/components/AppHeader";

export default function Providers({
  children,
  initialUsername,
}: {
  children: React.ReactNode;
  initialUsername?: string | null;
}) {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <AppHeader initialUsername={initialUsername ?? null} />
        {children}
      </NotificationProvider>
      <PWARegister username={initialUsername} />
      <PWAInstallBanner logo={'/logo2.png'} locale={"ar"} appName={"MHG Sofra"} />
    </LanguageProvider>
  );
}
