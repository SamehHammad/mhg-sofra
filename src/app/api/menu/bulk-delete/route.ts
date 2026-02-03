import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token');
        if (!token?.value) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const admin = await prisma.admin.findUnique({ where: { id: token.value } });
        if (!admin) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const restaurantId = typeof body?.restaurantId === 'string' ? body.restaurantId.trim() : '';
        const deleteAll = Boolean(body?.deleteAll);

        const menuWhere = deleteAll ? {} : restaurantId ? { restaurantId } : {};

        const { deletedOrderItemsCount, deletedMenuItemsCount } = await prisma.$transaction(async (tx) => {
            const menuItems = await tx.menuItem.findMany({
                where: menuWhere,
                select: { id: true },
            });

            if (menuItems.length === 0) {
                return { deletedOrderItemsCount: 0, deletedMenuItemsCount: 0 };
            }

            const menuItemIds = menuItems.map((m) => m.id);

            const orderItemsDeleteResult = await tx.orderItem.deleteMany({
                where: {
                    menuItemId: { in: menuItemIds },
                },
            });

            const menuItemsDeleteResult = await tx.menuItem.deleteMany({
                where: { id: { in: menuItemIds } },
            });

            return {
                deletedOrderItemsCount: orderItemsDeleteResult.count,
                deletedMenuItemsCount: menuItemsDeleteResult.count,
            };
        });

        return NextResponse.json({
            success: true,
            deletedCount: deletedMenuItemsCount,
            deletedMenuItemsCount,
            deletedOrderItemsCount,
        });
    } catch (error) {
        console.error('Error bulk deleting menu items:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء حذف الوجبات' }, { status: 500 });
    }
}
