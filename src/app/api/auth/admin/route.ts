import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

// POST: Admin login
export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'اسم المستخدم وكلمة المرور مطلوبة' },
                { status: 400 }
            );
        }

        // Find admin
        const admin = await prisma.admin.findUnique({
            where: { username },
        });

        if (!admin) {
            return NextResponse.json(
                { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, admin.passwordHash);

        if (!isValid) {
            return NextResponse.json(
                { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
                { status: 401 }
            );
        }

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('admin_token', admin.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return NextResponse.json({ success: true, admin: { username: admin.username } });
    } catch (error) {
        console.error('Error logging in:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء تسجيل الدخول' },
            { status: 500 }
        );
    }
}

// DELETE: Admin logout
export async function DELETE() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('admin_token');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error logging out:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء تسجيل الخروج' },
            { status: 500 }
        );
    }
}

// GET: Check admin session
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token');

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const admin = await prisma.admin.findUnique({
            where: { id: token.value },
        });

        if (!admin) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            admin: { username: admin.username }
        });
    } catch (error) {
        console.error('Error checking session:', error);
        return NextResponse.json({ authenticated: false }, { status: 500 });
    }
}
