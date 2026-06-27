const FormSelect = ({
  label,
  value,
  onChange,
  options = [],
  className = "",
  labelClassName = "block text-sm font-medium text-slate-700 mb-1",
  children,
  ...rest
}) => {
  return (
    <div className={className}>
      {label && <label className={labelClassName}>{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
