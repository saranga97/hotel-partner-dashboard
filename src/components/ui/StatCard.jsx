const StatCard = ({ icon: Icon, value, label, lightColor, textColor, color, onClick, highlight = false }) => {
  const clickable = typeof onClick === "function";

  if (color && !Icon) {
    const Wrapper = clickable ? "button" : "div";
    return (
      <Wrapper
        onClick={onClick}
        className={`w-full text-left bg-white rounded-xl border border-brand-border p-4 transition-shadow duration-150 ${
          clickable ? "hover:shadow-md cursor-pointer" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{value}</p>
          </div>
          <div className={`w-1.5 h-9 ${color} rounded-full`}></div>
        </div>
      </Wrapper>
    );
  }

  const Wrapper = clickable ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl border p-6 transition-all duration-150 ${
        highlight ? "border-primary/25 ring-1 ring-primary/15" : "border-brand-border"
      } ${clickable ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between mb-5">
        <div className={`p-2.5 rounded-xl ${lightColor || "bg-surface"}`}>
          {Icon && <Icon className={`h-5 w-5 ${textColor || "text-muted"}`} />}
        </div>
      </div>
      <div className="space-y-0.5">
        <h3 className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">{value}</h3>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </Wrapper>
  );
};

export default StatCard;
