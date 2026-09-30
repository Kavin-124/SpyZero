import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, ShieldAlert, CheckCircle, Radio, Info } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

export const AcousticBugDetector: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [peakFrequency, setPeakFrequency] = useState<number>(0);
  const [ultrasonicLevel, setUltrasonicLevel] = useState<number>(0); // 0 to 100
  const [audioError, setAudioError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isAnomaly = ultrasonicLevel > 65;

  const startListening = async () => {
    setAudioError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsListening(true);
      triggerHaptic('medium');
      soundFx.playRadarPing();
    } catch {
      setAudioError('Microphone permission required for acoustic bug sweep.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsListening(false);
    setUltrasonicLevel(0);
    setPeakFrequency(0);
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Visualizer loop
  useEffect(() => {
    if (!isListening) return;

    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const audioCtx = audioContextRef.current;
    if (!canvas || !analyser || !audioCtx) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const sampleRate = audioCtx.sampleRate;
    const nyquist = sampleRate / 2;

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#0c0d10';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Mark the Ultrasonic Band boundary (~15 kHz)
      const ultrasonicCutoffHz = 15000;
      const cutoffX = (ultrasonicCutoffHz / nyquist) * width;

      // Draw danger highlight zone (15 kHz - 22 kHz)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.fillRect(cutoffX, 0, width - cutoffX, height);

      ctx.fillStyle = '#71717a';
      ctx.font = '10px monospace';
      ctx.fillText('Normal Voice / Audio', 10, 16);
      ctx.fillStyle = '#ef4444';
      ctx.fillText('15kHz+ Ultrasonic Threat Zone', cutoffX + 8, 16);

      // Draw frequency spectrum curve
      ctx.beginPath();
      ctx.moveTo(0, height);

      let maxVal = 0;
      let maxBin = 0;
      let ultrasonicSum = 0;
      let ultrasonicCount = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i];
        const freq = (i * nyquist) / bufferLength;

        if (freq >= 15000) {
          ultrasonicSum += val;
          ultrasonicCount++;
        }

        if (val > maxVal) {
          maxVal = val;
          maxBin = i;
        }

        const x = (i / bufferLength) * width;
        const barHeight = (val / 255) * (height - 24);
        const y = height - barHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      // Gradient fill for frequency spectrum
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(0.65, '#60a5fa');
      gradient.addColorStop(0.85, '#ef4444');
      gradient.addColorStop(1, '#dc2626');

      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.55;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Update state metrics
      const peakHz = Math.round((maxBin * nyquist) / bufferLength);
      setPeakFrequency(peakHz);

      const avgUltra = ultrasonicCount > 0 ? (ultrasonicSum / ultrasonicCount / 255) * 100 : 0;
      setUltrasonicLevel(Math.round(avgUltra));

      if (avgUltra > 65) {
        soundFx.playGeigerClick();
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening]);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-[#121316] border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100 flex items-center space-x-2">
                <span>Ultrasonic & Coil Whine Sweeper</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800 text-purple-300 font-medium">
                  Acoustic Bug Radar
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Detects 15kHz–22kHz acoustic emissions leaked by concealed DC transformers & audio bugs
              </p>
            </div>
          </div>

          <button
            onClick={isListening ? stopListening : startListening}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition active:scale-95 ${
              isListening
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Stop Sweep</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Start Sweep</span>
              </>
            )}
          </button>
        </div>

        {audioError && (
          <div className="mt-3 p-3 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300">
            {audioError}
          </div>
        )}

        {/* Real-time Telemetry Readout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl">
            <span className="text-[11px] text-zinc-400 font-medium">Dominant Peak</span>
            <div className="text-lg font-mono font-semibold text-zinc-100 mt-0.5">
              {isListening ? `${(peakFrequency / 1000).toFixed(1)} kHz` : '-- kHz'}
            </div>
          </div>

          <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl">
            <span className="text-[11px] text-zinc-400 font-medium">Ultrasonic Leakage</span>
            <div className={`text-lg font-mono font-semibold mt-0.5 ${isAnomaly ? 'text-red-400' : 'text-emerald-400'}`}>
              {isListening ? `${ultrasonicLevel}%` : '0%'}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl flex flex-col justify-center">
            <span className="text-[11px] text-zinc-400 font-medium">Status</span>
            <div className="flex items-center space-x-1.5 mt-1">
              {isAnomaly ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-semibold text-red-400">Suspicious Emission</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">
                    {isListening ? 'Ambient Clean' : 'Standby'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Live Audio Frequency Spectrum Canvas */}
        <div className="mt-4 border border-zinc-800 rounded-xl overflow-hidden bg-[#0c0d10] p-1">
          <canvas
            ref={canvasRef}
            width={640}
            height={200}
            className="w-full h-44 rounded-lg block"
          />
        </div>

        {/* Ultrasonic Meter Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">15kHz+ Ultrasonic Band Intensity</span>
            <span className="font-mono text-zinc-300 font-medium">{ultrasonicLevel}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                isAnomaly ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${ultrasonicLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Acoustic Inspection Guide */}
      <div className="bg-[#121316] border border-zinc-800 rounded-2xl p-4 text-xs space-y-2.5">
        <div className="flex items-center space-x-2 text-zinc-200 font-semibold">
          <Info className="w-4 h-4 text-blue-400" />
          <span>How to Perform an Acoustic Bug Sweep</span>
        </div>
        <ol className="list-decimal list-inside text-zinc-400 space-y-1.5 leading-relaxed">
          <li>Hold phone microphone 5–10 cm away from wall sockets, AC units, and smoke detectors.</li>
          <li>Cheap spy camera power supplies leak continuous high-frequency coil whine between <strong>16 kHz and 21 kHz</strong>.</li>
          <li>If the red danger zone spikes above <strong>65%</strong> in a non-electronic area, inspect the fixture closely.</li>
        </ol>
      </div>
    </div>
  );
};
