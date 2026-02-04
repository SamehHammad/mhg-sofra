'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import MenuScanner from '@/components/MenuScanner';
import { MEAL_TYPES, MEAL_SHAPES } from '@/lib/constants';
import { useNotification } from '@/context/NotificationContext';
import {
    bulkDeleteMenuItemsAction,
    deleteMenuItemAction,
    getAdminMenuDataAction,
    importExcelMenuAction,
    importJsonMenuAction,
    saveImportedMealsAction,
    upsertMenuItemAction,
} from '../actions';

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
    const [activeSection, setActiveSection] = useState<'none' | 'manual' | 'scanner' | 'excel' | 'json'>('none');
    const [editingId, setEditingId] = useState<string | null>(null);
    // Scanned items for review
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);

    const [importFile, setImportFile] = useState<File | null>(null);
    const [importMode, setImportMode] = useState<'skip' | 'upsert'>('skip');
    const [importResult, setImportResult] = useState<any | null>(null);

    const [jsonFile, setJsonFile] = useState<File | null>(null);
    const [jsonImportMode, setJsonImportMode] = useState<'skip' | 'upsert'>('skip');
    const [jsonImportResult, setJsonImportResult] = useState<any | null>(null);

    // Imported meals for preview
    const [importedMeals, setImportedMeals] = useState<any[]>([]);
    const [editingImportedIndex, setEditingImportedIndex] = useState<number | null>(null);

    // Lazy loading and search state
    const [displayedItemsCount, setDisplayedItemsCount] = useState(20);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRestaurantFilter, setSelectedRestaurantFilter] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        mealType: 'BREAKFAST',
        description: '',
        restaurantId: '',
        options: [] as string[],
        mealShape: 'PLATE' as string | null, // Default
    });
    const [currentOption, setCurrentOption] = useState('');
    const router = useRouter();
    const { showNotification, showConfirm } = useNotification();

    useEffect(() => {
        fetchData();
    }, []);

    // Filter and search logic
    const filteredMenuItems = useMemo(() => {
        let filtered = menuItems;

        // Filter by restaurant
        if (selectedRestaurantFilter) {
            filtered = filtered.filter(item => item.restaurantId === selectedRestaurantFilter);
        }

        // Search by name
        if (searchQuery.trim()) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [menuItems, selectedRestaurantFilter, searchQuery]);

    // Items to display (with lazy loading)
    const displayedItems = useMemo(() => {
        // If searching, show all results
        if (searchQuery.trim()) {
            return filteredMenuItems;
        }
        // Otherwise, show limited items
        return filteredMenuItems.slice(0, displayedItemsCount);
    }, [filteredMenuItems, displayedItemsCount, searchQuery]);

    // Infinite scroll with Intersection Observer
    useEffect(() => {
        // Only enable infinite scroll when not searching
        if (searchQuery.trim()) return;
        if (displayedItems.length >= filteredMenuItems.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setDisplayedItemsCount(prev => Math.min(prev + 20, filteredMenuItems.length));
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        const sentinel = document.getElementById('scroll-sentinel');
        if (sentinel) observer.observe(sentinel);

        return () => observer.disconnect();
    }, [searchQuery, displayedItems.length, filteredMenuItems.length]);

    const handleActionClick = (section: 'none' | 'manual' | 'scanner' | 'excel' | 'json') => {
        if (activeSection === section) {
            setActiveSection('none');
        } else {
            setActiveSection(section);
            // Reset states when switching sections
            setEditingId(null);
            setScannedItems([]);
            setImportResult(null);
            setJsonImportResult(null);
            if (section === 'manual') {
                setFormData({
                    name: '',
                    price: '',
                    mealType: 'LUNCH',
                    description: '',
                    restaurantId: restaurants[0]?.id || '',
                    options: [],
                    mealShape: 'PLATE',
                });
                setCurrentOption('');
            }
        }
    };

    const handleDeleteAllMeals = (scope: 'restaurant' | 'all') => {
        const title = scope === 'all' ? 'حذف جميع الوجبات' : 'حذف وجبات المطعم';
        const message =
            scope === 'all'
                ? 'هل أنت متأكد؟ سيتم حذف جميع الوجبات من جميع المطاعم.'
                : 'هل أنت متأكد؟ سيتم حذف جميع وجبات المطعم المحدد.';

        showConfirm(title, message, async () => {
            try {
                setLoading(true);
                const result = await bulkDeleteMenuItemsAction({
                    deleteAll: scope === 'all',
                    restaurantId: scope === 'restaurant' ? formData.restaurantId : undefined,
                });

                if (result.ok) {
                    showNotification('تم الحذف', `تم حذف ${result.deletedCount} وجبة`, 'success');
                    setImportResult(null);
                    setScannedItems([]);
                    setActiveSection('none');
                    setEditingId(null);
                    fetchData();
                } else {
                    if (result.error === 'غير مصرح') {
                        router.push('/admin/login');
                        return;
                    }
                    showNotification('خطأ', result.error || 'فشل حذف الوجبات', 'error');
                }
            } catch (err) {
                showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
            } finally {
                setLoading(false);
            }
        });
    };

    const handleImportExcel = async () => {
        if (!importFile) {
            showNotification('تنبيه', 'الرجاء اختيار ملف Excel', 'error');
            return;
        }
        if (!formData.restaurantId) {
            showNotification('تنبيه', 'الرجاء اختيار مطعم افتراضي', 'error');
            return;
        }

        try {
            setLoading(true);
            setImportResult(null);

            const fd = new FormData();
            fd.append('file', importFile);
            fd.append('restaurantId', formData.restaurantId);
            fd.append('mealType', formData.mealType);
            fd.append('mode', importMode);

            const result = await importExcelMenuAction(fd);
            if (result.ok) {
                const viewData = {
                    success: true,
                    createdCount: result.createdCount,
                    skippedCount: result.skippedCount,
                    errorCount: result.errorCount,
                    results: [],
                };
                setImportResult(viewData);
                showNotification(
                    'تم الاستيراد',
                    `تم إنشاء/تحديث ${result.createdCount} وجبة. تم تخطي ${result.skippedCount}. أخطاء ${result.errorCount}.`,
                    result.errorCount > 0 ? 'error' : 'success'
                );
                fetchData();
            } else {
                if (result.error === 'غير مصرح') {
                    router.push('/admin/login');
                    return;
                }
                showNotification('خطأ', result.error || 'فشل استيراد الملف', 'error');
            }
        } catch (err) {
            showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleImportJson = async () => {
        if (!jsonFile) {
            showNotification('تنبيه', 'الرجاء اختيار ملف JSON', 'error');
            return;
        }

        try {
            setLoading(true);
            setJsonImportResult(null);
            setImportedMeals([]);

            const fd = new FormData();
            fd.append('file', jsonFile);
            if (formData.restaurantId) fd.append('restaurantId', formData.restaurantId);
            if (formData.mealType) fd.append('mealType', formData.mealType);

            const result = await importJsonMenuAction(fd);
            if (result.ok) {
                setImportedMeals(result.parsedMeals);
                if (result.errors.length > 0) {
                    showNotification(
                        'تحذير',
                        `تم تحليل ${result.parsedMeals.length} وجبة. ${result.errors.length} أخطاء.`,
                        'error'
                    );
                } else {
                    showNotification(
                        'تم التحليل',
                        `تم تحليل ${result.parsedMeals.length} وجبة بنجاح. يرجى المراجعة قبل الحفظ.`,
                        'success'
                    );
                }
            } else {
                if (result.error === 'غير مصرح') {
                    router.push('/admin/login');
                    return;
                }
                showNotification('خطأ', result.error || 'فشل استيراد الملف', 'error');
            }
        } catch (err) {
            showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await getAdminMenuDataAction();
            if (!result.ok) {
                router.push('/admin/login');
                return;
            }

            setMenuItems(result.menuItems);
            setRestaurants(result.restaurants);
            if (result.restaurants.length > 0 && !formData.restaurantId) {
                setFormData((prev) => ({
                    ...prev,
                    restaurantId: result.restaurants[0].id,
                }));
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
            const result = await upsertMenuItemAction({
                id: editingId,
                name: formData.name,
                price: parseFloat(formData.price),
                mealType: formData.mealType,
                description: formData.description,
                restaurantId: formData.restaurantId,
                options: formData.options,
                mealShape: formData.mealShape ?? undefined,
            });

            if (result.ok) {
                showNotification('تم الحفظ', editingId ? 'تم تعديل الوجبة بنجاح' : 'تم إضافة الوجبة بنجاح', 'success');
                setActiveSection('none');
                setEditingId(null);
                setFormData({
                    name: '',
                    price: '',
                    mealType: 'LUNCH',
                    description: '',
                    restaurantId: restaurants[0]?.id || '',
                    options: [],
                    mealShape: 'PLATE',
                });
                setCurrentOption('');
                fetchData();
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

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            price: item.price.toString(),
            mealType: item.mealType,
            description: item.description || '',
            restaurantId: item.restaurantId,
            options: item.options || [],
            mealShape: item.mealShape || 'PLATE',
        });
        setCurrentOption('');
        // setActiveSection('manual'); // Using modal instead
        setScannedItems([]);
    };

    const handleDelete = (id: string) => {
        showConfirm('حذف الوجبة', 'هل أنت متأكد من رغبتك في حذف هذه الوجبة؟', async () => {
            try {
                const result = await deleteMenuItemAction(id);
                if (result.ok) {
                    showNotification('تم الحذف', 'تم حذف الوجبة بنجاح', 'success');
                    fetchData();
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
                    const result = await upsertMenuItemAction({
                        name: item.name,
                        price: item.price,
                        mealType: formData.mealType,
                        restaurantId: formData.restaurantId,
                        description: '',
                    });

                    if (result.ok) {
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
                setActiveSection('none');
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

    // Remove an imported meal from the preview list
    const removeImportedMeal = (index: number) => {
        setImportedMeals((prev) => prev.filter((_, i) => i !== index));
    };

    // Update an imported meal
    const updateImportedMeal = (index: number, updates: Partial<any>) => {
        setImportedMeals((prev) =>
            prev.map((meal, i) => (i === index ? { ...meal, ...updates } : meal))
        );
    };

    // Save all imported meals to database
    const saveAllImportedMeals = async () => {
        if (importedMeals.length === 0) return;

        try {
            setLoading(true);
            const result = await saveImportedMealsAction({
                meals: importedMeals,
                mode: jsonImportMode,
            });

            if (result.ok) {
                showNotification(
                    'تم الحفظ',
                    `تم حفظ ${result.createdCount} وجبة. تم تخطي ${result.skippedCount}. أخطاء ${result.errorCount}.`,
                    result.errorCount > 0 ? 'error' : 'success'
                );
                setImportedMeals([]);
                setActiveSection('none');
                fetchData();
            } else {
                if (result.error === 'غير مصرح') {
                    router.push('/admin/login');
                    return;
                }
                showNotification('خطأ', result.error || 'حدث خطأ أثناء الحفظ', 'error');
            }
        } catch (err) {
            showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-mhg-gold mb-6">إدارة القوائم</h1>

                <AdminNav />

                {/* Search and Filter Section */}
                <div className="mb-6 glass-card p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Search Input */}
                        <div className="flex-1 w-full">
                            <input
                                type="text"
                                placeholder="🔍 ابحث عن وجبة..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-mhg-blue focus:ring-2 focus:ring-mhg-blue/20 outline-none text-gray-900 font-semibold"
                            />
                        </div>

                        {/* Restaurant Filter */}
                        <div className="w-full md:w-64">
                            <select
                                value={selectedRestaurantFilter}
                                onChange={(e) => setSelectedRestaurantFilter(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-mhg-blue focus:ring-2 focus:ring-mhg-blue/20 outline-none text-gray-900 font-semibold"
                            >
                                <option value="">جميع المطاعم</option>
                                {restaurants.map((restaurant) => (
                                    <option key={restaurant.id} value={restaurant.id}>
                                        {restaurant.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Meal Count Display */}
                        <div className="flex items-center gap-2 bg-mhg-gold/10 px-4 py-3 rounded-xl border-2 border-mhg-gold/30">
                            <span className="text-2xl">🍽️</span>
                            <div className="text-center">
                                <div className="text-xs text-mhg-gold font-bold">إجمالي الوجبات</div>
                                <div className="text-xl font-bold text-mhg-blue-deep">
                                    {searchQuery || selectedRestaurantFilter ? (
                                        <span>{filteredMenuItems.length} / {menuItems.length}</span>
                                    ) : (
                                        menuItems.length
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex gap-3 flex-wrap items-center bg-white/50 p-4 rounded-xl border border-white/20 shadow-sm backdrop-blur-sm">
                    <button
                        onClick={() => handleActionClick('manual')}
                        className={`btn-primary flex-1 sm:flex-none ${activeSection === 'manual' ? 'ring-2 ring-mhg-gold ring-offset-2' : ''}`}
                    >
                        {activeSection === 'manual' && !editingId ? 'إغلاق الإضافة' : '+ إضافة يدوية'}
                    </button>

                    <button
                        onClick={() => handleActionClick('excel')}
                        className={`btn px-4 py-2.5 rounded-xl font-bold border-2 transition-all duration-300 flex items-center gap-2 ${activeSection === 'excel'
                            ? 'bg-mhg-blue text-white border-mhg-blue'
                            : 'bg-white text-mhg-blue border-mhg-blue/30 hover:border-mhg-blue hover:bg-mhg-blue/5'
                            }`}
                    >
                        <span>📊</span>
                        استيراد Excel
                    </button>

                    <button
                        onClick={() => handleActionClick('json')}
                        className={`btn px-4 py-2.5 rounded-xl font-bold border-2 transition-all duration-300 flex items-center gap-2 ${activeSection === 'json'
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-orange-600 border-orange-600/30 hover:border-orange-600 hover:bg-orange-50'
                            }`}
                    >
                        <span>📋</span>
                        استيراد JSON
                    </button>

                    <button
                        onClick={() => handleActionClick('scanner')}
                        className={`btn px-4 py-2.5 rounded-xl font-bold border-2 transition-all duration-300 flex items-center gap-2 ${activeSection === 'scanner'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-purple-600 border-purple-600/30 hover:border-purple-600 hover:bg-purple-50'
                            }`}
                    >
                        <span>📸</span>
                        Mas7 (Scan)
                    </button>

                    <div className="flex-1"></div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleDeleteAllMeals('restaurant')}
                            disabled={loading || !formData.restaurantId}
                            className="px-4 py-2.5 rounded-xl font-bold text-red-600 hover:bg-red-50 border border-red-200 text-sm transition-all"
                            title="حذف جميع وجبات المطعم المحدد"
                        >
                            حذف وجبات المطعم
                        </button>
                        <button
                            onClick={() => handleDeleteAllMeals('all')}
                            disabled={loading}
                            className="px-4 py-2.5 rounded-xl font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-sm transition-all"
                            title="حذف جميع الوجبات من النظام"
                        >
                            حذف الكل 🗑️
                        </button>
                    </div>
                </div>

                {/* Excel Import Section */}
                {activeSection === 'excel' && (
                    <div className="glass-card p-6 mb-6 animate-[fadeIn_0.3s_ease-out]">
                        <h2 className="text-xl font-bold text-mhg-gold mb-4 flex items-center gap-2">
                            <span>📊</span> استيراد وجبات من Excel
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                    المطعم الافتراضي *
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
                                <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                    نوع الوجبة الافتراضي
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                    ملف Excel (.xlsx) *
                                </label>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                                    className="input-modern"
                                />
                                <div className="text-xs text-mhg-gold mt-2">
                                    الأعمدة المطلوبة: name, price (يمكن أيضاً استخدام: اسم/السعر)
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                    وضع الاستيراد
                                </label>
                                <select
                                    value={importMode}
                                    onChange={(e) => setImportMode(e.target.value as any)}
                                    className="input-modern"
                                >
                                    <option value="skip">تخطي الموجود</option>
                                    <option value="upsert">تحديث الموجود (حسب الاسم + النوع + المطعم)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleImportExcel}
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'جاري الاستيراد...' : 'استيراد الوجبات'}
                        </button>

                        {importResult?.success && (
                            <div className="mt-4 bg-white rounded-xl p-4 border border-gray-100">
                                <div className="font-bold text-mhg-gold mb-2">نتيجة الاستيراد</div>
                                <div className="text-sm text-mhg-blue-deep">
                                    تم إنشاء/تحديث: {importResult.createdCount} | تم تخطي: {importResult.skippedCount} | أخطاء: {importResult.errorCount}
                                </div>

                                {Array.isArray(importResult.results) && importResult.results.length > 0 && (
                                    <div className="mt-3 max-h-60 overflow-y-auto text-sm">
                                        {importResult.results.map((r: any) => (
                                            <div key={`${r.rowNumber}-${r.message}`} className="py-1 border-b border-gray-50">
                                                <span className="font-bold">Row {r.rowNumber}:</span> {r.status} - {r.message}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* JSON Import Section */}
                {activeSection === 'json' && (
                    <div className="glass-card p-6 mb-6 animate-[fadeIn_0.3s_ease-out]">
                        <h2 className="text-xl font-bold text-mhg-gold mb-4 flex items-center gap-2">
                            <span>📋</span> استيراد وجبات من JSON
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                    المطعم (اختياري - لتجاوز JSON)
                                </label>
                                <select
                                    value={formData.restaurantId}
                                    onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                                    className="input-modern"
                                >
                                    <option value="">-- خذ من الملف --</option>
                                    {restaurants.map((restaurant) => (
                                        <option key={restaurant.id} value={restaurant.id}>
                                            {restaurant.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                    نوع الوجبة (اختياري - لتجاوز JSON)
                                </label>
                                <select
                                    value={formData.mealType}
                                    onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                                    className="input-modern"
                                >
                                    <option value="">-- خذ من الملف --</option>
                                    {MEAL_TYPES.map((mt) => (
                                        <option key={mt.type} value={mt.type}>
                                            {mt.labelAr}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                ملف JSON (.json) *
                            </label>
                            <input
                                type="file"
                                accept=".json"
                                onChange={(e) => setJsonFile(e.target.files?.[0] ?? null)}
                                className="input-modern"
                            />
                            <div className="text-xs text-mhg-gold mt-2">
                                يجب أن يحتوي الملف على مصفوفة من الوجبات بالحقول: name, price, mealType, restaurantId, options (اختياري)
                            </div>
                            <details className="mt-2">
                                <summary className="text-xs text-mhg-blue cursor-pointer hover:text-mhg-blue-deep">
                                    عرض مثال على صيغة JSON
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs overflow-x-auto text-left" dir="ltr">
                                    {`[
  {
    "name": "ساندويتش فلافل",
    "price": 25,
    "mealType": "BREAKFAST",
    "description": "ساندويتش فلافل لذيذ",
    "restaurantId": "YOUR_RESTAURANT_ID",
    "options": ["شامي", "بلدي"]
  }
]`}
                                </pre>
                            </details>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                وضع الاستيراد
                            </label>
                            <select
                                value={jsonImportMode}
                                onChange={(e) => setJsonImportMode(e.target.value as any)}
                                className="input-modern"
                            >
                                <option value="skip">تخطي الموجود</option>
                                <option value="upsert">تحديث الموجود (حسب الاسم + النوع + المطعم)</option>
                            </select>
                        </div>

                        <button
                            onClick={handleImportJson}
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'جاري الاستيراد...' : 'استيراد الوجبات من JSON'}
                        </button>

                        {/* Preview Imported Meals */}
                        {importedMeals.length > 0 && (
                            <div className="mt-6 glass-card p-6 border-2 border-mhg-gold/20">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-mhg-gold">
                                        مراجعة الوجبات المستوردة ({importedMeals.length})
                                    </h3>
                                    <div className="text-sm text-mhg-gold">
                                        يمكنك تعديل أو حذف الوجبات قبل الحفظ
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                                    {importedMeals.map((meal, index) => (
                                        <div key={index} className="bg-white p-4 rounded-lg shadow-md border-2 border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">الاسم</label>
                                                    <input
                                                        type="text"
                                                        value={meal.name}
                                                        onChange={(e) => updateImportedMeal(index, { name: e.target.value })}
                                                        className="w-full px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-lg focus:border-mhg-blue focus:ring-2 focus:ring-mhg-blue/20 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">السعر</label>
                                                    <input
                                                        type="number"
                                                        value={meal.price}
                                                        onChange={(e) => updateImportedMeal(index, { price: parseFloat(e.target.value) })}
                                                        className="w-full px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-lg focus:border-mhg-blue focus:ring-2 focus:ring-mhg-blue/20 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">النوع</label>
                                                    <select
                                                        value={meal.mealType}
                                                        onChange={(e) => updateImportedMeal(index, { mealType: e.target.value })}
                                                        className="w-full px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-lg focus:border-mhg-blue focus:ring-2 focus:ring-mhg-blue/20 outline-none"
                                                    >
                                                        {MEAL_TYPES.map((mt) => (
                                                            <option key={mt.type} value={mt.type}>
                                                                {mt.labelAr}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">الشكل</label>
                                                    <select
                                                        value={meal.mealShape || 'PLATE'}
                                                        onChange={(e) => updateImportedMeal(index, { mealShape: e.target.value })}
                                                        className="w-full px-3 py-2 text-sm font-semibold text-gray-900 bg-gray-50 border-2 border-gray-300 rounded-lg focus:border-mhg-blue focus:ring-2 focus:ring-mhg-blue/20 outline-none"
                                                    >
                                                        {MEAL_SHAPES.map((ms) => (
                                                            <option key={ms.type} value={ms.type}>
                                                                {ms.labelAr}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="text-sm font-semibold text-gray-700">
                                                    {meal.restaurantName} {meal.options?.length > 0 && `• خيارات: ${meal.options.join(', ')}`}
                                                </div>
                                                <button
                                                    onClick={() => removeImportedMeal(index)}
                                                    className="px-3 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={saveAllImportedMeals}
                                        disabled={loading}
                                        className="btn-primary flex-1"
                                    >
                                        {loading ? 'جاري الحفظ...' : `حفظ جميع الوجبات (${importedMeals.length})`}
                                    </button>
                                    <button
                                        onClick={() => setImportedMeals([])}
                                        disabled={loading}
                                        className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-mhg-blue-deep hover:bg-gray-200 transition-all"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Manual Form */}
                {activeSection === 'manual' && !editingId && (
                    <div className="glass-card p-6 mb-6 animate-[message-in_0.3s_ease-out]">
                        <h2 className="text-xl font-bold text-mhg-gold mb-4">
                            {editingId ? 'تعديل الوجبة' : 'إضافة وجبة يدوياً'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
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
                                    <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
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
                                    <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
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
                                    <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
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
                                <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
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

                            <div>
                                <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                    شكل الوجبة
                                </label>
                                <select
                                    value={formData.mealShape || 'PLATE'}
                                    onChange={(e) => setFormData({ ...formData, mealShape: e.target.value })}
                                    className="input-modern"
                                >
                                    {MEAL_SHAPES.map((ms) => (
                                        <option key={ms.type} value={ms.type}>
                                            {ms.labelAr}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Options Section */}
                            <div>
                                <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                    خيارات الوجبة (اختياري)
                                </label>
                                <div className="text-xs text-mhg-gold mb-2">
                                    مثال: شامي، بلدي، صغير، كبير، إلخ
                                </div>

                                {/* Current Options Display */}
                                {formData.options.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.options.map((option, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 bg-mhg-gold/10 border border-mhg-gold/30 rounded-lg px-3 py-1.5"
                                            >
                                                <span className="text-mhg-gold font-bold">{option}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newOptions = formData.options.filter((_, i) => i !== index);
                                                        setFormData({ ...formData, options: newOptions });
                                                    }}
                                                    className="text-red-600 hover:text-red-700 font-bold"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Option Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={currentOption}
                                        onChange={(e) => setCurrentOption(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const trimmed = currentOption.trim();
                                                if (trimmed && !formData.options.includes(trimmed)) {
                                                    setFormData({ ...formData, options: [...formData.options, trimmed] });
                                                    setCurrentOption('');
                                                }
                                            }
                                        }}
                                        className="input-modern flex-1"
                                        placeholder="أضف خيار (اضغط Enter)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const trimmed = currentOption.trim();
                                            if (trimmed && !formData.options.includes(trimmed)) {
                                                setFormData({ ...formData, options: [...formData.options, trimmed] });
                                                setCurrentOption('');
                                            }
                                        }}
                                        className="px-4 py-2 rounded-xl font-bold bg-mhg-blue hover:bg-mhg-blue-deep text-white transition-all duration-300"
                                    >
                                        إضافة
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary w-full">
                                {editingId ? 'تحديث' : 'إضافة'}
                            </button>
                        </form>
                    </div>
                )
                }

                {/* OCR Scanner Section */}
                {/* OCR Scanner Section */}
                {activeSection === 'scanner' && (
                    <div className="space-y-6 mb-8 animate-[message-in_0.3s_ease-out]">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold text-mhg-gold mb-4">مسح المنيو من صورة</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
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
                                    <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
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
                            <div className="glass-card p-6 border-2 border-mhg-gold/20">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-mhg-gold">
                                        مراجعة الوجبات المستخرجة ({scannedItems.length})
                                    </h3>
                                    <div className="text-sm text-mhg-gold">
                                        يمكنك حذف الوجبات غير الصحيحة قبل الحفظ
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-h-96 overflow-y-auto p-2">
                                    {scannedItems.map((item) => (
                                        <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between group">
                                            <div>
                                                <div className="font-bold text-mhg-gold">{item.name}</div>
                                                <div className="text-mhg-blue font-bold">{item.price} جنيه</div>
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
                                        className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-mhg-blue-deep hover:bg-gray-200 transition-all"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
                }

                {loading && <LoadingSpinner />}

                {error && <ErrorMessage message={error} onRetry={fetchData} />}

                {
                    !loading && !error && (
                        <>
                            <div className="space-y-4">
                                {displayedItems.map((item) => (
                                    <div key={item.id} className="glass-card p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-mhg-gold">{item.name}</h3>
                                                <p className="text-sm text-mhg-gold mb-2">
                                                    {item.restaurant?.name} •{' '}
                                                    {MEAL_TYPES.find((mt) => mt.type === item.mealType)?.labelAr}
                                                </p>
                                                {item.description && (
                                                    <p className="text-sm text-mhg-gold mb-2">{item.description}</p>
                                                )}
                                                <p className="text-lg font-bold text-mhg-blue">{item.price} جنيه</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="px-4 py-2 rounded-xl font-bold bg-mhg-blue hover:bg-mhg-blue-deep text-white transition-all duration-300"
                                                >
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="px-4 py-2 rounded-xl font-bold bg-mhg-brown hover:bg-mhg-brown-soft text-white transition-all duration-300"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Scroll Sentinel for Infinite Loading */}
                            {!searchQuery && displayedItems.length < filteredMenuItems.length && (
                                <div id="scroll-sentinel" className="py-8 text-center">
                                    <div className="inline-flex items-center gap-2 text-mhg-gold">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mhg-gold"></div>
                                        <span className="font-bold">جاري تحميل المزيد...</span>
                                    </div>
                                </div>
                            )}

                            {/* Show message when all items are loaded */}
                            {!searchQuery && displayedItems.length >= filteredMenuItems.length && filteredMenuItems.length > 20 && (
                                <div className="py-4 text-center text-mhg-gold font-bold">
                                    ✓ تم عرض جميع الوجبات ({filteredMenuItems.length})
                                </div>
                            )}
                        </>
                    )
                }
                {/* Edit Modal */}
                {editingId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-[scaleIn_0.2s_ease-out]">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-xl font-bold text-mhg-gold">
                                    تعديل الوجبة
                                </h2>
                                <button
                                    onClick={() => {
                                        setEditingId(null);
                                        setFormData({
                                            name: '',
                                            price: '',
                                            mealType: 'LUNCH',
                                            description: '',
                                            restaurantId: restaurants[0]?.id || '',
                                            options: [],
                                            mealShape: 'PLATE',
                                        });
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-red-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                                اسم الوجبة *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="input-modern-light"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                                السعر (جنيه) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className="input-modern-light"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                                نوع الوجبة *
                                            </label>
                                            <select
                                                value={formData.mealType}
                                                onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                                                className="input-modern-light"
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
                                            <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                                المطعم *
                                            </label>
                                            <select
                                                value={formData.restaurantId}
                                                onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                                                className="input-modern-light"
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
                                        <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                            الوصف
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input-modern-light"
                                            rows={3}
                                            placeholder="وصف الوجبة (اختياري)"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                            شكل الوجبة
                                        </label>
                                        <select
                                            value={formData.mealShape || 'PLATE'}
                                            onChange={(e) => setFormData({ ...formData, mealShape: e.target.value })}
                                            className="input-modern-light"
                                        >
                                            {MEAL_SHAPES.map((ms) => (
                                                <option key={ms.type} value={ms.type}>
                                                    {ms.labelAr}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-mhg-blue-deep mb-2">
                                            خيارات الوجبة (اختياري)
                                        </label>
                                        <div className="text-xs text-mhg-gold mb-2">
                                            مثال: شامي، بلدي، صغير، كبير، إلخ
                                        </div>

                                        {formData.options.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {formData.options.map((option, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 bg-mhg-gold/10 border border-mhg-gold/30 rounded-lg px-3 py-1.5"
                                                    >
                                                        <span className="text-mhg-gold font-bold">{option}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newOptions = formData.options.filter((_, i) => i !== index);
                                                                setFormData({ ...formData, options: newOptions });
                                                            }}
                                                            className="text-red-600 hover:text-red-700 font-bold"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={currentOption}
                                                onChange={(e) => setCurrentOption(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const trimmed = currentOption.trim();
                                                        if (trimmed && !formData.options.includes(trimmed)) {
                                                            setFormData({ ...formData, options: [...formData.options, trimmed] });
                                                            setCurrentOption('');
                                                        }
                                                    }
                                                }}
                                                className="input-modern-light flex-1"
                                                placeholder="أضف خيار (اضغط Enter)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const trimmed = currentOption.trim();
                                                    if (trimmed && !formData.options.includes(trimmed)) {
                                                        setFormData({ ...formData, options: [...formData.options, trimmed] });
                                                        setCurrentOption('');
                                                    }
                                                }}
                                                className="px-4 py-2 rounded-xl font-bold bg-mhg-blue hover:bg-mhg-blue-deep text-white transition-all duration-300"
                                            >
                                                إضافة
                                            </button>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-primary w-full">
                                        تحديث الوجبة
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
}
