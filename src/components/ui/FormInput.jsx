const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  labelClassName = "block text-sm font-medium text-slate-700 mb-1",
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
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        {...rest}
      />
    </div>
  );
};

export default FormInput;
