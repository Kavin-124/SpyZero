import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export const MobileStatusBar: React.FC = () => {
  const [time, setTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#0c0d10] text-zinc-400 px-6 pt-2 pb-1.5 flex items-center justify-between text-xs select-none border-b border-zinc-800/40">
      {/* Clock */}
      <span className="font-medium tracking-tight text-zinc-200">{time}</span>

      {/* Dynamic Island Notch Pill */}
      <div className="flex items-center justify-center">
        <div className="w-20 h-4 bg-black rounded-full border border-zinc-800/80 flex items-center justify-end px-2 space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
        </div>
      </div>

      {/* Status Icons */}
      <div className="flex items-center space-x-1.5 text-zinc-400">
        <Signal className="w-3.5 h-3.5 text-zinc-300" />
        <span className="text-[10px] font-semibold text-zinc-300">5G</span>
        <Wifi className="w-3.5 h-3.5 text-zinc-300" />
        <BatteryMedium className="w-4 h-4 text-emerald-400" />
      </div>
    </div>
  );
};
