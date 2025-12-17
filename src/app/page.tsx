'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { FileText, CheckCircle, AlertCircle, TrendingUp, MoreHorizontal, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Dashboard() {
  const { t, language } = useLanguage();

  const stats = [
    {
      name: t.dashboard.stats.totalChecks,
      value: '1,284',
      change: '+12.5%',
      trend: 'up',
      icon: FileText,
      gradient: 'from-[#3949AB] to-[#5C6BC0]',
    },
    {
      name: t.dashboard.stats.thisMonth,
      value: '243',
      change: '+8.2%',
      trend: 'up',
      icon: CheckCircle,
      gradient: 'from-[#10B981] to-[#34D399]',
    },
    {
      name: t.dashboard.stats.voided,
      value: '12',
      change: '-2.4%',
      trend: 'down',
      icon: AlertCircle,
      gradient: 'from-[#F43F5E] to-[#FB7185]',
    },
    {
      name: t.dashboard.stats.activeTemplates,
      value: '8',
      change: '+2',
      trend: 'up',
      icon: TrendingUp,
      gradient: 'from-[#8B5CF6] to-[#A78BFA]',
    },
  ];

  const recentActivity = [
    { id: 1, action: language === 'ar' ? 'تم طباعة الشيك #1005' : 'Check #1005 printed', user: language === 'ar' ? 'أحمد محمد' : 'John Doe', time: language === 'ar' ? 'منذ ساعتين' : '2 hours ago', icon: '🖨️' },
    { id: 2, action: language === 'ar' ? 'تم إكمال دفعة من 15 شيك' : 'Batch of 15 checks completed', user: language === 'ar' ? 'فاطمة علي' : 'Jane Smith', time: language === 'ar' ? 'منذ 4 ساعات' : '4 hours ago', icon: '📦' },
    { id: 3, action: language === 'ar' ? 'تم إنشاء قالب جديد' : 'New template created', user: language === 'ar' ? 'أحمد محمد' : 'John Doe', time: language === 'ar' ? 'منذ يوم واحد' : '1 day ago', icon: '🎨' },
    { id: 4, action: language === 'ar' ? 'تم إلغاء الشيك #1002' : 'Check #1002 voided', user: language === 'ar' ? 'المسؤول' : 'Admin', time: language === 'ar' ? 'منذ يومين' : '2 days ago', icon: '⚠️' },
  ];

  return (
    <AppLayout 
      title={t.dashboard.title} 
      subtitle={t.dashboard.subtitle}
    >
      {/* شبكة الإحصائيات بتصميم جديد */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isUp = stat.trend === 'up';
          return (
            <div 
              key={stat.name} 
              className="glass-card p-6 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg text-white group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              
              <h3 className="text-3xl font-black text-neutral-800 mb-1">{stat.value}</h3>
              <p className="text-sm font-bold text-neutral-400">{stat.name}</p>
              
              {/* زخرفة خلفية */}
              <div className={`absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity duration-500`}></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* النشاط الأخير - تصميم التايم لاين */}
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-[#3949AB] flex items-center gap-3">
              <span className="w-2 h-8 bg-[#3949AB] rounded-full"></span>
              {t.dashboard.recentActivity}
            </h2>
            <button className="text-neutral-400 hover:text-[#3949AB] transition-colors">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>
          
          <div className="relative space-y-8 before:absolute before:inset-0 before:mr-6 before:h-full before:w-[2px] before:bg-neutral-100 before:content-[''] rtl:before:mr-6 rtl:before:right-0">
            {recentActivity.map((activity, index) => (
              <div key={activity.id} className="relative flex gap-6 group">
                <div className="absolute right-0 top-1 w-12 h-12 flex items-center justify-center -mr-6 rtl:mr-0 rtl:-right-6 bg-white border-4 border-[#f8faff] rounded-full shadow-sm z-10 text-xl group-hover:scale-110 transition-transform duration-300">
                  {activity.icon}
                </div>
                <div className="flex-1 mr-12 rtl:mr-16 rtl:ml-0 bg-[#f8faff] p-5 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#3949AB]/10">
                  <p className="text-base font-bold text-neutral-800 mb-1">{activity.action}</p>
                  <div className="flex items-center gap-3 text-sm text-neutral-500">
                    <span className="flex items-center gap-1 font-medium text-[#3949AB]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3949AB]"></span>
                      {activity.user}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الإجراءات السريعة - تصميم الأزرار العائمة */}
        <div className="glass-card p-8 h-fit sticky top-28">
          <h2 className="text-xl font-black text-[#3949AB] mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-[#3949AB] rounded-full"></span>
            {t.dashboard.quickActions}
          </h2>
          <div className="space-y-4">
            <button className="w-full btn-primary group !justify-between !px-6 !py-4 text-lg">
              <span>{t.dashboard.actions.printSingle}</span>
              <span className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
                <ArrowDownRight className="w-5 h-5" />
              </span>
            </button>
            
            <button className="w-full btn-secondary group !justify-between !px-6 !py-4">
              <span>{t.dashboard.actions.batchPrint}</span>
              <span className="text-[#3949AB]/40 group-hover:text-[#3949AB] transition-colors">
                <ArrowDownRight className="w-5 h-5" />
              </span>
            </button>
            
            <button className="w-full btn-secondary group !justify-between !px-6 !py-4">
              <span>{t.dashboard.actions.createTemplate}</span>
              <span className="text-[#3949AB]/40 group-hover:text-[#3949AB] transition-colors">
                <ArrowDownRight className="w-5 h-5" />
              </span>
            </button>
            
            <div className="pt-6 mt-6 border-t border-neutral-100">
              <div className="flex items-center gap-4 p-4 bg-[#f8faff] rounded-2xl">
                <Calendar className="w-10 h-10 text-[#3949AB] opacity-80" />
                <div>
                  <p className="text-xs font-bold text-neutral-400">التاريخ اليوم</p>
                  <p className="text-base font-black text-neutral-800">17 ديسمبر, 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
