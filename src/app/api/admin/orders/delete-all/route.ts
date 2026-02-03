import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';

// POST: Delete all orders (protected by password)
export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        const normalizedPassword = typeof password === 'string' ? password.trim() : '';

        if (!normalizedPassword) {
            return NextResponse.json(
                { error: 'كلمة المرور مطلوبة' },
                { status: 400 }
            );
        }

        const admin = await prisma.admin.findUnique({ where: { username: 'admin' } });

        if (!admin) {
            return NextResponse.json(
                { error: 'غير مصرح' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(normalizedPassword, admin.passwordHash);

        if (!isValid) {
            return NextResponse.json(
                { error: 'كلمة المرور غير صحيحة' },
                { status: 401 }
            );
        }

        // Delete all orders
        // Note: DELETE on Order will cascade delete OrderItems if schema is configured,
        // otherwise we need to delete OrderItems first. 
        // Assuming cascade or deleteMany.

        // Prisma cascade delete usually requires explicit configuration in schema or deleteMany.
        // Let's try deleteMany on orders. If relation is cascade in DB, it works.
        // To be safe, delete OrderItems first.

        await prisma.orderItem.deleteMany({});
        await prisma.order.deleteMany({});

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting all orders:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء حذف الطلبات' },
            { status: 500 }
        );
    }
}
