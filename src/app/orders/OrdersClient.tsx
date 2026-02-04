'use client';

import { useEffect, useMemo, useState } from 'react';
import { MEAL_TYPES, SESSION_KEYS } from '@/lib/constants';
import { useNotification } from '@/context/NotificationContext';
import { deleteOrderAction } from './actions';
import { PhoneCall, Trash2 } from 'lucide-react';

type OrdersSummary = Record<string, Record<string, any>>;

export default function OrdersClient({ summary }: { summary: OrdersSummary }) {
  const { showNotification, showConfirm } = useNotification();
  const [username, setUsername] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(SESSION_KEYS.USERNAME);
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hiddenOrderIds, setHiddenOrderIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const storedUsername = localStorage.getItem(SESSION_KEYS.USERNAME);
    setUsername(storedUsername);
  }, []);

  const getMealTypeLabel = (type: string) => {
    return MEAL_TYPES.find((mt) => mt.type === type)?.labelAr || type;
  };

  const hasSummary = useMemo(() => summary && Object.keys(summary).length > 0, [summary]);

  const onDelete = (orderId: string) => {
    if (!username) {
      showNotification('تنبيه', 'الرجاء تسجيل الدخول أولاً', 'info');
      return;
    }

    showConfirm('حذف الطلب', 'هل أنت متأكد من رغبتك في حذف هذا الطلب؟', async () => {
      try {
        setDeletingId(orderId);
        setHiddenOrderIds((prev) => {
          const next = new Set(prev);
          next.add(orderId);
          return next;
        });
        const result = await deleteOrderAction(orderId, username);
        if (result.ok) {
          showNotification('تم الحذف', 'تم حذف الطلب بنجاح', 'success');
        } else {
          setHiddenOrderIds((prev) => {
            const next = new Set(prev);
            next.delete(orderId);
            return next;
          });
          showNotification('خطأ', result.error || 'فشل حذف الطلب', 'error');
        }
      } catch (err) {
        setHiddenOrderIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
        showNotification('خطأ', 'حدث خطأ أثناء الاتصال بالخادم', 'error');
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <>
      {!hasSummary && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-mhg-gold mb-2">لا توجد طلبات</h3>
          <p className="text-mhg-gold mb-6">لم يتم تقديم أي طلبات بعد</p>
          <a href="/" className="btn-primary inline-block">
            ابدأ الطلب الآن
          </a>
        </div>
      )}

      {hasSummary && (
        <div className="space-y-8">
          {Object.entries(summary).map(([date, mealTypes]: [string, any]) => (
            <div key={date} className="glass-card p-6">
              <h2 className="text-2xl font-bold text-mhg-gold mb-6 flex items-center gap-2">
                <span>📅</span>
                {new Date(date).toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>

              <div className="space-y-6">
                {Object.entries(mealTypes).map(([mealType, data]: [string, any]) => (
                  <div key={mealType} className="border-r-4 border-mhg-gold pr-4">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-xl font-bold text-mhg-gold">{getMealTypeLabel(mealType)}</h3>

                      <div className="min-w-0 text-sm text-mhg-gold">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:justify-end">
                          <span className="font-medium text-mhg-blue bg-white rounded-md border border-mhg-gold p-1 break-words">{data.restaurant}</span>

                          {data.restaurantPhone && (
                            <a
                              href={`tel:${String(data.restaurantPhone).replace(/[^\d+]/g, '')}`}
                              className="inline-flex items-center gap-2 rounded-full bg-mhg-accent-green/10 px-3 py-1 font-bold text-mhg-accent-green border border-mhg-accent-green/20 hover:bg-mhg-accent-green/15 transition-colors"
                              aria-label={`اتصال بـ ${data.restaurantPhone}`}
                              title="اتصال"
                            >
                              <PhoneCall className="w-4 h-4" />
                              <span dir="ltr" className="text-[13px] leading-none">
                                {data.restaurantPhone}
                              </span>
                            </a>
                          )}

                          <span className="inline-flex items-center rounded-full bg-mhg-gold/10 px-3 py-1 font-bold text-mhg-gold-deep border border-mhg-gold/20">
                            توصيل: {data.deliveryFee} جنيه
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {data.orders.map((order: any) => {
                        if (hiddenOrderIds.has(order.id)) return null;

                        const canDelete =
                          !!username &&
                          !!order.user?.username &&
                          username.trim() === String(order.user.username).trim();

                        return (
                          <div
                            key={order.id}
                            className="rounded-xl p-4 group relative shadow-md border border-[#f2e7c3] bg-white transition-shadow hover:shadow-lg"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-bold text-[16px]" style={{ color: '#D6AE5A' }}>{order.user.username}</span>
                              <span className="text-lg font-extrabold" style={{ color: '#0062AC' }}>{order.totalAmount.toFixed(2)} جنيه</span>
                            </div>
                            <div className="divide-y divide-mhg-surface-muted/60">
                              {order.items.map((item: any, idx: number) => (
                                <div key={item.id} className="flex items-center justify-between py-1 first:pt-0 last:pb-0">
                                  <span className="font-medium" style={{ color: '#181818' }}>
                                    {item.menuItem.name}
                                    {item.selectedOption && (
                                      <span className="mr-2 text-xs font-bold px-2 py-0.5 rounded bg-mhg-gold/10 text-mhg-gold border border-mhg-gold/20">
                                        {item.selectedOption}
                                      </span>
                                    )}
                                    {item.quantity > 1 && <span className="text-xs font-bold mr-1" style={{ color: '#D6AE5A' }}>× {item.quantity}</span>}
                                  </span>
                                  <span className="font-bold text-sm" style={{ color: '#0062AC' }}>{(item.price * item.quantity).toFixed(2)} جنيه</span>
                                </div>
                              ))}
                            </div>
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => onDelete(order.id)}
                                disabled={deletingId === order.id}
                                className="absolute -top-4 left-1 z-10 rounded-lg p-2 shadow-sm border border-[#B22222] bg-white text-[#B22222] hover:bg-[#B22222] hover:text-white transition-colors disabled:opacity-50"
                                title="حذف الطلب"
                                aria-label="حذف الطلب"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
