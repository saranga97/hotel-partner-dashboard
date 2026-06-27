import { AlertCircle, Check, Info } from "lucide-react";

const variantStyles = {
  error: "bg-red-50 border-red-200 text-red-700",
  success: "bg-green-50 border-green-200 text-green-700",
  warning: "bg-amber-50 border-amber-200 text-amber-700",
  info: "bg-tint border-brand-border text-primary-dark",
};

const defaultIcons = {
  error: AlertCircle,
  success: Check,
  warning: AlertCircle,
  info: Info,
};

const Alert = ({ variant = "error", icon: IconProp, children, className = "" }) => {
  const Icon = IconProp || defaultIcons[variant];

  return (
    <div
      className={`flex items-center gap-2 p-3 border rounded-lg text-sm ${
        variantStyles[variant] || variantStyles.error
      } ${className}`}
    >
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
      {children}
    </div>
  );
};

export default Alert;
