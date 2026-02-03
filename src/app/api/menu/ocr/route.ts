import { NextResponse } from 'next/server';
import { extractMenuFromImage } from '@/lib/ocr';

export const runtime = 'nodejs';

// POST: Upload menu image and extract items via OCR
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const image = formData.get('image') as File;

        if (!image) {
            return NextResponse.json(
                { error: 'الصورة مطلوبة' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!image.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'يجب أن يكون الملف صورة' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        if (image.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'حجم الصورة يجب أن يكون أقل من 10 ميجابايت' },
                { status: 400 }
            );
        }

        // Convert image to base64
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');

        // Extract menu items using OCR
        const result = await extractMenuFromImage(base64Image);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'فشل في استخراج البيانات من الصورة' },
                { status: 500 }
            );
        }

        if (result.items.length === 0) {
            return NextResponse.json(
                {
                    error: 'لم يتم العثور على وجبات في الصورة. تأكد من وضوح الصورة واحتوائها على أسماء الوجبات والأسعار.',
                    items: []
                },
                { status: 200 }
            );
        }

        return NextResponse.json({
            success: true,
            items: result.items,
            count: result.items.length,
        });
    } catch (error) {
        console.error('Error processing menu image:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء معالجة الصورة' },
            { status: 500 }
        );
    }
}
