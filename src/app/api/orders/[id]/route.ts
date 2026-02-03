import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: Update order (edit items)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { items } = await request.json();

        // Recalculate total amount
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await prisma.menuItem.findUnique({
                where: { id: item.menuItemId },
            });

            if (menuItem) {
                const itemTotal = menuItem.price * item.quantity;
                totalAmount += itemTotal;
                orderItems.push({
                    id: item.id, // If exisiting item
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    price: menuItem.price, // Keep original price or update? Updating to current price seems safer for simplicity, or keep old? Let's use current.
                });
            }
        }

        // Transaction to update order and items
        // Simplified: Delete old items and recreate? Or update?
        // Updating is better for preserving IDs if possible, but recreating is easier.
        // Let's go with delete and recreate for simplicity of logic, or update if ID exists.

        // Actually, prisma update with nested deleteMany and create is clean.

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                totalAmount,
                items: {
                    deleteMany: {},
                    create: orderItems.map(item => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            },
            include: {
                items: {
                    include: { menuItem: true }
                }
            }
        });

        return NextResponse.json({ order: updatedOrder });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء تعديل الطلب' },
            { status: 500 }
        );
    }
}

// DELETE: Delete order
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const username = request.headers.get('x-username');

        if (!username || username.trim().length === 0) {
            return NextResponse.json(
                { error: 'اسم المستخدم مطلوب' },
                { status: 400 }
            );
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'الطلب غير موجود' },
                { status: 404 }
            );
        }

        if (order.user.username.trim() !== username.trim()) {
            return NextResponse.json(
                { error: 'غير مسموح لك بحذف هذا الطلب' },
                { status: 403 }
            );
        }

        await prisma.order.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء حذف الطلب' },
            { status: 500 }
        );
    }
}
