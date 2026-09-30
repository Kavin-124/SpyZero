import React from 'react';
import { 
  Home, 
  Camera, 
  Wifi, 
  Bluetooth, 
  Radio
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  threatCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  threatCount
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'optical', label: 'Lens Cam', icon: Camera, badge: null },
    { id: 'network', label: 'Wi-Fi', icon: Wifi, badge: threatCount > 0 ? threatCount : null },
    { id: 'ble', label: 'AirTag', icon: Bluetooth, badge: null },
    { id: 'acoustic', label: 'Audio Bug', icon: Radio, badge: null },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId !== activeTab) {
      triggerHaptic('light');
      soundFx.playRadarPing();
      setActiveTab(tabId);
    }
  };

  return (
    <nav className="shrink-0 w-full z-40 bg-[#0e0f12]/95 backdrop-blur-lg border-t border-zinc-800/80 pb-safe">
      <div className="w-full px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center relative rounded-xl transition duration-150 active:scale-95 ${
                isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'text-blue-400 scale-105' : 'text-zinc-400'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-semibold text-white' : 'font-normal'}`}>
                {tab.label}
              </span>

              {/* Active Tab Dot */}
              {isActive && (
                <span className="absolute -bottom-0.5 w-1 h-1 bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Swipe Home Indicator */}
      <div className="w-full flex justify-center pb-1 pt-0.5">
        <div className="w-28 h-1 bg-zinc-700/50 rounded-full" />
      </div>
    </nav>
  );
};
