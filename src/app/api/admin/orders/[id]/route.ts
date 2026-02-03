import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { password } = await request.json();
        const normalizedPassword = typeof password === 'string' ? password.trim() : '';

        if (!id) {
            return NextResponse.json({ error: 'معرّف الطلب مطلوب' }, { status: 400 });
        }

        if (!normalizedPassword) {
            return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 });
        }

        const admin = await prisma.admin.findUnique({ where: { username: 'admin' } });

        if (!admin) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const isValid = await verifyPassword(normalizedPassword, admin.passwordHash);

        if (!isValid) {
            return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
        }

        await prisma.orderItem.deleteMany({ where: { orderId: id } });
        await prisma.order.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء حذف الطلب' }, { status: 500 });
    }
}
