'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import MenuItemCard from '@/components/MenuItemCard';
import { MenuItem, Restaurant } from '@/lib/types';
import { SESSION_KEYS } from '@/lib/constants';
import { useNotification } from '@/context/NotificationContext';
import { createOrderAction } from './actions';

export default function MenuClient({
    restaurant,
    menuItems,
    mealType,
}: {
    restaurant: Restaurant;
    menuItems: MenuItem[];
    mealType: string;
}) {
    const router = useRouter();
    const { showNotification } = useNotification();

    const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
    const [searchQuery, setSearchQuery] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleToggleItem = (itemId: string) => {
        const next = new Map(selectedItems);
        if (next.has(itemId)) {
            next.delete(itemId);
        } else {
            next.set(itemId, 1);
        }
        setSelectedItems(next);
    };

    const handleQuantityChange = (itemId: string, quantity: number) => {
        const next = new Map(selectedItems);
        next.set(itemId, quantity);
        setSelectedItems(next);
    };

    const normalizeText = (value: string) => value.toLowerCase().trim();

    const filteredMenuItems = useMemo(() => {
        const q = normalizeText(searchQuery);
        if (!q) return menuItems;

        return menuItems.filter((item) => {
            const name = normalizeText(item.name);
            const description = normalizeText(item.description || '');
            return name.includes(q) || description.includes(q);
        });
    }, [menuItems, searchQuery]);

    const total = useMemo(() => {
        let sum = 0;
        selectedItems.forEach((quantity, itemId) => {
            const item = menuItems.find((mi) => mi.id === itemId);
            if (item) sum += item.price * quantity;
        });
        return sum;
    }, [menuItems, selectedItems]);

    const handleSubmitOrder = async () => {
        const username = localStorage.getItem(SESSION_KEYS.USERNAME);
        if (!username) {
            showNotification('تنبيه', 'الرجاء تسجيل الدخول أولاً', 'info', () => {
                router.push('/');
            });
            router.push('/');
            return;
        }

        if (selectedItems.size === 0) {
            showNotification('تنبيه', 'الرجاء اختيار وجبة واحدة على الأقل', 'info');
            return;
        }

        try {
            setSubmitting(true);

            const items = Array.from(selectedItems.entries()).map(([menuItemId, quantity]) => ({
                menuItemId,
                quantity,
            }));

            const result = await createOrderAction({
                username,
                restaurantId: restaurant.id,
                mealType: mealType || 'LUNCH',
                items,
            });

            if (result.ok) {
                showNotification('تم الإرسال', 'تم إرسال طلبك بنجاح', 'success', () => {
                    router.push('/orders');
                });
            } else {
                showNotification('خطأ', result.error || 'حدث خطأ أثناء إرسال الطلب', 'error');
            }
        } catch (err) {
            showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pb-32">
            <header className="glass-card mx-4 mt-4 mb-8 p-6">
                <div className="max-w-7xl mx-auto">
                    <a
                        href={`/restaurants?mealType=${mealType || ''}`}
                        className="text-mhg-blue hover:text-mhg-blue-deep mb-4 inline-block"
                    >
                        ← العودة للمطاعم
                    </a>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{restaurant.name}</h1>
                        <p className="text-gray-600">اختر الوجبات التي تريدها</p>
                    </div>

                    {menuItems.length > 0 && (
                        <div className="mt-6">
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن وجبة..."
                                className="w-full glass-card px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-mhg-gold/40 text-right"
                            />
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4">
                {menuItems.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد وجبات متاحة</h3>
                    </div>
                )}

                {menuItems.length > 0 && (
                    <div className="space-y-4">
                        {filteredMenuItems.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🔎</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد نتائج</h3>
                                <p className="text-gray-600">جرّب البحث بكلمة مختلفة</p>
                            </div>
                        ) : (
                            filteredMenuItems.map((item) => (
                                <MenuItemCard
                                    key={item.id}
                                    menuItem={item}
                                    isSelected={selectedItems.has(item.id)}
                                    onToggle={handleToggleItem}
                                    quantity={selectedItems.get(item.id) || 1}
                                    onQuantityChange={handleQuantityChange}
                                />
                            ))
                        )}
                    </div>
                )}
            </main>

            {selectedItems.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 glass-card p-4 shadow-2xl">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-600">{selectedItems.size} وجبة محددة</p>
                            <p className="text-2xl font-bold text-mhg-blue">{total.toFixed(2)} جنيه</p>
                        </div>
                        <button
                            onClick={handleSubmitOrder}
                            disabled={submitting}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
