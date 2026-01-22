'use client';

import React, {useState} from 'react'
import { useLanguage } from '@/contexts/LanguageContext';
import { mockBatchChecks } from '@/lib/mock-data';
import { 
    AlertCircle,
    Trash2,
    Edit,
} from 'lucide-react';

export default function ChequesTaple({ checks, template }: { checks: any[], template: any }) {
  const { t, language } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;
  const allSelected = checks.length > 0 && selectedCount === checks.length;
  const anySelected = selectedCount > 0;

//   const [checks, setChecks] = useState(mockBatchChecks);

// ============================================ Handlers ===========================================
// const staticChequeImages = [
//     '/cheques/egy-ahly.jpeg',
//     '/cheques/egy-cib.jpeg',
//     '/cheques/ksa-br.jpeg',
//     '/cheques/ksa-fr.jpeg',
//     '/cheques/ps-arabic.jpeg',
//   ];

  const openPrintForChecks = (checksToPrint: Array<{ id: string }>) => {
    if (checksToPrint.length === 0) return;
    // const images = checksToPrint.map((_, i) => staticChequeImages[i % staticChequeImages.length]);
    // setPrintChequeImages(images);
    // setShowPrintDialog(true);
  };

  const handlePrintAll = () => {
    openPrintForChecks(checks);
  };

  const handlePrintSelected = () => {
    const selectedChecks = checks.filter((c) => selectedIds[c.id]);
    openPrintForChecks(selectedChecks);
  };

  const totalAmount = checks.reduce((sum, check) => sum + check.amount, 0);

//=========================================== Handlers End ===========================================

  return (
    <>
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
                  <th className="px-6 py-4 text-start text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.amount}</th>
                  <th className="px-6 py-4 text-start text-xs font-black text-[#3949AB] uppercase tracking-wider">{t.table.date}</th>
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
                    <td className="px-6 py-4 font-mono font-bold text-[#3949AB]">
                      ${check.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-500">{check.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </>
  )
}
