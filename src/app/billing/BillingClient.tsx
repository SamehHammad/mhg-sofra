'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { MEAL_TYPES } from '@/lib/constants';
import { BillingSummary } from '@/lib/types';
import { calculateBillingAction, getRestaurantsForMealTypeAction } from './actions';

export default function BillingClient({
    initialDate,
    initialMealType,
    initialRestaurants,
}: {
    initialDate: string;
    initialMealType: string;
    initialRestaurants: any[];
}) {
    const [date, setDate] = useState(initialDate);
    const [mealType, setMealType] = useState(initialMealType);
    const [restaurantId, setRestaurantId] = useState('');
    const [billing, setBilling] = useState<BillingSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [restaurants, setRestaurants] = useState<any[]>(initialRestaurants);

    useEffect(() => {
        if (initialRestaurants.length > 0) {
            setRestaurantId(initialRestaurants[0].id);
        }
    }, [initialRestaurants]);

    const fetchBilling = async () => {
        if (!date || !mealType || !restaurantId) {
            alert('الرجاء تعبئة جميع الحقول');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await calculateBillingAction({ date, mealType, restaurantId });
            if (result.ok) {
                setBilling(result.billing);
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

    const handleMealTypeChange = async (newMealType: string) => {
        setMealType(newMealType);
        setRestaurantId('');
        setBilling(null);

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
                                                    {item.name} {item.quantity > 1 && `× ${item.quantity}`}
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
