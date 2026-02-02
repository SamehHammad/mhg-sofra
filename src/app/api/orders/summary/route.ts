import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Get orders summary grouped by date and meal type
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        const orders = await prisma.order.findMany({
            where: {
                ...(date && {
                    orderDate: {
                        gte: new Date(date + 'T00:00:00'),
                        lt: new Date(date + 'T23:59:59'),
                    },
                }),
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
            orderBy: [
                { orderDate: 'desc' },
                { mealType: 'asc' },
            ],
        });

        // Group by date and meal type
        const grouped = orders.reduce((acc: any, order) => {
            const dateKey = order.orderDate.toISOString().split('T')[0];
            const mealTypeKey = order.mealType;

            if (!acc[dateKey]) {
                acc[dateKey] = {};
            }

            if (!acc[dateKey][mealTypeKey]) {
                acc[dateKey][mealTypeKey] = {
                    mealType: mealTypeKey,
                    restaurant: order.restaurant.name,
                    restaurantId: order.restaurantId,
                    deliveryFee: order.restaurant.deliveryPrice,
                    orders: [],
                };
            }

            acc[dateKey][mealTypeKey].orders.push(order);

            return acc;
        }, {});

        return NextResponse.json({ summary: grouped });
    } catch (error) {
        console.error('Error fetching orders summary:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب ملخص الطلبات' },
            { status: 500 }
        );
    }
}
