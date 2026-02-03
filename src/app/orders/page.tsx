import OrdersClient from './OrdersClient';
import { getOrdersSummary } from './actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'الطلبات',
    description: 'عرض جميع الطلبات مرتبة حسب التاريخ ونوع الوجبة في سفرة MHG.',
    openGraph: {
        title: 'الطلبات | MHG Sofra',
        description: 'عرض جميع الطلبات مرتبة حسب التاريخ ونوع الوجبة في سفرة MHG.',
        locale: 'ar_SA',
    },
};

export default async function OrdersPage() {
    const summary = await getOrdersSummary();

    return (
        <div className="min-h-screen">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 pb-12">
                <div className="glass-card mx-0 mt-4 mb-8 p-6">
                    <a href="/" className="text-mhg-gold hover:text-mhg-gold-soft mb-4 inline-block">
                        ← العودة للرئيسية
                    </a>
                    <h1 className="text-3xl font-bold text-mhg-gold mb-2">الطلبات</h1>
                    <p className="text-mhg-gold">عرض جميع الطلبات مرتبة حسب التاريخ ونوع الوجبة</p>
                </div>

                <OrdersClient summary={summary as any} />
            </main>
        </div>
    );
}
