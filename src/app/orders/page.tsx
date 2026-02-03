import OrdersClient from './OrdersClient';
import { getOrdersSummary } from './actions';

export default async function OrdersPage() {
    const summary = await getOrdersSummary();

    return (
        <div className="min-h-screen">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 pb-12">
                <div className="glass-card mx-0 mt-4 mb-8 p-6">
                    <a href="/" className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
                        ← العودة للرئيسية
                    </a>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">الطلبات</h1>
                    <p className="text-gray-600">عرض جميع الطلبات مرتبة حسب التاريخ ونوع الوجبة</p>
                </div>

                <OrdersClient summary={summary as any} />
            </main>
        </div>
    );
}
