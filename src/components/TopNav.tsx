'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Copy,
  Database,
  Edit3,
  ChevronDown,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from 'lucide-react';

import Container from './Container';
import { useLanguage } from '@/contexts/LanguageContext';

interface TopNavProps {
  title?: string;
  subtitle?: string;
}

export default function TopNav({ title, subtitle }: TopNavProps) {
  const pathname = usePathname();
  const { language, setLanguage, t, direction } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const navigation = useMemo(
    () => [
      { name: t.nav.dashboard, href: '/', icon: Home },
      { name: t.nav.printCheck, href: '/print-check', icon: FileText },
      { name: t.nav.templateEditor, href: '/template-editor', icon: Edit3 },
      { name: t.nav.batchPrinting, href: '/batch-printing', icon: Copy },
      { name: t.nav.printedChecks, href: '/printed-checks', icon: Database },
    ],
    [t]
  );

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!userOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserOpen(false);
    };

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [userOpen]);

  useEffect(() => {
    setUserOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-[0_6px_24px_-18px_rgba(0,0,0,0.25)]">
      <Container>
        <div className="flex items-center justify-between gap-3 py-3">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 min-w-0"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3949AB] to-[#5C6BC0] flex items-center justify-center shadow-lg shadow-[#3949AB]/20 shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-black text-[#3949AB] tracking-tight leading-none truncate">
                تشيك برو
              </div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate">
                {t.enterpriseEdition}
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-300 ` +
                    (isActive
                      ? 'bg-[#3949AB] text-white shadow-[0_10px_20px_-12px_rgba(57,73,171,0.45)]'
                      : 'text-neutral-500 hover:bg-[#3949AB]/5 hover:text-[#3949AB]')
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="leading-none">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 bg-white rounded-xl text-sm font-bold text-[#3949AB] hover:bg-[#3949AB] hover:text-white transition-all duration-300 shadow-sm border border-[#3949AB]/10"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>

            {/* User dropdown (desktop) */}
            <div className="hidden md:block relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserOpen((v) => !v)}
                className="h-10 rounded-xl bg-white border border-[#3949AB]/10 shadow-sm hover:shadow-md transition-all duration-300 px-2.5 flex items-center gap-2 text-neutral-700"
                aria-haspopup="menu"
                aria-expanded={userOpen}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3949AB] to-[#5C6BC0] flex items-center justify-center text-white shadow-lg shadow-[#3949AB]/20">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div className="hidden lg:block text-start leading-tight">
                  <div className="text-sm font-black text-neutral-800">
                    {language === 'ar' ? 'أحمد محمد' : 'John Doe'}
                  </div>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase">
                    {t.user.role}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${userOpen ? 'rotate-180' : ''}`} />
              </button>

              <div
                className={
                  `absolute mt-2 w-60 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl overflow-hidden transition-all duration-200 ` +
                  (direction === 'rtl' ? 'left-0 origin-top-left ' : 'right-0 origin-top-right ') +
                  (userOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none')
                }
                role="menu"
              >
                <div className="px-4 py-3 border-b border-neutral-100">
                  <div className="text-sm font-black text-neutral-800">
                    {language === 'ar' ? 'أحمد محمد' : 'John Doe'}
                  </div>
                  <div className="text-[11px] font-bold text-neutral-400">
                    {t.user.role}
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-neutral-600 hover:bg-[#3949AB]/5 hover:text-[#3949AB] transition-colors"
                  role="menuitem"
                >
                  <User className="w-4 h-4" />
                  {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
                </button>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-neutral-600 hover:bg-[#3949AB]/5 hover:text-[#3949AB] transition-colors"
                  role="menuitem"
                >
                  <Settings className="w-4 h-4" />
                  {language === 'ar' ? 'الإعدادات' : 'Settings'}
                </button>
                <div className="h-px bg-neutral-100"></div>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden w-10 h-10 rounded-xl bg-white flex items-center justify-center text-neutral-500 hover:text-[#3949AB] transition-all duration-300 border border-[#3949AB]/10"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Title (mobile/tablet) */}
        {title && (
          <div className="lg:hidden pb-3">
            <div className="bg-white/70 rounded-2xl px-4 py-3 border border-white/40">
              <div className="text-center">
                <div className="text-base font-black text-[#3949AB] tracking-tight">
                  {title}
                </div>
                {subtitle && (
                  <div className="text-[11px] font-bold text-neutral-400 mt-0.5">
                    {subtitle}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>

      {/* Mobile drawer */}
      {mounted &&
        createPortal(
          <div
            className={
              `md:hidden fixed inset-0 z-[9999] transition-opacity duration-300 ` +
              (mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')
            }
            aria-hidden={!mobileOpen}
          >
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileOpen(false)}
            ></div>

            <div
              className={
                `absolute top-0 bottom-0 z-[10000] w-[86vw] max-w-sm bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl transition-transform duration-300 ease-out flex flex-col overflow-y-auto ` +
                (direction === 'rtl'
                  ? 'right-0 border-l '
                  : 'left-0 border-r ') +
                (mobileOpen
                  ? 'translate-x-0'
                  : direction === 'rtl'
                    ? 'translate-x-full'
                    : '-translate-x-full')
              }
            >
              <div className="p-4 border-b border-neutral-200/70 flex items-center justify-between">
                <div className="font-black text-[#3949AB] tracking-tight">تشيك برو</div>
                <button
                  type="button"
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-neutral-500 hover:text-[#3949AB] transition-all duration-300 border border-[#3949AB]/10"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 py-4 border-b border-neutral-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3949AB] to-[#5C6BC0] flex items-center justify-center text-white shadow-lg shadow-[#3949AB]/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-neutral-800 truncate">
                      {language === 'ar' ? 'أحمد محمد' : 'John Doe'}
                    </div>
                    <div className="text-[11px] font-bold text-neutral-400 truncate">
                      {t.user.role}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="h-10 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:border-[#3949AB]/30 hover:text-[#3949AB] transition-colors text-sm font-bold"
                  >
                    {language === 'ar' ? 'الملف' : 'Profile'}
                  </button>
                  <button
                    type="button"
                    className="h-10 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:border-red-200 hover:text-red-600 transition-colors text-sm font-bold"
                  >
                    {language === 'ar' ? 'خروج' : 'Logout'}
                  </button>
                </div>
              </div>

              <nav className="p-3 flex-1 overflow-y-auto">
                <div className="grid gap-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={
                          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ` +
                          (isActive
                            ? 'bg-[#3949AB] text-white shadow-[0_10px_20px_-12px_rgba(57,73,171,0.45)]'
                            : 'text-neutral-600 hover:bg-[#3949AB]/5 hover:text-[#3949AB]')
                        }
                      >
                        <Icon className="w-5 h-5" />
                        <span className="leading-none pt-0.5">{item.name}</span>
                        {isActive && (
                          <div
                            className={
                              `w-1.5 h-1.5 rounded-full bg-white/60 ` +
                              (direction === 'rtl' ? 'mr-auto' : 'ml-auto')
                            }
                          ></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
