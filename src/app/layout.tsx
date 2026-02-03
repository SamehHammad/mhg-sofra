import { Cairo } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
import { cookies } from "next/headers";
import { SESSION_KEYS } from "@/lib/constants";

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

export async function generateMetadata() {
  return {
    title: "MHG Sofra",
    description: "MHG Sofra",
    manifest: `/api/manifest`
  };
}
