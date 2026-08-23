const StatCard = ({ icon: Icon, value, label, lightColor, textColor, glow, onClick, highlight = false }) => {
  const clickable = typeof onClick === "function";
  const Wrapper = clickable ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl border p-3.5 transition-all duration-150 ${
        highlight ? "border-primary/25 ring-1 ring-primary/15" : "border-brand-border"
      } ${clickable ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${lightColor || "bg-surface"} ${glow || ""}`}>
          {Icon && <Icon className={`h-4 w-4 ${textColor || "text-muted"}`} />}
        </div>
        <h3 className="text-lg font-bold text-slate-900 tabular-nums tracking-tight">{value}</h3>
      </div>
      <p className="text-sm text-muted mt-1.5">{label}</p>
    </Wrapper>
  );
};

export default StatCard;
