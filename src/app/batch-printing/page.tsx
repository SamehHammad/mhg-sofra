'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { mockBatchChecks, currencies } from '@/lib/mock-data';
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
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BatchPrinting() {
  const { t, language, direction } = useLanguage();
  const [checks, setChecks] = useState(mockBatchChecks);
  const [showAddForm, setShowAddForm] = useState(false);

  const totalAmount = checks.reduce((sum, check) => sum + check.amount, 0);

  return (
    <AppLayout 
      title={t.batchPrinting.title} 
      subtitle={t.batchPrinting.subtitle}
    >
      <div className="space-y-8">
        
        {/* Top Section - Glass Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. Batch Settings */}
          <div className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3949AB]/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#3949AB]/10 flex items-center justify-center text-[#3949AB]">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#3949AB]">{t.batchPrinting.batchSettings}</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">{t.batchPrinting.batchName}</label>
                <input 
                  type="text" 
                  className="input-modern" 
                  placeholder={language === 'ar' ? 'مثال: مدفوعات الموردين' : 'e.g., Vendor Payments'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">{t.batchPrinting.startingCheckNumber}</label>
                  <input 
                    type="text" 
                    className="input-modern font-mono font-bold text-[#3949AB]" 
                    defaultValue="2001"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">{t.batchPrinting.defaultDate}</label>
                  <input 
                    type="date" 
                    className="input-modern"
                    defaultValue="2025-12-17"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Import Data (Drag & Drop) */}
          <div className="glass-card p-6 flex flex-col justify-center text-center relative group hover:border-[#3949AB]/30 transition-all cursor-pointer">
            <div className="absolute inset-0 bg-[#3949AB]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-lg shadow-[#3949AB]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-8 h-8 text-[#3949AB]" />
            </div>
            
            <h3 className="text-lg font-black text-neutral-800 mb-1">{t.batchPrinting.uploadCSV}</h3>
            <p className="text-sm text-neutral-400 mb-4">{t.batchPrinting.dragDrop}</p>
            
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowAddForm(true); }}
                className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-[#3949AB] hover:border-[#3949AB] text-sm font-bold transition-all z-10"
              >
                {t.batchPrinting.addManually}
              </button>
              <button className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-[#3949AB] hover:border-[#3949AB] text-sm font-bold transition-all z-10">
                {t.batchPrinting.downloadTemplate}
              </button>
            </div>
          </div>

          {/* 3. Batch Summary */}
          <div className="glass-card p-6 bg-gradient-to-br from-[#3949AB] to-[#5C6BC0] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <h3 className="text-lg font-bold text-white/80 mb-6 relative z-10">{t.batchPrinting.batchSummary}</h3>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-white/60">{t.batchPrinting.totalChecks}</span>
                <span className="text-3xl font-black">{checks.length}</span>
              </div>

              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-white/60">{t.batchPrinting.totalAmount}</span>
                <span className="text-3xl font-black font-mono">${totalAmount.toLocaleString()}</span>
              </div>

              <button className="w-full py-3 bg-white text-[#3949AB] rounded-xl font-bold hover:bg-white/90 transition-colors shadow-lg mt-2 flex items-center justify-center gap-2">
                <Printer className="w-5 h-5" />
                {t.batchPrinting.printAll}
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
                    <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-[#3949AB] focus:ring-[#3949AB]" />
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
                      <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-[#3949AB] focus:ring-[#3949AB]" />
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
      </div>
    </AppLayout>
  );
}
