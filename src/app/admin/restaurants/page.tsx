'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { useNotification } from '@/context/NotificationContext';
import { deleteRestaurantAction, getAdminRestaurantsAction, upsertRestaurantAction } from '../actions';

export default function AdminRestaurantsPage() {
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        deliveryPrice: '0',
    });
    const router = useRouter();
    const { showNotification, showConfirm } = useNotification();

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await getAdminRestaurantsAction();
            if (!result.ok) {
                router.push('/admin/login');
                return;
            }

            setRestaurants(result.restaurants);
        } catch (err) {
            setError('حدث خطأ أثناء الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const result = await upsertRestaurantAction({
                id: editingId,
                name: formData.name,
                phone: formData.phone,
                deliveryPrice: parseFloat(formData.deliveryPrice),
            });

            if (result.ok) {
                showNotification('تم الحفظ', editingId ? 'تم تعديل المطعم بنجاح' : 'تم إضافة المطعم بنجاح', 'success');
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: '', phone: '', deliveryPrice: '0' });
                fetchRestaurants();
            } else {
                if (result.error === 'غير مصرح') {
                    router.push('/admin/login');
                    return;
                }
                showNotification('خطأ', result.error || 'حدث خطأ أثناء الحفظ', 'error');
            }
        } catch (err) {
            showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
        }
    };

    const handleEdit = (restaurant: any) => {
        setEditingId(restaurant.id);
        setFormData({
            name: restaurant.name,
            phone: restaurant.phone || '',
            deliveryPrice: restaurant.deliveryPrice.toString(),
        });
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        showConfirm('حذف المطعم', 'هل أنت متأكد من رغبتك في حذف هذا المطعم؟ لا يمكن التراجع عن هذا الإجراء.', async () => {
            try {
                const result = await deleteRestaurantAction(id);
                if (result.ok) {
                    showNotification('تم الحذف', 'تم حذف المطعم بنجاح', 'success');
                    fetchRestaurants();
                } else {
                    if (result.error === 'غير مصرح') {
                        router.push('/admin/login');
                        return;
                    }
                    showNotification('خطأ', result.error || 'حدث خطأ أثناء الحذف', 'error');
                }
            } catch (err) {
                showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
            }
        });
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">إدارة المطاعم</h1>

                <AdminNav />

                <div className="mb-6">
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingId(null);
                            setFormData({ name: '', phone: '', deliveryPrice: '0' });
                        }}
                        className="btn-primary"
                    >
                        {showForm ? 'إلغاء' : '+ إضافة مطعم جديد'}
                    </button>
                </div>

                {showForm && (
                    <div className="glass-card p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingId ? 'تعديل المطعم' : 'إضافة مطعم جديد'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    اسم المطعم *
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
                                    رقم الهاتف
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-modern"
                                    placeholder="05xxxxxxxx"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    سعر التوصيل (جنيه) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.deliveryPrice}
                                    onChange={(e) => setFormData({ ...formData, deliveryPrice: e.target.value })}
                                    className="input-modern"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-primary w-full">
                                {editingId ? 'تحديث' : 'إضافة'}
                            </button>
                        </form>
                    </div>
                )}

                {loading && <LoadingSpinner />}

                {error && <ErrorMessage message={error} onRetry={fetchRestaurants} />}

                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map((restaurant) => (
                            <div key={restaurant.id} className="glass-card p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h3>
                                {restaurant.phone && (
                                    <p className="text-gray-600 mb-2">📞 {restaurant.phone}</p>
                                )}
                                <p className="text-indigo-600 font-bold mb-4">
                                    توصيل: {restaurant.deliveryPrice} جنيه
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    {restaurant.menuItems?.length || 0} وجبة
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(restaurant)}
                                        className="flex-1 px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300"
                                    >
                                        تعديل
                                    </button>
                                    <button
                                        onClick={() => handleDelete(restaurant.id)}
                                        className="flex-1 px-4 py-2 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white transition-all duration-300"
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
