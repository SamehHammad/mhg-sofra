'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                    <div className="text-center px-4">
                        <h1 className="text-6xl font-bold text-red-600 mb-4">خطأ</h1>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            حدث خطأ غير متوقع
                        </h2>
                        <p className="text-gray-600 mb-8">
                            {error.message || 'حدث خطأ في التطبيق'}
                        </p>
                        <button
                            onClick={reset}
                            className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                        >
                            حاول مرة أخرى
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
