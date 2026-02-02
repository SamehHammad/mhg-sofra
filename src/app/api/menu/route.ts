import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List menu items
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const restaurantId = searchParams.get('restaurantId');
        const mealType = searchParams.get('mealType');

        const menuItems = await prisma.menuItem.findMany({
            where: {
                isAvailable: true,
                ...(restaurantId && { restaurantId }),
                ...(mealType && { mealType: mealType as any }),
            },
            include: {
                restaurant: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json({ menuItems });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب قائمة الطعام' },
            { status: 500 }
        );
    }
}

// POST: Create menu item (admin only)
export async function POST(request: Request) {
    try {
        const { name, price, mealType, description, restaurantId } = await request.json();

        if (!name || !price || !mealType || !restaurantId) {
            return NextResponse.json(
                { error: 'جميع الحقول المطلوبة يجب تعبئتها' },
                { status: 400 }
            );
        }

        const menuItem = await prisma.menuItem.create({
            data: {
                name,
                price: parseFloat(price),
                mealType,
                description: description || null,
                restaurantId,
            },
            include: {
                restaurant: true,
            },
        });

        return NextResponse.json({ menuItem });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء الوجبة' },
            { status: 500 }
        );
    }
}
