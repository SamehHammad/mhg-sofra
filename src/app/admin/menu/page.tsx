'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { MEAL_TYPES } from '@/lib/constants';

export default function AdminMenuPage() {
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        mealType: 'LUNCH',
        description: '',
        restaurantId: '',
    });
    const router = useRouter();

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
                if (restaurantsData.restaurants.length > 0 && !formData.restaurantId) {
                    setFormData((prev) => ({
                        ...prev,
                        restaurantId: restaurantsData.restaurants[0].id,
                    }));
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
                alert(data.error || 'حدث خطأ');
            }
        } catch (err) {
            alert('حدث خطأ أثناء الاتصال بالخادم');
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
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الوجبة؟')) return;

        try {
            const response = await fetch(`/api/menu/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchData();
            } else {
                const data = await response.json();
                alert(data.error || 'حدث خطأ');
            }
        } catch (err) {
            alert('حدث خطأ أثناء الاتصال بالخادم');
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">إدارة القوائم</h1>

                <AdminNav />

                <div className="mb-6">
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingId(null);
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
                        {showForm ? 'إلغاء' : '+ إضافة وجبة جديدة'}
                    </button>
                </div>

                {showForm && (
                    <div className="glass-card p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingId ? 'تعديل الوجبة' : 'إضافة وجبة جديدة'}
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
                                        السعر (ر.س) *
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
                                        <p className="text-lg font-bold text-indigo-600">{item.price} ر.س</p>
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
