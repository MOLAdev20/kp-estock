const Spinner = ({ size = "md" }: { size: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 rounded-full border-4 border-red-500"></div>
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
      </div>
    </div>
  );
};

export default Spinner;
