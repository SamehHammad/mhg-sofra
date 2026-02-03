import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center px-4">
                <h1 className="text-9xl font-bold text-mhg-gold mb-4">404</h1>
                <h2 className="text-4xl font-bold text-white mb-4">
                    الصفحة غير موجودة
                </h2>
                <p className="text-white/75 text-lg mb-8">
                    عذراً، الصفحة التي تبحث عنها غير موجودة
                </p>
                <Link
                    href="/"
                    className="inline-block btn-primary px-8 py-3"
                >
                    العودة للصفحة الرئيسية
                </Link>
            </div>
        </div>
    );
}
