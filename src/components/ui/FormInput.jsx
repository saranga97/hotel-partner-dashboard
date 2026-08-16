const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  labelClassName = "block text-sm font-medium text-slate-700 mb-1.5",
  ...rest
}) => {
  return (
    <div className={className}>
      {label && <label className={labelClassName}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-brand-border rounded-xl transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        {...rest}
      />
    </div>
  );
};

export default FormInput;
