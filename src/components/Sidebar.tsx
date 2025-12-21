'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  Edit3, 
  Copy, 
  Database, 
  Home 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { t, direction } = useLanguage();
  
  const navigation = [
    { name: t.nav.dashboard, href: '/', icon: Home },
    { name: t.nav.printCheck, href: '/print-check', icon: FileText },
    { name: t.nav.templateEditor, href: '/template-editor', icon: Edit3 },
    { name: t.nav.batchPrinting, href: '/batch-printing', icon: Copy },
    { name: t.nav.printedChecks, href: '/printed-checks', icon: Database },
  ];

  return (
    <div className={`w-[280px] m-4 ml-0 rtl:mr-0 rtl:ml-4 bg-white/80 backdrop-blur-xl h-[calc(100vh-32px)] sticky top-4 rounded-2xl border border-white/40 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden transition-all duration-300`}>
      {/* خلفية جمالية */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#3949AB]/5 to-transparent pointer-events-none"></div>
      
      <div className="flex flex-col h-full relative z-10">
        {/* Logo */}
        <div className="px-8 py-8 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#3949AB] to-[#5C6BC0] rounded-[24px] flex items-center justify-center shadow-[0_15px_30px_-10px_rgba(57,73,171,0.4)] mb-4 hover:scale-105 transition-transform duration-500 cursor-pointer group">
            <FileText className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <h1 className="font-black text-2xl text-[#3949AB] tracking-tight">تشيك برو</h1>
          <p className="text-xs font-bold text-neutral-400 mt-1 uppercase tracking-widest">{t.enterpriseEdition}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all duration-300 group
                  ${isActive 
                    ? 'bg-[#3949AB] text-white shadow-[0_10px_20px_-10px_rgba(57,73,171,0.4)] translate-x-2' 
                    : 'text-neutral-500 hover:bg-[#3949AB]/5 hover:text-[#3949AB]'
                  }
                `}
              >
                <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="leading-none pt-1">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50 rtl:mr-auto rtl:ml-0"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 mt-auto">
          <div className="bg-[#f8faff] rounded-2xl p-4 border border-[#3949AB]/5 text-center">
            <p className="text-xs font-bold text-[#3949AB] mb-1">{t.version} 1.0.0</p>
            <p className="text-[10px] text-neutral-400">{t.copyright}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

