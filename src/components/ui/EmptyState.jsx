const EmptyState = ({ icon: Icon, message, description, action, className = "" }) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      {Icon && <Icon className="h-16 w-16 text-slate-300 mx-auto mb-4" />}
      {message && (
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{message}</h3>
      )}
      {description && <p className="text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
