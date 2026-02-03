'use client';

import { useLayoutEffect, useState } from 'react';
import Image from 'next/image';
import UsernameModal from '@/components/UsernameModal';
import { SESSION_KEYS } from '@/lib/constants';
import { Calculator, LayoutDashboard, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
      activeClassName: 'bg-indigo-600 text-white shadow-md',
      inactiveClassName: 'bg-white/70 text-indigo-700 hover:bg-indigo-50',
      className:
        'px-6 py-3 rounded-xl font-bold bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2',
    },
    {
      href: '/billing',
      label: 'الحساب والفواتير',
      Icon: Calculator,
      activeClassName: 'bg-emerald-600 text-white shadow-md',
      inactiveClassName: 'bg-white/70 text-emerald-700 hover:bg-emerald-50',
      className:
        'px-6 py-3 rounded-xl font-bold bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2',
    },
    {
      href: '/admin/login',
      label: 'لوحة الإدارة',
      Icon: LayoutDashboard,
      activeClassName: 'bg-gray-900 text-white shadow-md',
      inactiveClassName: 'bg-white/70 text-gray-800 hover:bg-gray-100',
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
      const response = await fetch('/api/auth/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
      });

      if (response.ok) {
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
        <div className="glass-card mx-4 mt-4 mb-8 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
              <div className="flex items-center justify-between gap-3 md:justify-start">
                <Link href={"/"}>
                <Image src="/logo.png" alt="MHG Sofra" width={80} height={80} className="h-16 md:h-20 w-auto" priority />
                </Link>

                {username && (
                  <div className="text-left md:hidden">
                    <p className="text-xs text-gray-600">مرحباً</p>
                    <p className="text-lg font-bold text-indigo-600 cursor-pointer" onClick={() => setShowEditModal(true)}>
                      {username}
                    </p>
                  </div>
                )}
              </div>

              <nav className="flex items-center justify-center gap-2 md:hidden">
                {quickLinks.map((link) => (
                  (() => {
                    const isActive = pathname === link.href || pathname?.startsWith(link.href);
                    const tabClass = isActive ? link.activeClassName : link.inactiveClassName;
                    const iconClass = isActive ? 'text-white' : 'currentColor';

                    return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={link.label}
                    aria-label={link.label}
                    className={`relative group p-2.5 rounded-2xl transition-colors shadow-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${tabClass}`}
                  >
                    <link.Icon className={`w-5 h-5 ${iconClass}`} />
                    <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      {link.label}
                    </span>
                  </Link>
                    );
                  })()
                ))}
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
                <div className="text-right hidden md:block">
                  <p className="text-sm text-gray-600">مرحباً</p>
                  <div className="flex items-center justify-end gap-2">
                    <p className="text-xl font-bold text-indigo-600 cursor-pointer" onClick={() => setShowEditModal(true)}>
                      {username}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
