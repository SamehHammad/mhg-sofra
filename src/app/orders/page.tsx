'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { MEAL_TYPES } from '@/lib/constants';
import { useNotification } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';
import UsernameModal from '@/components/UsernameModal';

export default function OrdersPage() {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [showUsernameModal, setShowUsernameModal] = useState(false);

    const { showNotification, showConfirm } = useNotification();
    const router = useRouter();

    useEffect(() => {
        // Get username from session for ownership verification
        const storedUsername = sessionStorage.getItem('username');
        setUsername(storedUsername);
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

    const handleDeleteOrder = async (orderId: string) => {
        showConfirm('حذف الطلب', 'هل أنت متأكد من رغبتك في حذف هذا الطلب؟', async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    showNotification('تم الحذف', 'تم حذف الطلب بنجاح', 'success');
                    fetchOrders();
                } else {
                    const data = await response.json();
                    showNotification('خطأ', data.error || 'فشل حذف الطلب', 'error');
                }
            } catch (err) {
                showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
            }
        });
    };

    const handleEditOrder = async (order: any) => {
        showConfirm('تعديل الطلب', 'سيتم حذف الطلب الحالي وإعادة توجيهك لصفحة المطعم لإنشاء طلب جديد. هل تريد المتابعة؟', async () => {
            try {
                // Delete the current order first
                const response = await fetch(`/api/orders/${order.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    showNotification('جاري التوجيه', 'تم حذف الطلب، جاري توجيهك للتعديل...', 'info');
                    // Store meal type in session or URL params if needed, but selecting restaurant is enough usually.
                    // Ideally we could populate the cart, but for now simple redirect is good.
                    router.push(`/menu/${order.restaurantId}`);
                } else {
                    const data = await response.json();
                    showNotification('خطأ', data.error || 'فشل تعديل الطلب', 'error');
                }
            } catch (err) {
                showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
            }
        });
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
                    {username && (
                        <div
                            className="mt-4 inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors group relative"
                            onClick={() => setShowUsernameModal(true)}
                            title="انقر لتغيير الاسم"
                        >
                            <span className="text-sm text-gray-600">تسجيل الدخول اسم: </span>
                            <span className="font-bold text-indigo-600 border-b border-dashed border-indigo-400 pb-0.5">{username}</span>
                            <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
                        </div>
                    )}
                </div>
            </header>

            {showUsernameModal && (
                <div className="relative z-[9999]">
                    <UsernameModal
                        initialUsername={username || ''}
                        canClose={true}
                        onClose={() => setShowUsernameModal(false)}
                        onSubmit={(newUsername) => {
                            sessionStorage.setItem('username', newUsername);
                            setUsername(newUsername);
                            setShowUsernameModal(false);
                            showNotification('تم التحديث', `تم تغيير الاسم إلى ${newUsername}`, 'success');
                        }}
                    />
                </div>
            )}

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
                                                    <div key={order.id} className="bg-white/50 rounded-lg p-4 group relative hover:shadow-md transition-shadow">
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

                                                        {username && order.user.username && username.trim() === order.user.username.trim() && (
                                                            <div className="absolute top-2 left-2 z-10 bg-white/95 rounded-lg p-1 shadow-sm border border-gray-100 flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditOrder(order)}
                                                                    className="text-indigo-600 hover:text-indigo-700 px-2 py-1 text-xs font-bold flex items-center gap-1 hover:bg-indigo-50 rounded transition-colors"
                                                                    title="تعديل الطلب"
                                                                >
                                                                    ✏️ تعديل
                                                                </button>
                                                                <div className="w-px bg-gray-200"></div>
                                                                <button
                                                                    onClick={() => handleDeleteOrder(order.id)}
                                                                    className="text-red-600 hover:text-red-700 px-2 py-1 text-xs font-bold flex items-center gap-1 hover:bg-red-50 rounded transition-colors"
                                                                    title="حذف الطلب"
                                                                >
                                                                    🗑️ حذف
                                                                </button>
                                                            </div>
                                                        )}
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
