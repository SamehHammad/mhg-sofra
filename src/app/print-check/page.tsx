'use client';

/*-*-*-- Core imports for page UI + image editing -*-*-*-// */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { currencies } from '@/lib/mock-data';
import { Printer, Save, ZoomIn, ZoomOut, CreditCard, Globe, ChevronDown, Calendar, Lock, Pencil,Undo2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import PrintSettingsDialog, { type PrintSettings } from '@/components/PrintSettingsDialog';
import BackgroundImageEditor from '@/components/BackgroundImageEditor';

/*-*-*-- Domain types for supported countries/banks -*-*-*-// */
type CountryCode = 'EG' | 'SA' | 'PS';
type BankCode = 'EG_AHLY' | 'EG_CIB' | 'SA_SABB' | 'SA_BSF' | 'PS_ARAB';

const supportedCountries: Array<{
  id: string;
  name: string;
  nameEn: string;
  code: CountryCode;
  direction: 'ltr' | 'rtl';
}> = [
  { id: 'EG', name: 'جمهورية مصر العربية', nameEn: 'Egypt', code: 'EG', direction: 'rtl' },
  { id: 'SA', name: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', code: 'SA', direction: 'rtl' },
  { id: 'PS', name: 'فلسطين', nameEn: 'Palestine', code: 'PS', direction: 'rtl' },
];

const banksByCountry: Record<CountryCode, Array<{ id: string; name: string; nameEn: string; code: BankCode }>> = {
  EG: [
    { id: 'EG_AHLY', name: 'البنك الأهلي المصري', nameEn: 'National Bank of Egypt', code: 'EG_AHLY' },
    { id: 'EG_CIB', name: 'البنك التجاري الدولي (CIB)', nameEn: 'Commercial International Bank (CIB)', code: 'EG_CIB' },
  ],
  SA: [
    { id: 'SA_SABB', name: 'البنك السعودي البريطاني', nameEn: 'Saudi British Bank (SABB)', code: 'SA_SABB' },
    { id: 'SA_BSF', name: 'البنك السعودي الفرنسي', nameEn: 'Banque Saudi Fransi (BSF)', code: 'SA_BSF' },
  ],
  PS: [
    { id: 'PS_ARAB', name: 'البنك العربي - فلسطين', nameEn: 'Arab Bank - Palestine', code: 'PS_ARAB' },
  ],
};

const chequeImageByBank: Record<BankCode, string> = {
  EG_AHLY: '/cheques/egy-ahly.jpeg',
  EG_CIB: '/cheques/egy-cib.jpeg',
  SA_SABB: '/cheques/ksa-br.jpeg',
  SA_BSF: '/cheques/ksa-fr.jpeg',
  PS_ARAB: '/cheques/ps-arabic.jpeg',
};

export default function PrintCheck() {
  const { t, direction, language } = useLanguage();
  const isRTL = direction === 'rtl';

  /*-*-*-- Selection state (drives which cheque image/template is shown) -*-*-*-// */
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [checkDirection, setCheckDirection] = useState<'ltr' | 'rtl'>('rtl');
  const [zoomLevel, setZoomLevel] = useState(1);

  /*-*-*-- Print settings dialog state -*-*-*-// */
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    paperPreset: 'A4',
    pageOrientation: 'portrait',
    customWidthMm: 210,
    customHeightMm: 99,
    marginMm: 0,
    printScale: 1,
    offsetXmm: 0,
    offsetYmm: 0,
    copies: 1,
  });

  /*-*-*-- When changing country: reset bank and update preview direction -*-*-*-// */
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedBank('');
    const country = supportedCountries.find(c => c.code === countryCode);
    if (country) {
      setCheckDirection(country.direction);
    }
  };

  /*-*-*-- Derived values from current selections -*-*-*-// */
  const availableBanks = selectedCountry
    ? banksByCountry[selectedCountry as CountryCode] || []
    : [];

  const selectedChequeImage = selectedBank
    ? chequeImageByBank[selectedBank as BankCode]
    : null;

  /*-*-*-- Editable cheque image (crop/rotate/zoom apply) -*-*-*-// */
  const [editedChequeImage, setEditedChequeImage] = useState<string | null>(null);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [imageEditorSrc, setImageEditorSrc] = useState<string | null>(null);

  const displayedChequeImage = useMemo(
    () => editedChequeImage ?? selectedChequeImage,
    [editedChequeImage, selectedChequeImage]
  );

  useEffect(() => {
    /*-*-*-- When bank changes: reset edits (edits are bank-specific) -*-*-*-// */
    setEditedChequeImage(null);
    setIsImageEditorOpen(false);
    setImageEditorSrc(null);
  }, [selectedBank]);

  const openChequeImageEditor = useCallback(() => {
    if (!displayedChequeImage) return;
    setImageEditorSrc(displayedChequeImage);
    setIsImageEditorOpen(true);
  }, [displayedChequeImage]);

  const resetChequeImageEdits = useCallback(() => {
    setEditedChequeImage(null);
  }, []);

  return (
    <AppLayout 
      title={t.printCheck.title} 
      subtitle={t.printCheck.subtitle}
    >
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-180px)]">
        
        {/*-*-*-- Left panel: selection + check details form -*-*-*-// */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
          
        {/*-*-*-- Step 1: Country/Bank selection -*-*-*-// */}
<div className="glass-card p-8 relative">
  {/* Step Header with improved visual hierarchy */}
  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-100">
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#3949AB]/10 flex items-center justify-center">
      <span className="text-lg font-bold text-[#3949AB]">1</span>
    </div>
    <div>
      <h3 className="text-xl font-bold text-gray-900">{t.printCheck.locationBank}</h3>
      <p className="text-sm text-gray-500 mt-1">
        {language === 'ar' ? 'اختر الدولة والبنك للمتابعة' : 'Select your country and bank to continue'}
      </p>
    </div>
  </div>

  {/* Form Grid */}
  <div className="space-y-6">
    {/* Country Selection */}
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {t.printCheck.country}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="relative">
        <select 
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all appearance-none cursor-pointer hover:border-gray-400 ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'}`}
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
        >
          <option value="" disabled>
            {t.printCheck.selectCountry}
          </option>
          {supportedCountries.map((country) => (
            <option key={country.id} value={country.code} className="py-2">
              {language === 'ar' ? country.name : country.nameEn}
            </option>
          ))}
        </select>
        <Globe className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'right-4' : 'left-4'}`} />
        <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'left-4' : 'right-4'}`} />
      </div>
    </div>

    {/* Bank Selection */}
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {t.printCheck.bank}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="relative">
        <select 
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'}`}
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
          disabled={!selectedCountry}
        >
          <option value="" disabled>
            {selectedCountry ? t.printCheck.selectBank : (language === 'ar' ? 'اختر الدولة أولاً' : 'Select country first')}
          </option>
          {availableBanks.map((bank) => (
            <option key={bank.id} value={bank.code} className="py-2">
              {language === 'ar' ? bank.name : bank.nameEn}
            </option>
          ))}
        </select>
        <CreditCard className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'right-4' : 'left-4'}`} />
        <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'left-4' : 'right-4'}`} />
      </div>
      {!selectedCountry && (
        <p className="text-sm text-gray-500 mt-1">
          {language === 'ar' ? 'من فضلك اختر الدولة أولاً' : 'Please select a country first'}
        </p>
      )}
    </div>
  </div>
</div>

{/* Step 2: Check Details */}
<div className="glass-card p-8 relative mt-6">
  {/* Step Header */}
  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-100">
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#3949AB]/10 flex items-center justify-center">
      <span className="text-lg font-bold text-[#3949AB]">2</span>
    </div>
    <div>
      <h3 className="text-xl font-bold text-gray-900">{t.printCheck.checkDetails}</h3>
      <p className="text-sm text-gray-500 mt-1">
        {language === 'ar' ? 'املأ بيانات الشيك' : 'Fill in the check details'}
      </p>
    </div>
  </div>

  {/* Form Grid */}
  <div className="space-y-6">
    {/* Check Number & Date Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {t.printCheck.checkNumber}
        </label>
        <input 
          type="text" 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white font-mono text-lg text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all"
          placeholder="1006"
          defaultValue="1006"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {t.printCheck.date}
        </label>
        <div className="relative">
          <input 
            type="date" 
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            defaultValue="2025-12-17"
          />
          <Calendar className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'right-4' : 'left-4'}`} />
        </div>
      </div>
    </div>

    {/* Payee */}
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {t.printCheck.payToOrderOf}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <input 
        type="text" 
        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all placeholder-gray-400"
        placeholder={language === 'ar' ? 'أدخل اسم المستفيد' : 'Enter beneficiary name'}
      />
    </div>

    {/* Amount & Currency Row */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {t.printCheck.amount}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <div className={`absolute top-1/2 -translate-y-1/2 ${direction === 'rtl' ? 'right-4' : 'left-4'} flex items-center gap-2`}>
            <span className="text-lg font-semibold text-gray-700">$</span>
          </div>
          <input 
            type="number" 
            className={`w-full border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all font-mono text-lg ${
              direction === 'rtl' ? 'pr-14 pl-4' : 'pl-14 pr-4'
            } py-3`}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {t.printCheck.currency}
        </label>
        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all cursor-pointer">
          {currencies.map((c) => (
            <option key={c.code} value={c.code} className="py-2">
              {c.code} - {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* Amount in Words */}
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {t.printCheck.amountInWords}
      </label>
      <div className="relative">
        <input 
          type="text" 
          className={`w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 italic focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all cursor-not-allowed ${isRTL ? 'pl-36 pr-4' : 'pr-36 pl-4'}`}
          disabled
          placeholder={language === 'ar' ? 'سيتم عرض المبلغ كتابة هنا' : 'Amount in words will appear here'}
        />
        <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'}`}>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Lock className="w-4 h-4" />
            <span>{language === 'ar' ? 'تلقائي' : 'Auto-generated'}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        {language === 'ar' ? 'سيتم تحويل المبلغ إلى حروف تلقائياً' : 'Amount will be converted to words automatically'}
      </p>
    </div>
  </div>
</div>

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-0 bg-gradient-to-t from-[#f8faff] pt-4 pb-2 z-10">
            <button
              className="flex-1 btn-primary shadow-lg shadow-[#3949AB]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowPrintDialog(true)}
              disabled={!selectedChequeImage}
            >
              <Printer className="w-5 h-5" />
              {t.printCheck.printButton}
            </button>
            <button className="px-4 py-3 rounded-2xl bg-white border border-[#3949AB]/20 text-[#3949AB] hover:bg-[#3949AB]/5 transition-colors">
              <Save className="w-5 h-5" />
            </button>
          </div>
        </div>

        <PrintSettingsDialog
          open={showPrintDialog}
          onClose={() => setShowPrintDialog(false)}
          settings={printSettings}
          onChange={setPrintSettings}
          selectedChequeImage={displayedChequeImage}
        />

        {/*-*-*-- Right panel: check preview + zoom + image edit -*-*-*-// */}
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
              {/*-*-*-- Edit cheque background image (crop/rotate/zoom) -*-*-*-// */}
              <button
                type="button"
                onClick={openChequeImageEditor}
                disabled={!displayedChequeImage}
                className="w-10 h-10 rounded-xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center text-neutral-500 hover:text-[#3949AB] hover:bg-[#3949AB]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={t.templateEditor.imageEditor.editImageButton}
                aria-label={t.templateEditor.imageEditor.editImageButton}
              >
                <Pencil className="w-5 h-5" />
              </button>

              {/*-*-*-- Reset edits to original bank image -*-*-*-// */}
              <button
                type="button"
                onClick={resetChequeImageEdits}
                disabled={!editedChequeImage}
                className="w-10 h-10 rounded-xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center text-neutral-500 hover:text-[#3949AB] hover:bg-[#3949AB]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={t.templateEditor.imageEditor.reset}
                aria-label={t.templateEditor.imageEditor.reset}
              >
                <Undo2 className="w-5 h-5" />
              </button>

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
            {displayedChequeImage ? (
              <div 
                className="bg-white shadow-2xl shadow-[#3949AB]/20 transition-all duration-500 ease-out"
                dir={checkDirection}
                style={{ 
                  width: '900px',
                  height: '420px',
                  transform: `scale(${zoomLevel})`,
                }}
              >
                <img
                  src={displayedChequeImage}
                  alt="Cheque"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
            ) : (
              <div className="text-center animate-float">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_20px_50px_-10px_rgba(57,73,171,0.2)]">
                  <Printer className="w-10 h-10 text-[#3949AB]" />
                </div>
                <h3 className="text-xl font-black text-[#3949AB] mb-2">{t.printCheck.emptyState}</h3>
                <p className="text-sm text-neutral-400 font-medium">ابدأ باختيار الدولة ثم البنك من القائمة الجانبية</p>
              </div>
            )}
          </div>
        </div>

        {/*-*-*-- Background Image Editor (Reusable Component) -*-*-*-// */}
        <BackgroundImageEditor
          isOpen={isImageEditorOpen}
          imageSrc={imageEditorSrc}
          aspect={900 / 420}
          onClose={() => setIsImageEditorOpen(false)}
          onApply={(result) => {
            setEditedChequeImage(result.dataUrl);
          }}
        />
      </div>
    </AppLayout>
  );
}
