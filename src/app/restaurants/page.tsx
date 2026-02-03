'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RestaurantCard from '@/components/RestaurantCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Restaurant } from '@/lib/types';
import { MEAL_TYPES } from '@/lib/constants';

function RestaurantsContent() {
    const searchParams = useSearchParams();
    const mealType = searchParams.get('mealType');
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mealTypeInfo = MEAL_TYPES.find((mt) => mt.type === mealType);

    useEffect(() => {
        fetchRestaurants();
    }, [mealType]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            setError(null);

            const url = mealType
                ? `/api/restaurants?mealType=${mealType}`
                : '/api/restaurants';

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setRestaurants(data.restaurants);
            } else {
                setError(data.error || 'حدث خطأ أثناء جلب المطاعم');
            }
        } catch (err) {
            setError('حدث خطأ أثناء الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="glass-card mx-4 mt-4 mb-8 p-6">
                <div className="max-w-7xl mx-auto">
                    <a href="/" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
                        ← العودة للرئيسية
                    </a>
                    <div className="flex items-center gap-4">
                        {mealTypeInfo && (
                            <div className="text-5xl">{mealTypeInfo.icon}</div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                {mealTypeInfo?.labelAr || 'المطاعم'}
                            </h1>
                            <p className="text-gray-600">اختر المطعم المفضل لديك</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 pb-12">
                {loading && <LoadingSpinner />}

                {error && <ErrorMessage message={error} onRetry={fetchRestaurants} />}

                {!loading && !error && restaurants.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏪</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            لا توجد مطاعم متاحة
                        </h3>
                        <p className="text-gray-600">
                            لا توجد مطاعم متاحة لهذا النوع من الوجبات حالياً
                        </p>
                    </div>
                )}

                {!loading && !error && restaurants.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map((restaurant: any) => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                mealType={mealType || ''}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function RestaurantsPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <RestaurantsContent />
        </Suspense>
    );
}
