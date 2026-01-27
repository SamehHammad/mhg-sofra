'use client';

/*-*-*-- Core imports for page UI + image editing -*-*-*-// */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Printer, Save, ZoomIn, ZoomOut, CreditCard, Globe, ChevronDown,  Pencil, Undo2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import PrintSettingsDialog, { type PrintSettings } from '@/components/PrintSettingsDialog';
import BackgroundImageEditor from '@/components/BackgroundImageEditor';
import { type Country } from '@/lib/actions/catalog';

interface PrintCheckClientProps {
    initialCountries: Country[];
}

export default function PrintCheckClient({ initialCountries }: PrintCheckClientProps) {
    const { t, direction, language } = useLanguage();
    const isRTL = direction === 'rtl';
console.log(initialCountries);

    /*-*-*-- Data state -*-*-*-// */
    const [countries] = useState<Country[]>(initialCountries);
    const [isLoading] = useState(false);

    /*-*-*-- Selection state (drives which cheque image/template is shown) -*-*-*-// */
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
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
    const handleCountryChange = (countryId: string) => {
        setSelectedCountry(countryId);
        setSelectedBank('');
        setSelectedTemplateId('');

        // Simple heuristic for direction based on known RTL country codes
        // In a real app, this should come from the database/API
        const rtlCountries = ['eg', 'sa', 'ps', 'ae', 'kw', 'qa', 'om', 'bh', 'jo', 'lb', 'iq', 'ye', 'sy', 'sd', 'ly', 'dz', 'ma', 'tn'];
        const isCountryRTL = rtlCountries.includes(countryId.toLowerCase());
        setCheckDirection(isCountryRTL ? 'rtl' : 'ltr');
    };

    /*-*-*-- Derived values from current selections -*-*-*-// */
    const selectedCountryData = useMemo(() =>
        countries.find(c => c.id === selectedCountry),
        [countries, selectedCountry]);

    const availableBanks = useMemo(() =>
        selectedCountryData?.banks || [],
        [selectedCountryData]);

    const selectedBankData = useMemo(() =>
        availableBanks.find(b => b.id === selectedBank),
        [availableBanks, selectedBank]);

    const availableTemplates = useMemo(() =>
        selectedBankData?.templates || [],
        [selectedBankData]);

    const selectedTemplate = useMemo(() => {
        if (!selectedBankData) return null;
        if (selectedTemplateId) {
            return availableTemplates.find(t => t.id === selectedTemplateId) || availableTemplates[0] || null;
        }
        return availableTemplates[0] || null;
    }, [availableTemplates, selectedBankData, selectedTemplateId]);

    const selectedChequeImage = selectedTemplate?.schema.background || null;

    /*-*-*-- Editable cheque image (crop/rotate/zoom apply) -*-*-*-// */
    const [editedChequeImage, setEditedChequeImage] = useState<string | null>(null);
    const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
    const [imageEditorSrc, setImageEditorSrc] = useState<string | null>(null);

    /*-*-*-- Canvas dimensions state -*-*-*-// */
    const [imageDimensions, setImageDimensions] = useState({ width: 900, height: 420 });

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        // Keep a fallback to natural image size when the template doesn't define a canvas.
        // We do NOT want this to be the source of truth when a canvas exists, because that
        // breaks the coordinate space between template-editor and printing.
        const { naturalWidth, naturalHeight } = e.currentTarget;
        setImageDimensions({ width: naturalWidth, height: naturalHeight });
    };

    const canvasSize = useMemo(() => {
        const w = selectedTemplate?.schema?.canvas?.width;
        const h = selectedTemplate?.schema?.canvas?.height;
        if (typeof w === 'number' && typeof h === 'number' && w > 0 && h > 0) {
            return { width: w, height: h };
        }
        return imageDimensions;
    }, [selectedTemplate, imageDimensions]);

    /*-*-*-- Dynamic Field State -*-*-*-// */
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

    /*-*-*-- Global field text style overrides (applied on top of template styles) -*-*-*-// */
    const [fieldTextStyle, setFieldTextStyle] = useState<{
        fontSize: number;
        color: string;
        bold: boolean;
        italic: boolean;
        underline: boolean;
    }>({
        fontSize: 14,
        color: '#000000',
        bold: false,
        italic: false,
        underline: false,
    });

    /*-*-*-- When template changes: reset field values -*-*-*-// */
    useEffect(() => {
        if (selectedTemplate) {
            const initialValues: Record<string, string> = {};
            selectedTemplate.schema.fields.forEach(field => {
                initialValues[field.id] = '';
            });
            setFieldValues(initialValues);
        }
    }, [selectedTemplate]);

    const handleFieldChange = (id: string, value: string) => {
        setFieldValues(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const displayedChequeImage = useMemo(
        () => editedChequeImage ?? selectedChequeImage,
        [editedChequeImage, selectedChequeImage]
    );

    useEffect(() => {
        if (!selectedBankData) {
            setSelectedTemplateId('');
            return;
        }
        if (availableTemplates.length === 0) {
            setSelectedTemplateId('');
            return;
        }
        setSelectedTemplateId((current) => {
            if (current && availableTemplates.some(t => t.id === current)) return current;
            return availableTemplates[0].id;
        });
    }, [availableTemplates, selectedBankData]);

    useEffect(() => {
        /*-*-*-- When bank changes: reset edits (edits are bank-specific) -*-*-*-// */
        setEditedChequeImage(null);
        setIsImageEditorOpen(false);
        setImageEditorSrc(null);
    }, [selectedBank]);

    useEffect(() => {
        setEditedChequeImage(null);
        setIsImageEditorOpen(false);
        setImageEditorSrc(null);
    }, [selectedTemplateId]);

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
                                        disabled={isLoading}
                                    >
                                        <option value="" disabled>
                                            {isLoading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : t.printCheck.selectCountry}
                                        </option>
                                        {countries.map((country) => (
                                            <option key={country.id} value={country.id} className="py-2">
                                                {language === 'ar' ? country.name : country.nameEn}
                                            </option>
                                        ))}
                                    </select>
                                    {isLoading ? (
                                        <Loader2 className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-[#3949AB] animate-spin ${direction === 'rtl' ? 'right-4' : 'left-4'}`} />
                                    ) : (
                                        <Globe className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'right-4' : 'left-4'}`} />
                                    )}
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
                                        onChange={(e) => {
                                            setSelectedBank(e.target.value);
                                            setSelectedTemplateId('');
                                        }}
                                        disabled={!selectedCountry || isLoading}
                                    >
                                        <option value="" disabled>
                                            {selectedCountry
                                                ? t.printCheck.selectBank
                                                : (language === 'ar' ? 'اختر الدولة أولاً' : 'Select country first')}
                                        </option>
                                        {availableBanks.map((bank) => (
                                            <option key={bank.id} value={bank.id} className="py-2">
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

                            {/* Template Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    {language === 'ar' ? 'النموذج' : 'Template'}
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200 ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'}`}
                                        value={selectedTemplateId}
                                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                                        disabled={!selectedBank || isLoading || availableTemplates.length === 0}
                                    >
                                        <option value="" disabled>
                                            {!selectedBank
                                                ? (language === 'ar' ? 'اختر البنك أولاً' : 'Select bank first')
                                                : (availableTemplates.length === 0
                                                    ? (language === 'ar' ? 'لا توجد نماذج متاحة' : 'No templates available')
                                                    : (language === 'ar' ? 'اختر النموذج' : 'Select template'))}
                                        </option>
                                        {availableTemplates.map((template) => (
                                            <option key={template.id} value={template.id} className="py-2">
                                                {language === 'ar'
                                                    ? `${template.name}${template.version ? ` - ${template.version}` : ''}`
                                                    : `${template.nameEn}${template.version ? ` - ${template.version}` : ''}`}
                                            </option>
                                        ))}
                                    </select>
                                    <CreditCard className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'right-4' : 'left-4'}`} />
                                    <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${direction === 'rtl' ? 'left-4' : 'right-4'}`} />
                                </div>
                                {selectedBank && availableTemplates.length > 1 && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {language === 'ar' ? 'هذا البنك يحتوي على أكثر من نموذج' : 'This bank has multiple templates'}
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
                            {selectedTemplate ? (
                                selectedTemplate.schema.fields.map((field) => (
                                    <div key={field.id} className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            {field.label || field.id}
                                        </label>
                                        <input
                                            type={field.type === 'number' ? 'number' : 'text'}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB] transition-all"
                                            placeholder={field.label || field.id}
                                            value={fieldValues[field.id] || ''}
                                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    {!selectedCountry
                                        ? (language === 'ar' ? 'الرجاء اختيار الدولة أولاً' : 'Please select a country first')
                                        : (!selectedBank
                                            ? (language === 'ar' ? 'الرجاء اختيار البنك أولاً' : 'Please select a bank first')
                                            : (availableTemplates.length === 0
                                                ? (language === 'ar' ? 'لا توجد نماذج متاحة لهذا البنك' : 'No templates available for this bank')
                                                : (language === 'ar' ? 'الرجاء اختيار نموذج الشيك أولاً' : 'Please select a cheque template first')))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 sticky bottom-0 bg-gradient-to-t from-[#f8faff] pt-4 pb-2 z-10">
                        <button
                            className="flex-1 btn-primary shadow-lg shadow-[#3949AB]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setShowPrintDialog(true)}
                            disabled={!selectedTemplate || !selectedChequeImage}
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
                    canvasSizePx={canvasSize}
                    fields={selectedTemplate?.schema.fields}
                    fieldValues={fieldValues}
                />

                {/*-*-*-- Right panel: check preview + zoom + image edit -*-*-*-// */}
                <div className="flex-1 glass-card p-2 flex flex-col relative overflow-hidden bg-white">
                    {/* Toolbar */}
                    <div className="absolute top-[30px] left-6 right-6 flex justify-between items-center z-20">
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

                    {/* Field text style options (applies to all rendered fields) */}
                    <div className="absolute top-[78px] left-6 right-6 z-20">
                        <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-sm border border-neutral-100 flex flex-wrap items-center gap-3">
                            <div className="text-xs font-black text-neutral-500 uppercase tracking-wider">
                                {language === 'ar' ? 'خيارات النص' : 'Text Options'}
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-neutral-500">
                                    {language === 'ar' ? 'الحجم' : 'Size'}
                                </label>
                                <input
                                    type="number"
                                    min={8}
                                    max={72}
                                    value={fieldTextStyle.fontSize}
                                    onChange={(e) =>
                                        setFieldTextStyle((p) => ({
                                            ...p,
                                            fontSize: Math.max(8, Math.min(72, Number(e.target.value) || 14)),
                                        }))
                                    }
                                    className="w-20 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-bold text-neutral-700 focus:ring-2 focus:ring-[#3949AB]/20 focus:border-[#3949AB]"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-neutral-500">
                                    {language === 'ar' ? 'اللون' : 'Color'}
                                </label>
                                <input
                                    type="color"
                                    value={fieldTextStyle.color}
                                    onChange={(e) => setFieldTextStyle((p) => ({ ...p, color: e.target.value }))}
                                    className="w-10 h-10 p-1 rounded-xl border border-neutral-200 bg-white"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFieldTextStyle((p) => ({ ...p, bold: !p.bold }))}
                                    className={`px-3 py-2 rounded-xl border text-sm font-black transition-colors ${
                                        fieldTextStyle.bold
                                            ? 'bg-[#3949AB] text-white border-[#3949AB]'
                                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-[#3949AB]'
                                    }`}
                                >
                                    B
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFieldTextStyle((p) => ({ ...p, italic: !p.italic }))}
                                    className={`px-3 py-2 rounded-xl border text-sm font-black transition-colors italic ${
                                        fieldTextStyle.italic
                                            ? 'bg-[#3949AB] text-white border-[#3949AB]'
                                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-[#3949AB]'
                                    }`}
                                >
                                    I
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFieldTextStyle((p) => ({ ...p, underline: !p.underline }))}
                                    className={`px-3 py-2 rounded-xl border text-sm font-black transition-colors underline ${
                                        fieldTextStyle.underline
                                            ? 'bg-[#3949AB] text-white border-[#3949AB]'
                                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-[#3949AB]'
                                    }`}
                                >
                                    U
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 bg-[#f0f4ff] rounded-[20px] relative overflow-hidden flex items-center justify-center bg-[radial-gradient(#3949AB_1px,transparent_1px)] [background-size:20px_20px] opacity-100">
                        {displayedChequeImage ? (
                            <div
                                className="bg-white shadow-2xl shadow-[#3949AB]/20 transition-all duration-500 ease-out"
                                style={{
                                    transform: `scale(${zoomLevel})`,
                                    transformOrigin: 'center center',
                                }}
                            >
                                {/*
                                  Use the same model as template-editor:
                                  - A fixed-size canvas (template.schema.canvas) is the coordinate space.
                                  - The cheque image is absolute, object-contain, and covers the canvas.
                                  - Fields are absolutely positioned using the same x/y saved in the schema.
                                */}
                                <div
                                    className="relative"
                                    dir={checkDirection}
                                    style={{
                                        width: `${canvasSize.width}px`,
                                        height: `${canvasSize.height}px`,
                                    }}
                                >
                                    <img
                                        src={displayedChequeImage}
                                        alt="Cheque"
                                        className="absolute inset-0 w-full h-full object-contain"
                                        draggable={false}
                                        onLoad={handleImageLoad}
                                    />

                                    {/* Render dynamic fields on top of the image */}
                                    {selectedTemplate?.schema.fields.map((field) => (
                                        <div
                                            key={field.id}
                                            style={{
                                                position: 'absolute',
                                                left: `${field.position.x}px`,
                                                top: `${field.position.y}px`,
                                                fontSize: `${fieldTextStyle.fontSize}px`,
                                                fontFamily: field.style.fontFamily,
                                                color: fieldTextStyle.color,
                                                fontWeight: fieldTextStyle.bold ? 700 : 400,
                                                fontStyle: fieldTextStyle.italic ? 'italic' : 'normal',
                                                textDecoration: fieldTextStyle.underline ? 'underline' : 'none',
                                                transform: `rotate(${field.style.rotation}deg)`,
                                                whiteSpace: 'nowrap',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            {fieldValues[field.id]}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center animate-float">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_20px_50px_-10px_rgba(57,73,171,0.2)]">
                                    <Printer className="w-10 h-10 text-[#3949AB]" />
                                </div>
                                <h3 className="text-xl font-black text-[#3949AB] mb-2">{t.printCheck.emptyState}</h3>
                                <p className="text-sm text-neutral-400 font-medium">
                                    {isLoading ? (language === 'ar' ? 'جاري تحميل البيانات...' : 'Loading data...') : (language === 'ar' ? 'ابدأ باختيار الدولة ثم البنك من القائمة الجانبية' : 'Start by selecting a country and bank')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/*-*-*-- Background Image Editor (Reusable Component) -*-*-*-// */}
                <BackgroundImageEditor
                    isOpen={isImageEditorOpen}
                    imageSrc={imageEditorSrc}
                    aspect={canvasSize.width / canvasSize.height}
                    onClose={() => setIsImageEditorOpen(false)}
                    onApply={(result) => {
                        setEditedChequeImage(result.dataUrl);
                    }}
                />
            </div>
        </AppLayout>
    );
}
