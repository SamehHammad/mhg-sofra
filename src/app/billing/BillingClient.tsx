'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { MEAL_TYPES } from '@/lib/constants';
import { BillingSummary } from '@/lib/types';
import { calculateBillingAction, getRestaurantsForMealTypeAction } from './actions';
import { useNotification } from '@/context/NotificationContext';

export default function BillingClient({
    initialDate,
    initialMealType,
    initialRestaurants,
    initialRestaurantId,
}: {
    initialDate: string;
    initialMealType: string;
    initialRestaurants: any[];
    initialRestaurantId?: string;
}) {
    const [date, setDate] = useState(initialDate);
    const [mealType, setMealType] = useState(initialMealType);
    const [restaurantId, setRestaurantId] = useState(initialRestaurantId || '');
    const [billing, setBilling] = useState<BillingSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [restaurants, setRestaurants] = useState<any[]>(initialRestaurants);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [sendingNotifications, setSendingNotifications] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        if (!initialRestaurantId && initialRestaurants.length > 0) {
            setRestaurantId(initialRestaurants[0].id);
        } else if (initialRestaurantId) {
            setRestaurantId(initialRestaurantId);
        }
    }, [initialRestaurants, initialRestaurantId]);

    // Auto-fetch if all params are present (e.g. from notification link)
    useEffect(() => {
        if (initialDate && initialMealType && initialRestaurantId) {
            // We need to define fetchBilling as a reusable function or move it outside
            // For simplicity, let's just copy the logic or trigger it
            // Better yet, let's extract fetchBilling Logic or just call it if we can
            // Since fetchBilling depends on state, and state is sync, we can't call it immediately usually
            // But here we rely on initial props, so we can call the action directly
            const loadInitialBilling = async () => {
                try {
                    setLoading(true);
                    const result = await calculateBillingAction({
                        date: initialDate,
                        mealType: initialMealType,
                        restaurantId: initialRestaurantId
                    });
                    if (result.ok) {
                        setBilling(result.billing);
                    } else {
                        // Don't show error immediately on load to avoid jarring UI if it's just empty
                        console.error(result.error);
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            loadInitialBilling();
        }
    }, [initialDate, initialMealType, initialRestaurantId]);

    const fetchBilling = async () => {
        if (!date || !mealType || !restaurantId) {
            alert('الرجاء تعبئة جميع الحقول');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setShowNotificationModal(false);

            const result = await calculateBillingAction({ date, mealType, restaurantId });
            if (result.ok) {
                setBilling(result.billing);
                setShowNotificationModal(true);
            } else {
                setError(result.error || 'حدث خطأ أثناء حساب الفاتورة');
                setBilling(null);
            }
        } catch (err) {
            setError('حدث خطأ أثناء الاتصال بالخادم');
            setBilling(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotifications = async () => {
        if (!billing) return;
        setSendingNotifications(true);
        try {
            // Dynamically import to avoid server-side issues in some setups, or just use the action
            const { sendBillingNotificationsAction } = await import('./actions');
            const result = await sendBillingNotificationsAction(billing);
            if (result.ok) {
                showNotification('نجاح', 'تم إرسال الإشعارات بنجاح', 'success');
            } else {
                showNotification('خطأ', 'حدث خطأ أثناء إرسال الإشعارات', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('خطأ', 'حدث خطأ غير متوقع', 'error');
        } finally {
            setSendingNotifications(false);
            setShowNotificationModal(false);
        }
    };

    const handleMealTypeChange = async (newMealType: string) => {
        setMealType(newMealType);
        setRestaurantId('');
        setBilling(null);
        setShowNotificationModal(false);

        try {
            setLoading(true);
            setError(null);
            const nextRestaurants = await getRestaurantsForMealTypeAction(newMealType);
            setRestaurants(nextRestaurants);
            if (nextRestaurants.length > 0) {
                setRestaurantId(nextRestaurants[0].id);
            }
        } catch (err) {
            setError('حدث خطأ أثناء الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen">
            <header className="glass-card mx-4 mt-4 mb-8 p-6 print:hidden">
                <div className="max-w-7xl mx-auto">
                    <a href="/" className="text-mhg-blue hover:text-mhg-blue-deep mb-4 inline-block">
                        ← العودة للرئيسية
                    </a>
                    <h1 className="text-3xl font-bold text-mhg-gold mb-2">حساب الطلبات</h1>
                    <p className="text-mhg-gold">حساب الفواتير وتقسيم سعر التوصيل</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 pb-12">
                <div className="glass-card p-6 mb-8 print:hidden">
                    <h2 className="text-xl font-bold text-mhg-gold mb-4">اختر التفاصيل</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-mhg-blue-deep mb-2">التاريخ</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input-modern"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-mhg-blue-deep mb-2">نوع الوجبة</label>
                            <select
                                value={mealType}
                                onChange={(e) => handleMealTypeChange(e.target.value)}
                                className="input-modern"
                            >
                                {MEAL_TYPES.map((mt) => (
                                    <option key={mt.type} value={mt.type}>
                                        {mt.labelAr}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-mhg-blue-deep mb-2">المطعم</label>
                            <select
                                value={restaurantId}
                                onChange={(e) => setRestaurantId(e.target.value)}
                                className="input-modern"
                                disabled={restaurants.length === 0}
                            >
                                <option value="">اختر المطعم</option>
                                {restaurants.map((restaurant) => (
                                    <option key={restaurant.id} value={restaurant.id}>
                                        {restaurant.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button onClick={fetchBilling} className="btn-primary w-full" disabled={loading}>
                        حساب الفاتورة
                    </button>
                </div>

                {loading && <LoadingSpinner />}

                {error && <ErrorMessage message={error} />}

                {/* Notification Modal */}
                {showNotificationModal && billing && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                            <h3 className="text-xl font-bold text-mhg-gold mb-4 text-center">
                                حساب الفاتورة اكتمل
                            </h3>
                            <p className="text-gray-600 mb-6 text-center">
                                تم حساب الفاتورة بنجاح. هل ترغب في إرسال إشعار لكل مستخدم بقيمة فاتورته؟
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleSendNotifications}
                                    disabled={sendingNotifications}
                                    className="flex-1 bg-mhg-blue text-white py-2 rounded-lg hover:bg-mhg-blue-deep transition disabled:opacity-50"
                                >
                                    {sendingNotifications ? 'جارِ الإرسال...' : 'نعم، أرسل الإشعارات'}
                                </button>
                                <button
                                    onClick={() => setShowNotificationModal(false)}
                                    disabled={sendingNotifications}
                                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                                >
                                    لا، شكراً
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {billing && (
                    <div className="glass-card p-8">
                        <div className="flex items-center justify-between mb-6 print:mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-mhg-gold">فاتورة الطلب</h2>
                                <p className="text-mhg-gold">
                                    {new Date(billing.date).toLocaleDateString('ar-SA')} •{' '}
                                    {MEAL_TYPES.find((mt) => mt.type === billing.mealType)?.labelAr}
                                </p>
                            </div>
                            <button onClick={handlePrint} className="btn-primary print:hidden">
                                طباعة
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="text-lg font-bold text-mhg-gold mb-2">{billing.restaurant}</div>
                            <div className="text-sm text-mhg-gold">
                                سعر التوصيل: {billing.deliveryFee.toFixed(2)} جنيه
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            {billing.users.map((user, index) => (
                                <div
                                    key={index}
                                    className="border-r-4 border-mhg-gold pr-4 bg-white/50 rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl font-bold text-mhg-gold">{user.username}</h3>
                                        <div className="text-2xl font-bold text-mhg-blue">
                                            {user.total.toFixed(2)} جنيه
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        {user.items.map((item, itemIndex) => (
                                            <div
                                                key={itemIndex}
                                                className="flex items-center justify-between text-sm"
                                            >
                                                <span className="text-mhg-blue-deep">
                                                    {item.name}
                                                    {item.selectedOption && (
                                                        <span className="mr-2 text-xs font-bold px-2 py-0.5 rounded bg-mhg-gold/10 text-mhg-gold border border-mhg-gold/20">
                                                            {item.selectedOption}
                                                        </span>
                                                    )}
                                                    {item.quantity > 1 && ` × ${item.quantity}`}
                                                </span>
                                                <span className="font-bold text-mhg-gold">
                                                    {(item.price * item.quantity).toFixed(2)} جنيه
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-200 pt-2 space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-mhg-gold">المجموع الفرعي</span>
                                            <span className="font-bold">{user.subtotal.toFixed(2)} ر.س</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-mhg-gold">نصيب التوصيل</span>
                                            <span className="font-bold">
                                                {user.deliveryShare.toFixed(2)} ر.س
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t-2 border-gray-300 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-mhg-gold">المجموع الكلي</span>
                                <span className="text-3xl font-bold text-mhg-blue">
                                    {billing.grandTotal.toFixed(2)} ر.س
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
