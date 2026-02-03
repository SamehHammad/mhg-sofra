'use server';

import { prisma } from '@/lib/prisma';
import { calculateBilling } from '@/lib/billing';

export async function getRestaurantsForMealTypeAction(mealType: string) {
    const restaurants = await prisma.restaurant.findMany({
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
        orderBy: {
            name: 'asc',
        },
    });

    return restaurants;
}

export async function calculateBillingAction(input: {
    date: string;
    mealType: string;
    restaurantId: string;
}) {
    const { date, mealType, restaurantId } = input;

    if (!date || !mealType || !restaurantId) {
        return { ok: false, error: 'التاريخ ونوع الوجبة والمطعم مطلوبة' } as const;
    }

    try {
        const start = new Date(`${date}T00:00:00`);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const orders = await prisma.order.findMany({
            where: {
                restaurantId,
                mealType: mealType as any,
                orderDate: {
                    gte: start,
                    lt: end,
                },
            },
            include: {
                user: true,
                restaurant: true,
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
        });

        if (orders.length === 0) {
            return { ok: false, error: 'لا توجد طلبات لهذا التاريخ ونوع الوجبة' } as const;
        }

        const restaurant = orders[0].restaurant;
        const billing = calculateBilling(
            orders as any,
            restaurant.deliveryPrice,
            restaurant.name,
            mealType,
            date
        );

        return { ok: true, billing } as const;
    } catch (error) {
        console.error('Error calculating billing:', error);
        return { ok: false, error: 'حدث خطأ أثناء حساب الفاتورة' } as const;
    }
}
