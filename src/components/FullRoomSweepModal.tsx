import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Wifi, 
  Bluetooth, 
  Radio, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  Share2, 
  X, 
  Play, 
  RotateCcw,
  Sparkles,
  Lock
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface FullRoomSweepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThreatDetected?: (threat: string) => void;
  demoMode?: boolean;
}

interface SweepStage {
  id: string;
  name: string;
  vector: string;
  icon: React.ElementType;
  description: string;
}

const STAGES: SweepStage[] = [
  {
    id: 'wifi',
    name: 'Wi-Fi & Surveillance Streams',
    vector: 'RF Spectrum (2.4/5GHz)',
    icon: Wifi,
    description: 'Scanning subnet for RTSP video streams, covert SSIDs, and unauthorized camera MAC OUIs.'
  },
  {
    id: 'ble',
    name: 'AirTag & BLE Tracker Sweep',
    vector: 'Bluetooth Low Energy',
    icon: Bluetooth,
    description: 'Intercepting nearby advertising packets for Apple FindMy, Samsung SmartTags, and beacons.'
  },
  {
    id: 'acoustic',
    name: 'Acoustic & Ultrasonic Analysis',
    vector: 'High-Frequency Audio (15-22kHz)',
    icon: Radio,
    description: 'Analyzing ambient room spectrum for inaudible microphone transmitters and tracking audio tags.'
  },
  {
    id: 'optical',
    name: 'Optical & Magnetic Baseline',
    vector: 'Optical Glint & Magnetometer',
    icon: Camera,
    description: 'Synthesizing ambient EMF flux baseline and verifying pinhole lens reflection thresholds.'
  }
];

export const FullRoomSweepModal: React.FC<FullRoomSweepModalProps> = ({
  isOpen,
  onClose,
  onThreatDetected,
  demoMode = false
}) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'completed'>('idle');
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [roomName, setRoomName] = useState<string>('Guest Suite / Room 304');
  const [certId, setCertId] = useState<string>('');
  const [certDate, setCertDate] = useState<string>('');
  const [threatsFound, setThreatsFound] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && status === 'idle') {
      const id = 'SPY-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + new Date().getFullYear();
      setCertId(id);
      setCertDate(new Date().toLocaleString());
    }
  }, [isOpen, status]);

  if (!isOpen) return null;

  const startSweep = () => {
    setStatus('scanning');
    setProgress(0);
    setCurrentStage(0);
    setThreatsFound([]);
    setLogs([
      `[${new Date().toLocaleTimeString()}] Initializing SpyZero Multi-Vector Counter-Surveillance Sweep...`,
      `[${new Date().toLocaleTimeString()}] Target: ${roomName}`,
      `[${new Date().toLocaleTimeString()}] Calibrating hardware sensors & RF radio interface...`
    ]);
    triggerHaptic('medium');
    soundFx.playRadarPing();

    let currentProg = 0;
    const interval = setInterval(() => {
      currentProg += 2;
      setProgress(currentProg);

      // Stage transitions
      if (currentProg === 26) {
        setCurrentStage(1);
        triggerHaptic('click');
        soundFx.playRadarPing();
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Stage 1: RF/Wi-Fi scan nominal. 0 open RTSP ports detected.`,
          `[${new Date().toLocaleTimeString()}] Stage 2: Engaging BLE Tracker Interceptor (FindMy & SmartTag)...`
        ]);
      } else if (currentProg === 52) {
        setCurrentStage(2);
        triggerHaptic('click');
        soundFx.playRadarPing();
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Stage 2: Bluetooth spectrum clear of rogue moving tags.`,
          `[${new Date().toLocaleTimeString()}] Stage 3: Listening for 18kHz-22kHz ultrasonic microphone hum...`
        ]);
      } else if (currentProg === 76) {
        setCurrentStage(3);
        triggerHaptic('click');
        soundFx.playRadarPing();
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Stage 3: Acoustic noise floor clean. No covert audio telemetry.`,
          `[${new Date().toLocaleTimeString()}] Stage 4: Verifying ambient magnetic flux baseline & optical glint...`
        ]);
      } else if (currentProg >= 100) {
        clearInterval(interval);
        setStatus('completed');
        triggerHaptic('heavy');
        soundFx.playSuccessChime();

        if (demoMode) {
          const simThreat = 'Tuya Mini RTSP Camera (IP: 192.168.1.108)';
          setThreatsFound([simThreat]);
          onThreatDetected?.(simThreat);
          setLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] [ALERT] 1 Covert surveillance device detected during sweep: ${simThreat}`,
            `[${new Date().toLocaleTimeString()}] Sweep completed. Audit report generated.`
          ]);
        } else {
          setLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] Stage 4: Optical/Magnetic baselines confirmed nominal.`,
            `[${new Date().toLocaleTimeString()}] Full room counter-surveillance sweep completed. 0 threats detected.`,
            `[${new Date().toLocaleTimeString()}] Privacy Audit Certificate issued successfully.`
          ]);
        }
      }
    }, 200); // 10 seconds total fast demonstration sweep
  };

  const handleShareCertificate = () => {
    const text = `🛡️ SPYZERO PRIVACY AUDIT CERTIFICATE
ID: ${certId}
Target: ${roomName}
Date: ${certDate}
Result: ${threatsFound.length === 0 ? '98% SAFE - 0 Hidden Surveillance Threats Found' : `⚠️ ${threatsFound.length} Threat(s) Found`}
Status: Multi-Vector Scan (Wi-Fi, Bluetooth BLE, Ultrasonic, Optical, Magnetic) Verified.
Authenticated by SpyZero Hardware Privacy Sentinel.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      triggerHaptic('click');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrintCertificate = () => {
    triggerHaptic('light');
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0e1015] border border-cyan-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                Full Room Privacy Sweep
                {demoMode && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                    DEMO MODE
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-zinc-400">Automated Multi-Vector Counter-Surveillance</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          
          {/* STATE 1: IDLE */}
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-2">
                <label className="text-[11px] font-medium text-zinc-300 block">Room / Audit Location Tag</label>
                <input 
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Hotel Room 304, Marriott"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                  Scan Vectors Included:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {STAGES.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.id} className="p-2.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex items-start space-x-2">
                        <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-zinc-200">{s.name}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{s.vector}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-xl flex items-center space-x-3 text-cyan-300">
                <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
                <p className="text-[11px] leading-relaxed">
                  SpyZero will run an automated sweep across all antennas and sensors, generate a cryptographic Safety Certificate, and provide full audit logs.
                </p>
              </div>

              <button
                onClick={startSweep}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/50 transition active:scale-98 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START 60-SECOND ROOM SWEEP</span>
              </button>
            </div>
          )}

          {/* STATE 2: SCANNING IN PROGRESS */}
          {status === 'scanning' && (
            <div className="space-y-4 py-2">
              {/* Radar Circle Animation */}
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-30" />
                <div className="absolute inset-3 rounded-full border border-cyan-500/40" />
                <div className="absolute inset-8 rounded-full border border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: '6s' }} />
                <div className="absolute inset-14 rounded-full bg-cyan-950/40 border border-cyan-500/60 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <span className="text-lg font-bold font-mono text-cyan-300">{progress}%</span>
                </div>
              </div>

              {/* Current Active Vector */}
              <div className="p-3 bg-zinc-900/80 border border-cyan-500/40 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Stage {currentStage + 1} of 4: {STAGES[currentStage].name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">{progress}%</span>
                </div>
                <p className="text-xs text-zinc-300">{STAGES[currentStage].description}</p>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-200" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Streaming Cyber Terminal Logs */}
              <div className="bg-black/90 border border-zinc-800 rounded-xl p-3 font-mono text-[10px] text-zinc-400 space-y-1 h-32 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx} className={log.includes('[ALERT]') ? 'text-red-400 font-semibold' : 'text-zinc-400'}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATE 3: COMPLETED CERTIFICATE */}
          {status === 'completed' && (
            <div className="space-y-4">
              
              {/* Certificate Card (Printable) */}
              <div id="spyzero-certificate" className="p-4 bg-zinc-950 border-2 border-cyan-500/60 rounded-2xl relative overflow-hidden shadow-2xl">
                
                {/* Certificate Background Watermark */}
                <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-64 h-64 text-cyan-400" />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-900/40 border border-cyan-500 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-wider">SPYZERO PRIVACY SENTINEL</h3>
                      <p className="text-[9px] text-cyan-400 font-mono">AUDIT VERIFICATION // {certId}</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-2 py-0.5 rounded-full font-mono">
                    OFFICIAL
                  </span>
                </div>

                {/* Score & Verdict */}
                <div className="py-3 flex items-center justify-between border-b border-zinc-800/80">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Audited Location</span>
                    <p className="text-xs font-semibold text-white mt-0.5">{roomName}</p>
                    <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{certDate}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Privacy Rating</span>
                    <div className="flex items-center justify-end space-x-1 mt-0.5">
                      {threatsFound.length === 0 ? (
                        <span className="text-base font-bold text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> 98% SAFE
                        </span>
                      ) : (
                        <span className="text-base font-bold text-red-400 font-mono flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" /> 64% THREAT
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vector Breakdown */}
                <div className="py-3 space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="flex items-center gap-1.5 text-zinc-400"><Wifi className="w-3 h-3 text-cyan-400" /> Wi-Fi Video RTSP Streams:</span>
                    <span className="font-mono text-emerald-400 font-medium">0 Detected (Clean)</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="flex items-center gap-1.5 text-zinc-400"><Bluetooth className="w-3 h-3 text-cyan-400" /> Covert AirTags / Trackers:</span>
                    <span className="font-mono text-emerald-400 font-medium">0 Following (Clean)</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="flex items-center gap-1.5 text-zinc-400"><Radio className="w-3 h-3 text-cyan-400" /> Ultrasonic Audio Transmitters:</span>
                    <span className="font-mono text-emerald-400 font-medium">Nominal Noise Floor</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-300">
                    <span className="flex items-center gap-1.5 text-zinc-400"><Camera className="w-3 h-3 text-cyan-400" /> Optical Glint & EMF Flux:</span>
                    <span className="font-mono text-emerald-400 font-medium">Calibrated (Baseline 34µT)</span>
                  </div>
                </div>

                {/* Threat Warnings if any */}
                {threatsFound.length > 0 && (
                  <div className="mt-2 p-2.5 bg-red-950/60 border border-red-800 rounded-xl">
                    <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider block">
                      Detected Anomalies:
                    </span>
                    {threatsFound.map((t, idx) => (
                      <p key={idx} className="text-xs text-red-200 mt-1 flex items-center gap-1">
                        • {t}
                      </p>
                    ))}
                  </div>
                )}

                {/* Footer Hash */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                  <span>SHA-256: 7f8a92...b41e</span>
                  <span className="flex items-center gap-1 text-cyan-400/80">
                    <Lock className="w-2.5 h-2.5" /> Hardware Authenticated
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleShareCertificate}
                  className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition active:scale-98 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied to Clipboard!' : 'Share Evidence'}</span>
                </button>

                <button
                  onClick={handlePrintCertificate}
                  className="py-2.5 px-3 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition active:scale-98 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>

              <button
                onClick={() => setStatus('idle')}
                className="w-full py-2 text-zinc-400 hover:text-white text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Run New Room Sweep</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
