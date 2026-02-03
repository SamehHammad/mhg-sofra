import { prisma } from '@/lib/prisma';
import RestaurantCard from '@/components/RestaurantCard';
import { Restaurant } from '@/lib/types';
import { MEAL_TYPES } from '@/lib/constants';
import type { Metadata } from 'next';

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ mealType?: string }>;
}): Promise<Metadata> {
    const { mealType } = await searchParams;
    const mealTypeInfo = MEAL_TYPES.find((mt) => mt.type === mealType);

    const title = mealTypeInfo ? `مطاعم ${mealTypeInfo.labelAr}` : 'المطاعم';
    const description = mealTypeInfo
        ? `اختر مطعمك المفضل لوجبة ${mealTypeInfo.labelAr} وابدأ الطلب الآن.`
        : 'اختر مطعمك المفضل وابدأ الطلب الآن.';

    return {
        title,
        description,
        openGraph: {
            title: `${title} | MHG Sofra`,
            description,
            locale: 'ar_SA',
        },
    };
}

export default async function RestaurantsPage({
    searchParams,
}: {
    searchParams: Promise<{ mealType?: string }>;
}) {
    const { mealType } = await searchParams;

    const mealTypeInfo = MEAL_TYPES.find((mt) => mt.type === mealType);

    const restaurants = (await prisma.restaurant.findMany({
        where: {
            isActive: true,
            ...(mealType && {
                menuItems: {
                    some: {
                        mealType: mealType as any,
                        isAvailable: true,
                    },
                },
            }),
        },
        include: {
            menuItems: {
                where: {
                    isAvailable: true,
                    ...(mealType && { mealType: mealType as any }),
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    })) as unknown as (Restaurant & { menuItems?: any[] })[];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="glass-card mx-4 mt-4 mb-8 p-6">
                <div className="max-w-7xl mx-auto">
                    <a href="/" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
                        ← العودة للرئيسية
                    </a>
                    <div className="flex items-center gap-4">
                        {mealTypeInfo && <div className="text-5xl">{mealTypeInfo.icon}</div>}
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
                {restaurants.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏪</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد مطاعم متاحة</h3>
                        <p className="text-gray-600">
                            لا توجد مطاعم متاحة لهذا النوع من الوجبات حالياً
                        </p>
                    </div>
                )}

                {restaurants.length > 0 && (
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
