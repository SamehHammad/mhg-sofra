'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getOrdersSummary(date?: string | null) {
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
    orderBy: [{ orderDate: 'desc' }, { mealType: 'asc' }],
  });

  const grouped = orders.reduce((acc: any, order: any) => {
    const dateKey = order.orderDate.toISOString().split('T')[0];
    const mealTypeKey = order.mealType;

    if (!acc[dateKey]) acc[dateKey] = {};

    if (!acc[dateKey][mealTypeKey]) {
      acc[dateKey][mealTypeKey] = {
        mealType: mealTypeKey,
        restaurant: order.restaurant.name,
        restaurantPhone: order.restaurant.phone,
        restaurantId: order.restaurantId,
        deliveryFee: order.restaurant.deliveryPrice,
        orders: [],
      };
    }

    acc[dateKey][mealTypeKey].orders.push(order);
    return acc;
  }, {});

  return grouped;
}

export async function deleteOrderAction(orderId: string, username: string) {
  if (!orderId) {
    return { ok: false, error: 'معرّف الطلب غير صالح' } as const;
  }

  if (!username || username.trim().length === 0) {
    return { ok: false, error: 'اسم المستخدم مطلوب' } as const;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) {
    return { ok: false, error: 'الطلب غير موجود' } as const;
  }

  if (order.user.username.trim() !== username.trim()) {
    return { ok: false, error: 'غير مسموح لك بحذف هذا الطلب' } as const;
  }

  await prisma.order.delete({ where: { id: orderId } });

  revalidatePath('/orders');
  return { ok: true } as const;
}
