'use client';

import { useLayoutEffect, useState } from 'react';
import Image from 'next/image';
import UsernameModal from '@/components/UsernameModal';
import { SESSION_KEYS } from '@/lib/constants';
import { Calculator, LayoutDashboard, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { saveUsernameAction } from './actions';

export default function AppHeader({ initialUsername }: { initialUsername?: string | null }) {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(() => {
    if (typeof window === 'undefined') return initialUsername ?? null;
    return initialUsername ?? localStorage.getItem(SESSION_KEYS.USERNAME);
  });
  const [showModal, setShowModal] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !(initialUsername ?? localStorage.getItem(SESSION_KEYS.USERNAME));
  });
  const [showEditModal, setShowEditModal] = useState(false);

  const quickLinks = [
    {
      href: '/orders',
      label: 'عرض الطلبات',
      Icon: ShoppingCart,
      activeClassName: 'bg-mhg-blue text-white shadow-md',
      inactiveClassName: 'bg-white/70 text-mhg-blue hover:bg-mhg-blue/10',
      className:
        'px-6 py-3 rounded-xl font-bold bg-white hover:bg-gray-50 text-mhg-blue-deep shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2',
    },
    {
      href: '/billing',
      label: 'حساب الطلبات',
      Icon: Calculator,
      activeClassName: 'bg-mhg-gold text-mhg-brown shadow-md',
      inactiveClassName: 'bg-white/70 text-mhg-gold-deep hover:bg-mhg-gold/10',
      className:
        'px-6 py-3 rounded-xl font-bold bg-white hover:bg-gray-50 text-mhg-blue-deep shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2',
    },
    {
      href: '/admin/login',
      label: 'لوحة الإدارة',
      Icon: LayoutDashboard,
      activeClassName: 'bg-mhg-brown text-white shadow-md',
      inactiveClassName: 'bg-white/70 text-mhg-brown hover:bg-mhg-brown/10',
      className:
        'px-6 py-3 rounded-xl font-bold bg-gray-800 hover:bg-gray-900 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2',
    },
  ] as const;

  useLayoutEffect(() => {
    const storedUsername = localStorage.getItem(SESSION_KEYS.USERNAME);
    const resolved = storedUsername || initialUsername || null;
    if (!storedUsername && initialUsername) {
      localStorage.setItem(SESSION_KEYS.USERNAME, initialUsername);
    }

    if (resolved) {
      document.cookie = `${encodeURIComponent(SESSION_KEYS.USERNAME)}=${encodeURIComponent(resolved)}; path=/; max-age=31536000`;
    }
    setUsername(resolved);
    setShowModal(!resolved);
  }, [initialUsername]);

  const saveUsername = async (newUsername: string) => {
    try {
      const result = await saveUsernameAction(newUsername);
      if (result.ok) {
        localStorage.setItem(SESSION_KEYS.USERNAME, newUsername);
        document.cookie = `${encodeURIComponent(SESSION_KEYS.USERNAME)}=${encodeURIComponent(newUsername)}; path=/; max-age=31536000`;
        setUsername(newUsername);
        return true;
      }
    } catch (error) {
      console.error('Error saving username:', error);
    }

    return false;
  };

  const handleUsernameSubmit = async (newUsername: string) => {
    const ok = await saveUsername(newUsername);
    if (ok) setShowModal(false);
  };

  const handleUsernameEdit = async (newUsername: string) => {
    const ok = await saveUsername(newUsername);
    if (ok) setShowEditModal(false);
  };

  return (
    <>
      {showModal && <UsernameModal onSubmit={handleUsernameSubmit} />}
      {showEditModal && (
        <div className="relative z-[9999]">
          <UsernameModal
            onSubmit={handleUsernameEdit}
            initialUsername={username || ''}
            canClose={true}
            onClose={() => setShowEditModal(false)}
          />
        </div>
      )}

      <header className="sticky top-0 z-40">
        <div className="glass-card mx-4 mt-4 mb-8 px-3 pt-1">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
              <div className="flex items-center justify-between gap-3 md:justify-start max-h-20">
                <Link href={"/"} className='mt-1 max-h-20'>
                <Image src="/logo.png" alt="MHG Sofra" width={112} height={112} className="h-20 md:h-28 w-24 md:w-32" priority />
                </Link>

                {username && (
                  <div className="md:hidden animate-user-chip-in">
  <button
    type="button"
    onClick={() => setShowEditModal(true)}
    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 shadow-sm backdrop-blur-sm transition-all duration-150 hover:bg-white/15 active:scale-95 focus:outline-none focus:ring-2 focus:ring-mhg-blue/30 w-full max-w-[220px] mx-auto"
    aria-label="تعديل الاسم"
  >
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mhg-blue/25 text-xs font-bold text-white shadow-inner shrink-0">
      {(username?.trim()?.[0] || 'U').toUpperCase()}
    </span>
    <span className="flex flex-col min-w-0">
      <span className="text-[10px] font-normal text-mhg-gold/80 leading-tight">مرحباً</span>
      <span className="truncate text-[15px] font-bold text-white leading-tight">
        {username}
      </span>
    </span>
  </button>
</div>
                )}
              </div>

              <nav className="flex items-center justify-center -mt-4 mb-4 gap-2 md:hidden">
  <div className="flex w-full justify-center gap-2">

                {quickLinks.map((link) => {
  const isActive = pathname === link.href || pathname?.startsWith(link.href);
  const tabClass = isActive ? link.activeClassName : link.inactiveClassName;
  const iconClass = isActive ? 'text-white' : 'currentColor';
  return (
    <Link
      key={link.href}
      href={link.href}
      title={link.label}
      aria-label={link.label}
      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-colors shadow-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-mhg-blue/40 min-w-[60px] ${tabClass}`}
      style={{minWidth:'60px'}}
    >
      <link.Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${iconClass}`} />
      <span className="text-xs font-bold mt-1 leading-tight" style={{fontSize:'12px'}}>{link.label}</span>
    </Link>
  );
})}
</div>
              </nav>

              <nav className="hidden md:flex items-center justify-center gap-4">
                {quickLinks.map((link) => (
                  <a key={link.href} href={link.href} className={link.className}>
                    <link.Icon className="w-4 h-4" />
                    {link.label}
                  </a>
                ))}
              </nav>

              {username && (
                <div className="hidden md:block animate-user-chip-in">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="group flex items-center justify-end gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-right shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white/15 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mhg-blue/40"
                    aria-label="تعديل الاسم"
                  >
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-mhg-gold/90">مرحباً</span>
                      <span className="block max-w-[260px] truncate text-lg font-extrabold text-white transition-colors group-hover:text-mhg-gold-soft">
                        {username}
                      </span>
                    </span>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-mhg-blue/20 text-base font-extrabold text-white shadow-inner">
                      {(username?.trim()?.[0] || 'U').toUpperCase()}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
