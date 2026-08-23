import { X } from "lucide-react";

const ToggleChip = ({
  label,
  icon: Icon,
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
        {Icon && <Icon className="h-3.5 w-3.5" />}
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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
        selected
          ? selectedColor
          : "bg-surface text-slate-600 border-brand-border hover:bg-[#EBEBEB]"
      } ${className}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
};

export default ToggleChip;
