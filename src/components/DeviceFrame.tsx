import React, { useState, useEffect, createContext } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Monitor, QrCode, X, Copy, Check, ScanLine } from 'lucide-react';
import { MobileStatusBar } from './MobileStatusBar';
import { triggerHaptic } from '../utils/haptics';

interface ViewModeContextType {
  viewMode: 'mobile' | 'wide';
  setViewMode: (mode: 'mobile' | 'wide') => void;
}

export const ViewModeContext = createContext<ViewModeContextType>({
  viewMode: 'mobile',
  setViewMode: () => {}
});

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'mobile' | 'wide'>('mobile');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [networkIp, setNetworkIp] = useState<string>('http://192.168.0.102:5173');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // 1. Fetch real host IP from Python backend if available
    fetch('http://localhost:8000/api/host-ip')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ip && data.ip !== '127.0.0.1') {
          const port = window.location.port || '5173';
          setNetworkIp(`http://${data.ip}:${port}`);
        }
      })
      .catch(() => {
        // Fallback to window.location hostname if accessed directly
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const port = window.location.port;
          if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            setNetworkIp(`${window.location.protocol}//${hostname}${port ? ':' + port : ''}`);
          }
        }
      });
  }, []);

  // Generate QR code whenever networkIp changes
  useEffect(() => {
    if (!networkIp) return;
    QRCode.toDataURL(networkIp, {
      width: 256,
      margin: 2,
      color: {
        dark: '#09090b',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR Code:', err));
  }, [networkIp]);

  const copyIp = () => {
    navigator.clipboard.writeText(networkIp);
    setCopied(true);
    triggerHaptic('light');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-start antialiased selection:bg-blue-600 selection:text-white">
        
        {/* Top Developer & Mode Preview Bar */}
        <div className="hidden sm:flex items-center justify-between w-full max-w-6xl px-4 py-2.5 my-1 z-30">
          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-100 font-semibold tracking-tight">SpyZero</span>
            <span className="text-zinc-600">•</span>
            <span>Hardware Privacy Scanner</span>
          </div>

          {/* View Switcher Controls */}
          <div className="flex items-center space-x-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 flex space-x-1 text-xs">
              <button
                onClick={() => {
                  setViewMode('mobile');
                  triggerHaptic('light');
                }}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition ${
                  viewMode === 'mobile'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile App</span>
              </button>

              <button
                onClick={() => {
                  setViewMode('wide');
                  triggerHaptic('light');
                }}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition ${
                  viewMode === 'wide'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop Dashboard</span>
              </button>
            </div>

            {/* Test on real phone button */}
            <button
              onClick={() => setShowQrModal(true)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition"
              title="Open on real phone"
            >
              <QrCode className="w-3.5 h-3.5 text-zinc-400" />
              <span>Connect Phone</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full flex-1 flex justify-center items-start sm:px-4">
          {viewMode === 'mobile' ? (
            /* Realistic Smartphone Chassis Frame */
            <div className="w-full sm:max-w-[410px] sm:my-3 sm:rounded-[50px] sm:border-[8px] sm:border-[#1e2024] sm:shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)] bg-[#0c0d10] overflow-hidden flex flex-col relative transition-all h-[100dvh] sm:h-[844px] max-h-[94vh]">
              {/* Native Mobile Status Bar */}
              <div className="shrink-0">
                <MobileStatusBar />
              </div>

              {/* Mobile App Viewport */}
              <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-[#0c0d10]">
                {children}
              </div>
            </div>
          ) : (
            /* True Widescreen Laptop / PC Mode */
            <div className="w-full max-w-6xl min-h-screen flex flex-col pb-12">
              {children}
            </div>
          )}
        </div>

        {/* Real Phone QR / Link Dialog */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Scan to Connect Phone</h3>
                  <p className="text-xs text-zinc-400">Scan with your mobile camera</p>
                </div>
              </div>

              {/* QR Code Card */}
              <div className="flex flex-col items-center justify-center pt-1">
                <div className="bg-white p-3 rounded-2xl shadow-lg border border-zinc-200">
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="Scan QR code to open SpyZero on phone" 
                      className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-44 h-44 sm:w-48 sm:h-48 flex flex-col items-center justify-center text-zinc-500 text-xs gap-2">
                      <ScanLine className="w-6 h-6 animate-pulse text-zinc-600" />
                      <span>Generating QR Code...</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1.5 mt-3 text-[11px] text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Point iPhone / Android camera at the QR code</span>
                </div>
              </div>

              {/* Direct Link & Wi-Fi requirement */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Local Wi-Fi Link</span>
                  <span className="text-[10px] text-zinc-500">Same Wi-Fi required</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                  <code className="text-blue-400 font-mono text-xs break-all font-semibold">
                    {networkIp}
                  </code>
                  <button
                    onClick={copyIp}
                    className="ml-2 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center space-x-1 shrink-0 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-[10px] text-zinc-500 leading-tight">
                  Tip: Phone browser-la open pannathum <strong>"Add to Home Screen"</strong> kudutha fullscreen app-aa work aagum.
                </p>
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </ViewModeContext.Provider>
  );
};
