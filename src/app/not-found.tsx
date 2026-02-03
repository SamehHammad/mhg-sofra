import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
            <div className="text-center px-4">
                <h1 className="text-9xl font-bold text-orange-600 mb-4">404</h1>
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                    الصفحة غير موجودة
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                    عذراً، الصفحة التي تبحث عنها غير موجودة
                </p>
                <Link
                    href="/"
                    className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                    العودة للصفحة الرئيسية
                </Link>
            </div>
        </div>
    );
}
