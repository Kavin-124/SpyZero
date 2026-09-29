import React, { useRef, useState, useEffect, useContext } from 'react';
import { 
  Camera, 
  Flashlight, 
  Moon, 
  ShieldCheck,
  RotateCcw,
  Video,
  Info
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { ViewModeContext } from './DeviceFrame';

interface GlintScannerProps {
  onThreatFound?: (threatName: string) => void;
}

export const GlintScanner: React.FC<GlintScannerProps> = ({ onThreatFound: _onThreatFound }) => {
  const { viewMode } = useContext(ViewModeContext);
  const isWide = viewMode === 'wide';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [flashlightOn, setFlashlightOn] = useState<boolean>(false);
  const [irNightMode, setIrNightMode] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        triggerHaptic('medium');
        soundFx.playRadarPing();
      }
    } catch {
      setCameraError('Camera access not available. Check browser permissions.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setFlashlightOn(false);
    setIrNightMode(false);
  };

  const handleFlashlightToggle = async () => {
    const nextState = !flashlightOn;
    setFlashlightOn(nextState);
    triggerHaptic('medium');
    soundFx.playRadarPing();

    if (nextState) {
      setIrNightMode(false);
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          const capabilities = (track.getCapabilities?.() || {}) as any;
          if (capabilities.torch) {
            await track.applyConstraints({ advanced: [{ torch: nextState }] } as any);
          }
        } catch {
          // Torch not supported on some webcams
        }
      }
    }
  };

  const handleNightModeToggle = () => {
    const nextState = !irNightMode;
    setIrNightMode(nextState);
    triggerHaptic('light');
    soundFx.playRadarPing();

    if (nextState) {
      setFlashlightOn(false);
    }
  };

  // Canvas render loop for live video processing
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (cameraActive && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);

        // Apply optical filters if active
        if (irNightMode) {
          // Night IR enhancement filter
          const imgData = ctx.getImageData(0, 0, width, height);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const b = d[i + 2];
            // Boost red/blue sensitivity (where IR LEDs typically bloom as violet/purple)
            if (r > 200 && b > 180) {
              d[i] = 255;     // Boost magenta/violet
              d[i + 1] = 100;
              d[i + 2] = 255;
            }
          }
          ctx.putImageData(imgData, 0, 0);

          // Subtle night mode tint
          ctx.fillStyle = 'rgba(147, 51, 234, 0.12)';
          ctx.fillRect(0, 0, width, height);
        }

        // Draw optical reticle HUD corners
        ctx.strokeStyle = irNightMode ? '#c084fc' : flashlightOn ? '#fbbf24' : '#60a5fa';
        ctx.lineWidth = 2;
        const cornerSize = 16;
        const cx = width / 2;
        const cy = height / 2;
        const boxSize = 70;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(cx - boxSize, cy - boxSize + cornerSize);
        ctx.lineTo(cx - boxSize, cy - boxSize);
        ctx.lineTo(cx - boxSize + cornerSize, cy - boxSize);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(cx + boxSize - cornerSize, cy - boxSize);
        ctx.lineTo(cx + boxSize, cy - boxSize);
        ctx.lineTo(cx + boxSize, cy - boxSize + cornerSize);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(cx - boxSize, cy + boxSize - cornerSize);
        ctx.lineTo(cx - boxSize, cy + boxSize);
        ctx.lineTo(cx - boxSize + cornerSize, cy + boxSize);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(cx + boxSize - cornerSize, cy + boxSize);
        ctx.lineTo(cx + boxSize, cy + boxSize);
        ctx.lineTo(cx + boxSize, cy + boxSize - cornerSize);
        ctx.stroke();

      } else {
        // Standby Viewfinder
        ctx.fillStyle = '#0c0d10';
        ctx.fillRect(0, 0, width, height);

        // Center HUD Crosshairs
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 40, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width / 2 - 50, height / 2);
        ctx.lineTo(width / 2 + 50, height / 2);
        ctx.moveTo(width / 2, height / 2 - 50);
        ctx.lineTo(width / 2, height / 2 + 50);
        ctx.stroke();
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [cameraActive, flashlightOn, irNightMode]);

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 mx-auto text-zinc-100 ${
      isWide ? "p-6 max-w-4xl" : "p-4 max-w-md"
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Optical Lens Scanner</h2>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Identify hidden pinhole camera lenses via light retro-reflection.
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          {cameraActive && (
            <button
              onClick={stopCamera}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              title="Stop Camera"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-medium flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>100% Offline</span>
          </span>
        </div>
      </div>

      {/* Viewfinder Frame */}
      <div className="relative rounded-xl overflow-hidden bg-black border border-zinc-800 flex justify-center items-center aspect-[4/3] max-h-[380px]">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas 
          ref={canvasRef} 
          width={640} 
          height={480} 
          className="w-full h-full object-cover" 
        />

        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-black/60 backdrop-blur-xs">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-zinc-300">
              <Video className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Camera Standby</h3>
              <p className="text-xs text-zinc-400 max-w-xs mt-1 leading-relaxed">
                Start the live camera to inspect suspicious wall fixtures, clocks, and smoke alarms.
              </p>
            </div>
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition active:scale-95"
            >
              Start Live Camera
            </button>
            {cameraError && (
              <span className="text-[11px] text-red-400">{cameraError}</span>
            )}
          </div>
        )}

        {/* Viewfinder Status Overlay when Active */}
        {cameraActive && (
          <div className="absolute top-2.5 left-2.5 flex items-center space-x-2 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded bg-black/70 text-emerald-400 border border-zinc-800 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE FEED</span>
            </span>
            {flashlightOn && (
              <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                TORCH ON
              </span>
            )}
            {irNightMode && (
              <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                IR FILTER ON
              </span>
            )}
          </div>
        )}
      </div>

      {/* Optical Modes: Flashlight vs IR */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={handleFlashlightToggle}
          className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition active:scale-95 ${
            flashlightOn 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60' 
              : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-750'
          }`}
        >
          <Flashlight className="w-4 h-4 text-amber-400" />
          <span>{flashlightOn ? 'Flashlight: ON' : 'Flashlight Glint'}</span>
        </button>

        <button
          onClick={handleNightModeToggle}
          className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition active:scale-95 ${
            irNightMode 
              ? 'bg-purple-950/80 text-purple-300 border border-purple-600' 
              : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 hover:bg-zinc-750'
          }`}
        >
          <Moon className="w-4 h-4 text-purple-400" />
          <span>{irNightMode ? 'IR Filter: Active' : 'Night IR Filter'}</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 space-y-1 leading-relaxed">
        <div className="text-zinc-300 font-medium flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Inspection Technique</span>
        </div>
        <p>
          1. <strong>Lens Glint:</strong> Turn off room lights and turn on the <strong>Flashlight</strong>. Scan slowly looking through the screen. Any hidden camera lens will reflect light straight back as a distinct bright pinpoint glare.
        </p>
        <p>
          2. <strong>Night IR:</strong> Switch on the <strong>Night IR Filter</strong> to spot night-vision cameras. Invisible infrared LEDs emitting from dark glass clocks will show up on your screen as bright violet or purple lights.
        </p>
      </div>

    </div>
  );
};
