import { prisma } from '@/lib/prisma';
import { Restaurant, MenuItem } from '@/lib/types';
import MenuClient from './MenuClient';
import type { Metadata } from 'next';

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ mealType?: string }>;
}): Promise<Metadata> {
    const { id: restaurantId } = await params;
    const { mealType } = await searchParams;

    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { name: true },
    });

    const title = restaurant?.name ? `قائمة ${restaurant.name}` : 'قائمة المطعم';
    const description = restaurant?.name
        ? `استعرض قائمة ${restaurant.name}${mealType ? ` لوجبة ${mealType}` : ''} واختر وجباتك.`
        : 'استعرض قائمة المطعم واختر وجباتك.';

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

export default async function MenuPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ mealType?: string }>;
}) {
    const { id: restaurantId } = await params;
    const { mealType } = await searchParams;

    const restaurant = (await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
            menuItems: {
                where: { isAvailable: true },
                orderBy: { name: 'asc' },
            },
        },
    })) as unknown as (Restaurant & { menuItems: MenuItem[] }) | null;

    if (!restaurant) {
        return (
            <div className="min-h-screen pb-32">
                <header className="glass-card mx-4 mt-4 mb-8 p-6">
                    <div className="max-w-7xl mx-auto">
                        <a
                            href={`/restaurants?mealType=${mealType || ''}`}
                            className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
                        >
                            ← العودة للمطاعم
                        </a>
                        <div>
                            <h1 className="text-3xl font-bold text-mhg-gold mb-2">المطعم غير موجود</h1>
                        </div>
                    </div>
                </header>
            </div>
        );
    }

    return (
        <MenuClient
            restaurant={restaurant}
            menuItems={restaurant.menuItems || []}
            mealType={mealType || ''}
        />
    );
}
