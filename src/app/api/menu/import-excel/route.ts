import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';

type ImportRowResult = {
    rowNumber: number;
    status: 'created' | 'skipped' | 'error';
    message: string;
    menuItemId?: string;
};

function normalizeHeader(value: unknown): string {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

function parseMealType(value: unknown): string | null {
    const raw = String(value ?? '').trim().toUpperCase();
    if (!raw) return null;

    const allowed = new Set(['APPETIZER', 'BREAKFAST', 'LUNCH', 'DINNER', 'DESSERT']);
    if (allowed.has(raw)) return raw;

    const map: Record<string, string> = {
        فطور: 'BREAKFAST',
        افطار: 'BREAKFAST',
        غداء: 'LUNCH',
        عشاء: 'DINNER',
        تحلية: 'DESSERT',
        حلو: 'DESSERT',
        مقبلات: 'APPETIZER',
    };

    return map[String(value ?? '').trim()] ?? null;
}

function parseBoolean(value: unknown): boolean | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'boolean') return value;
    const raw = String(value).trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'نعم'].includes(raw)) return true;
    if (['false', '0', 'no', 'n', 'لا'].includes(raw)) return false;
    return null;
}

function parsePrice(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;

    const cleaned = String(value)
        .replace(/,/g, '.')
        .replace(/[^0-9.\-]/g, '')
        .trim();

    if (!cleaned) return null;
    const n = Number(cleaned);
    if (!Number.isFinite(n)) return null;
    return n;
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token');
        if (!token?.value) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const admin = await prisma.admin.findUnique({ where: { id: token.value } });
        if (!admin) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const defaultRestaurantId = String(formData.get('restaurantId') ?? '').trim();
        const defaultMealType = parseMealType(formData.get('mealType')) ?? null;
        const mode = String(formData.get('mode') ?? 'skip').trim().toLowerCase();

        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 });
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !['xlsx', 'xls'].includes(ext)) {
            return NextResponse.json({ error: 'يجب رفع ملف Excel بصيغة xlsx أو xls' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            return NextResponse.json({ error: 'ملف Excel فارغ' }, { status: 400 });
        }

        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
        if (!rows.length) {
            return NextResponse.json({ error: 'ملف Excel فارغ' }, { status: 400 });
        }

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
        const restaurantIdCol = idx('restaurantid') ?? idx('restaurant id') ?? idx('معرف المطعم');
        const restaurantNameCol = idx('restaurant') ?? idx('restaurantname') ?? idx('restaurant name') ?? idx('المطعم') ?? idx('اسم المطعم');
        const isAvailableCol = idx('isavailable') ?? idx('is available') ?? idx('متاح') ?? idx('متوفر');

        if (nameCol === undefined || priceCol === undefined) {
            return NextResponse.json(
                { error: 'يجب أن يحتوي الملف على أعمدة name و price (أو اسم/السعر)' },
                { status: 400 }
            );
        }

        const restaurantNameCache = new Map<string, string>();
        const results: ImportRowResult[] = [];

        let createdCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i] ?? [];
            const rowNumber = i + 1;

            const name = String(row[nameCol] ?? '').trim();
            const price = parsePrice(row[priceCol]);
            const mealType =
                parseMealType(mealTypeCol !== undefined ? row[mealTypeCol] : null) ??
                defaultMealType ??
                'LUNCH';

            const description = descriptionCol !== undefined ? String(row[descriptionCol] ?? '').trim() : '';
            const isAvailableParsed = isAvailableCol !== undefined ? parseBoolean(row[isAvailableCol]) : null;

            let restaurantId = restaurantIdCol !== undefined ? String(row[restaurantIdCol] ?? '').trim() : '';
            const restaurantName = restaurantNameCol !== undefined ? String(row[restaurantNameCol] ?? '').trim() : '';

            if (!restaurantId) restaurantId = defaultRestaurantId;

            if (!restaurantId && restaurantName) {
                const key = restaurantName.toLowerCase();
                const cached = restaurantNameCache.get(key);
                if (cached) {
                    restaurantId = cached;
                } else {
                    const found = await prisma.restaurant.findFirst({ where: { name: restaurantName } });
                    if (found) {
                        restaurantNameCache.set(key, found.id);
                        restaurantId = found.id;
                    }
                }
            }

            const emptyRow = !name && (price === null || price === undefined) && !description && !restaurantId && !restaurantName;
            if (emptyRow) {
                continue;
            }

            if (!name) {
                results.push({ rowNumber, status: 'error', message: 'الاسم مطلوب' });
                errorCount++;
                continue;
            }

            if (price === null || price <= 0) {
                results.push({ rowNumber, status: 'error', message: 'السعر غير صحيح' });
                errorCount++;
                continue;
            }

            if (!restaurantId) {
                results.push({ rowNumber, status: 'error', message: 'restaurantId أو اسم المطعم مطلوب' });
                errorCount++;
                continue;
            }

            const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
            if (!restaurant) {
                results.push({ rowNumber, status: 'error', message: 'المطعم غير موجود' });
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
                results.push({ rowNumber, status: 'skipped', message: 'موجود مسبقاً', menuItemId: existing.id });
                skippedCount++;
                continue;
            }

            try {
                if (existing && mode === 'upsert') {
                    const updated = await prisma.menuItem.update({
                        where: { id: existing.id },
                        data: {
                            price,
                            description: description || null,
                            isAvailable: isAvailableParsed ?? true,
                        },
                        select: { id: true },
                    });

                    results.push({ rowNumber, status: 'created', message: 'تم التحديث', menuItemId: updated.id });
                    createdCount++;
                } else {
                    const created = await prisma.menuItem.create({
                        data: {
                            name,
                            price,
                            mealType: mealType as any,
                            description: description || null,
                            isAvailable: isAvailableParsed ?? true,
                            restaurantId,
                        },
                        select: { id: true },
                    });

                    results.push({ rowNumber, status: 'created', message: 'تم الإنشاء', menuItemId: created.id });
                    createdCount++;
                }
            } catch (e) {
                results.push({ rowNumber, status: 'error', message: 'فشل الحفظ' });
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            createdCount,
            skippedCount,
            errorCount,
            results,
        });
    } catch (error) {
        console.error('Error importing excel menu:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء استيراد الملف' }, { status: 500 });
    }
}
