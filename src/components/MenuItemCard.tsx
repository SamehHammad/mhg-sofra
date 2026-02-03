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
            className={`glass-card h-full p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${isSelected ? 'ring-2 ring-mhg-gold bg-mhg-gold/10' : ''
                }`}
            onClick={() => onToggle(menuItem.id)}
        >
            <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 mt-1">
                    <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${isSelected
                            ? 'bg-mhg-gold border-mhg-gold'
                            : 'border-white/20 bg-white/10'
                            }`}
                    >
                        {isSelected && <span className="text-white text-sm">✓</span>}
                    </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                    <h4 className="font-bold text-mhg-gold mb-1 leading-snug break-words">{menuItem.name}</h4>
                    {menuItem.description && (
                        <p className="text-sm text-mhg-gold/90 mb-2 leading-snug break-words">{menuItem.description}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2">
                        <span className="text-lg font-bold text-mhg-blue whitespace-nowrap">
                            {menuItem.price} جنيه
                        </span>

                        {isSelected && onQuantityChange && (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => onQuantityChange(menuItem.id, Math.max(1, quantity - 1))}
                                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center font-bold text-white"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-bold text-mhg-gold">{quantity}</span>
                                <button
                                    onClick={() => onQuantityChange(menuItem.id, quantity + 1)}
                                    className="w-9 h-9 rounded-xl bg-mhg-blue hover:bg-mhg-blue-deep text-white flex items-center justify-center font-bold"
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
