import { prisma } from '@/lib/prisma';
import BillingClient from './BillingClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'حساب الطلبات',
    description: 'احسب الفواتير وقسّم سعر التوصيل بين المشاركين بسهولة.',
    openGraph: {
        title: 'حساب الطلبات | MHG Sofra',
        description: 'احسب الفواتير وقسّم سعر التوصيل بين المشاركين بسهولة.',
        locale: 'ar_SA',
    },
};

export default async function BillingPage({
    searchParams,
}: {
    searchParams: Promise<{ date?: string; mealType?: string; restaurantId?: string }>;
}) {
    const { date, mealType, restaurantId } = await searchParams;

    const today = new Date().toISOString().split('T')[0];
    const initialDate = date || today;
    const initialMealType = mealType || 'LUNCH';
    const initialRestaurantId = restaurantId || '';

    const initialRestaurants = await prisma.restaurant.findMany({
        where: {
            isActive: true,
            menuItems: {
                some: {
                    mealType: initialMealType as any,
                    isAvailable: true,
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    });

    return (
        <BillingClient
            initialDate={initialDate}
            initialMealType={initialMealType}
            initialRestaurants={JSON.parse(JSON.stringify(initialRestaurants))}
            initialRestaurantId={initialRestaurantId}
        />
    );
}
