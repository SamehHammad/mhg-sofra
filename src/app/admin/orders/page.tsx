'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { MEAL_TYPES } from '@/lib/constants';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
        fetchOrders();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/admin');
            if (!response.ok) {
                router.push('/admin/login');
            }
        } catch (err) {
            router.push('/admin/login');
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/orders');
            const data = await response.json();

            if (response.ok) {
                setOrders(data.orders);
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
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">إدارة الطلبات</h1>

                <AdminNav />

                {loading && <LoadingSpinner />}

                {error && <ErrorMessage message={error} onRetry={fetchOrders} />}

                {!loading && !error && orders.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد طلبات</h3>
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="glass-card p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                                            {order.user.username}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.orderDate).toLocaleDateString('ar-SA')} •{' '}
                                            {getMealTypeLabel(order.mealType)}
                                        </p>
                                        <p className="text-sm text-gray-600">{order.restaurant.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-indigo-600 mb-1">
                                            {order.totalAmount.toFixed(2)} ر.س
                                        </div>
                                        <div className="text-xs text-gray-500">{order.orderNumber}</div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="font-bold text-gray-800 mb-2">الوجبات:</h4>
                                    <div className="space-y-2">
                                        {order.items.map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <span className="text-gray-700">
                                                    {item.menuItem.name} {item.quantity > 1 && `× ${item.quantity}`}
                                                </span>
                                                <span className="font-bold text-gray-800">
                                                    {(item.price * item.quantity).toFixed(2)} ر.س
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
