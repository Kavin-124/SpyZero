import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  Flashlight
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface MobileHeaderProps {
  threatCount: number;
  onOpenEmergencyModal: () => void;
  onToggleTorch?: () => void;
  torchActive?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  threatCount,
  onOpenEmergencyModal,
  onToggleTorch,
  torchActive = false
}) => {
  const [muted, setMuted] = useState(false);

  const toggleSound = () => {
    soundFx.isMuted = !muted;
    setMuted(!muted);
    triggerHaptic('light');
  };

  const handleEmergency = () => {
    triggerHaptic('warning');
    onOpenEmergencyModal();
  };

  return (
    <header 
      className="sticky top-0 z-30 bg-[#0e0f12]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2.5 flex items-center justify-between"
      style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
    >
      {/* Left: App Identity & Room Status */}
      <div className="flex items-center space-x-2.5">
        <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-cyan-500/30 flex items-center justify-center text-white shadow-sm shrink-0 overflow-hidden">
          <img src="/favicon.png" alt="SpyZero" className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-white tracking-tight text-xs">SpyZero</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded-md ${
              threatCount > 0 
                ? 'bg-red-950/60 text-red-300 border border-red-800/80' 
                : 'bg-zinc-800/90 text-zinc-300 border border-zinc-700/50'
            }`}>
              {threatCount > 0 ? `${threatCount} Threat` : 'Ready'}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 block -mt-0.5">Offline Device Detector</span>
        </div>
      </div>

      {/* Right: Quick Mobile Actions */}
      <div className="flex items-center space-x-1.5">
        {/* Flashlight toggle */}
        {onToggleTorch && (
          <button
            onClick={() => {
              triggerHaptic('medium');
              onToggleTorch();
            }}
            className={`p-1.5 rounded-lg border transition ${
              torchActive 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                : 'bg-zinc-850 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Toggle Flashlight / Torch"
          >
            <Flashlight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Audio Mute */}
        <button
          onClick={toggleSound}
          className="p-1.5 rounded-lg bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          title={muted ? "Unmute Sound" : "Mute Sound"}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5 text-zinc-500" /> : <Volume2 className="w-3.5 h-3.5 text-zinc-300" />}
        </button>

        {/* Emergency SOS Button */}
        <button
          onClick={handleEmergency}
          className="px-2 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-medium flex items-center space-x-1 shadow-sm transition active:scale-95"
        >
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Help</span>
        </button>
      </div>
    </header>
  );
};
