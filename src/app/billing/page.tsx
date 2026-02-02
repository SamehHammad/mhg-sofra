'use client';

import { useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { MEAL_TYPES } from '@/lib/constants';
import { BillingSummary } from '@/lib/types';

export default function BillingPage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [mealType, setMealType] = useState('LUNCH');
    const [restaurantId, setRestaurantId] = useState('');
    const [billing, setBilling] = useState<BillingSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [restaurants, setRestaurants] = useState<any[]>([]);

    const fetchBilling = async () => {
        if (!date || !mealType || !restaurantId) {
            alert('الرجاء تعبئة جميع الحقول');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/billing?date=${date}&mealType=${mealType}&restaurantId=${restaurantId}`
            );
            const data = await response.json();

            if (response.ok) {
                setBilling(data.billing);
            } else {
                setError(data.error || 'حدث خطأ أثناء حساب الفاتورة');
                setBilling(null);
            }
        } catch (err) {
            setError('حدث خطأ أثناء الاتصال بالخادم');
            setBilling(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchRestaurants = async (selectedMealType: string) => {
        try {
            const response = await fetch(`/api/restaurants?mealType=${selectedMealType}`);
            const data = await response.json();
            if (response.ok) {
                setRestaurants(data.restaurants);
                if (data.restaurants.length > 0) {
                    setRestaurantId(data.restaurants[0].id);
                }
            }
        } catch (err) {
            console.error('Error fetching restaurants:', err);
        }
    };

    const handleMealTypeChange = (newMealType: string) => {
        setMealType(newMealType);
        setRestaurantId('');
        fetchRestaurants(newMealType);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="glass-card mx-4 mt-4 mb-8 p-6 print:hidden">
                <div className="max-w-7xl mx-auto">
                    <a href="/" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
                        ← العودة للرئيسية
                    </a>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">الحساب والفواتير</h1>
                    <p className="text-gray-600">حساب الفواتير وتقسيم سعر التوصيل</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 pb-12">
                {/* Filters */}
                <div className="glass-card p-6 mb-8 print:hidden">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">اختر التفاصيل</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                التاريخ
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input-modern"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                نوع الوجبة
                            </label>
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
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                المطعم
                            </label>
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

                    <button onClick={fetchBilling} className="btn-primary w-full">
                        حساب الفاتورة
                    </button>
                </div>

                {/* Results */}
                {loading && <LoadingSpinner />}

                {error && <ErrorMessage message={error} />}

                {billing && (
                    <div className="glass-card p-8">
                        <div className="flex items-center justify-between mb-6 print:mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">فاتورة الطلب</h2>
                                <p className="text-gray-600">
                                    {new Date(billing.date).toLocaleDateString('ar-SA')} •{' '}
                                    {MEAL_TYPES.find((mt) => mt.type === billing.mealType)?.labelAr}
                                </p>
                            </div>
                            <button onClick={handlePrint} className="btn-primary print:hidden">
                                طباعة
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="text-lg font-bold text-gray-800 mb-2">
                                {billing.restaurant}
                            </div>
                            <div className="text-sm text-gray-600">
                                سعر التوصيل: {billing.deliveryFee.toFixed(2)} ر.س
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            {billing.users.map((user, index) => (
                                <div key={index} className="border-r-4 border-indigo-600 pr-4 bg-white/50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl font-bold text-gray-800">{user.username}</h3>
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {user.total.toFixed(2)} ر.س
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        {user.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700">
                                                    {item.name} {item.quantity > 1 && `× ${item.quantity}`}
                                                </span>
                                                <span className="font-bold text-gray-800">
                                                    {(item.price * item.quantity).toFixed(2)} ر.س
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-200 pt-2 space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">المجموع الفرعي</span>
                                            <span className="font-bold">{user.subtotal.toFixed(2)} ر.س</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">نصيب التوصيل</span>
                                            <span className="font-bold">{user.deliveryShare.toFixed(2)} ر.س</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t-2 border-gray-300 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-gray-800">المجموع الكلي</span>
                                <span className="text-3xl font-bold text-indigo-600">
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
