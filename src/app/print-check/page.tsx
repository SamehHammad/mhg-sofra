'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { countries, banks, checkTemplates, currencies } from '@/lib/mock-data';
import { ChevronDown, Printer, Save, X, RotateCw, ZoomIn, ZoomOut, Check, CreditCard, Globe, LayoutTemplate } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrintCheck() {
  const { t, direction, language } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [checkDirection, setCheckDirection] = useState<'ltr' | 'rtl'>('rtl');
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedBank('');
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setCheckDirection(country.direction);
    }
  };

  const availableBanks = selectedCountry ? banks[selectedCountry as keyof typeof banks] || [] : [];
  const availableTemplates = selectedBank ? checkTemplates.filter(temp => temp.bankCode === selectedBank) : [];

  return (
    <AppLayout 
      title={t.printCheck.title} 
      subtitle={t.printCheck.subtitle}
    >
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-180px)]">
        
        {/* Left Panel - Smart Configuration (Floating Glass) */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
          
          {/* Step 1: Selection */}
          <div className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#3949AB] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-black text-[#3949AB] mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#3949AB]/10 flex items-center justify-center text-[#3949AB]">1</span>
              {t.printCheck.locationBank}
            </h3>
            
            <div className="space-y-5">
              <div className="relative group/input">
                <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">{t.printCheck.country}</label>
                <div className="relative">
                  <select 
                    className="input-modern appearance-none cursor-pointer"
                    value={selectedCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                  >
                    <option value="">{t.printCheck.selectCountry}</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.code}>
                        {language === 'ar' ? country.name : country.nameEn}
                      </option>
                    ))}
                  </select>
                  <Globe className={`absolute ${direction === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#3949AB]/40 pointer-events-none group-hover/input:text-[#3949AB] transition-colors`} />
                </div>
              </div>

              <div className="relative group/input">
                <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">{t.printCheck.bank}</label>
                <div className="relative">
                  <select 
                    className="input-modern appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    disabled={!selectedCountry}
                  >
                    <option value="">{t.printCheck.selectBank}</option>
                    {availableBanks.map((bank) => (
                      <option key={bank.id} value={bank.code}>
                        {language === 'ar' ? bank.name : bank.nameEn}
                      </option>
                    ))}
                  </select>
                  <CreditCard className={`absolute ${direction === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#3949AB]/40 pointer-events-none group-hover/input:text-[#3949AB] transition-colors`} />
                </div>
              </div>

              <div className="relative group/input">
                <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">{t.printCheck.template}</label>
                <div className="relative">
                  <select 
                    className="input-modern appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    disabled={!selectedBank}
                  >
                    <option value="">{t.printCheck.selectTemplate}</option>
                    {availableTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {language === 'ar' ? template.name : template.nameEn}
                      </option>
                    ))}
                  </select>
                  <LayoutTemplate className={`absolute ${direction === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#3949AB]/40 pointer-events-none group-hover/input:text-[#3949AB] transition-colors`} />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Details */}
          <div className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#3949AB] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-lg font-black text-[#3949AB] mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#3949AB]/10 flex items-center justify-center text-[#3949AB]">2</span>
              {t.printCheck.checkDetails}
            </h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-400 mb-2 block">{t.printCheck.checkNumber}</label>
                  <input 
                    type="text" 
                    className="input-modern font-mono text-lg tracking-widest text-center text-[#3949AB] font-bold" 
                    defaultValue="1006"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-400 mb-2 block">{t.printCheck.date}</label>
                  <input 
                    type="date" 
                    className="input-modern"
                    defaultValue="2025-12-17"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 mb-2 block">{t.printCheck.payToOrderOf}</label>
                <input 
                  type="text" 
                  className="input-modern font-bold" 
                  placeholder={language === 'ar' ? 'اسم المستفيد' : 'Beneficiary Name'}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-neutral-400 mb-2 block">{t.printCheck.amount}</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="input-modern pl-12 font-mono text-lg font-bold" 
                      placeholder="0.00"
                      step="0.01"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3949AB] font-black">$</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-400 mb-2 block">{t.printCheck.currency}</label>
                  <select className="input-modern font-bold text-[#3949AB]">
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 mb-2 block">{t.printCheck.amountInWords}</label>
                <input 
                  type="text" 
                  className="input-modern bg-neutral-50/50 italic text-neutral-500" 
                  disabled
                  placeholder={language === 'ar' ? 'فقط ...' : 'Only ...'}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-0 bg-gradient-to-t from-[#f8faff] pt-4 pb-2 z-10">
            <button className="flex-1 btn-primary shadow-lg shadow-[#3949AB]/30">
              <Printer className="w-5 h-5" />
              {t.printCheck.printButton}
            </button>
            <button className="px-4 py-3 rounded-2xl bg-white border border-[#3949AB]/20 text-[#3949AB] hover:bg-[#3949AB]/5 transition-colors">
              <Save className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Panel - Immersive Preview (Canvas) */}
        <div className="flex-1 glass-card p-2 flex flex-col relative overflow-hidden bg-white">
          {/* Toolbar */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-3">
              <span className="text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.printCheck.checkPreview}</span>
              <div className="w-px h-4 bg-neutral-200"></div>
              <span className="text-xs font-bold text-neutral-400">
                {checkDirection === 'rtl' ? t.printCheck.layoutRTL : t.printCheck.layoutLTR}
              </span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
                className="w-10 h-10 rounded-xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center text-neutral-500 hover:text-[#3949AB] hover:bg-[#3949AB]/5 transition-all"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="w-16 flex items-center justify-center font-mono font-bold text-neutral-400 bg-white/50 rounded-xl text-sm">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
                className="w-10 h-10 rounded-xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center text-neutral-500 hover:text-[#3949AB] hover:bg-[#3949AB]/5 transition-all"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-[#f0f4ff] rounded-[20px] relative overflow-hidden flex items-center justify-center bg-[radial-gradient(#3949AB_1px,transparent_1px)] [background-size:20px_20px] opacity-100">
            {selectedTemplate ? (
              <div 
                className="bg-white shadow-2xl shadow-[#3949AB]/20 transition-all duration-500 ease-out"
                dir={checkDirection}
                style={{ 
                  width: '800px',
                  height: '320px',
                  transform: `scale(${zoomLevel})`,
                  backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')", // Texture placeholder
                }}
              >
                {/* Check Security Pattern Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/arches.png')]"></div>

                {/* Actual Check Content */}
                <div className="relative h-full p-8 flex flex-col justify-between z-10">
                  {/* Header */}
                  <div className={`flex items-start ${checkDirection === 'rtl' ? 'flex-row-reverse' : ''} justify-between`}>
                    <div>
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{t.businessName}</div>
                      <div className="text-xl font-black text-neutral-800">{t.companyName}</div>
                      <div className="text-xs text-neutral-500 mt-1 font-medium">{t.companyAddress}</div>
                    </div>
                    <div className={`text-right ${checkDirection === 'rtl' ? 'text-left' : ''}`}>
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{t.printCheck.checkNumber}</div>
                      <div className="text-2xl font-mono font-black text-[#3949AB]">1006</div>
                    </div>
                  </div>

                  {/* Date Line */}
                  <div className={`flex ${checkDirection === 'rtl' ? 'flex-row-reverse' : ''} justify-between items-center mt-4`}>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{t.printCheck.date}</span>
                      <div className="border-b-2 border-[#3949AB]/20 px-6 py-1 min-w-[140px] text-center font-mono font-bold text-neutral-800">
                        17 / 12 / 2025
                      </div>
                    </div>
                  </div>

                  {/* Pay to Line */}
                  <div className={`mt-6 ${checkDirection === 'rtl' ? 'text-right' : ''}`}>
                    <div className="flex items-end gap-4">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap mb-2">{t.printCheck.payToOrderOf}</span>
                      <div className="flex-1 border-b-2 border-[#3949AB]/20 pb-1 px-4 flex items-center bg-[#3949AB]/5">
                        <span className="text-lg font-bold text-[#3949AB] w-full">محمد أحمد علي</span>
                      </div>
                      <div className="w-40 border-2 border-[#3949AB]/20 rounded-lg px-4 py-2 flex items-center justify-between bg-white shadow-inner">
                        <span className="text-sm font-bold text-neutral-400">$</span>
                        <span className="text-xl font-mono font-black text-neutral-800">5,000.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount Line */}
                  <div className={`mt-4 flex ${checkDirection === 'rtl' ? 'flex-row-reverse' : ''} items-end gap-4`}>
                    <div className="flex-1">
                      <div className="border-b-2 border-[#3949AB]/20 pb-1 px-4 bg-[#3949AB]/5">
                        <span className="text-sm font-bold text-neutral-600 italic">خمسة آلاف دولار فقط لا غير</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={`mt-auto flex ${checkDirection === 'rtl' ? 'flex-row-reverse' : ''} justify-between items-end`}>
                    <div className="flex-1 max-w-[50%]">
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{t.printCheck.memo}</div>
                      <div className="border-b border-neutral-300 w-full h-6"></div>
                    </div>
                    <div className={`${checkDirection === 'rtl' ? 'text-left' : 'text-right'}`}>
                      <div className="border-b-2 border-neutral-300 w-64 h-10 mb-2"></div>
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t.authorizedSignature}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center animate-float">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_20px_50px_-10px_rgba(57,73,171,0.2)]">
                  <Printer className="w-10 h-10 text-[#3949AB]" />
                </div>
                <h3 className="text-xl font-black text-[#3949AB] mb-2">{t.printCheck.emptyState}</h3>
                <p className="text-sm text-neutral-400 font-medium">ابدأ باختيار الدولة من القائمة الجانبية</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
