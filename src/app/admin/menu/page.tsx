'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import MenuScanner from '@/components/MenuScanner';
import { MEAL_TYPES } from '@/lib/constants';
import { useNotification } from '@/context/NotificationContext';

interface ScannedItem {
    id: string; // Temporary ID for review
    name: string;
    price: number;
}

export default function AdminMenuPage() {
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    // Scanned items for review
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        mealType: 'LUNCH',
        description: '',
        restaurantId: '',
    });
    const router = useRouter();
    const { showNotification, showConfirm } = useNotification();

    useEffect(() => {
        checkAuth();
        fetchData();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/admin');
            if (!response.ok) {
                router.push('/admin/login');
            }
        } catch (err) {
            router.push('/admin/login');
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [menuRes, restaurantsRes] = await Promise.all([
                fetch('/api/menu'),
                fetch('/api/restaurants'),
            ]);

            const menuData = await menuRes.json();
            const restaurantsData = await restaurantsRes.json();

            if (menuRes.ok && restaurantsRes.ok) {
                setMenuItems(menuData.menuItems);
                setRestaurants(restaurantsData.restaurants);
                if (restaurantsData.restaurants.length > 0) {
                    // Set default restaurant if not already set
                    if (!formData.restaurantId) {
                        setFormData((prev) => ({
                            ...prev,
                            restaurantId: restaurantsData.restaurants[0].id,
                        }));
                    }
                }
            } else {
                setError('حدث خطأ أثناء جلب البيانات');
            }
        } catch (err) {
            setError('حدث خطأ أثناء الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingId ? `/api/menu/${editingId}` : '/api/menu';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                }),
            });

            if (response.ok) {
                showNotification('تم الحفظ', editingId ? 'تم تعديل الوجبة بنجاح' : 'تم إضافة الوجبة بنجاح', 'success');
                setShowForm(false);
                setEditingId(null);
                setFormData({
                    name: '',
                    price: '',
                    mealType: 'LUNCH',
                    description: '',
                    restaurantId: restaurants[0]?.id || '',
                });
                fetchData();
            } else {
                const data = await response.json();
                showNotification('خطأ', data.error || 'حدث خطأ أثناء الحفظ', 'error');
            }
        } catch (err) {
            showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            price: item.price.toString(),
            mealType: item.mealType,
            description: item.description || '',
            restaurantId: item.restaurantId,
        });
        setShowForm(true);
        setShowScanner(false);
        setScannedItems([]);
    };

    const handleDelete = (id: string) => {
        showConfirm('حذف الوجبة', 'هل أنت متأكد من رغبتك في حذف هذه الوجبة؟', async () => {
            try {
                const response = await fetch(`/api/menu/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    showNotification('تم الحذف', 'تم حذف الوجبة بنجاح', 'success');
                    fetchData();
                } else {
                    const data = await response.json();
                    showNotification('خطأ', data.error || 'حدث خطأ أثناء الحذف', 'error');
                }
            } catch (err) {
                showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
            }
        });
    };

    // Handler for when items are extracted by the scanner
    const handleItemsExtracted = (items: { name: string; price: number }[]) => {
        const newItems = items.map((item, index) => ({
            id: `scanned-${Date.now()}-${index}`,
            name: item.name,
            price: item.price,
        }));
        setScannedItems(newItems);
        showNotification('تم المسح', `تم استخراج ${items.length} عنصر بنجاح`, 'success');
    };

    // Remove a scanned item from the review list
    const removeScannedItem = (id: string) => {
        setScannedItems((prev) => prev.filter((item) => item.id !== id));
    };

    // Save all scanned items to the database
    const saveScannedItems = async () => {
        if (scannedItems.length === 0) return;
        if (!formData.restaurantId) {
            showNotification('تنبيه', 'الرجاء اختيار مطعم أولاً', 'error');
            return;
        }

        try {
            setLoading(true);
            let successCount = 0;
            let failCount = 0;

            // Sequentially save items
            for (const item of scannedItems) {
                try {
                    const response = await fetch('/api/menu', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: item.name,
                            price: item.price,
                            mealType: formData.mealType, // Use currently selected meal type
                            restaurantId: formData.restaurantId, // Use currently selected restaurant
                            description: '',
                        }),
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (err) {
                    failCount++;
                }
            }

            if (successCount > 0) {
                showNotification('تم الحفظ', `تم إضافة ${successCount} وجبة بنجاح. ${failCount > 0 ? `فشل ${failCount} وجبة.` : ''}`, 'success');
                setScannedItems([]);
                setShowScanner(false);
                fetchData();
            } else {
                showNotification('خطأ', 'فشل حفظ الوجبات', 'error');
            }
        } catch (err) {
            showNotification('خطأ', 'حدث خطأ أثناء الحفظ', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">إدارة القوائم</h1>

                <AdminNav />

                <div className="mb-6 flex gap-4 flex-wrap">
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setShowScanner(false);
                            setEditingId(null);
                            setScannedItems([]);
                            setFormData({
                                name: '',
                                price: '',
                                mealType: 'LUNCH',
                                description: '',
                                restaurantId: restaurants[0]?.id || '',
                            });
                        }}
                        className="btn-primary"
                    >
                        {showForm ? 'إلغاء' : '+ إضافة وجبة يدوياً'}
                    </button>

                    <button
                        onClick={() => {
                            setShowScanner(!showScanner);
                            setShowForm(false);
                            setEditingId(null);
                            setScannedItems([]);
                        }}
                        className="btn px-6 py-3 rounded-xl font-bold bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2"
                    >
                        <span>📸</span>
                        {showScanner ? 'إغلاق الماسح الضوئي' : 'مسح المنيو من صورة'}
                    </button>
                </div>

                {/* Manual Form */}
                {showForm && (
                    <div className="glass-card p-6 mb-6 animate-[message-in_0.3s_ease-out]">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingId ? 'تعديل الوجبة' : 'إضافة وجبة يدوياً'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        اسم الوجبة *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-modern"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        السعر (جنيه) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="input-modern"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        نوع الوجبة *
                                    </label>
                                    <select
                                        value={formData.mealType}
                                        onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                                        className="input-modern"
                                        required
                                    >
                                        {MEAL_TYPES.map((mt) => (
                                            <option key={mt.type} value={mt.type}>
                                                {mt.labelAr}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        المطعم *
                                    </label>
                                    <select
                                        value={formData.restaurantId}
                                        onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                                        className="input-modern"
                                        required
                                    >
                                        {restaurants.map((restaurant) => (
                                            <option key={restaurant.id} value={restaurant.id}>
                                                {restaurant.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    الوصف
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-modern"
                                    rows={3}
                                    placeholder="وصف الوجبة (اختياري)"
                                />
                            </div>

                            <button type="submit" className="btn-primary w-full">
                                {editingId ? 'تحديث' : 'إضافة'}
                            </button>
                        </form>
                    </div>
                )}

                {/* OCR Scanner Section */}
                {showScanner && (
                    <div className="space-y-6 mb-8 animate-[message-in_0.3s_ease-out]">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">مسح المنيو من صورة</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        اختر المطعم لإضافة الوجبات إليه *
                                    </label>
                                    <select
                                        value={formData.restaurantId}
                                        onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                                        className="input-modern"
                                        required
                                    >
                                        {restaurants.map((restaurant) => (
                                            <option key={restaurant.id} value={restaurant.id}>
                                                {restaurant.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        نوع الوجبة للوجبات الممسوحة *
                                    </label>
                                    <select
                                        value={formData.mealType}
                                        onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                                        className="input-modern"
                                        required
                                    >
                                        {MEAL_TYPES.map((mt) => (
                                            <option key={mt.type} value={mt.type}>
                                                {mt.labelAr}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <MenuScanner
                                restaurantId={formData.restaurantId}
                                mealType={formData.mealType}
                                onItemsExtracted={handleItemsExtracted}
                            />
                        </div>

                        {/* Review Scanned Items */}
                        {scannedItems.length > 0 && (
                            <div className="glass-card p-6 border-2 border-indigo-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        مراجعة الوجبات المستخرجة ({scannedItems.length})
                                    </h3>
                                    <div className="text-sm text-gray-600">
                                        يمكنك حذف الوجبات غير الصحيحة قبل الحفظ
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-h-96 overflow-y-auto p-2">
                                    {scannedItems.map((item) => (
                                        <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between group">
                                            <div>
                                                <div className="font-bold text-gray-800">{item.name}</div>
                                                <div className="text-indigo-600 font-bold">{item.price} جنيه</div>
                                            </div>
                                            <button
                                                onClick={() => removeScannedItem(item.id)}
                                                className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                                                title="حذف"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={saveScannedItems}
                                        disabled={loading}
                                        className="btn-primary flex-1"
                                    >
                                        {loading ? 'جاري الحفظ...' : 'حفظ جميع الوجبات'}
                                    </button>
                                    <button
                                        onClick={() => setScannedItems([])}
                                        disabled={loading}
                                        className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {loading && <LoadingSpinner />}

                {error && <ErrorMessage message={error} onRetry={fetchData} />}

                {!loading && !error && (
                    <div className="space-y-4">
                        {menuItems.map((item) => (
                            <div key={item.id} className="glass-card p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {item.restaurant?.name} •{' '}
                                            {MEAL_TYPES.find((mt) => mt.type === item.mealType)?.labelAr}
                                        </p>
                                        {item.description && (
                                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                        )}
                                        <p className="text-lg font-bold text-indigo-600">{item.price} جنيه</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300"
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-4 py-2 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white transition-all duration-300"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
