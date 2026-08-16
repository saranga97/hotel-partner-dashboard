const variants = {
  primary: "bg-primary hover:bg-primary-dark text-white shadow-sm shadow-primary/20",
  secondary: "border border-brand-border text-slate-700 bg-white hover:bg-surface hover:border-slate-300",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20",
  success: "bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-600/20",
  icon: "p-2 text-muted hover:text-slate-700 hover:bg-surface rounded-lg",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
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
    : `inline-flex items-center justify-center gap-2 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} rounded-xl font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1`;

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
