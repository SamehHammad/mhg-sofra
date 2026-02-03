import MealTypeCard from '@/components/MealTypeCard';
import { MEAL_TYPES } from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الرئيسية',
  description: 'اختر نوع الوجبة وابدأ الطلب من المطاعم المتاحة في سفرة MHG.',
  openGraph: {
    title: 'الرئيسية | MHG Sofra',
    description: 'اختر نوع الوجبة وابدأ الطلب من المطاعم المتاحة في سفرة MHG.',
    locale: 'ar_SA',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            اختر نوع الوجبة
          </h2>
          <p className="text-gray-600 text-lg">
            ابدأ بتحديد نوع الوجبة التي تريد طلبها
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {MEAL_TYPES.map((mealType) => (
            <MealTypeCard key={mealType.type} mealType={mealType} />
          ))}
        </div>

        
      </main>
    </div>
  );
}
