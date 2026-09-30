import React from 'react';
import { 
  ShieldCheck, 
  Camera, 
  Wifi, 
  Magnet, 
  Sparkles, 
  Building2, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  Play,
  Bluetooth,
  Radio
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  threatCount: number;
  onOpenAuditWizard: () => void;
  onOpenEmergencyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  threatCount,
  onOpenAuditWizard,
  onOpenEmergencyModal
}) => {
  const [muted, setMuted] = React.useState(false);

  const toggleSound = () => {
    soundFx.isMuted = !muted;
    setMuted(!muted);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: ShieldCheck },
    { id: 'optical', label: 'Camera Scan', icon: Camera },
    { id: 'network', label: 'Wi-Fi Radar', icon: Wifi },
    { id: 'ble', label: 'AirTag / BLE', icon: Bluetooth },
    { id: 'acoustic', label: 'Audio Bug Sweeper', icon: Radio },
    { id: 'emf', label: 'Magnetic EMF', icon: Magnet },
    { id: 'genai', label: 'Photo Check', icon: Sparkles },
    { id: 'heatmap', label: 'Hotel Ratings', icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-15">
          
          {/* Logo */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer" 
            onClick={() => setActiveTab('overview')}
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-cyan-500/30 flex items-center justify-center text-white shadow-sm overflow-hidden">
              <img src="/favicon.png" alt="SpyZero" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-semibold tracking-tight text-white">SpyZero</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  Detector
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Status Pill */}
            <div className={`hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              threatCount > 0 
                ? 'bg-red-950/40 text-red-300 border-red-800/60' 
                : 'bg-zinc-900 text-zinc-300 border-zinc-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${threatCount > 0 ? 'bg-red-400' : 'bg-emerald-400'}`} />
              <span>{threatCount > 0 ? `${threatCount} Threat Found` : 'All Clear'}</span>
            </div>

            {/* Quick Audit Button */}
            <button
              onClick={onOpenAuditWizard}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow-sm transition active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Quick Sweep</span>
            </button>

            {/* Emergency Button */}
            <button
              onClick={onOpenEmergencyModal}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center space-x-1.5 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Help</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
              title={muted ? "Unmute Sound" : "Mute Sound"}
            >
              {muted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-zinc-300" />}
            </button>
          </div>
        </div>

        {/* Clean Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-1.5 border-t border-zinc-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  active
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-blue-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
