'use server';

import { prisma } from '@/lib/prisma';
import { SESSION_KEYS } from '@/lib/constants';
import { cookies } from 'next/headers';

export async function saveUsernameAction(username: string) {
    const normalized = typeof username === 'string' ? username.trim() : '';

    if (!normalized) {
        return { ok: false, error: 'اسم المستخدم مطلوب' } as const;
    }

    try {
        await prisma.user.upsert({
            where: { username: normalized },
            update: {},
            create: { username: normalized },
        });

        const cookieStore = await cookies();
        cookieStore.set(SESSION_KEYS.USERNAME, normalized, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
        });

        return { ok: true } as const;
    } catch (error) {
        console.error('Error saving username:', error);
        return { ok: false, error: 'حدث خطأ أثناء حفظ المستخدم' } as const;
    }
}
