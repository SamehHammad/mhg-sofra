'use client';

import Link from 'next/link';
import { Restaurant } from '@/lib/types';

interface RestaurantCardProps {
    restaurant: Restaurant & { menuItems?: any[] };
    mealType?: string;
}

export default function RestaurantCard({ restaurant, mealType }: RestaurantCardProps) {
    const menuItemCount = restaurant.menuItems?.length || 0;

    return (
        <Link
            href={`/menu/${restaurant.id}?mealType=${mealType || ''}`}
            className="glass-card p-6 hover:scale-105 transition-all duration-300"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h3>
                    {restaurant.phone && (
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                            <span>📞</span>
                            {restaurant.phone}
                        </p>
                    )}
                </div>
                <div className="text-3xl">🍽️</div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                    <span className="font-semibold">{menuItemCount}</span> وجبة متاحة
                </div>
                <div className="text-sm font-bold text-mhg-gold-deep">
                    توصيل: {restaurant.deliveryPrice} جنيه
                </div>
            </div>
        </Link>
    );
}
