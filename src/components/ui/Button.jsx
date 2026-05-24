const variants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "border border-slate-300 text-slate-700 hover:bg-slate-50",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
  icon: "p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-sm",
};

const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  children,
  className = "",
  type = "button",
  ...rest
}) => {
  const isIcon = variant === "icon";

  const base = isIcon
    ? variants.icon
    : `inline-flex items-center justify-center gap-2 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${className}`}
      {...rest}
    >
      {loading && (
        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
