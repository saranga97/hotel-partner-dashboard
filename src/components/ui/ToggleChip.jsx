import { X } from "lucide-react";

const ToggleChip = ({
  label,
  selected = false,
  onToggle,
  removable = false,
  onRemove,
  selectedColor = "bg-tint text-primary-dark border-primary",
  className = "",
}) => {
  if (removable) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300 ${className}`}
      >
        {label}
        <button
          type="button"
          onClick={onRemove || onToggle}
          className="hover:text-red-600"
        >
          <X className="h-3 w-3" />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
        selected
          ? selectedColor
          : "bg-surface text-slate-600 border-brand-border hover:bg-[#EBEBEB]"
      } ${className}`}
    >
      {label}
    </button>
  );
};

export default ToggleChip;
