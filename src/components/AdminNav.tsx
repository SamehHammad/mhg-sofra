'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/admin', label: 'لوحة التحكم', icon: '📊' },
        { href: '/admin/restaurants', label: 'المطاعم', icon: '🏪' },
        { href: '/admin/menu', label: 'القوائم', icon: '📋' },
        { href: '/admin/orders', label: 'الطلبات', icon: '📦' },
    ];

    return (
        <nav className="glass-card p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 w-full text-center">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${pathname === item.href
                                    ? 'bg-mhg-brown text-white shadow-lg'
                                    : 'bg-white hover:bg-mhg-gold/10 text-gray-700'
                                }`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
