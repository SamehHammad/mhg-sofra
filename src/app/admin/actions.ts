'use server';

import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

async function requireAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return null;

    const admin = await prisma.admin.findUnique({ where: { id: token } });
    return admin;
}

export async function adminLoginAction(input: { username: string; password: string }) {
    const username = typeof input.username === 'string' ? input.username.trim() : '';
    const password = typeof input.password === 'string' ? input.password.trim() : '';

    if (!username || !password) {
        return { ok: false, error: 'اسم المستخدم وكلمة المرور مطلوبة' } as const;
    }

    try {
        const admin = await prisma.admin.findUnique({ where: { username } });
        if (!admin) {
            return { ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' } as const;
        }

        const isValid = await verifyPassword(password, admin.passwordHash);
        if (!isValid) {
            return { ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' } as const;
        }

        const cookieStore = await cookies();
        cookieStore.set('admin_token', admin.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return { ok: true } as const;
    } catch (error) {
        console.error('Error logging in:', error);
        return { ok: false, error: 'حدث خطأ أثناء تسجيل الدخول' } as const;
    }
}

export async function adminLogoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_token');
    return { ok: true } as const;
}

export async function getAdminStatsAction() {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    const today = new Date();
    const start = new Date(today.toISOString().split('T')[0] + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const [restaurantsCount, ordersCount, todayOrders] = await Promise.all([
        prisma.restaurant.count(),
        prisma.order.count(),
        prisma.order.count({
            where: {
                orderDate: {
                    gte: start,
                    lt: end,
                },
            },
        }),
    ]);

    return {
        ok: true,
        stats: {
            restaurantsCount,
            ordersCount,
            todayOrders,
        },
    } as const;
}

export async function getAdminRestaurantsAction() {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    const restaurants = await prisma.restaurant.findMany({
        include: {
            menuItems: {
                select: { id: true },
            },
        },
        orderBy: { name: 'asc' },
    });

    return { ok: true, restaurants } as const;
}

export async function upsertRestaurantAction(input: {
    id?: string | null;
    name: string;
    phone?: string;
    deliveryPrice: number;
}) {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    const name = typeof input.name === 'string' ? input.name.trim() : '';
    if (!name) return { ok: false, error: 'اسم المطعم مطلوب' } as const;

    try {
        const restaurant = input.id
            ? await prisma.restaurant.update({
                where: { id: input.id },
                data: {
                    name,
                    phone: input.phone ? input.phone.trim() : null,
                    deliveryPrice: Number.isFinite(input.deliveryPrice) ? input.deliveryPrice : 0,
                },
            })
            : await prisma.restaurant.create({
                data: {
                    name,
                    phone: input.phone ? input.phone.trim() : null,
                    deliveryPrice: Number.isFinite(input.deliveryPrice) ? input.deliveryPrice : 0,
                },
            });

        return { ok: true, restaurant } as const;
    } catch (error) {
        console.error('Error saving restaurant:', error);
        return { ok: false, error: 'حدث خطأ أثناء الحفظ' } as const;
    }
}

export async function deleteRestaurantAction(id: string) {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    try {
        await prisma.restaurant.delete({ where: { id } });
        return { ok: true } as const;
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        return { ok: false, error: 'حدث خطأ أثناء الحذف' } as const;
    }
}

export async function getAdminOrdersAction() {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    const orders = await prisma.order.findMany({
        include: {
            user: true,
            restaurant: true,
            items: { include: { menuItem: true } },
        },
        orderBy: { orderDate: 'desc' },
    });

    return { ok: true, orders } as const;
}

export async function deleteAdminOrderAction(input: { id: string; password: string }) {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    const id = typeof input.id === 'string' ? input.id.trim() : '';
    const password = typeof input.password === 'string' ? input.password.trim() : '';

    if (!id) return { ok: false, error: 'معرّف الطلب مطلوب' } as const;
    if (!password) return { ok: false, error: 'كلمة المرور مطلوبة' } as const;

    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) return { ok: false, error: 'كلمة المرور غير صحيحة' } as const;

    try {
        await prisma.orderItem.deleteMany({ where: { orderId: id } });
        await prisma.order.delete({ where: { id } });
        return { ok: true } as const;
    } catch (error) {
        console.error('Error deleting order:', error);
        return { ok: false, error: 'حدث خطأ أثناء حذف الطلب' } as const;
    }
}

export async function deleteAllOrdersAction(password: string) {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    const normalizedPassword = typeof password === 'string' ? password.trim() : '';
    if (!normalizedPassword) return { ok: false, error: 'كلمة المرور مطلوبة' } as const;

    const isValid = await verifyPassword(normalizedPassword, admin.passwordHash);
    if (!isValid) return { ok: false, error: 'كلمة المرور غير صحيحة' } as const;

    try {
        await prisma.orderItem.deleteMany({});
        await prisma.order.deleteMany({});
        return { ok: true } as const;
    } catch (error) {
        console.error('Error deleting all orders:', error);
        return { ok: false, error: 'حدث خطأ أثناء حذف الطلبات' } as const;
    }
}

export async function getAdminMenuDataAction() {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    const [menuItems, restaurants] = await Promise.all([
        prisma.menuItem.findMany({
            include: { restaurant: true },
            orderBy: { name: 'asc' },
        }),
        prisma.restaurant.findMany({
            orderBy: { name: 'asc' },
        }),
    ]);

    return { ok: true, menuItems, restaurants } as const;
}

export async function upsertMenuItemAction(input: {
    id?: string | null;
    name: string;
    price: number;
    mealType: string;
    description?: string;
    restaurantId: string;
    options?: string[];
    mealShape?: string;
}) {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const restaurantId = typeof input.restaurantId === 'string' ? input.restaurantId.trim() : '';

    if (!name || !input.price || !input.mealType || !restaurantId) {
        return { ok: false, error: 'جميع الحقول المطلوبة يجب تعبئتها' } as const;
    }

    try {
        const menuItem = input.id
            ? await prisma.menuItem.update({
                where: { id: input.id },
                data: {
                    name,
                    price: input.price,
                    mealType: input.mealType as any,
                    description: input.description ? input.description.trim() : null,
                    restaurantId,
                    options: input.options || [],
                    mealShape: input.mealShape ? (input.mealShape as any) : null,
                },
                include: { restaurant: true },
            })
            : await prisma.menuItem.create({
                data: {
                    name,
                    price: input.price,
                    mealType: input.mealType as any,
                    description: input.description ? input.description.trim() : null,
                    restaurantId,
                    options: input.options || [],
                    mealShape: input.mealShape ? (input.mealShape as any) : null,
                },
                include: { restaurant: true },
            });

        return { ok: true, menuItem } as const;
    } catch (error) {
        console.error('Error saving menu item:', error);
        return { ok: false, error: 'حدث خطأ أثناء إنشاء/تحديث الوجبة' } as const;
    }
}

export async function deleteMenuItemAction(id: string) {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    try {
        await prisma.menuItem.delete({ where: { id } });
        return { ok: true } as const;
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return { ok: false, error: 'حدث خطأ أثناء الحذف' } as const;
    }
}

export async function bulkDeleteMenuItemsAction(input: { deleteAll: boolean; restaurantId?: string }) {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    const restaurantId = typeof input.restaurantId === 'string' ? input.restaurantId.trim() : '';
    const deleteAll = Boolean(input.deleteAll);

    const menuWhere = deleteAll ? {} : restaurantId ? { restaurantId } : {};

    try {
        const { deletedMenuItemsCount } = await prisma.$transaction(async (tx) => {
            const menuItems = await tx.menuItem.findMany({
                where: menuWhere,
                select: { id: true },
            });

            if (menuItems.length === 0) {
                return { deletedMenuItemsCount: 0 };
            }

            const menuItemIds = menuItems.map((m) => m.id);

            await tx.orderItem.deleteMany({
                where: {
                    menuItemId: { in: menuItemIds },
                },
            });

            const menuItemsDeleteResult = await tx.menuItem.deleteMany({
                where: { id: { in: menuItemIds } },
            });

            return {
                deletedMenuItemsCount: menuItemsDeleteResult.count,
            };
        });

        return { ok: true, deletedCount: deletedMenuItemsCount } as const;
    } catch (error) {
        console.error('Error bulk deleting menu items:', error);
        return { ok: false, error: 'حدث خطأ أثناء حذف الوجبات' } as const;
    }
}

export async function importExcelMenuAction(formData: FormData) {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    try {
        const XLSX = await import('xlsx');

        const file = formData.get('file');
        const defaultRestaurantId = String(formData.get('restaurantId') ?? '').trim();
        const defaultMealType = String(formData.get('mealType') ?? '').trim();
        const mode = String(formData.get('mode') ?? 'skip').trim().toLowerCase();

        if (!(file instanceof File)) {
            return { ok: false, error: 'الملف مطلوب' } as const;
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !['xlsx', 'xls'].includes(ext)) {
            return { ok: false, error: 'يجب رفع ملف Excel بصيغة xlsx أو xls' } as const;
        }

        const normalizeHeader = (value: unknown): string =>
            String(value ?? '')
                .trim()
                .toLowerCase()
                .replace(/\s+/g, ' ');

        const parsePrice = (value: unknown): number | null => {
            if (value === null || value === undefined || value === '') return null;
            if (typeof value === 'number' && Number.isFinite(value)) return value;
            const cleaned = String(value).replace(/,/g, '.').replace(/[^0-9.\-]/g, '').trim();
            if (!cleaned) return null;
            const n = Number(cleaned);
            if (!Number.isFinite(n)) return null;
            return n;
        };

        const parseMealType = (value: unknown): string | null => {
            const raw = String(value ?? '').trim().toUpperCase();
            if (!raw) return null;
            const allowed = new Set(['APPETIZER', 'BREAKFAST', 'LUNCH', 'DINNER', 'DESSERT']);
            if (allowed.has(raw)) return raw;
            const map: Record<string, string> = {
                فطار: 'BREAKFAST',
                افطار: 'BREAKFAST',
                غداء: 'LUNCH',
                عشاء: 'DINNER',
                تحلية: 'DESSERT',
                حلو: 'DESSERT',
                مقبلات: 'APPETIZER',
            };
            return map[String(value ?? '').trim()] ?? null;
        };

        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) return { ok: false, error: 'ملف Excel فارغ' } as const;

        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
        if (!rows.length) return { ok: false, error: 'ملف Excel فارغ' } as const;

        const headerRow = rows[0] ?? [];
        const headerIndex: Record<string, number> = {};
        headerRow.forEach((h: unknown, idx: number) => {
            const key = normalizeHeader(h);
            if (key) headerIndex[key] = idx;
        });

        const idx = (name: string) => headerIndex[normalizeHeader(name)];
        const nameCol = idx('name') ?? idx('اسم') ?? idx('اسم الوجبة');
        const priceCol = idx('price') ?? idx('السعر') ?? idx('سعر');
        const mealTypeCol = idx('mealtype') ?? idx('meal type') ?? idx('نوع') ?? idx('نوع الوجبة');
        const descriptionCol = idx('description') ?? idx('الوصف');
        const mealShapeCol = idx('mealshape') ?? idx('shape') ?? idx('شكل') ?? idx('شكل الوجبة') ?? idx('نوع الطبق');

        if (nameCol === undefined || priceCol === undefined) {
            return { ok: false, error: 'يجب أن يحتوي الملف على أعمدة name و price (أو اسم/السعر)' } as const;
        }

        let createdCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i] ?? [];
            const name = String(row[nameCol] ?? '').trim();
            const price = parsePrice(row[priceCol]);
            const mealType =
                parseMealType(mealTypeCol !== undefined ? row[mealTypeCol] : null) ??
                parseMealType(defaultMealType) ??
                'LUNCH';

            const description = descriptionCol !== undefined ? String(row[descriptionCol] ?? '').trim() : '';

            let mealShape: string | null = null;
            if (mealShapeCol !== undefined) {
                const raw = String(row[mealShapeCol] ?? '').trim().toUpperCase();
                if (['SANDWICH', 'PLATE', 'BOX'].includes(raw)) mealShape = raw;
                else if (raw.includes('سند') || raw.includes('ساند')) mealShape = 'SANDWICH';
                else if (raw.includes('طبق')) mealShape = 'PLATE';
                else if (raw.includes('علب')) mealShape = 'BOX';
            }



            const emptyRow = !name && (price === null || price === undefined) && !description;
            if (emptyRow) continue;

            if (!name || price === null || price <= 0) {
                errorCount++;
                continue;
            }

            const restaurantId = defaultRestaurantId;
            if (!restaurantId) {
                errorCount++;
                continue;
            }

            const existing = await prisma.menuItem.findFirst({
                where: {
                    restaurantId,
                    name,
                    mealType: mealType as any,
                },
                select: { id: true },
            });

            if (existing && mode !== 'upsert') {
                skippedCount++;
                continue;
            }

            try {
                if (existing && mode === 'upsert') {
                    await prisma.menuItem.update({
                        where: { id: existing.id },
                        data: {
                            price,
                            description: description || null,
                            mealShape: mealShape as any,
                        },
                    });
                    createdCount++;
                } else {
                    await prisma.menuItem.create({
                        data: {
                            name,
                            price,
                            mealType: mealType as any,
                            description: description || null,
                            restaurantId,
                            mealShape: mealShape as any,
                        },
                    });
                    createdCount++;
                }
            } catch {
                errorCount++;
            }
        }

        return { ok: true, createdCount, skippedCount, errorCount } as const;
    } catch (error) {
        console.error('Error importing excel menu:', error);
        return { ok: false, error: 'حدث خطأ أثناء استيراد الملف' } as const;
    }
}

export async function importJsonMenuAction(formData: FormData) {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    try {
        const file = formData.get('file');
        const defaultRestaurantId = String(formData.get('restaurantId') ?? '').trim();
        const defaultMealType = String(formData.get('mealType') ?? '').trim();

        if (!(file instanceof File)) {
            return { ok: false, error: 'الملف مطلوب' } as const;
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || ext !== 'json') {
            return { ok: false, error: 'يجب رفع ملف JSON' } as const;
        }

        const content = await file.text();
        let data: any[];

        try {
            data = JSON.parse(content);
        } catch {
            return { ok: false, error: 'ملف JSON غير صالح' } as const;
        }

        if (!Array.isArray(data)) {
            return { ok: false, error: 'يجب أن يحتوي الملف على مصفوفة من الوجبات' } as const;
        }

        const parsedMeals: any[] = [];
        const errors: any[] = [];

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            try {
                const name = String(item.name ?? '').trim();
                const price = Number(item.price);
                let mealType = String(item.mealType ?? 'LUNCH').trim().toUpperCase();
                let restaurantId = String(item.restaurantId ?? '').trim();
                const description = String(item.description ?? '').trim();

                // Parse mealShape with Arabic support
                let mealShape: string | null = null;
                const rawMealShape = String(item.mealShape ?? '').trim();
                if (rawMealShape) {
                    const upperShape = rawMealShape.toUpperCase();
                    if (['SANDWICH', 'PLATE', 'BOX'].includes(upperShape)) {
                        mealShape = upperShape;
                    } else if (rawMealShape.includes('ساند') || rawMealShape.includes('سند')) {
                        mealShape = 'SANDWICH';
                    } else if (rawMealShape.includes('طبق')) {
                        mealShape = 'PLATE';
                    } else if (rawMealShape.includes('علب')) {
                        mealShape = 'BOX';
                    }
                }

                if (defaultRestaurantId) restaurantId = defaultRestaurantId;
                if (defaultMealType) mealType = defaultMealType;
                const options = Array.isArray(item.options) ? item.options.map((o: any) => String(o).trim()).filter(Boolean) : [];

                if (!name || !price || price <= 0 || !restaurantId) {
                    errors.push({ index: i, name: name || 'غير معروف', error: 'بيانات غير كاملة' });
                    continue;
                }

                const validMealTypes = ['APPETIZER', 'BREAKFAST', 'LUNCH', 'DINNER', 'DESSERT'];
                if (!validMealTypes.includes(mealType)) {
                    errors.push({ index: i, name, error: 'نوع وجبة غير صالح' });
                    continue;
                }

                // Check if restaurant exists
                const restaurant = await prisma.restaurant.findUnique({
                    where: { id: restaurantId },
                });

                if (!restaurant) {
                    errors.push({ index: i, name, error: 'المطعم غير موجود' });
                    continue;
                }

                parsedMeals.push({
                    name,
                    price,
                    mealType,
                    description: description || null,
                    restaurantId,
                    restaurantName: restaurant.name,
                    options,
                    mealShape,
                });
            } catch (err) {
                errors.push({ index: i, name: item.name || 'غير معروف', error: 'خطأ في المعالجة' });
            }
        }

        return { ok: true, parsedMeals, errors } as const;
    } catch (error) {
        console.error('Error importing json menu:', error);
        return { ok: false, error: 'حدث خطأ أثناء استيراد الملف' } as const;
    }
}

export async function saveImportedMealsAction(input: {
    meals: Array<{
        name: string;
        price: number;
        mealType: string;
        description?: string | null;
        restaurantId: string;
        options?: string[];
        mealShape?: string | null;
    }>;
    mode: 'skip' | 'upsert';
}) {
    const admin = await requireAdmin();
    if (!admin) return { ok: false, error: 'غير مصرح' } as const;

    try {
        let createdCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const meal of input.meals) {
            try {
                const existing = await prisma.menuItem.findFirst({
                    where: {
                        restaurantId: meal.restaurantId,
                        name: meal.name,
                        mealType: meal.mealType as any,
                    },
                    select: { id: true },
                });

                if (existing && input.mode !== 'upsert') {
                    skippedCount++;
                    continue;
                }

                if (existing && input.mode === 'upsert') {
                    await prisma.menuItem.update({
                        where: { id: existing.id },
                        data: {
                            price: meal.price,
                            description: meal.description || null,
                            mealShape: meal.mealShape as any,
                            options: meal.options || [],
                        },
                    });
                    createdCount++;
                } else {
                    await prisma.menuItem.create({
                        data: {
                            name: meal.name,
                            price: meal.price,
                            mealType: meal.mealType as any,
                            description: meal.description || null,
                            restaurantId: meal.restaurantId,
                            options: meal.options || [],
                            mealShape: meal.mealShape as any,
                        },
                    });
                    createdCount++;
                }
            } catch (err) {
                console.error('Error saving meal:', err);
                errorCount++;
            }
        }

        return { ok: true, createdCount, skippedCount, errorCount } as const;
    } catch (error) {
        console.error('Error saving imported meals:', error);
        return { ok: false, error: 'حدث خطأ أثناء حفظ الوجبات' } as const;
    }
}
