'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  DndContext, 
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import { 
  Upload, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  RotateCw, 
  Trash2,
  Save,
  Eye,
  Move,
  Grid,
  Maximize
} from 'lucide-react';
import { checkFields, fontFamilies, fontSizes } from '@/lib/mock-data';
import { useLanguage } from '@/contexts/LanguageContext';

interface CheckField {
  id: string;
  label: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  alignment: 'left' | 'center' | 'right';
  rotation: number;
}

// ... (Draggable components will be refined inside)

export default function TemplateEditor() {
  const { t, direction } = useLanguage();
  const [placedFields, setPlacedFields] = useState<CheckField[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  // ... (handlers same as before but improved)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const fieldId = active.id as string;
    
    const existingFieldIndex = placedFields.findIndex(f => f.id === fieldId);
    
    if (existingFieldIndex >= 0) {
      setPlacedFields(prev => prev.map(f => 
        f.id === fieldId 
          ? { ...f, x: f.x + delta.x, y: f.y + delta.y }
          : f
      ));
    } else {
      const sourceField = checkFields.find(f => f.id === fieldId);
      if (sourceField) {
        const newField: CheckField = {
          id: fieldId,
          label: sourceField.label,
          x: delta.x + 50,
          y: delta.y + 50,
          fontSize: 14,
          fontFamily: 'Arial',
          alignment: 'left',
          rotation: 0,
        };
        setPlacedFields(prev => [...prev, newField]);
      }
    }
    setActiveId(null);
  };

  const updateField = (id: string, updates: Partial<CheckField>) => {
    setPlacedFields(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  const removeField = (id: string) => {
    setPlacedFields(prev => prev.filter(f => f.id !== id));
    setSelectedField(null);
  };

  const selectedFieldData = placedFields.find(f => f.id === selectedField);

  return (
    <AppLayout 
      title={t.templateEditor.title} 
      subtitle={t.templateEditor.subtitle}
    >
      <DndContext onDragStart={({ active }) => setActiveId(active.id as string)} onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
          
          {/* Left Toolbar - Glass Vertical Bar */}
          <div className="w-20 hidden lg:flex flex-col gap-4 items-center py-6 glass-card">
            <button 
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${showGrid ? 'bg-[#3949AB] text-white shadow-lg shadow-[#3949AB]/30' : 'bg-white text-neutral-400 hover:text-[#3949AB]'}`}
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle Grid"
            >
              <Grid className="w-6 h-6" />
            </button>
            <div className="w-8 h-px bg-neutral-200"></div>
            <button className="w-12 h-12 rounded-xl bg-white text-neutral-400 hover:text-[#3949AB] flex items-center justify-center transition-colors">
              <Maximize className="w-6 h-6" />
            </button>
          </div>

          {/* Canvas Area - Main Workspace */}
          <div className="flex-1 glass-card relative overflow-hidden bg-[#f0f4ff] flex items-center justify-center">
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none opacity-20" 
                   style={{ backgroundImage: 'radial-gradient(#3949AB 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              </div>
            )}
            
            <div 
              id="canvas"
              className="relative bg-white shadow-2xl shadow-[#3949AB]/10 transition-all duration-300"
              style={{ width: '800px', height: '350px' }}
              onClick={() => setSelectedField(null)}
            >
              {/* Check Background Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-neutral-200 m-2 rounded-xl pointer-events-none">
                <div className="text-center opacity-30">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-[#3949AB]" />
                  <p className="text-sm font-bold">{t.templateEditor.uploadText}</p>
                </div>
              </div>

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
                    <h3 className="text-lg font-black text-[#3949AB]">{t.templateEditor.fieldProperties}</h3>
                    <button onClick={() => setSelectedField(null)} className="text-xs font-bold text-neutral-400 hover:text-[#3949AB]">Done</button>
                  </div>
                  <p className="text-sm font-bold text-neutral-500">{selectedFieldData.label}</p>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  <div>
                    <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase">{t.templateEditor.fontFamily}</label>
                    <div className="flex gap-2 flex-wrap">
                      {['Arial', 'Cairo', 'Times'].map(font => (
                        <button
                          key={font}
                          onClick={() => updateField(selectedField!, { fontFamily: font })}
                          className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${
                            selectedFieldData.fontFamily === font 
                              ? 'bg-[#3949AB] text-white border-[#3949AB]' 
                              : 'bg-white text-neutral-500 border-neutral-200 hover:border-[#3949AB]'
                          }`}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-400 mb-2 block uppercase">{t.templateEditor.fontSize}</label>
                    <input 
                      type="range" 
                      min="8" max="72" 
                      value={selectedFieldData.fontSize}
                      onChange={(e) => updateField(selectedField!, { fontSize: parseInt(e.target.value) })}
                      className="w-full accent-[#3949AB]"
                    />
                    <div className="text-right text-xs font-bold text-[#3949AB] mt-1">{selectedFieldData.fontSize}px</div>
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
                  <h3 className="text-lg font-black text-[#3949AB]">{t.templateEditor.availableFields}</h3>
                  <p className="text-xs text-neutral-400 font-bold mt-1">{t.templateEditor.tipText}</p>
                </div>
                
                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                  {checkFields.map((field) => (
                    <DraggableLibraryItem key={field.id} field={field} />
                  ))}
                </div>

                <div className="p-4 bg-white/50 border-t border-white/50">
                  <button className="w-full btn-primary">
                    <Save className="w-5 h-5" />
                    {t.templateEditor.saveTemplate}
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
              {checkFields.find(f => f.id === activeId)?.label}
            </div>
          )}
        </DragOverlay>
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
        <span className="font-bold text-neutral-700 group-hover:text-[#3949AB]">{field.label}</span>
      </div>
      <Move className="w-4 h-4 text-neutral-300 group-hover:text-[#3949AB]" />
    </div>
  );
}

function DraggableCanvasField({ field, isSelected, onSelect }: { field: CheckField, isSelected: boolean, onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: field.id });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...style,
        position: 'absolute',
        left: field.x,
        top: field.y,
        fontSize: field.fontSize,
        fontFamily: field.fontFamily,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`
        px-2 py-1 cursor-grab select-none whitespace-nowrap transition-colors
        ${isSelected 
          ? 'ring-2 ring-[#3949AB] bg-[#3949AB]/10 text-[#3949AB] font-bold z-50' 
          : 'hover:bg-neutral-100 hover:ring-1 hover:ring-neutral-300'
        }
      `}
    >
      {field.label}
      {isSelected && (
        <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#3949AB] rounded-full flex items-center justify-center text-white shadow-md">
          <Move className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
