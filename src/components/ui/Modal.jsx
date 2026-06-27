import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-hidden mx-4`}
      >
        {title && (
          <div className="sticky top-0 bg-white border-b border-brand-border px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-muted" />
            </button>
          </div>
        )}
        <div className={title ? "overflow-y-auto max-h-[calc(90vh-65px)]" : "overflow-y-auto max-h-[90vh]"}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
