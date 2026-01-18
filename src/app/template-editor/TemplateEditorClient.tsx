"use client";

/*-*-*-- Core imports for the template editor page -*-*-*-// */
import { useCallback, useMemo, useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Toast, type ToastPayload, type ToastType } from "@/components/Toast";
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  Upload,
  Type,
  Crop,
  Pencil,
  Trash2,
  Save,
  Move,
  Grid,
  Maximize,
  Eraser,
  ImageMinus,
  Loader2,
} from "lucide-react";
import { checkFields } from "@/lib/mock-data";
import { useLanguage } from "@/contexts/LanguageContext";
import BackgroundImageEditor from "@/components/BackgroundImageEditor";
import type { Country } from "@/lib/actions/catalog";

interface CheckField {
  id: string;
  label: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  alignment: "left" | "center" | "right";
  rotation: number;
}

export default function TemplateEditorClient({
  initialCountries,
}: {
  initialCountries: Country[];
}) {
  const { t, direction } = useLanguage();

  const [toast, setToast] = useState<(ToastPayload & { autoCloseMs?: number }) | null>(null);

  const showToast = useCallback(
    (
      type: ToastType,
      message: string,
      title?: string,
      autoCloseMs?: number
    ) => {
      setToast({ type, title, message, autoCloseMs });
    },
    []
  );

  useEffect(() => {
    if (!toast?.autoCloseMs) return;
    const t = setTimeout(() => setToast(null), toast.autoCloseMs);
    return () => clearTimeout(t);
  }, [toast?.autoCloseMs]);

  /*-*-*-- Template Info State -*-*-*-// */
  const [templateNameAr, setTemplateNameAr] = useState("");
  const [templateNameEn, setTemplateNameEn] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const countries = useMemo(() => initialCountries ?? [], [initialCountries]);

  const banks = useMemo(() => {
    return countries.flatMap((country) =>
      country.banks.map((bank) => ({
        id: bank.id,
        name: bank.name,
        nameEn: bank.nameEn,
        countryName: country.name,
        countryNameEn: country.nameEn,
      }))
    );
  }, [countries]);

  /*-*-*-- Canvas state: fields + selection + background -*-*-*-// */
  const [placedFields, setPlacedFields] = useState<CheckField[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 350 });

  /*-*-*-- Background image editor state (open/apply flow) -*-*-*-// */
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);

  /*-*-*-- Drag/drop handlers for placing fields onto the canvas -*-*-*-// */
  // ... (handlers same as before but improved)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const fieldId = active.id as string;
    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const pointerEvent = event.activatorEvent as MouseEvent;

    const x = pointerEvent.clientX - canvasRect.left;
    const y = pointerEvent.clientY - canvasRect.top;

    const existingFieldIndex = placedFields.findIndex((f) => f.id === fieldId);

    if (existingFieldIndex >= 0) {
      setPlacedFields((prev) =>
        prev.map((f) =>
          f.id === fieldId ? { ...f, x: f.x + delta.x, y: f.y + delta.y } : f
        )
      );
    } else {
      const sourceField = checkFields.find((f) => f.id === fieldId);

      if (sourceField) {
        const newField: CheckField = {
          id: fieldId,
          label: sourceField.label,
          x: Math.max(0, Math.min(x, canvasRect.width - 30)),
          y: Math.max(0, Math.min(y, canvasRect.height - 30)),
          fontSize: 14,
          fontFamily: "Arial",
          alignment: "left",
          rotation: 0,
        };
        setPlacedFields((prev) => [...prev, newField]);
      }
    }
    setActiveId(null);
  };

  const updateField = (id: string, updates: Partial<CheckField>) => {
    setPlacedFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeField = (id: string) => {
    setPlacedFields((prev) => prev.filter((f) => f.id !== id));
    setSelectedField(null);
  };

  const selectedFieldData = placedFields.find((f) => f.id === selectedField);

  // ===================================== (SHerif) Handle Save Template ==========================================
  const handleSaveTemplate = async () => {
    // Validation
    if (!templateNameAr || !templateNameEn) {
      showToast(
        "error",
        direction === "rtl"
          ? "الرجاء إدخال اسم النموذج بالعربي والإنجليزي"
          : "Please enter template name in both Arabic and English",
        direction === "rtl" ? "بيانات ناقصة" : "Missing information",
        4000
      );
      return;
    }

    if (!selectedBankId) {
      showToast(
        "error",
        direction === "rtl" ? "الرجاء اختيار البنك" : "Please select a bank",
        direction === "rtl" ? "بيانات ناقصة" : "Missing information",
        4000
      );
      return;
    }

    if (!backgroundImage) {
      showToast(
        "error",
        direction === "rtl"
          ? "الرجاء رفع صورة خلفية للشيك"
          : "Please upload a check background image",
        direction === "rtl" ? "بيانات ناقصة" : "Missing information",
        4000
      );
      return;
    }

    if (placedFields.length === 0) {
      showToast(
        "error",
        direction === "rtl"
          ? "الرجاء إضافة حقول على الأقل"
          : "Please add at least one field",
        direction === "rtl" ? "بيانات ناقصة" : "Missing information",
        4000
      );
      return;
    }

    const templateSchema = buildTemplateSchema();

    try {
      setIsSaving(true);
      showToast(
        "loading",
        direction === "rtl" ? "جاري حفظ النموذج..." : "Saving template...",
        direction === "rtl" ? "الرجاء الانتظار" : "Please wait"
      );
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateSchema),
      });

      if (response.ok) {
        showToast(
          "success",
          direction === "rtl" ? "تم حفظ النموذج بنجاح" : "Template saved successfully",
          direction === "rtl" ? "تم" : "Success",
          3500
        );

        // Reset form
        setTemplateNameAr("");
        setTemplateNameEn("");
        setSelectedBankId("");
        setPlacedFields([]);
        setBackgroundImage(null);
      } else {
        throw new Error("Failed to save template");
      }
    } catch (error) {
      console.error("Failed to save template", error);
      showToast(
        "error",
        direction === "rtl" ? "فشل في حفظ النموذج" : "Failed to save template",
        direction === "rtl" ? "خطأ" : "Error",
        5000
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ===================================== (SHerif) Handle Save Template End ==========================================

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;

        /*-*-*-- Open editor immediately after upload (best UX) -*-*-*-// */
        setUploadedImageSrc(src);
        setIsImageEditorOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditorForCurrentBackground = useCallback(() => {
    if (!backgroundImage) return;
    setUploadedImageSrc(backgroundImage);
    setIsImageEditorOpen(true);
  }, [backgroundImage]);

  /*-*-*-- Remove background image and return to upload placeholder -*-*-*-// */
  const removeBackgroundImage = useCallback(() => {
    setBackgroundImage(null);
    setUploadedImageSrc(null);
    setCanvasSize({ width: 800, height: 350 });
    setSelectedField(null);
  }, []);

  const closeImageEditor = useCallback(() => {
    setIsImageEditorOpen(false);
  }, []);

  /*-*-*-- Build template schema payload (used by save) -*-*-*-// */
  const buildTemplateSchema = () => {
    return {
      bankId: selectedBankId,
      nameAr: templateNameAr,
      nameEn: templateNameEn,
      version: "1.0",
      schema: {
        canvas: {
          width: canvasSize.width,
          height: canvasSize.height,
          grid: showGrid,
        },
        background: backgroundImage,
        fields: placedFields.map((field) => ({
          id: field.id,
          type: "text",
          label: field.label,
          position: {
            x: Math.round(field.x),
            y: Math.round(field.y),
          },
          style: {
            fontSize: field.fontSize,
            fontFamily: field.fontFamily,
            alignment: field.alignment,
            rotation: field.rotation,
          },
        })),
        meta: {
          direction,
          savedAt: new Date().toISOString(),
        },
      },
    };
  };

  return (
    <AppLayout title={t.templateEditor.title} subtitle={t.templateEditor.subtitle}>
      <Toast toast={toast} onClose={() => setToast(null)} direction={direction} />

      {/*-*-*-- Template Info Section - Placed at the top -*-*-*-// */}
      <div className="glass-card p-6 mb-6 animate-slide-in">
        <h2 className="text-xl font-black text-[#3949AB] mb-4 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#3949AB]/10 flex items-center justify-center">
            <Type className="w-5 h-5 text-[#3949AB]" />
          </div>
          {t.templateEditor.templateInfo}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Arabic Name */}
          <div>
            <label className="block text-sm font-bold text-neutral-600 mb-2">
              {t.templateEditor.templateNameAr}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={templateNameAr}
              onChange={(e) => setTemplateNameAr(e.target.value)}
              className="input-modern w-full py-3 px-4 text-sm font-bold"
              placeholder={t.templateEditor.templateNameArPlaceholder}
              dir="rtl"
              required
            />
          </div>

          {/* English Name */}
          <div>
            <label className="block text-sm font-bold text-neutral-600 mb-2">
              {t.templateEditor.templateNameEn}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={templateNameEn}
              onChange={(e) => setTemplateNameEn(e.target.value)}
              className="input-modern w-full py-3 px-4 text-sm font-bold"
              placeholder={t.templateEditor.templateNameEnPlaceholder}
              dir="ltr"
              required
            />
          </div>

          {/* Bank Selection */}
          <div>
            <label className="block text-sm font-bold text-neutral-600 mb-2">
              {t.templateEditor.selectBank}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
              className="input-modern w-full py-3 px-4 text-sm font-bold"
              dir={direction}
              required
            >
              <option value="">{t.templateEditor.selectBankPlaceholder}</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {direction === "rtl"
                    ? `${bank.name} (${bank.countryName})`
                    : `${bank.nameEn} (${bank.countryNameEn})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info message */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-700 font-bold">
            {direction === "rtl"
              ? "💡 املأ جميع الحقول المطلوبة (*) قبل البدء في تصميم القالب"
              : "💡 Fill all required fields (*) before starting to design the template"}
          </p>
        </div>
      </div>

      {/*-*-*-- Drag context for library items and canvas fields -*-*-*-// */}
      <DndContext onDragStart={({ active }) => setActiveId(active.id as string)} onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
          {/* Left Toolbar - Glass Vertical Bar */}
          <div className="w-20 hidden lg:flex flex-col gap-4 items-center py-6 glass-card">
            <button
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                showGrid
                  ? "bg-[#3949AB] text-white shadow-lg shadow-[#3949AB]/30"
                  : "bg-white text-neutral-400 hover:text-[#3949AB]"
              }`}
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle Grid"
            >
              <Grid className="w-6 h-6" />
            </button>
            <div className="w-8 h-px bg-neutral-200"></div>

            {/*-*-*-- Re-open background editor (only when image exists) -*-*-*-// */}
            <button
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                backgroundImage
                  ? "bg-white text-neutral-400 hover:text-[#3949AB]"
                  : "bg-white/60 text-neutral-300 cursor-not-allowed"
              }`}
              onClick={openEditorForCurrentBackground}
              disabled={!backgroundImage}
              title="Edit background"
            >
              <Crop className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 rounded-xl bg-white text-neutral-400 hover:text-[#3949AB] flex items-center justify-center transition-colors">
              <Eraser className="w-6 h-6" onClick={() => setPlacedFields([])} />
            </button>
            <button className="w-12 h-12 rounded-xl bg-white text-neutral-400 hover:text-[#3949AB] flex items-center justify-center transition-colors">
              <ImageMinus className="w-6 h-6" onClick={() => setBackgroundImage(null)} />
            </button>
          </div>

          {/* Canvas Area - Main Workspace */}
          <div className="flex-1 glass-card relative overflow-hidden bg-[#f0f4ff] flex items-center justify-center">
            {showGrid && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: "radial-gradient(#3949AB 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              ></div>
            )}

            <div
              id="canvas"
              className="relative bg-white shadow-2xl shadow-[#3949AB]/10 transition-all duration-300"
              style={{
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
              }}
              onClick={() => setSelectedField(null)}
            >
              {/*-*-*-- Top quick actions (edit/remove background image) -*-*-*-// */}
              {backgroundImage && (
                <div className="absolute -top-10 right-3 z-50 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditorForCurrentBackground();
                    }}
                    className="px-3 py-2 rounded-xl bg-white/90 hover:bg-white shadow-sm border border-neutral-200 text-neutral-700 font-bold text-xs flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    {t.templateEditor.imageEditor.editImageButton}
                  </button>

                  {/*-*-*-- Remove background image button -*-*-*-// */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBackgroundImage();
                    }}
                    className="w-10 h-10 rounded-xl bg-white/90 hover:bg-red-50 shadow-sm border border-neutral-200 text-red-600 flex items-center justify-center"
                    title={t.delete}
                    aria-label={t.delete}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Background Image */}
              {backgroundImage && (
                <img
                  src={backgroundImage}
                  alt="Check Background"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
              )}

              {/* Upload Placeholder */}
              {!backgroundImage && (
                <label className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-neutral-200 m-2 rounded-xl cursor-pointer hover:border-[#3949AB] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="text-center opacity-30 hover:opacity-50 transition-opacity">
                    <Upload className="w-12 h-12 mx-auto mb-2 text-[#3949AB]" />
                    <p className="text-sm font-bold">{t.templateEditor.uploadText}</p>
                  </div>
                </label>
              )}

              {placedFields.map((field) => (
                <DraggableCanvasField
                  key={field.id}
                  field={field}
                  isSelected={selectedField === field.id}
                  onSelect={() => setSelectedField(field.id)}
                />
              ))}
            </div>
          </div>

          {/* Right Panel - Dynamic Context (Fields or Properties) */}
          <div className="w-full lg:w-[360px] glass-card flex flex-col overflow-hidden">
            {selectedFieldData ? (
              // Properties Mode
              <div className="flex flex-col h-full animate-slide-in">
                <div className="p-6 border-b border-white/50 bg-white/50">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-black text-[#3949AB]">
                      {t.templateEditor.fieldProperties}
                    </h3>
                    <button
                      onClick={() => setSelectedField(null)}
                      className="text-xs font-bold text-neutral-400 hover:text-[#3949AB]"
                    >
                      Done
                    </button>
                  </div>
                  <p className="text-sm font-bold text-neutral-500">
                    {selectedFieldData.label}
                  </p>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  <div>
                    <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase">
                      {t.templateEditor.fontFamily}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {["Arial", "Cairo", "Times"].map((font) => (
                        <button
                          key={font}
                          onClick={() => updateField(selectedField!, { fontFamily: font })}
                          className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${
                            selectedFieldData.fontFamily === font
                              ? "bg-[#3949AB] text-white border-[#3949AB]"
                              : "bg-white text-neutral-500 border-neutral-200 hover:border-[#3949AB]"
                          }`}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase">
                      {t.templateEditor.fontSize}
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="72"
                      value={selectedFieldData.fontSize}
                      onChange={(e) =>
                        updateField(selectedField!, {
                          fontSize: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-[#3949AB]"
                    />
                    <div className="text-right text-xs font-bold text-[#3949AB] mt-1">
                      {selectedFieldData.fontSize}px
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase">X</label>
                      <input
                        type="number"
                        className="input-modern py-2 px-3 text-sm"
                        value={Math.round(selectedFieldData.x)}
                        onChange={(e) => updateField(selectedField!, { x: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase">Y</label>
                      <input
                        type="number"
                        className="input-modern py-2 px-3 text-sm"
                        value={Math.round(selectedFieldData.y)}
                        onChange={(e) => updateField(selectedField!, { y: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => removeField(selectedField!)}
                    className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 mt-4"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t.templateEditor.removeField}
                  </button>
                </div>
              </div>
            ) : (
              // Library Mode
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-white/50 bg-white/50">
                  <h3 className="text-lg font-black text-[#3949AB]">
                    {t.templateEditor.availableFields}
                  </h3>
                  <p className="text-xs text-neutral-400 font-bold mt-1">
                    {t.templateEditor.tipText}
                  </p>
                </div>

                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                  {checkFields.map((field) => (
                    <DraggableLibraryItem key={field.id} field={field} />
                  ))}
                </div>

                <div className="p-4 bg-white/50 border-t border-white/50">
                  <button
                    className="w-full btn-primary"
                    onClick={handleSaveTemplate}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {isSaving
                      ? direction === "rtl"
                        ? "جاري الحفظ..."
                        : "Saving..."
                      : t.templateEditor.saveTemplate}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeId && (
            <div className="bg-[#3949AB] text-white px-4 py-2 rounded-xl shadow-xl font-bold flex items-center gap-2 cursor-grabbing scale-105">
              <Move className="w-4 h-4" />
              {checkFields.find((f) => f.id === activeId)?.label}
            </div>
          )}
        </DragOverlay>

        {/*-*-*-- Background image editor modal (reusable component) -*-*-*-// */}
        <BackgroundImageEditor
          isOpen={isImageEditorOpen}
          imageSrc={uploadedImageSrc}
          aspect={canvasSize.width / canvasSize.height}
          onClose={closeImageEditor}
          onApply={(result) => {
            setBackgroundImage(result.dataUrl);
            setCanvasSize({ width: result.width, height: result.height });
          }}
        />
      </DndContext>
    </AppLayout>
  );
}

// Helper Components
function DraggableLibraryItem({ field }: { field: any }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: field.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md hover:border-[#3949AB]/30 hover:-translate-y-1 transition-all cursor-grab group flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#f0f4ff] flex items-center justify-center text-[#3949AB] group-hover:bg-[#3949AB] group-hover:text-white transition-colors">
          <Type className="w-4 h-4" />
        </div>
        <span className="font-bold text-neutral-700 group-hover:text-[#3949AB]">
          {field.label}
        </span>
      </div>
      <Move className="w-4 h-4 text-neutral-300 group-hover:text-[#3949AB]" />
    </div>
  );
}

function DraggableCanvasField({
  field,
  isSelected,
  onSelect,
}: {
  field: CheckField;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: field.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...style,
        position: "absolute",
        left: field.x,
        top: field.y,
        fontSize: field.fontSize,
        fontFamily: field.fontFamily,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={
        `
        px-2 py-2 cursor-grab select-none whitespace-nowrap p-2 w-24 h-8 transition-colors border-dashed  flex items-center justify-center rounded-lg border-purple-600 border-2
        ${
          isSelected
            ? "ring-2 ring-[#3949AB] bg-[#3949AB]/10 text-[#3949AB]  font-bold z-50 flex items-center justify-center"
            : "hover:bg-neutral-100 hover:ring-1 hover:ring-neutral-300"
        }
      `
      }
    >
      {field.label}
      {isSelected && (
        <div className="absolute -top-3 -right-3 w-8 h-6 bg-[#3949AB] rounded-full flex items-center justify-center text-white shadow-md">
          <Move className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
