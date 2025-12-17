'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { mockPrintedChecks } from '@/lib/mock-data';
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrintedChecks() {
  const { t, language, direction } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock pagination logic
  const totalPages = Math.ceil(mockPrintedChecks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentChecks = mockPrintedChecks.slice(startIndex, endIndex);

  return (
    <AppLayout 
      title={t.printedChecks.title} 
      subtitle={t.printedChecks.subtitle}
    >
      <div className="space-y-8">
        {/* Search and Filters Bar - Floating Glass */}
        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-28 z-20">
          <div className="relative w-full md:w-96 group">
            <Search className={`absolute ${direction === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-hover:text-[#3949AB] transition-colors`} />
            <input
              type="text"
              placeholder={t.printedChecks.searchPlaceholder}
              className={`input-modern ${direction === 'rtl' ? 'pr-12' : 'pl-12'} w-full !py-3 !rounded-xl !bg-[#f8faff] focus:!bg-white`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn flex-1 md:w-auto gap-2 !px-5 !py-3 !rounded-xl border transition-all ${
                showFilters 
                  ? 'bg-[#3949AB] text-white border-[#3949AB]' 
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-[#3949AB] hover:text-[#3949AB]'
              }`}
            >
              <Filter className="w-4 h-4" />
              {t.printedChecks.filters}
            </button>

            <button className="btn-secondary !px-5 !py-3 !rounded-xl">
              <Download className="w-4 h-4" />
              {t.export}
            </button>
          </div>
        </div>

        {/* Filter Panel (Expandable) */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          {['Date Range', 'Status', 'Amount Range', 'User'].map((label, i) => (
            <div key={i} className="glass-card p-4">
              <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">
                {label}
              </label>
              <select className="input-modern !py-2 !text-sm">
                <option>All</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          ))}
        </div>

        {/* Checks Table - Modern Glass Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#3949AB]/5 bg-[#f8faff]">
                  <th className="px-6 py-5 text-start w-16">
                    <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-[#3949AB] focus:ring-[#3949AB]" />
                  </th>
                  <th className="px-6 py-5 text-start text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.checkNumber}</th>
                  <th className="px-6 py-5 text-start text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.date}</th>
                  <th className="px-6 py-5 text-start text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.beneficiary}</th>
                  <th className="px-6 py-5 text-start text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.amount}</th>
                  <th className="px-6 py-5 text-start text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.status}</th>
                  <th className="px-6 py-5 text-start text-xs font-black text-[#3949AB] uppercase tracking-wider hidden lg:table-cell">{t.table.printedBy}</th>
                  <th className="px-6 py-5 text-end text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {currentChecks.map((check, index) => (
                  <tr 
                    key={check.id} 
                    className="hover:bg-[#f8faff] transition-colors group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-[#3949AB] focus:ring-[#3949AB]" />
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-neutral-600 group-hover:text-[#3949AB] transition-colors">
                      {check.checkNumber}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-500">
                      {check.date}
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-800">
                      {language === 'ar' ? check.beneficiary : check.beneficiaryEn}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-neutral-800">
                        {check.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-neutral-400 font-bold ml-1">{check.currency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        check.status === 'printed' 
                          ? 'bg-green-50 text-green-600 border-green-100' 
                          : check.status === 'voided'
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                      }`}>
                        {check.status === 'printed' && <CheckCircle2 className="w-3 h-3" />}
                        {check.status === 'voided' && <XCircle className="w-3 h-3" />}
                        {check.status === 'pending' && <Clock className="w-3 h-3" />}
                        {t.printedChecks.statuses[check.status as keyof typeof t.printedChecks.statuses]}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#3949AB]/10 flex items-center justify-center text-[#3949AB] text-xs font-bold">
                          {(language === 'ar' ? check.printedBy : check.printedByEn).charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-neutral-600">
                          {language === 'ar' ? check.printedBy : check.printedByEn}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-[#3949AB]/5 text-neutral-400 hover:text-[#3949AB] transition-colors" title={t.view}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-[#3949AB]/5 text-neutral-400 hover:text-[#3949AB] transition-colors" title={t.printedChecks.reprint}>
                          <Printer className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-[#3949AB]/5 text-neutral-400 hover:text-[#3949AB] transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-neutral-100 bg-[#f8faff]/50 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">
              {t.printedChecks.showing} <span className="font-bold text-neutral-800">{startIndex + 1}-{Math.min(endIndex, mockPrintedChecks.length)}</span> {t.printedChecks.of} <span className="font-bold text-neutral-800">{mockPrintedChecks.length}</span>
            </p>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:text-[#3949AB] hover:border-[#3949AB] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                      currentPage === i + 1
                        ? 'bg-[#3949AB] text-white shadow-md shadow-[#3949AB]/20'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-[#3949AB] hover:text-[#3949AB]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:text-[#3949AB] hover:border-[#3949AB] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
