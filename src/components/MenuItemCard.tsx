'use client';

import { MenuItem } from '@/lib/types';

interface MenuItemCardProps {
    menuItem: MenuItem;
    isSelected: boolean;
    onToggle: (id: string) => void;
    quantity?: number;
    onQuantityChange?: (id: string, quantity: number) => void;
}

export default function MenuItemCard({
    menuItem,
    isSelected,
    onToggle,
    quantity = 1,
    onQuantityChange,
}: MenuItemCardProps) {
    return (
        <div
            className={`glass-card p-4 cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-indigo-600 bg-indigo-50/50' : ''
                }`}
            onClick={() => onToggle(menuItem.id)}
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                    <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${isSelected
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-gray-300 bg-white'
                            }`}
                    >
                        {isSelected && <span className="text-white text-sm">✓</span>}
                    </div>
                </div>

                <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">{menuItem.name}</h4>
                    {menuItem.description && (
                        <p className="text-sm text-gray-600 mb-2">{menuItem.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-indigo-600">
                            {menuItem.price} ر.س
                        </span>

                        {isSelected && onQuantityChange && (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => onQuantityChange(menuItem.id, Math.max(1, quantity - 1))}
                                    className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-bold">{quantity}</span>
                                <button
                                    onClick={() => onQuantityChange(menuItem.id, quantity + 1)}
                                    className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center font-bold"
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
