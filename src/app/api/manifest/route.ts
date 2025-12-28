import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // استخراج الـ locale أو tenant من الريكويست
  const url = new URL(req.url);

// جلب الإعدادات الديناميكية

const manifest = {
  name: "Check Printing",
    short_name: "Check Printing",
    description: "Check Printing" ,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2c3ee1",
    icons: [
      {
        src:"/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  // مهم جدًا أن تستخدم NextResponse.json (وليس Response)
  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
}