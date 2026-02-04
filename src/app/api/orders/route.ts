import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all orders
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mealType = searchParams.get('mealType');
        const date = searchParams.get('date');

        const orders = await prisma.order.findMany({
            where: {
                ...(mealType && { mealType: mealType as any }),
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
            orderBy: {
                orderDate: 'desc',
            },
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب الطلبات' },
            { status: 500 }
        );
    }
}

// POST: Create new order
export async function POST(request: Request) {
    try {
        const { username, restaurantId, mealType, items } = await request.json();

        if (!username || !restaurantId || !mealType || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'جميع الحقول المطلوبة يجب تعبئتها' },
                { status: 400 }
            );
        }

        // Get or create user
        const user = await prisma.user.upsert({
            where: { username },
            update: {},
            create: { username },
        });

        // Calculate total
        const menuItems = await prisma.menuItem.findMany({
            where: {
                id: { in: items.map((item: any) => item.menuItemId) },
            },
        });

        let totalAmount = 0;
        const orderItems = items.map((item: any) => {
            const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
            if (!menuItem) throw new Error('Menu item not found');

            const itemTotal = menuItem.price * (item.quantity || 1);
            totalAmount += itemTotal;

            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity || 1,
                price: menuItem.price,
            };
        });

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Create order
        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: user.id,
                restaurantId,
                mealType,
                totalAmount,
                items: {
                    create: orderItems,
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

        // Send notification
        // Note: In Next.js App Router API routes, we can just call the function.
        // But since sendNotificationToAll is async and we want to return response quickly,
        // we might not await it? Or just await it to be safe.
        const { sendNotificationToAllExcept } = await import('@/lib/notifications');
        await sendNotificationToAllExcept(
            username,
            'طلب جديد! 🍔',
            `تم عمل اوردر جديد من ${order.restaurant.name}`
        );

        return NextResponse.json({ order });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء الطلب' },
            { status: 500 }
        );
    }
}
