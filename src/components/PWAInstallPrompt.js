import { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if already dismissed recently
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) return; // 7 days
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 30 seconds of browsing
      setTimeout(() => setShowBanner(true), 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[799] animate-fadeInUp">
      <div className="bg-white rounded-2xl shadow-luxury-lg border border-gray-100 p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-[#e84393] to-[#a855f7] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm mb-0.5">Get the Anjola App</h4>
          <p className="text-gray-500 text-xs leading-relaxed mb-3">
            Add to your home screen for quick access and an app-like experience
          </p>
          <div className="flex items-center gap-2">
            <button onClick={handleInstall}
              className="bg-gradient-to-r from-[#e84393] to-[#a855f7] text-white px-4 py-2 rounded-lg text-xs font-semibold
                hover:from-[#d63384] hover:to-[#9333ea] transition-all shadow-sm flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Install
            </button>
            <button onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 text-xs font-medium px-2 py-2 transition-colors">
              Not now
            </button>
          </div>
        </div>

        {/* Close */}
        <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 transition-colors p-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
