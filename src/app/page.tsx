'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UsernameModal from '@/components/UsernameModal';
import MealTypeCard from '@/components/MealTypeCard';
import { MEAL_TYPES, SESSION_KEYS } from '@/lib/constants';

export default function HomePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem(SESSION_KEYS.USERNAME);
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setShowModal(true);
    }
  }, []);

  const handleUsernameSubmit = async (newUsername: string) => {
    try {
      const response = await fetch('/api/auth/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
      });

      if (response.ok) {
        localStorage.setItem(SESSION_KEYS.USERNAME, newUsername);
        setUsername(newUsername);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error saving username:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {showModal && <UsernameModal onSubmit={handleUsernameSubmit} />}

      {/* Header */}
      <header className="glass-card mx-4 mt-4 mb-8 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">MHG Sofra</h1>
            <p className="text-gray-600">نظام تجميع أوردرات الوجبات</p>
          </div>
          {username && (
            <div className="text-right">
              <p className="text-sm text-gray-600">مرحباً</p>
              <p className="text-xl font-bold text-indigo-600">{username}</p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            اختر نوع الوجبة
          </h2>
          <p className="text-gray-600 text-lg">
            ابدأ بتحديد نوع الوجبة التي تريد طلبها
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MEAL_TYPES.map((mealType) => (
            <MealTypeCard key={mealType.type} mealType={mealType} />
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <a
            href="/orders"
            className="px-6 py-3 rounded-xl font-bold bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <span>📦</span>
            عرض الطلبات
          </a>
          <a
            href="/billing"
            className="px-6 py-3 rounded-xl font-bold bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <span>💰</span>
            الحساب والفواتير
          </a>
          <a
            href="/admin/login"
            className="px-6 py-3 rounded-xl font-bold bg-gray-800 hover:bg-gray-900 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <span>🔐</span>
            لوحة الإدارة
          </a>
        </div>
      </main>
    </div>
  );
}
