const FormSelect = ({
  label,
  value,
  onChange,
  options = [],
  className = "",
  labelClassName = "block text-sm font-medium text-slate-700 mb-1.5",
  children,
  ...rest
}) => {
  return (
    <div className={className}>
      {label && <label className={labelClassName}>{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-brand-border rounded-xl transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        {...rest}
      >
        {children ||
          options.map((opt) => {
            const optValue = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            );
          })}
      </select>
    </div>
  );
};

export default FormSelect;
