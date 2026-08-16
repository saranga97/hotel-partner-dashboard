const variantStyles = {
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-tint text-primary-dark border-primary/20",
  neutral: "bg-surface text-slate-600 border-brand-border",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
};

const Badge = ({ variant = "neutral", children, dot = false, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
        variantStyles[variant] || variantStyles.neutral
      } ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            variant === "success"
              ? "bg-green-500"
              : variant === "warning"
              ? "bg-amber-500"
              : variant === "danger"
              ? "bg-red-500"
              : variant === "info"
              ? "bg-primary"
              : "bg-slate-400"
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
