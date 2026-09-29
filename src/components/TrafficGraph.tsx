import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ArrowDown,
  ArrowUp,
  Radio,
  Sliders
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const TrafficGraph: React.FC = () => {
  const [uploadRate, setUploadRate] = useState<number>(2340); // Kbps
  const [downloadRate, setDownloadRate] = useState<number>(14); // Kbps
  const [packetInterval, setPacketInterval] = useState<number>(33.3); // ms (30fps)
  const [history, setHistory] = useState<{ up: number; down: number }[]>([]);

  // Calculate real-time anomaly metrics
  const asymmetryRatio = uploadRate / Math.max(downloadRate, 1);
  let anomalyScore = 0;
  if (uploadRate > 1200) anomalyScore += 45;
  else if (uploadRate > 600) anomalyScore += 20;

  if (asymmetryRatio > 3.0) anomalyScore += 35;
  if (packetInterval >= 25 && packetInterval <= 40) anomalyScore += 20;
  anomalyScore = Math.min(100, anomalyScore);

  const isSpyStream = anomalyScore >= 75;

  // Real-time scrolling telemetry data points
  useEffect(() => {
    const interval = setInterval(() => {
      const currentUp = uploadRate + (Math.random() * 90 - 45);
      const currentDown = downloadRate + (Math.random() * 12 - 6);

      setHistory((prev) => {
        const next = [...prev, { up: Math.max(0, currentUp), down: Math.max(0, currentDown) }];
        return next.slice(-28);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [uploadRate, downloadRate]);

  return (
    <div className="glass-panel-glow border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/60 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold font-hud uppercase tracking-wider text-slate-100">
                Network Traffic Anomaly & Telemetry Engine
              </h2>
              <span className="text-[11px] font-mono text-cyan-400">
                Vector 4: Asymmetric Uplink & GOP Cadence Anomaly Inspection
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Ordinary smartphones/TVs use intermittent downlink bursts. Spy cameras continuously stream high-bandwidth video upstream (steady ~2 Mbps).
          </p>
        </div>

        {/* Live Anomaly Badge */}
        <div className={`px-4 py-2 rounded-2xl border text-xs font-mono font-bold flex items-center space-x-2.5 transition-all ${
          isSpyStream 
            ? 'bg-red-950/90 border-red-500 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse' 
            : 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${isSpyStream ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
          <span>{isSpyStream ? '🚨 CRITICAL COVERT VIDEO STREAM DETECTED' : '🟢 NORMAL CONSUMER TRAFFIC'}</span>
          <span className="font-hud text-sm">({anomalyScore}%)</span>
        </div>
      </div>

      {/* Main Charts & Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Live Scrolling Telemetry Oscilloscope */}
        <div className="lg:col-span-8 bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold font-hud uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Real-Time Bandwidth Stream (Oscilloscope Channel A & B)</span>
            </h3>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center space-x-1.5 text-red-400 font-bold">
                <span className="w-3 h-1 bg-red-500 rounded shadow-[0_0_8px_#ef4444]" />
                <span>Upload (Upstream Stream)</span>
              </span>
              <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <span className="w-3 h-1 bg-emerald-500 rounded shadow-[0_0_8px_#10b981]" />
                <span>Download (Downstream User)</span>
              </span>
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="h-52 w-full bg-slate-950 border border-slate-800/90 rounded-xl p-3 relative flex items-end overflow-hidden shadow-inner">
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-rows-4 pointer-events-none opacity-20">
              <div className="border-b border-cyan-500" />
              <div className="border-b border-cyan-500" />
              <div className="border-b border-cyan-500" />
              <div className="border-b border-cyan-500" />
            </div>

            <svg className="w-full h-full overflow-visible">
              {/* Upload Line (Red Glowing Line) */}
              <polyline
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                points={history
                  .map((p, i) => `${(i / 27) * 100}%,${100 - Math.min(100, (p.up / 3200) * 100)}%`)
                  .join(' ')}
              />
              {/* Download Line (Emerald Dashed) */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 2"
                className="drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]"
                points={history
                  .map((p, i) => `${(i / 27) * 100}%,${100 - Math.min(100, (p.down / 3200) * 100)}%`)
                  .join(' ')}
              />
            </svg>

            {/* Threshold Line */}
            <div className="absolute inset-x-0 bottom-[38%] border-t-2 border-dashed border-red-500/60 flex justify-between px-3 text-[10px] text-red-400 font-mono">
              <span className="bg-slate-950/80 px-2 py-0.5 rounded">-- 1.2 Mbps Spy Stream Exfiltration Line --</span>
              <span className="font-bold">1,200 Kbps</span>
            </div>
          </div>

          {/* Telemetry Stat Gauges */}
          <div className="grid grid-cols-3 gap-3 mt-4 text-center font-mono">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 shadow-inner">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-center space-x-1">
                <ArrowUp className="w-3 h-3 text-red-400" />
                <span>Upload Rate</span>
              </span>
              <div className="text-lg font-black font-hud text-red-400 mt-0.5">
                {(uploadRate / 1024).toFixed(2)} <span className="text-xs font-normal">Mbps</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 shadow-inner">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-center space-x-1">
                <ArrowDown className="w-3 h-3 text-emerald-400" />
                <span>Download Rate</span>
              </span>
              <div className="text-lg font-black font-hud text-emerald-400 mt-0.5">
                {(downloadRate / 1024).toFixed(2)} <span className="text-xs font-normal">Mbps</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 shadow-inner">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Asymmetry Ratio</span>
              <div className="text-lg font-black font-hud text-cyan-400 mt-0.5">
                {asymmetryRatio.toFixed(1)} <span className="text-xs font-normal">: 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Heuristic Bitrate Tester */}
        <div className="lg:col-span-4 bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <div>
            <h3 className="text-xs font-bold font-hud uppercase tracking-wider text-slate-200 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Simulate Device Bitrate Profile</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              Adjust parameters below to test how SpyZero differentiates an autonomous covert video cam from a smartphone or television.
            </p>

            {/* Upload Rate Slider */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Upload Bitrate</span>
                <span className="text-red-400 font-bold">{uploadRate} Kbps</span>
              </div>
              <input
                type="range"
                min="50"
                max="3500"
                step="50"
                value={uploadRate}
                onChange={(e) => setUploadRate(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
              />
            </div>

            {/* Packet Cadence */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Packet Cadence (GOP)</span>
                <span className="text-cyan-400 font-bold">{packetInterval.toFixed(1)} ms (30fps)</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={packetInterval}
                onChange={(e) => setPacketInterval(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Quick Presets */}
            <div className="mt-5 space-y-2">
              <button
                onClick={() => {
                  setUploadRate(2340);
                  setDownloadRate(15);
                  setPacketInterval(33.3);
                  soundFx.playThreatAlert();
                }}
                className="w-full p-2.5 rounded-xl bg-red-950/70 border border-red-700/80 text-red-200 text-xs font-hud font-bold tracking-wider uppercase hover:bg-red-900 transition flex items-center justify-between"
              >
                <span>Simulate Spy Cam (2.3 Mbps)</span>
                <span className="text-[10px] font-mono text-red-400">CRITICAL</span>
              </button>

              <button
                onClick={() => {
                  setUploadRate(120);
                  setDownloadRate(3800);
                  setPacketInterval(75);
                  soundFx.playSuccessChime();
                }}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-hud font-bold tracking-wider uppercase hover:bg-slate-800 transition flex items-center justify-between"
              >
                <span>Normal Phone (YouTube 1080p)</span>
                <span className="text-[10px] font-mono text-emerald-400">SAFE</span>
              </button>
            </div>
          </div>

          {/* Anomaly Gauge Breakdown */}
          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase">Heuristic Anomaly Index:</span>
              <span className={`font-black text-sm ${isSpyStream ? 'text-red-400' : 'text-emerald-400'}`}>
                {anomalyScore}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isSpyStream ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-emerald-500'
                }`}
                style={{ width: `${anomalyScore}%` }}
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
