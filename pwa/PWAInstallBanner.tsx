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
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if user already dismissed the banner in this session
        const dismissed = localStorage.getItem("pwa-banner-dismissed");
        if (dismissed) {
            setIsDismissed(true);
            return;
        }

        // Detect if app is installed
        const checkInstalled = () => {
            // For iOS
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
            setIsInstalled(!!isStandalone);
        };
        checkInstalled();
        window.addEventListener('appinstalled', checkInstalled);
        window.addEventListener('resize', checkInstalled);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if (!isDismissed) {
                setIsVisible(true);
            }
        };
        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Always show the banner if not installed and not dismissed
        if (!isInstalled && !isDismissed) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', checkInstalled);
            window.removeEventListener('resize', checkInstalled);
        };
    }, [isDismissed, isInstalled]);

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

    if (!isVisible || isDismissed || isInstalled) return null;

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
                className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border"
                style={{
                    background: 'rgb(var(--mhg-surface) / 0.97)',
                    borderColor: 'rgb(var(--mhg-gold-soft) / 0.5)',
                }}
                dir={isAr ? "rtl" : "ltr"}
            >
                {/* Logo/Icon section */}
                <div className="relative w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{ background: 'rgb(var(--mhg-blue) / 0.08)' }}>
                    {logo ? (
                        <Image src={logo} alt={appName} fill className="object-contain p-2" />
                    ) : (
                        <Smartphone className="w-6 h-6" style={{ color: 'rgb(var(--mhg-blue-deep))' }} />
                    )}
                </div>
                {/* Text section */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate tracking-tight uppercase"
                        style={{ color: 'rgb(var(--mhg-blue-deep))' }}>
                        {content.title}
                    </h3>
                    <p className="text-[11px] truncate mt-0.5 font-medium" style={{ color: 'rgb(var(--mhg-brown-soft) / 0.95)' }}>
                        {content.subtitle}
                    </p>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleInstall}
                        className="text-[11px] font-bold px-4 py-2 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                        style={{
                            background: 'linear-gradient(90deg, rgb(var(--mhg-blue)), rgb(var(--mhg-gold)))',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
                        }}
                    >
                        <Download className="w-3 h-3" style={{ color: 'white' }} />
                        {content.button}
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="p-1.5 rounded-lg transition-colors"
                        aria-label="close"
                        style={{ background: 'rgba(var(--mhg-gold-soft), 0.16)', color: 'rgb(var(--mhg-brown-soft))' }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                {/* Decorative background element */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
                    style={{ background: 'rgba(var(--mhg-blue-deep), 0.08)' }} />
            </div>
        </div>
    );
}
