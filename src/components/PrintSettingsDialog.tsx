'use client';

import { useState, useRef } from 'react';
import { Printer, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReactToPrint } from 'react-to-print';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export type PaperPreset = 'A4' | 'LETTER' | 'CUSTOM';
export type PageOrientation = 'portrait' | 'landscape';

export type PrintSettings = {
  paperPreset: PaperPreset;
  pageOrientation: PageOrientation;
  customWidthMm: number;
  customHeightMm: number;
  marginMm: number;
  printScale: number;
  offsetXmm: number;
  offsetYmm: number;
  copies: number;
};

const paperPresets: Record<Exclude<PaperPreset, 'CUSTOM'>, { widthMm: number; heightMm: number }> = {
  A4: { widthMm: 210, heightMm: 297 },
  LETTER: { widthMm: 216, heightMm: 279 },
};

type Props = {
  open: boolean;
  onClose: () => void;
  settings: PrintSettings;
  onChange: (next: PrintSettings) => void;
  chequeImages?: string[];
  selectedChequeImage: string | null;
  canvasSizePx?: { width: number; height: number };
  fields?: Array<{
    id: string;
    type: string;
    label: string;
    position: { x: number; y: number };
    style: {
      fontSize: number;
      fontFamily: string;
      alignment: string;
      rotation: number;
    };
  }>;
  fieldValues?: Record<string, string>;
};

export default function PrintSettingsDialog({ open, onClose, settings, onChange, chequeImages, selectedChequeImage, canvasSizePx, fields, fieldValues }: Props) {
  const { t, language } = useLanguage();

  // UI/printing status (used to disable controls and show progress)
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<'idle' | 'preparing' | 'printing' | 'success' | 'error'>('idle');
  const [printMessage, setPrintMessage] = useState<string | null>(null);

  // react-to-print prints a DOM subtree referenced by this ref
  const printContainerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // Derived sizing values
  // NOTE: we calculate everything in millimeters (mm) to match cheque paper.
  // ---------------------------------------------------------------------------
  const basePaper =
    settings.paperPreset === 'CUSTOM'
      ? { widthMm: settings.customWidthMm, heightMm: settings.customHeightMm }
      : paperPresets[settings.paperPreset];

  const paperWidthMm = settings.pageOrientation === 'landscape' ? basePaper.heightMm : basePaper.widthMm;
  const paperHeightMm = settings.pageOrientation === 'landscape' ? basePaper.widthMm : basePaper.heightMm;

  // Helper to update settings
  const set = (patch: Partial<PrintSettings>) => onChange({ ...settings, ...patch });

  // Copies are rendered as multiple print pages (1..50) and printed in one run.
  const copies = Math.min(50, Math.max(1, Math.floor(settings.copies || 1)));
  const w = Math.max(1, paperWidthMm);
  const h = Math.max(1, paperHeightMm);
  const margin = Math.max(0, settings.marginMm);

  const normalizedImages = (chequeImages && chequeImages.length > 0 ? chequeImages : selectedChequeImage ? [selectedChequeImage] : []).filter(Boolean);
  const canPrint = normalizedImages.length > 0;

  const resolvedCanvasSizePx = canvasSizePx && canvasSizePx.width > 0 && canvasSizePx.height > 0
    ? canvasSizePx
    : { width: 900, height: 420 };

  const hasOverlay = Boolean(fields && fields.length > 0 && fieldValues);

  // ---------------------------------------------------------------------------
  // Print CSS injected by react-to-print
  // - Uses @page to force the exact paper size/margins.
  // - Adds per-copy page breaks.
  // ---------------------------------------------------------------------------
  const pageStyle = `
    @page { size: ${w}mm ${h}mm; margin: ${margin}mm; }
    html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .print-root { width: ${w}mm; height: ${h}mm; }
    .print-page { width: ${w}mm; height: ${h}mm; page-break-after: always; box-sizing: border-box; padding: ${margin}mm; }
    .print-page:last-child { page-break-after: auto; }
    .print-content { width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .print-cheque { width: 100%; height: 100%; object-fit: contain; transform-origin: center; transform: translate(${settings.offsetXmm}mm, ${settings.offsetYmm}mm) scale(${settings.printScale}); }
    .print-canvas { position: relative; width: ${Math.max(1, resolvedCanvasSizePx.width)}px; height: ${Math.max(1, resolvedCanvasSizePx.height)}px; transform-origin: center; transform: translate(${settings.offsetXmm}mm, ${settings.offsetYmm}mm) scale(${settings.printScale}); }
    .print-canvas-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
  `;

  // ---------------------------------------------------------------------------
  // Printing hook
  // IMPORTANT: Must be called on every render (Rules of Hooks).
  // ---------------------------------------------------------------------------
  const reactToPrint = useReactToPrint({
    contentRef: printContainerRef,
    pageStyle,
    onBeforePrint: async () => {
      setIsPrinting(true);
      setPrintStatus('printing');
      setPrintMessage(language === 'ar' ? 'جارٍ فتح نافذة الطباعة...' : 'Opening print dialog...');
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      setPrintStatus('success');
      setPrintMessage(language === 'ar' ? 'تمت عملية الطباعة!' : 'Print completed');
      window.setTimeout(() => {
        setPrintStatus('idle');
        setPrintMessage(null);
        onClose();
      }, 1500);
    },
    onPrintError: () => {
      setIsPrinting(false);
      setPrintStatus('error');
      setPrintMessage(language === 'ar' ? 'حدث خطأ أثناء الطباعة.' : 'An error occurred during printing.');
      window.setTimeout(() => {
        setPrintStatus('idle');
        setPrintMessage(null);
      }, 5000);
    },
  });

  // Render nothing when closed (hooks above still run to keep order stable)
  if (!open) return null;

  // ---------------------------------------------------------------------------
  // Print action
  // - Ensures the printable images are loaded before calling print.
  // - Then triggers react-to-print.
  // ---------------------------------------------------------------------------
  const handlePrint = async () => {
    if (!canPrint || isPrinting) return;

    setIsPrinting(true);
    setPrintStatus('preparing');
    setPrintMessage(language === 'ar' ? 'جارٍ تجهيز الطباعة...' : 'Preparing print...');

    try {
      const container = printContainerRef.current;
      if (!container) {
        throw new Error(language === 'ar' ? 'تعذر تجهيز الطباعة' : 'Unable to prepare printing');
      }

      const imgs = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise<void>((resolve, reject) => {
              if (img.complete && img.naturalWidth > 0) {
                resolve();
                return;
              }
              const timeout = window.setTimeout(() => {
                reject(new Error(language === 'ar' ? 'انتهت مهلة تحميل الصورة' : 'Image load timeout'));
              }, 10000);
              img.onload = () => {
                window.clearTimeout(timeout);
                resolve();
              };
              img.onerror = () => {
                window.clearTimeout(timeout);
                reject(new Error(language === 'ar' ? 'فشل تحميل الصورة' : 'Failed to load image'));
              };
            })
        )
      );

      reactToPrint?.();

    } catch (error) {
      console.error('Print error:', error);
      setPrintStatus('error');
      setPrintMessage(
        error instanceof Error
          ? error.message
          : (language === 'ar'
              ? 'حدث خطأ أثناء الطباعة.'
              : 'An error occurred during printing.')
      );
      setIsPrinting(false);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setPrintStatus('idle');
        setPrintMessage(null);
      }, 5000);
    }
  };

  // Reset print status when dialog closes
  const handleClose = () => {
    setPrintStatus('idle');
    setPrintMessage(null);
    setIsPrinting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#3949AB]/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div style={{ position: 'fixed', left: -10000, top: 0, width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <div ref={printContainerRef} className="print-root">
          {normalizedImages.flatMap((imgSrc, imgIndex) =>
            Array.from({ length: copies }).map((_, copyIndex) => (
              <div key={`${imgIndex}-${copyIndex}`} className="print-page">
                <div className="print-content">
                  {hasOverlay ? (
                    <div className="print-canvas">
                      <img className="print-canvas-image" src={imgSrc} alt="Cheque" draggable={false} />
                      {(fields || []).map((field) => (
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
                          }}
                        >
                          {fieldValues?.[field.id] ?? ''}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <img className="print-cheque" src={imgSrc} alt="Cheque" draggable={false} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="glass-card w-full max-w-4xl p-0 shadow-2xl scale-100 animate-scale-up overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-[#3949AB]">
            {language === 'ar' ? 'إعدادات الطباعة' : 'Print Settings'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-red-50 rounded-full text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-50"
            disabled={isPrinting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 gap-6">
          {/* Settings controls */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">
                  {language === 'ar' ? 'عدد النسخ' : 'Copies'}
                </label>
                <input
                  type="number"
                  className="input-modern font-mono"
                  value={settings.copies}
                  onChange={(e) => set({ copies: Number(e.target.value) })}
                  min={1}
                  step={1}
                  disabled={isPrinting}
                />
              </div>
              <div />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">
                  {language === 'ar' ? 'حجم الورق' : 'Paper Size'}
                </label>
                <select
                  className="input-modern appearance-none cursor-pointer"
                  value={settings.paperPreset}
                  onChange={(e) => set({ paperPreset: e.target.value as PaperPreset })}
                  disabled={isPrinting}
                >
                  <option value="A4">A4 (210×297mm)</option>
                  <option value="LETTER">Letter (216×279mm)</option>
                  <option value="CUSTOM">{language === 'ar' ? 'مخصص' : 'Custom'}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">
                  {language === 'ar' ? 'اتجاه الصفحة' : 'Orientation'}
                </label>
                <select
                  className="input-modern appearance-none cursor-pointer"
                  value={settings.pageOrientation}
                  onChange={(e) => set({ pageOrientation: e.target.value as PageOrientation })}
                  disabled={isPrinting}
                >
                  <option value="portrait">{language === 'ar' ? 'طولي' : 'Portrait'}</option>
                  <option value="landscape">{language === 'ar' ? 'عرضي' : 'Landscape'}</option>
                </select>
              </div>
            </div>

            {settings.paperPreset === 'CUSTOM' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">
                    {language === 'ar' ? 'العرض (mm)' : 'Width (mm)'}
                  </label>
                  <input
                    type="number"
                    className="input-modern font-mono"
                    value={settings.customWidthMm}
                    onChange={(e) => set({ customWidthMm: Number(e.target.value) })}
                    min={1}
                    step={1}
                    disabled={isPrinting}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">
                    {language === 'ar' ? 'الطول (mm)' : 'Height (mm)'}
                  </label>
                  <input
                    type="number"
                    className="input-modern font-mono"
                    value={settings.customHeightMm}
                    onChange={(e) => set({ customHeightMm: Number(e.target.value) })}
                    min={1}
                    step={1}
                    disabled={isPrinting}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">
                  {language === 'ar' ? 'الهامش (mm)' : 'Margin (mm)'}
                </label>
                <input
                  type="number"
                  className="input-modern font-mono"
                  value={settings.marginMm}
                  onChange={(e) => set({ marginMm: Number(e.target.value) })}
                  min={0}
                  step={1}
                  disabled={isPrinting}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">Scale</label>
                <input
                  type="number"
                  className="input-modern font-mono"
                  value={settings.printScale}
                  onChange={(e) => set({ printScale: Number(e.target.value) })}
                  min={0.1}
                  step={0.05}
                  disabled={isPrinting}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">
                  {language === 'ar' ? 'إعادة ضبط' : 'Reset'}
                </label>
                <button
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-neutral-200 text-neutral-600 hover:text-[#3949AB] hover:border-[#3949AB] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    set({ marginMm: 0, printScale: 1, offsetXmm: 0, offsetYmm: 0 });
                  }}
                  disabled={isPrinting}
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">Offset X (mm)</label>
                <input
                  type="number"
                  className="input-modern font-mono"
                  value={settings.offsetXmm}
                  onChange={(e) => set({ offsetXmm: Number(e.target.value) })}
                  step={0.5}
                  disabled={isPrinting}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase tracking-wider">Offset Y (mm)</label>
                <input
                  type="number"
                  className="input-modern font-mono"
                  value={settings.offsetYmm}
                  onChange={(e) => set({ offsetYmm: Number(e.target.value) })}
                  step={0.5}
                  disabled={isPrinting}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-[#f8faff]/60 p-4">
              <div className="text-xs font-bold text-neutral-500 mb-2">
                {language === 'ar' ? 'المقاس النهائي للطباعة' : 'Final print size'}
              </div>
              <div className="font-mono font-black text-[#3949AB]">
                {Math.round(paperWidthMm)}mm × {Math.round(paperHeightMm)}mm
              </div>
            </div>
          </div>
        </div>

        {/* Print status and actions */}
        <div className="px-6 py-4 border-t border-neutral-100 flex flex-col gap-3 bg-[#f8faff]/50">
          {/* Status messages */}
          {printMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              printStatus === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-100' 
                : printStatus === 'error'
                ? 'bg-red-50 text-red-700 border border-red-100'
                : 'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              {printStatus === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : printStatus === 'error' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
              <span className="text-sm font-medium">{printMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl font-bold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50"
              disabled={isPrinting}
            >
              {t.cancel}
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary !py-2.5 !px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={!canPrint || isPrinting}
            >
              {isPrinting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {language === 'ar' ? 'جاري الطباعة...' : 'Printing...'}
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  {language === 'ar' ? 'طباعة' : 'Print'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}