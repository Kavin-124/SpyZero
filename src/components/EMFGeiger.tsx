import React, { useState, useEffect, useContext } from 'react';
import { 
  Magnet, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { ViewModeContext } from './DeviceFrame';

export const EMFGeiger: React.FC = () => {
  const { viewMode } = useContext(ViewModeContext);
  const isWide = viewMode === 'wide';

  const [reading, setReading] = useState<number>(0.0);
  const [baseline, setBaseline] = useState<number>(0.0);
  const [audioClicks, setAudioClicks] = useState<boolean>(false);
  const [hasSensor, setHasSensor] = useState<boolean>(false);

  // Mobile Hardware Magnetometer Listener
  useEffect(() => {
    let sensor: any = null;
    try {
      if ('Magnetometer' in window) {
        sensor = new (window as any).Magnetometer({ frequency: 10 });
        sensor.addEventListener('reading', () => {
          setHasSensor(true);
          const mag = Math.sqrt(sensor.x ** 2 + sensor.y ** 2 + sensor.z ** 2);
          const val = Math.round(mag * 10) / 10;
          setReading(val);
          if (val > 80) {
            triggerHaptic('click');
          }
        });
        sensor.start();
      }
    } catch {
      // Desktop / unsupported device fallback
    }

    return () => {
      if (sensor) sensor.stop();
      soundFx.stopGeigerStream();
    };
  }, []);

  useEffect(() => {
    if (audioClicks && reading > 0) {
      soundFx.startGeigerStream(reading);
    } else {
      soundFx.stopGeigerStream();
    }
    return () => {
      soundFx.stopGeigerStream();
    };
  }, [reading, audioClicks]);

  const delta = Math.max(0, reading - baseline);
  const isHighEMF = reading > 0 && delta > 45;

  const calibrateBaseline = () => {
    triggerHaptic('medium');
    soundFx.playRadarPing();
    setBaseline(reading);
  };

  const handleReset = () => {
    triggerHaptic('light');
    setReading(0.0);
    setBaseline(0.0);
    soundFx.stopGeigerStream();
  };

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 mx-auto text-zinc-100 ${
      isWide ? "p-6 max-w-4xl" : "p-4 max-w-md"
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Magnet className="w-4 h-4 text-emerald-400" />
            <span>Magnetic Field Meter</span>
          </h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Hold your device near suspect objects to detect unshielded electronics.
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              triggerHaptic('light');
              setAudioClicks(!audioClicks);
            }}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center transition ${
              audioClicks 
                ? 'bg-blue-600/20 border-blue-500 text-blue-300' 
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle Audio Clicks"
          >
            {audioClicks ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white text-xs font-medium flex items-center transition"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Digital Readout Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-center space-y-2 relative">
        <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
          Magnetic Flux Density
        </span>
        
        <div className={`text-4xl sm:text-5xl font-bold font-mono tracking-tight ${
          isHighEMF ? 'text-red-400' : reading > 0 ? 'text-emerald-400' : 'text-zinc-500'
        }`}>
          {reading.toFixed(1)} <span className="text-sm font-normal text-zinc-400">µT</span>
        </div>

        {/* Live Status Pill */}
        <div className="pt-1">
          {reading === 0 ? (
            <span className="inline-flex items-center space-x-1.5 bg-zinc-900 text-zinc-400 border border-zinc-800 px-3 py-1 rounded-full text-xs font-medium">
              <span>{hasSensor ? 'Sensor Active • Approach Target Object' : 'Hardware Magnetometer Standby'}</span>
            </span>
          ) : isHighEMF ? (
            <span className="inline-flex items-center space-x-1.5 bg-red-950/60 text-red-300 border border-red-800 px-3 py-1 rounded-full text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Elevated Magnetic Field Detected!</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 bg-emerald-950/50 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Normal Ambient Field</span>
            </span>
          )}
        </div>

        {/* Meter Gauge Bar */}
        <div className="pt-3 max-w-sm mx-auto space-y-1">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                isHighEMF ? 'bg-red-500' : reading > 50 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, (reading / 200) * 100))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>0 µT (Earth Ambient)</span>
            <span>100 µT</span>
            <span>200+ µT (Circuits)</span>
          </div>
        </div>
      </div>

      {/* Calibration Action */}
      <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs">
        <div>
          <span className="font-medium text-white block">Room Calibration</span>
          <span className="text-[11px] text-zinc-400">
            Baseline: {baseline > 0 ? `${baseline.toFixed(1)} µT` : 'Not calibrated'}
          </span>
        </div>
        <button
          onClick={calibrateBaseline}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium text-xs border border-zinc-700 transition active:scale-95"
        >
          Set Ambient Baseline
        </button>
      </div>

      {/* Practical Instructions */}
      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 space-y-1.5">
        <div className="text-zinc-300 font-medium flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>How to Inspect Hotel Fixtures</span>
        </div>
        <p className="leading-relaxed">
          1. Hold your phone in the center of the room and tap <strong>"Set Ambient Baseline"</strong>.
        </p>
        <p className="leading-relaxed">
          2. Move the top edge of your phone within 2–5 cm of smoke alarms, bedside clocks, tissue boxes, or decorative frames.
        </p>
        <p className="leading-relaxed">
          3. Normal wood and plastic will not alter the reading. An unshielded camera circuit or hidden micro-recorder will cause a sharp spike of +40 to +150 µT.
        </p>
      </div>

    </div>
  );
};
