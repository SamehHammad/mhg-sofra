import { createWorker } from 'tesseract.js';

interface ExtractedMenuItem {
    name: string;
    price: number;
}

interface OCRResult {
    success: boolean;
    items: ExtractedMenuItem[];
    error?: string;
    source?: 'GOOGLE_VISION' | 'TESSERACT_LOCAL';
}

export async function extractMenuFromImage(
    imageBase64: string
): Promise<OCRResult> {
    // First, try Google Vision API if key is present
    const apiKey = process.env.GOOGLE_VISION_API_KEY;

    if (apiKey) {
        try {
            console.log('Attempting Google Vision OCR...');
            const result = await extractWithGoogleVision(imageBase64, apiKey);
            if (result.success) return { ...result, source: 'GOOGLE_VISION' };

            // If Google failed with a specific error (like billing), fall back to Tesseract
            console.warn(`Google Vision failed: ${result.error}. Falling back to Tesseract...`);
        } catch (error) {
            console.warn('Google Vision error, falling back to Tesseract:', error);
        }
    } else {
        console.log('No Google Vision API key found. Using Tesseract.js...');
    }

    // Fallback to Tesseract.js
    try {
        const result = await extractWithTesseract(imageBase64);
        return { ...result, source: 'TESSERACT_LOCAL' };
    } catch (error) {
        console.error('Tesseract Error:', error);
        return {
            success: false,
            items: [],
            error: error instanceof Error ? error.message : 'Unknown OCR error',
        };
    }
}

async function extractWithGoogleVision(
    imageBase64: string,
    apiKey: string
): Promise<OCRResult> {
    try {
        const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requests: [
                        {
                            image: {
                                content: imageBase64,
                            },
                            features: [
                                {
                                    type: 'TEXT_DETECTION',
                                    maxResults: 1,
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Google Vision API request failed');
        }

        const data = await response.json();
        const detectedText = data.responses[0]?.fullTextAnnotation?.text;

        if (!detectedText) {
            return {
                success: false,
                items: [],
                error: 'No text detected in image',
            };
        }

        const items = parseMenuText(detectedText);
        return { success: true, items };
    } catch (error) {
        return {
            success: false,
            items: [],
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

async function extractWithTesseract(imageBase64: string): Promise<OCRResult> {
    try {
        const worker = await createWorker('ara+eng');

        const ret = await worker.recognize(`data:image/png;base64,${imageBase64}`);
        const text = ret.data.text;

        await worker.terminate();

        if (!text || text.trim().length === 0) {
            return {
                success: false,
                items: [],
                error: 'No text extracted using Tesseract',
            };
        }

        const items = parseMenuText(text);
        return { success: true, items };
    } catch (error) {
        return {
            success: false,
            items: [],
            error: error instanceof Error ? error.message : 'Tesseract processing failed',
        };
    }
}

function parseMenuText(text: string): ExtractedMenuItem[] {
    const items: ExtractedMenuItem[] = [];
    const lines = text.split('\n').filter((line) => line.trim());

    // Pattern to match menu items with prices
    const patterns = [
        // Arabic/English name followed by price
        /^(.+?)\s*[.\-:]+\s*(\d+(?:\.\d{1,2})?)\s*(?:ج\.م|جنيه|EGP|LE)?$/i,
        // Price at the end without separators
        /^(.+?)\s+(\d+(?:\.\d{1,2})?)\s*(?:ج\.م|جنيه|EGP|LE)?$/i,
        // Price at the beginning
        /^(\d+(?:\.\d{1,2})?)\s*(?:ج\.م|جنيه|EGP|LE)?\s+(.+)$/i,
    ];

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.length < 3 || /^\d+$/.test(trimmedLine)) {
            continue;
        }

        for (const pattern of patterns) {
            const match = trimmedLine.match(pattern);

            if (match) {
                let name: string;
                let priceStr: string;

                if (/^\d/.test(match[1])) {
                    priceStr = match[1];
                    name = match[2];
                } else {
                    name = match[1];
                    priceStr = match[2];
                }

                const price = parseFloat(priceStr);

                if (name && !isNaN(price) && price > 0 && price < 10000) {
                    name = name
                        .trim()
                        .replace(/[.\-:]+$/, '')
                        .replace(/^\d+\.\s*/, '')
                        .replace(/[|\[\]{}()]/g, '') // Clean common OCR noise
                        .trim();

                    if (name.length >= 2 && !/^\d+$/.test(name)) {
                        items.push({ name, price });
                        break;
                    }
                }
            }
        }
    }

    // Remove duplicates
    const uniqueItems = items.filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.name === item.name && t.price === item.price)
    );

    return uniqueItems;
}

// Helper function to convert File to base64
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
}
