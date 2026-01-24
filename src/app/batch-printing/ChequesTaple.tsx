'use client';

import React, {useState, useRef} from 'react'
import { useLanguage } from '@/contexts/LanguageContext';
import { useReactToPrint } from 'react-to-print';
import { 
    AlertCircle,
    Trash2,
    Edit,
    Printer,
} from 'lucide-react';

export default function ChequesTaple({ checks, template }: { checks: any[], template: any }) {
  const { t, language } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [isPreparing, setIsPreparing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;
  const allSelected = checks.length > 0 && selectedCount === checks.length;
  const anySelected = selectedCount > 0;

  // get canvas dimensions from template
  const resolvedCanvasSizePx = template?.schema?.canvas?.width && template?.schema?.canvas?.height
    ? { width: template.schema.canvas.width, height: template.schema.canvas.height }
    : { width: 800, height: 350 };

  const fields = template?.schema?.fields || [];
  const backgroundImage = template?.schema?.background;

  // printing settings (can be modified later)
  const printSettings = {
    marginMm: 0,
    printScale: 1,
    offsetXmm: 0,
    offsetYmm: 0,
  };

  // CSS for printing 
  const pageStyle = `
    @page { 
      size: ${resolvedCanvasSizePx.width}px ${resolvedCanvasSizePx.height}px; 
      margin: ${printSettings.marginMm}mm; 
    }
    html, body { 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important;
      margin: 0;
      padding: 0;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .print-root { 
      width: ${resolvedCanvasSizePx.width}px; 
      height: ${resolvedCanvasSizePx.height}px; 
    }
    .print-page { 
      width: ${resolvedCanvasSizePx.width}px; 
      height: ${resolvedCanvasSizePx.height}px; 
      page-break-after: always; 
      box-sizing: border-box; 
      padding: ${printSettings.marginMm}mm; 
      position: relative;
    }
    .print-page:last-child { 
      page-break-after: auto; 
    }
    .print-content { 
      width: 100%; 
      height: 100%; 
      overflow: hidden; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
    }
    .print-canvas { 
      position: relative; 
      width: ${Math.max(1, resolvedCanvasSizePx.width)}px; 
      height: ${Math.max(1, resolvedCanvasSizePx.height)}px; 
      transform-origin: center; 
      transform: translate(${printSettings.offsetXmm}mm, ${printSettings.offsetYmm}mm) scale(${printSettings.printScale}); 
    }
    .print-canvas-image { 
      position: absolute; 
      inset: 0; 
      width: 100%; 
      height: 100%; 
      object-fit: contain; 
    }
  `;

  // function to load images before printing
  const preloadImages = async () => {
    if (!backgroundImage) return;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = reject;
      img.src = backgroundImage;
      
      // timeout
      setTimeout(() => reject(new Error('Image load timeout')), 10000);
    });
  };

// setup react-to-print
const reactToPrint = useReactToPrint({
  contentRef: printRef,
  pageStyle,
  onBeforePrint: async () => {
    console.log('Opening print dialog...');
  },
  onAfterPrint: () => {
    setIsPreparing(false);
    console.log('Print completed');
  },
  onPrintError: (errorLocation, error) => {
    setIsPreparing(false);
    console.error('Print error:', errorLocation, error);
    alert(language === 'ar' ? 'حدث خطأ أثناء الطباعة' : 'An error occurred during printing');
  },
});

// print all checks
const handlePrintAll = async () => {
  setSelectedIds({});
  await new Promise(resolve => setTimeout(resolve, 200));
  await handlePrintWithPreload();
};

// print selected checks
const handlePrintSelected = async () => {
  if (anySelected) {
    await handlePrintWithPreload();
  }
};

// helper function for print with preload images
const handlePrintWithPreload = async () => {
  setIsPreparing(true);
  
  try {
    // load images first
    await preloadImages();
    
    // wait for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // call print
    reactToPrint?.();
    
  } catch (error) {
    console.error('Error preparing print:', error);
    setIsPreparing(false);
    alert(language === 'ar' ? 'فشل في تحميل الصور' : 'Failed to load images');
  }
};
  const totalAmount = checks.reduce((sum, check) => sum + parseFloat(check.amount || 0), 0);

  return (
    <>
      {/* Checks Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-[#3949AB]">{t.batchPrinting.checksInBatch}</h3>
          <div className="flex items-center gap-3">
            {anySelected && (
              <button
                onClick={handlePrintSelected}
                disabled={isPreparing}
                className="btn-primary !py-2 !px-4 text-sm disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                {isPreparing 
                  ? (language === 'ar' ? 'جاري التحضير...' : 'Preparing...') 
                  : (language === 'ar' ? `طباعة المحدد (${selectedCount})` : `Print Selected (${selectedCount})`)
                }
              </button>
            )}
            <button
              onClick={handlePrintAll}
              disabled={isPreparing}
              className="btn-primary !py-2 !px-4 text-sm disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              {isPreparing 
                ? (language === 'ar' ? 'جاري التحضير...' : 'Preparing...') 
                : t.batchPrinting.printAll
              }
            </button>
            <span className="bg-[#3949AB]/10 text-[#3949AB] px-3 py-1 rounded-full text-xs font-bold">
              {checks.length} {t.batchPrinting.items}
            </span>
          </div>
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
                    {check.currency} {parseFloat(check.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-500">{check.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden Print Area  */}
      <div style={{ position: 'fixed', left: -10000, top: 0, width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <div ref={printRef} className="print-root">
          {checks.map((check) => {
            const shouldPrint = anySelected ? selectedIds[check.id] : true;
            
            if (!shouldPrint) return null;

            return (
              <div key={check.id} className="print-page">
                <div className="print-content">
                  <div className="print-canvas">
                    {/* background image */}
                    {backgroundImage && (
                      <img 
                        className="print-canvas-image" 
                        src={backgroundImage} 
                        alt="Cheque" 
                        draggable={false} 
                      />
                    )}
                    
                    {/* dynamic fields */}
                    {fields.map((field: any) => {
                      let value = '';
                      switch (field.id) {
                        case 'date':
                          value = check.date;
                          break;
                        case 'amount':
                          value = check.amount.toString();
                          break;
                        case 'checkNumber':
                          value = check.checkNumber.toString();
                          break;
                        case 'beneficiary':
                          value = check.beneficiary || '';
                          break;
                        case 'amountWords':
                          value = check.amountWords || '';
                          break;
                        default:
                          value = '';
                      }

                      return (
                        <div
                          key={field.id}
                          style={{
                            position: 'absolute',
                            left: `${field.position.x}px`,
                            top: `${field.position.y}px`,
                            fontSize: `${field.style.fontSize}px`,
                            fontFamily: field.style.fontFamily,
                            transform: `rotate(${field.style.rotation}deg)`,
                            textAlign: field.style.alignment as any,
                            whiteSpace: 'nowrap',
                            color: '#000000',
                          }}
                        >
                          {value}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  )
}