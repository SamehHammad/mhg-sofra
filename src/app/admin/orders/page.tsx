'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { MEAL_TYPES } from '@/lib/constants';
import { useNotification } from '@/context/NotificationContext';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [deleting, setDeleting] = useState(false);

    const router = useRouter();
    const { showNotification, showConfirm } = useNotification();

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

    const handleDeleteAll = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeleting(true);
        try {
            const response = await fetch('/api/admin/orders/delete-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('تم الحذف', 'تم حذف جميع الطلبات بنجاح', 'success');
                setOrders([]);
                setShowPasswordModal(false);
                setPassword('');
            } else {
                showNotification('خطأ', data.error || 'فشل الحذف', 'error');
            }
        } catch (err) {
            showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const getMealTypeLabel = (type: string) => {
        return MEAL_TYPES.find((mt) => mt.type === type)?.labelAr || type;
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">إدارة الطلبات</h1>
                    {orders.length > 0 && (
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg hover:shadow-red-200"
                        >
                            🗑️ حذف جميع الطلبات
                        </button>
                    )}
                </div>

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
                                            {order.totalAmount.toFixed(2)} جنيه
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
                                                    {(item.price * item.quantity).toFixed(2)} جنيه
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Password Confirmation Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-[scale-in_0.3s_ease-out]">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">تأكيد الحذف النهائي</h3>
                            <p className="text-gray-600 mb-6 text-center">
                                هل أنت متأكد من رغبتك في حذف جميع الطلبات؟ لا يمكن التراجع عن هذا الإجراء.
                                <br />
                                <span className="text-red-600 font-bold">الرجاء إدخال بيانات التسجيل (كلمة المرور) للتأكيد.</span>
                            </p>

                            <form onSubmit={handleDeleteAll}>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="أدخل كلمة المرور"
                                    className="input-modern mb-6"
                                    required
                                    autoFocus
                                />

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            setPassword('');
                                        }}
                                        className="flex-1 px-4 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={deleting}
                                        className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg shadow-red-200 disabled:opacity-50"
                                    >
                                        {deleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
