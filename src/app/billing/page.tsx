import { prisma } from '@/lib/prisma';
import BillingClient from './BillingClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'الحساب والفواتير',
    description: 'احسب الفواتير وقسّم سعر التوصيل بين المشاركين بسهولة.',
    openGraph: {
        title: 'الحساب والفواتير | MHG Sofra',
        description: 'احسب الفواتير وقسّم سعر التوصيل بين المشاركين بسهولة.',
        locale: 'ar_SA',
    },
};

export default async function BillingPage() {
    const initialDate = new Date().toISOString().split('T')[0];
    const initialMealType = 'LUNCH';

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
            initialRestaurants={initialRestaurants}
        />
    );
}
