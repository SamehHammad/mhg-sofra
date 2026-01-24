"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-cropper";
import type { ReactCropperElement } from "react-cropper";
import "react-cropper/node_modules/cropperjs/dist/cropper.css";
import { Check, Minus, Plus, RefreshCcw, RotateCw, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BackgroundImageEditorProps {
  isOpen: boolean;
  imageSrc: string | null;
  aspect: number;
  onClose: () => void;
  onApply: (result: { dataUrl: string; width: number; height: number }) => void;
}

export default function BackgroundImageEditor({
  isOpen,
  imageSrc,
  aspect,
  onClose,
  onApply,
}: BackgroundImageEditorProps) {
  const { t } = useLanguage();

  const clampZoom = useCallback((value: number) => {
    return Math.min(3, Math.max(0.05, value));
  }, []);

  //*-*-*--commnet-*-*-*-// Cropper instance ref
  const cropperRef = useRef<ReactCropperElement>(null);

  //*-*-*--commnet-*-*-*-// Local editor state (fully controlled inside the component)
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //*-*-*--commnet-*-*-*-// Cropper is free-form by default; keep prop for future (optional lock)
  const aspectRatio = useMemo(() => {
    void aspect;
    return NaN;
  }, [aspect]);

  const reset = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setError(null);

    const cropper = cropperRef.current?.cropper;
    cropper?.reset();
  }, []);

  //*-*-*--commnet-*-*-*-// Keep cropper in sync with UI sliders
  useEffect(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper.zoomTo(clampZoom(zoom));
  }, [zoom]);

  useEffect(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper.rotateTo(rotation);
  }, [rotation]);

  const handleClose = useCallback(() => {
    setIsApplying(false);
    setError(null);
    onClose();
  }, [onClose]);

  const handleApply = useCallback(async () => {
    if (!imageSrc) return;

    setIsApplying(true);
    setError(null);

    try {
      const cropper = cropperRef.current?.cropper;
      if (!cropper) {
        setError(t.templateEditor.imageEditor.cropRequiredError);
        return;
      }

      const canvas = cropper.getCroppedCanvas();
      if (!canvas) {
        setError(t.templateEditor.imageEditor.cropRequiredError);
        return;
      }

      const dataUrl = canvas.toDataURL("image/png");
      onApply({ dataUrl, width: canvas.width, height: canvas.height });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to apply image edits.");
    } finally {
      setIsApplying(false);
    }
  }, [imageSrc, onApply, onClose, t.templateEditor.imageEditor.cropRequiredError]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-[#3949AB]">
                {t.templateEditor.imageEditor.title}
              </div>
              <div className="text-xs font-bold text-neutral-400">
                {t.templateEditor.imageEditor.subtitle}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-10 h-10 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
            <div className="relative bg-neutral-950" style={{ height: 420 }}>
              <Cropper
                ref={cropperRef}
                src={imageSrc}
                style={{ height: 420, width: "100%" }}
                //*-*-*--commnet-*-*-*-// Highest flexibility: resize crop box from any edge/corner
                aspectRatio={aspectRatio}
                viewMode={0}
                dragMode="move"
                autoCropArea={1}
                responsive
                background={false}
                guides
                center
                highlight
                zoomOnWheel
                cropBoxMovable
                cropBoxResizable
                toggleDragModeOnDblclick={false}
                ready={() => {
                  // Ensure slider state applies on open
                  const cropper = cropperRef.current?.cropper;
                  cropper?.zoomTo(zoom);
                  cropper?.rotateTo(rotation);
                }}
              />
            </div>

            <div className="p-5 space-y-5">
              <div>
                <div className="text-xs font-bold text-neutral-400 mb-2 uppercase">
                  {t.templateEditor.imageEditor.zoom}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => clampZoom(z - 0.1))}
                    className="w-10 h-10 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 flex items-center justify-center"
                    aria-label="Zoom out"
                  >
                    <Minus className="w-4 h-4 text-neutral-700" />
                  </button>

                  <input
                    type="range"
                    min={0.1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(clampZoom(parseFloat(e.target.value)))}
                    className="w-full accent-[#3949AB]"
                  />

                  <button
                    type="button"
                    onClick={() => setZoom((z) => clampZoom(z + 0.1))}
                    className="w-10 h-10 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 flex items-center justify-center"
                    aria-label="Zoom in"
                  >
                    <Plus className="w-4 h-4 text-neutral-700" />
                  </button>
                </div>
                <div className="text-right text-xs font-bold text-[#3949AB] mt-1">
                  {zoom.toFixed(2)}x
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-neutral-400 mb-2 uppercase">
                  {t.templateEditor.imageEditor.rotation}
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full accent-[#3949AB]"
                />
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="px-3 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 font-bold text-xs flex items-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    {t.templateEditor.imageEditor.rotate90}
                  </button>
                  <div className="text-xs font-bold text-[#3949AB]">
                    {rotation}°
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="flex-1 px-3 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-bold text-sm flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  {t.templateEditor.imageEditor.reset}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-3 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-bold text-sm"
                >
                  {t.templateEditor.imageEditor.cancel}
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 font-bold text-xs border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying}
                className={`w-full px-4 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors ${
                  isApplying
                    ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                    : "bg-[#3949AB] text-white hover:bg-[#2f3b8f]"
                }`}
              >
                <Check className="w-5 h-5" />
                {isApplying
                  ? t.templateEditor.imageEditor.applying
                  : t.templateEditor.imageEditor.apply}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
