const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-[#fff7f9] flex items-center justify-center z-[9999]">
      <div className="text-center">
        {/* Animated logo */}
        <div className="relative mb-8">
          {/* Pulsing glow behind logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 bg-gradient-to-br from-[#e84393]/20 to-[#a855f7]/20 rounded-full blur-2xl animate-pulse" />
          </div>

          {/* Logo with ring spinner */}
          <div className="relative w-24 h-24 mx-auto">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#e84393] border-r-[#a855f7] animate-spin"
              style={{ animationDuration: '1.2s' }} />

            {/* Inner counter-spinning ring */}
            <div className="absolute inset-2 rounded-full border-[2px] border-transparent border-b-[#f472b6] border-l-[#c084fc] animate-spin"
              style={{ animationDuration: '1.8s', animationDirection: 'reverse' }} />

            {/* Logo center */}
            <div className="absolute inset-4 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
              <img
                src="/anjola-favicon-v2.png"
                alt="Anjola Aesthetics"
                className="w-10 h-10 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Brand name with shimmer */}
        <h2 className="text-2xl font-serif text-gray-900 mb-1 tracking-tight">
          Anjola <span className="text-gradient">Aesthetics</span>
        </h2>
        <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mb-10">Luxury Self-Care</p>

        {/* Animated loading bar */}
        <div className="w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#e84393] via-[#a855f7] to-[#e84393] rounded-full"
            style={{
              width: '40%',
              animation: 'loadingBar 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
