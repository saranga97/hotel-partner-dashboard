const LoadingSpinner = ({ size = "md", className = "", message }) => {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin ${sizes[size] || sizes.md} border-primary border-t-transparent rounded-full`}
      />
      {message && <p className="text-muted mt-4">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
