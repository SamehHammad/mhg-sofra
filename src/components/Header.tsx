"use client";

import { Bell, Settings, User, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { language, setLanguage, t, direction } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <header className="bg-transparent pt-4 pb-2 sticky top-0 z-10">
      <div className="px-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-white/40 flex items-center justify-center relative">
          {/* Title - Center Aligned */}
          <div className="text-center">
            <h1 className="text-2xl font-black text-[#3949AB] tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs font-bold text-neutral-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right Actions - Absolute Positioned */}
          <div
            className={`absolute ${
              direction === "rtl" ? "left-4" : "right-4"
            } flex items-center gap-3`}
          >
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-[#3949AB] hover:bg-[#3949AB] hover:text-white transition-all duration-300 shadow-sm border border-[#3949AB]/10"
            >
              {language === "ar" ? "EN" : "عربي"}
            </button>

            <div className="w-px h-8 bg-neutral-200 mx-2 hidden sm:block"></div>

            <button className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-neutral-400 hover:text-[#3949AB] hover:shadow-md transition-all duration-300 hidden sm:flex">
              <Bell className="w-5 h-5" />
            </button>

            <div
              className={`flex items-center gap-3 ${
                direction === "rtl" ? "pr-3" : "pl-3"
              } hidden sm:flex`}
            >
              <div
                className={`text-${
                  direction === "rtl" ? "left" : "right"
                } hidden md:block`}
              >
                <p className="text-sm font-bold text-neutral-800">
                  {language === "ar" ? "أحمد محمد" : "John Doe"}
                </p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">
                  {t.user.role}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3949AB] to-[#5C6BC0] flex items-center justify-center text-white shadow-lg shadow-[#3949AB]/20">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
