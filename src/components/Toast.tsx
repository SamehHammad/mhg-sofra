import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";

// Toast variants supported by this component.
export type ToastType = "success" | "error" | "loading";

// Payload used to render a toast message.
//
// Notes:
// - If `title` is omitted, the toast will render only the message.
// - If `autoCloseMs` is provided by the caller, they should hide the toast after that duration.
export type ToastPayload = {
  type: ToastType;
  title?: string;
  message: string;
};

// Big, professional-looking toast banner.
//
// Usage:
// - Keep the toast state in the page/component.
// - Render <Toast toast={toast} onClose={() => setToast(null)} direction={direction} />
// - For RTL pages, pass direction="rtl" to flip position and text direction.
export function Toast({
  toast,
  onClose,
  direction,
}: {
  toast: ToastPayload | null;
  onClose: () => void;
  direction: "ltr" | "rtl";
}) {
  if (!toast) return null;

  const isRTL = direction === "rtl";

  // Position + base layout (bigger/wider by request).
  const base =
    "fixed z-[9999] top-6 max-w-[560px] w-[calc(100%-2rem)] sm:w-auto rounded-3xl border shadow-xl backdrop-blur-md";
  const position = isRTL ? "right-6" : "left-6";

  // Colors per state.
  const colors =
    toast.type === "success"
      ? "bg-green-50/95 border-green-200"
      : toast.type === "error"
        ? "bg-red-50/95 border-red-200"
        : "bg-white/95 border-neutral-200";

  // Icon per state.
  const Icon =
    toast.type === "success"
      ? CheckCircle2
      : toast.type === "error"
        ? AlertTriangle
        : Loader2;

  const iconClass =
    toast.type === "success"
      ? "text-green-600"
      : toast.type === "error"
        ? "text-red-600"
        : "text-[#3949AB] animate-spin";

  return (
    <div className={`${base} ${position} ${colors}`} dir={direction}>
      <div className="flex items-start gap-4 px-6 py-5">
        <div className="mt-0.5">
          <Icon className={`w-7 h-7 ${iconClass}`} />
        </div>

        <div className="flex-1">
          {toast.title && (
            <div className="text-base font-black text-neutral-900">
              {toast.title}
            </div>
          )}
          <div className="text-base font-bold text-neutral-700">
            {toast.message}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
