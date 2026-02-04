'use client';

import { MenuItem } from '@/lib/types';
import { useState } from 'react';

interface MenuItemCardProps {
    menuItem: MenuItem;
    isSelected: boolean;
    onToggle: (id: string) => void;
    quantity?: number;
    onQuantityChange?: (id: string, quantity: number) => void;
    selectedOption?: string;
    onOptionChange?: (id: string, option: string) => void;
}

export default function MenuItemCard({
    menuItem,
    isSelected,
    onToggle,
    quantity = 1,
    onQuantityChange,
    selectedOption,
    onOptionChange,
}: MenuItemCardProps) {
    const [localSelectedOption, setLocalSelectedOption] = useState<string>(selectedOption || '');

    const hasOptions = menuItem.options && menuItem.options.length > 0;

    const handleOptionSelect = (option: string) => {
        setLocalSelectedOption(option);
        if (onOptionChange) {
            onOptionChange(menuItem.id, option);
        }
    };

    return (
        <div
            className={`glass-card h-full p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${isSelected ? 'ring-2 ring-mhg-gold bg-mhg-gold/10' : ''}`}
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
                    <h4 className="font-bold text-mhg-gold mb-1 leading-snug break-words">
                        {menuItem.name}
                        {menuItem.mealShape && (
                            <span className="mr-2 text-sm font-medium text-mhg-gold/80">
                                ({menuItem.mealShape === 'SANDWICH' ? 'ساندويتش' : menuItem.mealShape === 'PLATE' ? 'طبق' : 'علبة'})
                            </span>
                        )}
                    </h4>
                    {menuItem.description && (
                        <p className="text-sm text-mhg-gold/90 mb-2 leading-snug break-words">{menuItem.description}</p>
                    )}

                    {/* Options Display */}
                    {hasOptions && (
                        <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                            <div className="text-xs text-mhg-gold/80 mb-1.5 font-bold">الخيارات:</div>
                            <div className="flex flex-wrap gap-2">
                                {menuItem.options.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleOptionSelect(option)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${localSelectedOption === option || selectedOption === option
                                            ? 'bg-mhg-gold text-white'
                                            : 'bg-white/10 text-mhg-gold border border-mhg-gold/30 hover:bg-mhg-gold/20'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
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
