import { Cairo } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PWARegister } from "../../pwa/PWARegister";
import { PWAInstallBanner } from "../../pwa/PWAInstallBanner";

// خط Cairo - لكل المحتوى العربي
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className={cairo.className} suppressHydrationWarning>
        <LanguageProvider>
          {children}
          <PWARegister />
          <PWAInstallBanner
            logo={'/logo.png'}
            locale={"ar"}
            appName={"MHG Sofra"}
          />
        </LanguageProvider>
      </body>
    </html>
  );
}

export async function generateMetadata() {
  return {
    title: "نظام طباعة وإدارة الشيكات | Check Printing & Management System",
    description: "حل احترافي لطباعة وإدارة الشيكات | Enterprise-grade check printing and management solution",
    manifest: `/api/manifest`
  };
}
