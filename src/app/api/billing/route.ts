import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBilling } from '@/lib/billing';

// GET: Calculate billing for specific date and meal type
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const mealType = searchParams.get('mealType');
        const restaurantId = searchParams.get('restaurantId');

        if (!date || !mealType || !restaurantId) {
            return NextResponse.json(
                { error: 'التاريخ ونوع الوجبة والمطعم مطلوبة' },
                { status: 400 }
            );
        }

        const start = new Date(`${date}T00:00:00`);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        // Fetch orders
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
            return NextResponse.json(
                { error: 'لا توجد طلبات لهذا التاريخ ونوع الوجبة' },
                { status: 404 }
            );
        }

        const restaurant = orders[0].restaurant;
        const billing = calculateBilling(
            orders as any,
            restaurant.deliveryPrice,
            restaurant.name,
            mealType,
            date
        );

        return NextResponse.json({ billing });
    } catch (error) {
        console.error('Error calculating billing:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء حساب الفاتورة' },
            { status: 500 }
        );
    }
}
