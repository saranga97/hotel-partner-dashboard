const variantStyles = {
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-tint text-primary-dark",
  neutral: "bg-surface text-slate-800",
  purple: "bg-purple-100 text-purple-800",
};

const Badge = ({ variant = "neutral", children, dot = false, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        variantStyles[variant] || variantStyles.neutral
      } ${className}`}
    >
      {dot && (
        <span
          className={`w-2 h-2 rounded-full mr-1.5 ${
            variant === "success"
              ? "bg-green-400"
              : variant === "warning"
              ? "bg-amber-400"
              : variant === "danger"
              ? "bg-red-400"
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
