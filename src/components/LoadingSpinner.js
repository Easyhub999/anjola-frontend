const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fff7f9]">
      <div className="text-center">
        {/* Skeleton UI preview */}
        <div className="max-w-md mx-auto px-6 space-y-6">
          {/* Logo skeleton */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl skeleton"></div>
            <div className="space-y-2">
              <div className="w-20 h-4 skeleton"></div>
              <div className="w-16 h-3 skeleton"></div>
            </div>
          </div>

          {/* Elegant spinner */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-3 border-t-[#e84393] rounded-full animate-spin"></div>
          </div>

          <p className="text-gray-400 font-medium text-sm tracking-wide">Loading your experience...</p>

          {/* Product card skeletons */}
          <div className="grid grid-cols-3 gap-3 mt-8 opacity-40">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-square rounded-xl skeleton"></div>
                <div className="h-3 w-full skeleton"></div>
                <div className="h-3 w-2/3 skeleton"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
