'use server';

import { prisma } from '@/lib/prisma';
import { sendNotificationToUser } from '@/lib/notifications';

export async function createOrderAction(input: {
    username: string;
    restaurantId: string;
    mealType: string;
    items: { menuItemId: string; quantity: number; selectedOption?: string | null }[];
}) {
    const { username, restaurantId, mealType, items } = input;

    if (!username || !restaurantId || !mealType || !items || items.length === 0) {
        return { ok: false, error: 'جميع الحقول المطلوبة يجب تعبئتها' } as const;
    }

    try {
        const user = await prisma.user.upsert({
            where: { username },
            update: {},
            create: { username },
        });

        const menuItems = await prisma.menuItem.findMany({
            where: {
                id: { in: items.map((item) => item.menuItemId) },
            },
        });

        let totalAmount = 0;
        const orderItems = items.map((item) => {
            const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
            if (!menuItem) throw new Error('Menu item not found');

            const itemTotal = menuItem.price * (item.quantity || 1);
            totalAmount += itemTotal;

            return {
                menuItemId: item.menuItemId,
                quantity: item.quantity || 1,
                price: menuItem.price,
                selectedOption: item.selectedOption || null,
            };
        });

        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`;


        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: user.id,
                restaurantId,
                mealType: mealType as any,
                totalAmount,
                items: {
                    create: orderItems,
                },
            },
        });

        // Send notification to user
        await sendNotificationToUser(
            user.username,
            'تم استلام الطلب ✅',
            `تم استلام طلبك بنجاح! رقم الطلب: ${orderNumber}`,
            `${process.env.NEXT_PUBLIC_BASE_URL}/orders`
        );

        return { ok: true } as const;
    } catch (error) {
        console.error('Error creating order:', error);
        return { ok: false, error: 'حدث خطأ أثناء إنشاء الطلب' } as const;
    }
}
