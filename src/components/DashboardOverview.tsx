import React, { useContext } from 'react';
import { 
  Camera, 
  Wifi, 
  Magnet, 
  Sparkles, 
  Play, 
  ChevronRight, 
  ShieldCheck,
  Building2,
  Radio,
  Lock,
  Moon,
  AlertTriangle,
  Bluetooth
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { ViewModeContext } from './DeviceFrame';

interface DashboardOverviewProps {
  setActiveTab: (tab: string) => void;
  onOpenAuditWizard: () => void;
  onOpenRoomSweep: () => void;
  threatCount: number;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  setActiveTab,
  onOpenAuditWizard,
  onOpenRoomSweep,
  threatCount
}) => {
  const { viewMode } = useContext(ViewModeContext);
  const isWide = viewMode === 'wide';

  const tools = [
    {
      id: 'optical',
      title: 'Optical Lens Scanner',
      desc: 'Use flashlight reflections to spot hidden pinhole camera lenses.',
      icon: Camera,
      tag: 'Camera',
      accent: 'text-zinc-100 bg-zinc-800'
    },
    {
      id: 'network',
      title: 'Wi-Fi & Stream Radar',
      desc: 'Discover wireless cameras and intercept unauthorized video feeds.',
      icon: Wifi,
      tag: 'Wi-Fi',
      accent: 'text-zinc-100 bg-zinc-800'
    },
    {
      id: 'ble',
      title: 'AirTag & BLE Hunter',
      desc: 'Find hidden Apple AirTags, SmartTags, and covert Bluetooth transmitters.',
      icon: Bluetooth,
      tag: 'Bluetooth',
      accent: 'text-zinc-100 bg-zinc-800'
    },
    {
      id: 'acoustic',
      title: 'Acoustic Bug Sweeper',
      desc: 'Detect 15kHz+ ultrasonic whine leaked by hidden power adapters & mics.',
      icon: Radio,
      tag: 'Audio',
      accent: 'text-zinc-100 bg-zinc-800'
    },
    {
      id: 'emf',
      title: 'Magnetic Field Meter',
      desc: 'Locate unshielded circuits inside clocks, smoke alarms, and sockets.',
      icon: Magnet,
      tag: 'Magnetic',
      accent: 'text-zinc-100 bg-zinc-800'
    },
    {
      id: 'genai',
      title: 'Photo Lens Inspection',
      desc: 'Photograph suspect screws and fixtures to check for concealed apertures.',
      icon: Sparkles,
      tag: 'Vision',
      accent: 'text-zinc-100 bg-zinc-800'
    }
  ];

  const handleStartAudit = () => {
    triggerHaptic('medium');
    soundFx.playRadarPing();
    onOpenAuditWizard();
  };

  return (
    <div className="space-y-4 w-full max-w-5xl mx-auto py-1 text-zinc-100">
      
      {/* Room Status Overview Card */}
      <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl transition-all ${
        isWide ? "p-6 flex items-center justify-between gap-6" : "p-4 space-y-4"
      }`}>
        <div className="flex items-start space-x-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
            threatCount > 0 
              ? 'bg-red-950/40 border-red-800/80 text-red-400' 
              : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-400'
          }`}>
            {threatCount > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold text-white tracking-tight">
                {threatCount > 0 ? `${threatCount} Suspicious Signal Found` : 'Room Status: All Clear'}
              </h1>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                threatCount > 0
                  ? 'bg-red-950 text-red-300 border border-red-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {threatCount > 0 ? 'Action Recommended' : 'Protected'}
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-lg">
              {threatCount > 0 
                ? 'A suspicious transmitter was identified nearby. Check the Wi-Fi Radar or Lens Scanner to locate the device.'
                : 'Zero hidden camera feeds, suspicious beacons, or magnetic anomalies have been detected in this space.'}
            </p>

            {/* Live Sensor Readiness Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-400 font-mono">
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Camera: Ready</span>
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Wi-Fi: Active</span>
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Magnetic: Ready</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className={`shrink-0 flex flex-col sm:flex-row gap-2 ${isWide ? "" : "pt-1"}`}>
          <button
            onClick={() => {
              triggerHaptic('medium');
              soundFx.playRadarPing();
              onOpenRoomSweep();
            }}
            className={`py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/40 transition active:scale-95 cursor-pointer ${
              isWide ? "w-auto" : "w-full"
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Full Room Sweep</span>
          </button>

          <button
            onClick={handleStartAudit}
            className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-300 text-xs font-medium flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer"
            title="Open Step-by-Step Room Inspection Wizard"
          >
            <span>Manual Checklist</span>
          </button>
        </div>
      </div>



      {/* Offline Protection Guide */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-zinc-400" />
            <h2 className="text-xs font-semibold text-zinc-200">
              No Hotel Wi-Fi Password?
            </h2>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">
            100% Offline Capable
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          You do not need to connect to the hotel Wi-Fi. Optical and magnetic tools run directly on your phone's built-in hardware sensors:
        </p>

        <div className={isWide ? "grid grid-cols-3 gap-3 pt-1" : "flex flex-col gap-2 pt-1"}>
          <button
            onClick={() => {
              triggerHaptic('light');
              soundFx.playRadarPing();
              setActiveTab('network');
            }}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition active:scale-95"
          >
            <div className="flex items-center space-x-2 text-zinc-200 font-medium text-xs">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span>Broadcast Sniffer</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              Finds cameras broadcasting their own Wi-Fi beacon without connecting to any network.
            </p>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              soundFx.playRadarPing();
              setActiveTab('optical');
            }}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition active:scale-95"
          >
            <div className="flex items-center space-x-2 text-zinc-200 font-medium text-xs">
              <Moon className="w-3.5 h-3.5 text-purple-400" />
              <span>Infrared Night Scan</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              Phone camera converts invisible 850nm night-vision LEDs into visible purple lights.
            </p>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              soundFx.playRadarPing();
              setActiveTab('emf');
            }}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition active:scale-95"
          >
            <div className="flex items-center space-x-2 text-zinc-200 font-medium text-xs">
              <Magnet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Magnetic Circuit Check</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              Magnetometer senses unshielded power supplies inside clocks, mirrors, and outlets.
            </p>
          </button>
        </div>
      </div>

      {/* Detection Tools Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Detection Tools
          </h2>
          <span className="text-[11px] text-zinc-500">6 Hardware Vectors</span>
        </div>

        <div className={isWide ? "grid grid-cols-3 gap-3" : "grid grid-cols-2 gap-2"}>
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  triggerHaptic('light');
                  soundFx.playRadarPing();
                  setActiveTab(tool.id);
                }}
                className={`bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between text-left transition active:scale-95 hover:bg-zinc-850 ${
                  isWide ? "rounded-2xl p-4 min-h-[140px]" : "rounded-xl p-3 min-h-[120px]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                      {tool.tag}
                    </span>
                  </div>

                  <h3 className={`font-semibold text-zinc-100 leading-snug ${isWide ? "text-xs" : "text-xs"}`}>
                    {tool.title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-medium text-zinc-400">
                  <span>Open Scanner</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hotel Directory Quick Card */}
      <button
        onClick={() => {
          triggerHaptic('light');
          soundFx.playRadarPing();
          setActiveTab('heatmap');
        }}
        className="w-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3.5 flex items-center justify-between text-left transition active:scale-95"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-300 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-200">
              Verified Hotel Safety Directory
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Check community privacy audit logs and safety ratings for hotels & homestays.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
      </button>

    </div>
  );
};
