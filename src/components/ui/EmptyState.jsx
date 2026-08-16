const EmptyState = ({ icon: Icon, message, description, action, className = "" }) => {
  return (
    <div className={`text-center py-10 ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
          <Icon className="h-6 w-6 text-slate-400" />
        </div>
      )}
      {message && (
        <h3 className="text-base font-semibold text-slate-900 mb-1">{message}</h3>
      )}
      {description && <p className="text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
