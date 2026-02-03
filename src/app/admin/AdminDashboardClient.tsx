'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import { adminLogoutAction } from './actions';

export default function AdminDashboardClient({ initialStats }: { initialStats: any }) {
    const [stats] = useState<any>(initialStats);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            setLoading(true);
            await adminLogoutAction();
            router.push('/admin/login');
        } catch (err) {
            console.error('Error logging out:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white transition-all duration-300"
                        disabled={loading}
                    >
                        تسجيل الخروج
                    </button>
                </div>

                <AdminNav />

                {loading && <LoadingSpinner />}

                {!loading && stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="glass-card p-6">
                                <div className="text-4xl mb-2">🏪</div>
                                <div className="text-3xl font-bold text-indigo-600 mb-1">{stats.restaurantsCount}</div>
                                <div className="text-gray-600">مطعم مسجل</div>
                            </div>

                            <div className="glass-card p-6">
                                <div className="text-4xl mb-2">📦</div>
                                <div className="text-3xl font-bold text-indigo-600 mb-1">{stats.ordersCount}</div>
                                <div className="text-gray-600">إجمالي الطلبات</div>
                            </div>

                            <div className="glass-card p-6">
                                <div className="text-4xl mb-2">🔥</div>
                                <div className="text-3xl font-bold text-indigo-600 mb-1">{stats.todayOrders}</div>
                                <div className="text-gray-600">طلبات اليوم</div>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">إجراءات سريعة</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <a
                                    href="/admin/restaurants"
                                    className="p-4 bg-white hover:bg-indigo-50 rounded-xl border-2 border-gray-100 hover:border-indigo-600 transition-all duration-300 flex items-center gap-3"
                                >
                                    <span className="text-3xl">🏪</span>
                                    <div>
                                        <div className="font-bold text-gray-800">إدارة المطاعم</div>
                                        <div className="text-sm text-gray-600">إضافة وتعديل المطاعم</div>
                                    </div>
                                </a>

                                <a
                                    href="/admin/menu"
                                    className="p-4 bg-white hover:bg-indigo-50 rounded-xl border-2 border-gray-100 hover:border-indigo-600 transition-all duration-300 flex items-center gap-3"
                                >
                                    <span className="text-3xl">📋</span>
                                    <div>
                                        <div className="font-bold text-gray-800">إدارة القوائم</div>
                                        <div className="text-sm text-gray-600">إضافة وتعديل الوجبات</div>
                                    </div>
                                </a>

                                <a
                                    href="/admin/orders"
                                    className="p-4 bg-white hover:bg-indigo-50 rounded-xl border-2 border-gray-100 hover:border-indigo-600 transition-all duration-300 flex items-center gap-3"
                                >
                                    <span className="text-3xl">📦</span>
                                    <div>
                                        <div className="font-bold text-gray-800">عرض الطلبات</div>
                                        <div className="text-sm text-gray-600">متابعة جميع الطلبات</div>
                                    </div>
                                </a>

                                <a
                                    href="/orders"
                                    className="p-4 bg-white hover:bg-indigo-50 rounded-xl border-2 border-gray-100 hover:border-indigo-600 transition-all duration-300 flex items-center gap-3"
                                >
                                    <span className="text-3xl">👀</span>
                                    <div>
                                        <div className="font-bold text-gray-800">عرض المستخدم</div>
                                        <div className="text-sm text-gray-600">مشاهدة واجهة المستخدم</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
