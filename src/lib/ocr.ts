import path from 'path';

interface ExtractedMenuItem {
    name: string;
    price: number;
}

interface OCRResult {
    success: boolean;
    items: ExtractedMenuItem[];
    error?: string;
    source?: 'TESSERACT_LOCAL';
}

export async function extractMenuFromImage(
    imageBase64: string
): Promise<OCRResult> {
    try {
        console.log('Attempting local Tesseract OCR...');
        const result = await extractWithTesseract(imageBase64);
        return { ...result, source: 'TESSERACT_LOCAL' };
    } catch (error) {
        console.error('Tesseract OCR Error:', error);
        return {
            success: false,
            items: [],
            error: error instanceof Error ? error.message : 'Unknown OCR error',
        };
    }
}

async function extractWithTesseract(imageBase64: string): Promise<OCRResult> {
    // Dynamic import for tesseract.js to avoid build issues
    const Tesseract = await import('tesseract.js');
    const { createWorker } = Tesseract;

    const workerPath = path.resolve(process.cwd(), 'node_modules', 'tesseract.js', 'dist', 'worker.min.js');
    const corePath = path.resolve(process.cwd(), 'node_modules', 'tesseract.js-core', 'tesseract-core.wasm.js');

    const worker = await createWorker('ara+eng', 1, {
        workerPath,
        corePath,
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    });

    try {
        const ret = await worker.recognize(`data:image/jpeg;base64,${imageBase64}`);
        const text = (ret?.data?.text || '').trim();

        if (!text) {
            return {
                success: false,
                items: [],
                error: 'No text extracted from image',
            };
        }

        const items = parseMenuText(text);
        if (items.length === 0) {
            return {
                success: false,
                items: [],
                error: 'No menu items parsed from extracted text',
            };
        }

        return { success: true, items };
    } finally {
        await worker.terminate();
    }
}

function parseMenuText(text: string): ExtractedMenuItem[] {
    const items: ExtractedMenuItem[] = [];
    const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    const patterns: RegExp[] = [
        /^(.+?)\s*[.\-:|]+\s*(\d+(?:[\.,]\d{1,2})?)\s*(?:ج\.?م|جنيه|EGP|LE)?$/i,
        /^(.+?)\s+(\d+(?:[\.,]\d{1,2})?)\s*(?:ج\.?م|جنيه|EGP|LE)?$/i,
        /^(\d+(?:[\.,]\d{1,2})?)\s*(?:ج\.?م|جنيه|EGP|LE)?\s+(.+?)$/i,
    ];

    for (const line of lines) {
        if (line.length < 3) continue;
        if (/^\d+$/.test(line)) continue;

        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (!match) continue;

            let name: string;
            let priceStr: string;

            if (/^\d/.test(match[1])) {
                priceStr = match[1];
                name = match[2];
            } else {
                name = match[1];
                priceStr = match[2];
            }

            const price = parseFloat(String(priceStr).replace(',', '.'));
            name = String(name)
                .trim()
                .replace(/[.\-:|]+$/, '')
                .replace(/^\d+\s*[)\].-]?\s*/, '')
                .replace(/[\[\]{}()]/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim();

            if (name.length >= 2 && Number.isFinite(price) && price > 0 && price < 100000) {
                items.push({ name, price });
            }

            break;
        }
    }

    const unique = items.filter(
        (item, index, self) => index === self.findIndex((t) => t.name === item.name && t.price === item.price)
    );

    return unique;
}
