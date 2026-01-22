'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { mockBatchChecks, currencies } from '@/lib/mock-data';
import PrintSettingsDialog, { type PrintSettings } from '@/components/PrintSettingsDialog';
import { 
  Upload, 
  Plus, 
  Download,
  Printer, 
  FileSpreadsheet,
  AlertCircle,
  Trash2,
  Edit,
  FileText,
  CheckCircle2,
  X,
  Globe,
  CreditCard,
  ChevronDown,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CatalogResponse } from '@/lib/actions/catalog';

export default function BatchPrintingClient({ initialCatalog }: { initialCatalog: CatalogResponse }) {
  console.log("this is initialcatalog",initialCatalog);
  const { t, language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [checks, setChecks] = useState(mockBatchChecks);
  const [showAddForm, setShowAddForm] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printChequeImages, setPrintChequeImages] = useState<string[]>([]);
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

  // Batch generation form state
  const [batchForm, setBatchForm] = useState({
    country: '',
    bank: '',
    template: '',
    monthsCount: '',
    checksCount: '',
    currency: 'SAR',
    checkAmount: '',
    startingNumber: '',
    startDate: '',
  });

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;
  const allSelected = checks.length > 0 && selectedCount === checks.length;
  const anySelected = selectedCount > 0;

  const staticChequeImages = [
    '/cheques/egy-ahly.jpeg',
    '/cheques/egy-cib.jpeg',
    '/cheques/ksa-br.jpeg',
    '/cheques/ksa-fr.jpeg',
    '/cheques/ps-arabic.jpeg',
  ];

  const openPrintForChecks = (checksToPrint: Array<{ id: string }>) => {
    if (checksToPrint.length === 0) return;
    const images = checksToPrint.map((_, i) => staticChequeImages[i % staticChequeImages.length]);
    setPrintChequeImages(images);
    setShowPrintDialog(true);
  };

  const handlePrintAll = () => {
    openPrintForChecks(checks);
  };

  const handlePrintSelected = () => {
    const selectedChecks = checks.filter((c) => selectedIds[c.id]);
    openPrintForChecks(selectedChecks);
  };

  const totalAmount = checks.reduce((sum, check) => sum + check.amount, 0);

  return (
    <AppLayout 
      title={t.batchPrinting.title} 
      subtitle={t.batchPrinting.subtitle}
    >
      <div className="space-y-8">
        
        {/* Batch Generation Form */}
        <div className="glass-card p-8 relative">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-100">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#3949AB]/10 flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-[#3949AB]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {language === 'ar' ? 'إعداد الدفعة' : 'Batch Setup'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {language === 'ar' ? 'املأ البيانات لإنشاء دفعة من الشيكات' : 'Fill in the details to generate a batch of checks'}
              </p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="space-y-6">
            {/* Row 1: Country, Bank, Template */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Country */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {language === 'ar' ? 'البلد' : 'Country'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <select
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all appearance-none cursor-pointer hover:border-gray-400 ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'}`}
                    value={batchForm.country}
                    onChange={(e) => setBatchForm({...batchForm, country: e.target.value})}
                  >
                    <option value="">{language === 'ar' ? 'اختر البلد' : 'Select Country'}</option>
                    <option value="sa">{language === 'ar' ? 'السعودية' : 'Saudi Arabia'}</option>
                    <option value="eg">{language === 'ar' ? 'مصر' : 'Egypt'}</option>
                    <option value="ae">{language === 'ar' ? 'الإمارات' : 'UAE'}</option>
                  </select>
                  <Globe className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'right-4' : 'left-4'}`} />
                  <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'left-4' : 'right-4'}`} />
                </div>
              </div>

              {/* Bank */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {language === 'ar' ? 'البنك' : 'Bank'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <select
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all appearance-none cursor-pointer hover:border-gray-400 ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'}`}
                    value={batchForm.bank}
                    onChange={(e) => setBatchForm({...batchForm, bank: e.target.value})}
                    disabled={!batchForm.country}
                  >
                    <option value="">{language === 'ar' ? 'اختر البنك' : 'Select Bank'}</option>
                    <option value="ahly">{language === 'ar' ? 'البنك الأهلي' : 'Al Ahly Bank'}</option>
                    <option value="rajhi">{language === 'ar' ? 'بنك الراجحي' : 'Al Rajhi Bank'}</option>
                  </select>
                  <CreditCard className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'right-4' : 'left-4'}`} />
                  <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'left-4' : 'right-4'}`} />
                </div>
              </div>

              {/* Template */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {language === 'ar' ? 'النموذج' : 'Template'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <select
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all appearance-none cursor-pointer hover:border-gray-400 ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'}`}
                    value={batchForm.template}
                    onChange={(e) => setBatchForm({...batchForm, template: e.target.value})}
                    disabled={!batchForm.bank}
                  >
                    <option value="">{language === 'ar' ? 'اختر النموذج' : 'Select Template'}</option>
                    <option value="standard1">{language === 'ar' ? 'نموذج قياسي 1' : 'Standard Template 1'}</option>
                    <option value="standard2">{language === 'ar' ? 'نموذج قياسي 2' : 'Standard Template 2'}</option>
                  </select>
                  <FileText className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'right-4' : 'left-4'}`} />
                  <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'left-4' : 'right-4'}`} />
                </div>
              </div>
            </div>

            {/* Row 2: Months Count, Checks Count, Currency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Months Count */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {language === 'ar' ? 'عدد الشهور' : 'Number of Months'}
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all"
                  placeholder={language === 'ar' ? 'مثال: 12' : 'e.g., 12'}
                  value={batchForm.monthsCount}
                  onChange={(e) => setBatchForm({...batchForm, monthsCount: e.target.value})}
                />
              </div>

              {/* Checks Count */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {language === 'ar' ? 'عدد الشيكات' : 'Number of Checks'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all"
                  placeholder={language === 'ar' ? 'مثال: 10' : 'e.g., 10'}
                  value={batchForm.checksCount}
                  onChange={(e) => setBatchForm({...batchForm, checksCount: e.target.value})}
                />
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {language === 'ar' ? 'العملة' : 'Currency'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all"
                  value={batchForm.currency}
                  onChange={(e) => setBatchForm({...batchForm, currency: e.target.value})}
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {language === 'ar' ? c.name : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Check Amount, Starting Number, Start Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Check Amount */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {language === 'ar' ? 'قيمة الشيك' : 'Check Amount'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all font-mono"
                  placeholder={language === 'ar' ? 'مثال: 5000.00' : 'e.g., 5000.00'}
                  value={batchForm.checkAmount}
                  onChange={(e) => setBatchForm({...batchForm, checkAmount: e.target.value})}
                />
              </div>

              {/* Starting Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {language === 'ar' ? 'رقم البداية' : 'Starting Number'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all font-mono font-bold text-[#3949AB]"
                  placeholder={language === 'ar' ? 'مثال: 2001' : 'e.g., 2001'}
                  value={batchForm.startingNumber}
                  onChange={(e) => setBatchForm({...batchForm, startingNumber: e.target.value})}
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {language === 'ar' ? 'بداية التاريخ' : 'Start Date'}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all"
                  value={batchForm.startDate}
                  onChange={(e) => setBatchForm({...batchForm, startDate: e.target.value})}
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center pt-4">
              <button className="btn-primary !py-3 !px-8 shadow-lg shadow-[#3949AB]/30">
                <Plus className="w-5 h-5" />
                {language === 'ar' ? 'توليد الشيكات' : 'Generate Checks'}
              </button>
            </div>
          </div>
        </div>

        {/* Checks Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-lg font-black text-[#3949AB]">{t.batchPrinting.checksInBatch}</h3>
            <span className="bg-[#3949AB]/10 text-[#3949AB] px-3 py-1 rounded-full text-xs font-bold">
              {checks.length} {t.batchPrinting.items}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8faff]">
                  <th className="px-6 py-4 text-start w-16">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => {
                        const nextChecked = e.target.checked;
                        const next: Record<string, boolean> = {};
                        checks.forEach((c) => {
                          next[c.id] = nextChecked;
                        });
                        setSelectedIds(next);
                      }}
                      className="w-4 h-4 rounded border-neutral-300 text-[#3949AB] focus:ring-[#3949AB]"
                    />
                  </th>
                  <th className="px-6 py-4 text-start text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.checkNumber}</th>
                  <th className="px-6 py-4 text-start text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.beneficiary}</th>
                  <th className="px-6 py-4 text-start text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.amount}</th>
                  <th className="px-6 py-4 text-start text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.date}</th>
                  <th className="px-6 py-4 text-start text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.status}</th>
                  <th className="px-6 py-4 text-end text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {checks.map((check, index) => (
                  <tr 
                    key={check.id} 
                    className="hover:bg-[#f8faff] transition-colors group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedIds[check.id])}
                        onChange={(e) => {
                          setSelectedIds((prev) => ({ ...prev, [check.id]: e.target.checked }));
                        }}
                        className="w-4 h-4 rounded border-neutral-300 text-[#3949AB] focus:ring-[#3949AB]"
                      />
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-neutral-600">{check.checkNumber}</td>
                    <td className="px-6 py-4 font-bold text-neutral-800">
                      {language === 'ar' ? check.beneficiary : check.beneficiaryEn}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-[#3949AB]">
                      ${check.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-500">{check.date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-600 border border-yellow-100">
                        <AlertCircle className="w-3 h-3" />
                        {t.printedChecks.statuses.pending}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-[#3949AB]/5 text-neutral-400 hover:text-[#3949AB] transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Check Modal (Overlay) */}
        {showAddForm && (
          <div className="fixed inset-0 bg-[#3949AB]/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="glass-card w-full max-w-lg p-0 shadow-2xl scale-100 animate-scale-up">
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-[#3949AB]">{t.batchPrinting.addCheckTitle}</h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-red-50 rounded-full text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase">{t.printCheck.checkNumber}</label>
                    <input type="text" className="input-modern" placeholder="Auto" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase">{t.printCheck.date}</label>
                    <input type="date" className="input-modern" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase">{t.printCheck.payToOrderOf}</label>
                  <input type="text" className="input-modern" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase">{t.printCheck.amount}</label>
                    <input type="number" className="input-modern" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase">{t.printCheck.currency}</label>
                    <select className="input-modern">
                      {currencies.map((c) => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 bg-[#f8faff]/50 rounded-b-2xl">
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="btn-primary !py-2.5 !px-6"
                >
                  <Plus className="w-4 h-4" />
                  {t.add}
                </button>
              </div>
            </div>
          </div>
        )}

        <PrintSettingsDialog
          open={showPrintDialog}
          onClose={() => {
            setShowPrintDialog(false);
            setPrintChequeImages([]);
          }}
          settings={printSettings}
          onChange={setPrintSettings}
          chequeImages={printChequeImages}
          selectedChequeImage={printChequeImages[0] ?? null}
        />
      </div>
    </AppLayout>
  );

}
