import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Get single restaurant with menu items
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const restaurant = await prisma.restaurant.findUnique({
            where: { id },
            include: {
                menuItems: {
                    where: { isAvailable: true },
                    orderBy: { name: 'asc' },
                },
            },
        });

        if (!restaurant) {
            return NextResponse.json(
                { error: 'المطعم غير موجود' },
                { status: 404 }
            );
        }

        return NextResponse.json({ restaurant });
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب المطعم' },
            { status: 500 }
        );
    }
}

// PUT: Update restaurant (admin only)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { name, phone, deliveryPrice, isActive } = await request.json();

        const restaurant = await prisma.restaurant.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(phone !== undefined && { phone }),
                ...(deliveryPrice !== undefined && { deliveryPrice }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json({ restaurant });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء تحديث المطعم' },
            { status: 500 }
        );
    }
}

// DELETE: Delete restaurant (admin only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.restaurant.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء حذف المطعم' },
            { status: 500 }
        );
    }
}
