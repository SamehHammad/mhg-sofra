import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: Update menu item (admin only)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { name, price, mealType, description, isAvailable } = await request.json();

        const menuItem = await prisma.menuItem.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(mealType && { mealType }),
                ...(description !== undefined && { description }),
                ...(isAvailable !== undefined && { isAvailable }),
            },
            include: {
                restaurant: true,
            },
        });

        return NextResponse.json({ menuItem });
    } catch (error) {
        console.error('Error updating menu item:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء تحديث الوجبة' },
            { status: 500 }
        );
    }
}

// DELETE: Delete menu item (admin only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.menuItem.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء حذف الوجبة' },
            { status: 500 }
        );
    }
}
