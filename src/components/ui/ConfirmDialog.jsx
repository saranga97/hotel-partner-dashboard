import { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import Button from "./Button";

// Generic themed confirm/cancel dialog — use this instead of window.confirm()
// wherever an action needs a yes/no gate. variant="danger" swaps the confirm
// button to red and adds a warning icon for destructive actions.
// Ported from tripora-frontend's components/ui/ConfirmDialog.jsx, adapted to
// this dashboard's own Button component and Tailwind theme tokens.
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-brand-border bg-white p-6 shadow-xl">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-slate-600 transition-colors"
        >
          <X className="h-[18px] w-[18px]" />
        </button>

        <div className="flex items-center gap-3 pr-6">
          {variant === "danger" && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tint">
              <AlertTriangle className="h-4 w-4 text-primary" />
            </div>
          )}
          <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}

        <div className="mt-5 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
