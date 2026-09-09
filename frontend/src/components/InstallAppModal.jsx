import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle, X, ExternalLink, QrCode } from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install on your mobile device:\n\n1. Open this website in Chrome on your phone.\n2. Tap the ⋮ (Three Dots Menu) in Chrome.\n3. Tap "Install App" or "Add to Home Screen".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative overflow-hidden">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Smartphone size={26} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Download & Use on Mobile</h3>
            <p className="text-xs text-slate-500">University Issue Portal on your smartphone</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-600">
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-100">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-1">
              <Download size={16} className="text-blue-600" />
              Method 1: Instant Android Install (Recommended)
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              This system is built as an installable Progressive Web Application (PWA). You can install it on your Android phone without needing to enable unknown APK sources!
            </p>
            <button
              onClick={handleInstallClick}
              className="mt-3 w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Smartphone size={16} />
              {deferredPrompt ? 'Tap to Install Directly on Device' : 'Install on Mobile (Add to Home Screen)'}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-emerald-600" />
              How to access from phone on same Wi-Fi:
            </h4>
            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 mt-2">
              <li>Check your computer's local IP address (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">http://&lt;your-ip&gt;:5000</code>).</li>
              <li>Open Google Chrome on your Android smartphone and visit that URL.</li>
              <li>Tap Chrome's menu (<strong>⋮</strong>) and tap <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</li>
              <li>The University Portal icon will appear on your app drawer just like any native APK!</li>
            </ol>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900">
            <strong>Android Studio / Native APK Build:</strong>
            <p className="mt-1 text-indigo-700">
              The project root includes ready-to-run Capacitor configs (<code className="bg-indigo-100/80 px-1 py-0.5 rounded">capacitor.config.json</code>) and a GitHub Actions workflow (<code className="bg-indigo-100/80 px-1 py-0.5 rounded">.github/workflows/build-apk.yml</code>) so you can compile a signed release <code className="font-mono">.apk</code> anytime with 1 click.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
