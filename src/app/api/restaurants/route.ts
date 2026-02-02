import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all restaurants (with optional meal type filter)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mealType = searchParams.get('mealType');

        const restaurants = await prisma.restaurant.findMany({
            where: {
                isActive: true,
                ...(mealType && {
                    menuItems: {
                        some: {
                            mealType: mealType as any,
                            isAvailable: true,
                        },
                    },
                }),
            },
            include: {
                menuItems: {
                    where: {
                        isAvailable: true,
                        ...(mealType && { mealType: mealType as any }),
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json({ restaurants });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب المطاعم' },
            { status: 500 }
        );
    }
}

// POST: Create new restaurant (admin only)
export async function POST(request: Request) {
    try {
        const { name, phone, deliveryPrice } = await request.json();

        if (!name) {
            return NextResponse.json(
                { error: 'اسم المطعم مطلوب' },
                { status: 400 }
            );
        }

        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                phone: phone || null,
                deliveryPrice: deliveryPrice || 0,
            },
        });

        return NextResponse.json({ restaurant });
    } catch (error) {
        console.error('Error creating restaurant:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء المطعم' },
            { status: 500 }
        );
    }
}
