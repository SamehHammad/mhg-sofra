'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import MenuItemCard from '@/components/MenuItemCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { MenuItem, Restaurant } from '@/lib/types';
import { SESSION_KEYS } from '@/lib/constants';
import { useNotification } from '@/context/NotificationContext';

export default function MenuPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const restaurantId = params.id as string;
    const mealType = searchParams.get('mealType');

    const { showNotification } = useNotification();

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRestaurant();
    }, [restaurantId]);

    const fetchRestaurant = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/restaurants/${restaurantId}`);
            const data = await response.json();

            if (response.ok) {
                setRestaurant(data.restaurant);
                setMenuItems(data.restaurant.menuItems || []);
            } else {
                setError(data.error || 'حدث خطأ أثناء جلب القائمة');
            }
        } catch (err) {
            setError('حدث خطأ أثناء الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleItem = (itemId: string) => {
        const newSelected = new Map(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.set(itemId, 1);
        }
        setSelectedItems(newSelected);
    };

    const handleQuantityChange = (itemId: string, quantity: number) => {
        const newSelected = new Map(selectedItems);
        newSelected.set(itemId, quantity);
        setSelectedItems(newSelected);
    };

    const normalizeText = (value: string) => value.toLowerCase().trim();

    const filteredMenuItems = menuItems.filter((item) => {
        const q = normalizeText(searchQuery);
        if (!q) return true;

        const name = normalizeText(item.name);
        const description = normalizeText(item.description || '');
        return name.includes(q) || description.includes(q);
    });

    const calculateTotal = () => {
        let total = 0;
        selectedItems.forEach((quantity, itemId) => {
            const item = menuItems.find((mi) => mi.id === itemId);
            if (item) {
                total += item.price * quantity;
            }
        });
        return total;
    };

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

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    restaurantId,
                    mealType: mealType || 'LUNCH',
                    items,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('تم الإرسال', 'تم إرسال طلبك بنجاح', 'success', () => {
                    router.push('/orders');
                });
            } else {
                showNotification('خطأ', data.error || 'حدث خطأ أثناء إرسال الطلب', 'error');
            }
        } catch (err) {
            showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const total = calculateTotal();

    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <header className="glass-card mx-4 mt-4 mb-8 p-6">
                <div className="max-w-7xl mx-auto">
                    <a
                        href={`/restaurants?mealType=${mealType || ''}`}
                        className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
                    >
                        ← العودة للمطاعم
                    </a>
                    {restaurant && (
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                {restaurant.name}
                            </h1>
                            <p className="text-gray-600">اختر الوجبات التي تريدها</p>
                        </div>
                    )}

                    {!loading && !error && menuItems.length > 0 && (
                        <div className="mt-6">
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن وجبة..."
                                className="w-full glass-card px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                            />
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4">
                {loading && <LoadingSpinner />}

                {error && <ErrorMessage message={error} onRetry={fetchRestaurant} />}

                {!loading && !error && menuItems.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            لا توجد وجبات متاحة
                        </h3>
                    </div>
                )}

                {!loading && !error && menuItems.length > 0 && (
                    <div className="space-y-4">
                        {filteredMenuItems.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🔎</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    لا توجد نتائج
                                </h3>
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

            {/* Fixed Bottom Bar */}
            {selectedItems.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 glass-card p-4 shadow-2xl">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-600">
                                {selectedItems.size} وجبة محددة
                            </p>
                            <p className="text-2xl font-bold text-indigo-600">
                                {total.toFixed(2)} جنيه
                            </p>
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
