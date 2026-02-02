import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Get current username from session (client-side handled)
export async function GET() {
    return NextResponse.json({ message: 'Use client-side session' });
}

// POST: Create or get user by username
export async function POST(request: Request) {
    try {
        const { username } = await request.json();

        if (!username || username.trim().length === 0) {
            return NextResponse.json(
                { error: 'اسم المستخدم مطلوب' },
                { status: 400 }
            );
        }

        // Create or get user
        const user = await prisma.user.upsert({
            where: { username: username.trim() },
            update: {},
            create: { username: username.trim() },
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء حفظ المستخدم' },
            { status: 500 }
        );
    }
}
