'use client';

import Link from 'next/link';
import { MealTypeOption } from '@/lib/types';

interface MealTypeCardProps {
    mealType: MealTypeOption;
}

export default function MealTypeCard({ mealType }: MealTypeCardProps) {
    return (
        <Link
            href={`/restaurants?mealType=${mealType.type}`}
            className="group glass-card p-5 text-center hover:scale-105 transition-all duration-300"
        >
            <div className="text-7xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {mealType.icon}
            </div>
            <h3 className="text-2xl font-bold text-mhg-gold mb-2">{mealType.labelAr}</h3>
            <p className="text-mhg-white text-sm">{mealType.label}</p>

            <div className={`mt-4 h-1 w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r ${mealType.gradient} rounded-full mx-auto`} />
        </Link>
    );
}
