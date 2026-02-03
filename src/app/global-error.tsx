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
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center px-4">
                        <h1 className="text-6xl font-bold text-mhg-gold mb-4">خطأ</h1>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            حدث خطأ غير متوقع
                        </h2>
                        <p className="text-white/75 mb-8">
                            {error.message || 'حدث خطأ في التطبيق'}
                        </p>
                        <button
                            onClick={reset}
                            className="btn-primary px-8 py-3"
                        >
                            حاول مرة أخرى
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
