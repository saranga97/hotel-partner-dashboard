const StatCard = ({ icon: Icon, value, label, lightColor, textColor, color }) => {
  if (color && !Icon) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-brand-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          </div>
          <div className={`w-3 h-8 ${color} rounded-full`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-border p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${lightColor || "bg-surface"}`}>
          {Icon && <Icon className={`h-5 w-5 ${textColor || "text-muted"}`} />}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
