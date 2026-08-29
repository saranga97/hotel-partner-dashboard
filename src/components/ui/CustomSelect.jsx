import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const CustomSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  error,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Decide whether dropdown should open upward
  const [dropUp, setDropUp] = useState(false);
  const toggleOpen = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 220);
    }
    setOpen((p) => !p);
  };

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      )}
      <button
        type="button"
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm border rounded-xl bg-white transition-all duration-200 ${
          open
            ? "border-primary ring-2 ring-primary/30"
            : error
              ? "border-red-300 hover:border-red-400"
              : "border-brand-border hover:border-slate-300"
        }`}
      >
        <span className={`truncate ${selected ? "text-slate-900 font-medium" : "text-slate-400"}`}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-50 left-0 right-0 bg-white border border-brand-border rounded-xl shadow-lg overflow-hidden animate-fadeIn ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <div className="max-h-48 overflow-y-auto py-1">
            {options.map((opt) => {
              const isActive = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-between gap-2 w-full px-3.5 py-2 text-sm transition-colors duration-150 ${
                    isActive
                      ? "bg-tint text-primary font-semibold"
                      : "text-slate-700 hover:bg-surface"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isActive && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default CustomSelect;
