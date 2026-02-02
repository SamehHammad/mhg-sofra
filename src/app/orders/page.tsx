'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { MEAL_TYPES } from '@/lib/constants';

export default function OrdersPage() {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/orders/summary');
            const data = await response.json();

            if (response.ok) {
                setSummary(data.summary);
            } else {
                setError(data.error || 'حدث خطأ أثناء جلب الطلبات');
            }
        } catch (err) {
            setError('حدث خطأ أثناء الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const getMealTypeLabel = (type: string) => {
        return MEAL_TYPES.find((mt) => mt.type === type)?.labelAr || type;
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="glass-card mx-4 mt-4 mb-8 p-6">
                <div className="max-w-7xl mx-auto">
                    <a href="/" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
                        ← العودة للرئيسية
                    </a>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">الطلبات</h1>
                    <p className="text-gray-600">عرض جميع الطلبات مرتبة حسب التاريخ ونوع الوجبة</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 pb-12">
                {loading && <LoadingSpinner />}

                {error && <ErrorMessage message={error} onRetry={fetchOrders} />}

                {!loading && !error && (!summary || Object.keys(summary).length === 0) && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد طلبات</h3>
                        <p className="text-gray-600 mb-6">لم يتم تقديم أي طلبات بعد</p>
                        <a href="/" className="btn-primary inline-block">
                            ابدأ الطلب الآن
                        </a>
                    </div>
                )}

                {!loading && !error && summary && Object.keys(summary).length > 0 && (
                    <div className="space-y-8">
                        {Object.entries(summary).map(([date, mealTypes]: [string, any]) => (
                            <div key={date} className="glass-card p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span>📅</span>
                                    {new Date(date).toLocaleDateString('ar-SA', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </h2>

                                <div className="space-y-6">
                                    {Object.entries(mealTypes).map(([mealType, data]: [string, any]) => (
                                        <div key={mealType} className="border-r-4 border-indigo-600 pr-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold text-gray-800">
                                                    {getMealTypeLabel(mealType)}
                                                </h3>
                                                <div className="text-sm text-gray-600">
                                                    {data.restaurant} {data.restaurantPhone && `• ${data.restaurantPhone}`} • توصيل: {data.deliveryFee} جنيه
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {data.orders.map((order: any) => (
                                                    <div key={order.id} className="bg-white/50 rounded-lg p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="font-bold text-gray-800">
                                                                {order.user.username}
                                                            </div>
                                                            <div className="text-sm font-bold text-indigo-600">
                                                                {order.totalAmount.toFixed(2)} جنيه
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {order.items.map((item: any) => (
                                                                <div
                                                                    key={item.id}
                                                                    className="text-sm text-gray-600 flex items-center justify-between"
                                                                >
                                                                    <span>
                                                                        {item.menuItem.name} {item.quantity > 1 && `× ${item.quantity}`}
                                                                    </span>
                                                                    <span>{(item.price * item.quantity).toFixed(2)} جنيه</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
