const StatCard = ({ icon: Icon, value, label, lightColor, textColor, color }) => {
  // Support two styles: icon-based (Dashboard) and color-bar (Bookings/Rooms)
  if (color && !Icon) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          </div>
          <div className={`w-3 h-8 ${color} rounded-full`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${lightColor || "bg-slate-50"}`}>
          {Icon && <Icon className={`h-5 w-5 ${textColor || "text-slate-600"}`} />}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
