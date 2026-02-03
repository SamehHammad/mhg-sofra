import { Cairo } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
import { cookies } from "next/headers";
import { SESSION_KEYS } from "@/lib/constants";
import type { Metadata } from 'next';

// خط Cairo - لكل المحتوى العربي
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialUsername = cookieStore.get(SESSION_KEYS.USERNAME)?.value ?? null;

  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className={cairo.className} suppressHydrationWarning>
        <Providers initialUsername={initialUsername}>{children}</Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: {
    default: 'MHG Sofra',
    template: '%s | MHG Sofra',
  },
  description: 'سفرة MHG - اطلب وجبتك بسهولة من المطاعم المتاحة، وتابع الطلبات واحسب الفواتير.',
  applicationName: 'MHG Sofra',
  manifest: '/api/manifest',
  alternates: {
    languages: {
      ar: '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    title: 'MHG Sofra',
    description: 'سفرة MHG - اطلب وجبتك بسهولة من المطاعم المتاحة، وتابع الطلبات واحسب الفواتير.',
    siteName: 'MHG Sofra',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MHG Sofra',
    description: 'سفرة MHG - اطلب وجبتك بسهولة من المطاعم المتاحة، وتابع الطلبات واحسب الفواتير.',
  },
};
