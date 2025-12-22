"use client";

import React, { useEffect, useState } from "react";
import { X, Download, Smartphone } from "lucide-react";
import Image from "next/image";

interface PWAInstallBannerProps {
    logo?: string;
    locale: string;
    appName: string;
}

export function PWAInstallBanner({ logo, locale, appName }: PWAInstallBannerProps) {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if user already dismissed the banner in this session or forever
        const dismissed = localStorage.getItem("pwa-banner-dismissed");
        if (dismissed) {
            setIsDismissed(true);
            return;
        }

        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Show the banner if not dismissed
            if (!isDismissed) {
                setIsVisible(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Also check if already installed
        window.addEventListener("appinstalled", () => {
            setDeferredPrompt(null);
            setIsVisible(false);
        });

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, [isDismissed]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("User accepted the PWA install");
        } else {
            console.log("User dismissed the PWA install");
        }

        // We used the prompt, and can't use it again
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        // Don't show again for 24 hours (or just use flag)
        localStorage.setItem("pwa-banner-dismissed", "true");
    };

    if (!isVisible || isDismissed) return null;

    const isAr = locale === "ar";
    const content = {
        title: isAr ? `ثبت تطبيق ${appName}` : `Install ${appName} App`,
        subtitle: isAr ? "لتجربة تسوق أسرع وأسهل" : "For a faster and easier shopping experience",
        button: isAr ? "تثبيت الآن" : "Install Now",
    };

    return (
            <div
               className="fixed bottom-4 left-4 right-4 z-[100] md:hidden"
            >
                <div
                    className="relative overflow-hidden bg-white border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl p-4 flex items-center gap-4"
                    dir={isAr ? "rtl" : "ltr"}
                >
                    {/* Logo/Icon section */}
                    <div className="relative w-12 h-12 flex-shrink-0 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden">
                        {logo ? (
                            <Image src={logo} alt={appName} fill className="object-contain p-2" />
                        ) : (
                            <Smartphone className="w-6 h-6 text-primary" />
                        )}
                    </div>

                    {/* Text section */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate tracking-tight uppercase">
                            {content.title}
                        </h3>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5 font-medium">
                            {content.subtitle}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleInstall}
                            className="bg-primary hover:bg-primary/90 text-white text-[11px] font-bold px-4 py-2 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                        >
                            <Download className="w-3 h-3" />
                            {content.button}
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                            aria-label="close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Decorative background element */}
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                </div>
            </div>
    );
}
