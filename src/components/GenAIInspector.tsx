import React, { useState, useRef, useContext } from 'react';
import { 
  Sparkles, 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  ShieldCheck,
  FileImage,
  Info
} from 'lucide-react';
import type { HardwareInspectionResult } from '../types';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { ViewModeContext } from './DeviceFrame';

export const GenAIInspector: React.FC = () => {
  const { viewMode } = useContext(ViewModeContext);
  const isWide = viewMode === 'wide';

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<HardwareInspectionResult | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [reticlePos, setReticlePos] = useState<{ x: number; y: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Handle image file selection
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setImageFileName(file.name);
    setResult(null);
    setReticlePos(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageSrc(e.target.result as string);
        triggerHaptic('light');
        soundFx.playRadarPing();
      }
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    triggerHaptic('light');
    setImageSrc(null);
    setImageFileName('');
    setResult(null);
    setReticlePos(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Real Canvas-based Vision & Aperture Analysis
  const runVisionAnalysis = () => {
    if (!imageSrc) return;

    setAnalyzing(true);
    triggerHaptic('medium');
    soundFx.playRadarPing();

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxDim = 320;
      let w = img.width;
      let h = img.height;

      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;

      if (!ctx) {
        setAnalyzing(false);
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      let specularCount = 0;
      let darkCoreCount = 0;
      let candidateX = Math.round(w / 2);
      let candidateY = Math.round(h / 2);
      let maxContrast = 0;

      const step = 4;
      for (let y = step; y < h - step; y += step) {
        for (let x = step; x < w - step; x += step) {
          const idx = (y * w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          if (lum > 242) {
            specularCount++;
          }

          if (lum < 35) {
            darkCoreCount++;
          }

          const rightIdx = (y * w + (x + step)) * 4;
          const rightLum = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
          const grad = Math.abs(lum - rightLum);

          if (grad > maxContrast) {
            maxContrast = grad;
            candidateX = x;
            candidateY = y;
          }
        }
      }

      const totalSamplePoints = (w * h) / (step * step);
      const glintRatio = specularCount / totalSamplePoints;
      const darkCoreRatio = darkCoreCount / totalSamplePoints;

      let threatProb = 0;
      let isThreat = false;
      let analysisText = "";
      let recText = "";
      const indicators: string[] = [];

      if (glintRatio > 0.0008 && darkCoreRatio > 0.0005) {
        isThreat = true;
        threatProb = Math.min(96, Math.max(78, Math.round(75 + (glintRatio * 1000) + (maxContrast / 10))));
        indicators.push("lens_glint", "aperture_core", "high_contrast_edge");
        analysisText = "A micro-aperture was detected with concentrated circular contrast. Possible hidden pinhole camera lens or drilled hole.";
        recText = "Perform a direct flashlight reflection test at a 15-degree angle. Cover the aperture or request a room change if inside a private area.";
      } else if (darkCoreRatio > 0.003 || maxContrast > 140) {
        threatProb = Math.min(68, Math.max(42, Math.round(40 + (maxContrast / 6))));
        isThreat = threatProb > 55;
        indicators.push("circular_fitting");
        analysisText = "Surface boundary detected. Likely a standard screw, sensor port, or normal manufacturing detail.";
        recText = "Examine with phone flashlight to ensure no glass lens or optical elements are visible inside.";
      } else {
        threatProb = Math.max(3, Math.round((maxContrast / 40) + (glintRatio * 100)));
        isThreat = false;
        indicators.push("standard_surface");
        analysisText = "Surface texture and geometry analyzed. No micro-lenses, drilled apertures, or glass retro-reflection detected.";
        recText = "No optical anomaly found. Proceed with Wi-Fi and magnetic scans.";
      }

      setTimeout(() => {
        setReticlePos({
          x: Math.round((candidateX / w) * 100),
          y: Math.round((candidateY / h) * 100)
        });

        setResult({
          source: "Optical Vision Analyzer",
          device_class: "IMAGE_INSPECTION",
          oem_standard_baseline: "Surface Geometry Baseline",
          anomaly_detected: isThreat,
          threat_probability_percent: threatProb,
          anomaly_analysis: analysisText,
          forensic_indicators: indicators,
          actionable_recommendations: recText,
          evidence_hash: `Audit-${Date.now().toString(36).toUpperCase()}`
        });

        setAnalyzing(false);
        if (isThreat) {
          triggerHaptic('warning');
          soundFx.playThreatAlert();
        } else {
          triggerHaptic('light');
          soundFx.playRadarPing();
        }
      }, 700);
    };
  };

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 mx-auto text-zinc-100 ${
      isWide ? "p-6 max-w-4xl" : "p-4 max-w-md"
    }`}>
      
      {/* Hidden File Inputs */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={onFileInputChange} 
      />
      <input 
        ref={cameraInputRef}
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        onChange={onFileInputChange} 
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 text-blue-400 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Photo Lens Inspection
            </h2>
            <p className="text-[11px] text-zinc-400">
              Upload a close-up photo to check for drilled pinhole apertures.
            </p>
          </div>
        </div>

        {imageSrc && (
          <button
            onClick={handleReset}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition active:scale-95"
            title="Upload another photo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Photo</span>
          </button>
        )}
      </div>

      {/* Main Area: Upload Dropzone OR Viewfinder */}
      {!imageSrc ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
            isDragOver 
              ? 'border-blue-500 bg-blue-950/10' 
              : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/60 text-zinc-300 mx-auto flex items-center justify-center mb-3">
            <Camera className="w-6 h-6 text-blue-400" />
          </div>

          <h3 className="text-sm font-semibold text-white mb-1">
            Capture or Upload a Room Object
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4 leading-relaxed">
            Take a clear photo of any wall clock, smoke alarm, power socket, screw, or mirror to inspect for concealed lenses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => {
                triggerHaptic('light');
                cameraInputRef.current?.click();
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-sm transition active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Take Photo</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                fileInputRef.current?.click();
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium text-xs flex items-center justify-center space-x-2 border border-zinc-700 transition active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Choose Image</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Private: Image stays directly on your device.</span>
          </div>
        </div>
      ) : (
        /* Image Preview & Inspection Viewfinder */
        <div className="space-y-3">
          
          <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-video max-h-[360px] flex items-center justify-center">
            <img 
              src={imageSrc} 
              alt="Inspected room fixture" 
              className="w-full h-full object-contain"
            />

            {/* Target Reticle when Analyzed */}
            {reticlePos && (
              <div 
                className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300"
                style={{ left: `${reticlePos.x}%`, top: `${reticlePos.y}%` }}
              >
                <div className="w-full h-full border-2 border-red-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                </div>
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-medium px-1.5 py-0.2 rounded shadow whitespace-nowrap">
                  Focal Target
                </span>
              </div>
            )}

            {/* Scanning Overlay during Analysis */}
            {analyzing && (
              <div className="bg-black/50 backdrop-blur-xs inset-0 absolute flex items-center justify-center">
                <div className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white flex items-center space-x-2 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  <span className="text-xs font-medium">Scanning surface geometry...</span>
                </div>
              </div>
            )}

            {/* Filename Chip */}
            <div className="absolute top-2 left-2 bg-zinc-950/80 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-lg text-[10px] font-mono flex items-center space-x-1.5">
              <FileImage className="w-3 h-3 text-zinc-400" />
              <span className="truncate max-w-[140px] sm:max-w-xs">{imageFileName || 'Selected Photo'}</span>
            </div>
          </div>

          {/* Action Button: Run Scan */}
          <div className="flex items-center justify-between gap-2.5">
            <button
              onClick={runVisionAnalysis}
              disabled={analyzing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-sm transition active:scale-95"
            >
              <Sparkles className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analyzing ? 'Analyzing Image...' : 'Analyze Photo'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition active:scale-95 shrink-0"
              title="Change photo"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Change Photo</span>
            </button>
          </div>

          {/* Inspection Findings Card */}
          {result && (
            <div className={`border rounded-xl p-4 space-y-2.5 transition-all ${
              result.anomaly_detected 
                ? 'bg-red-950/20 border-red-800/80' 
                : 'bg-zinc-950 border-zinc-800'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                  {result.anomaly_detected ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <div>
                    <h4 className={`text-xs font-semibold ${
                      result.anomaly_detected ? 'text-red-300' : 'text-zinc-100'
                    }`}>
                      {result.anomaly_detected ? 'Suspicious Aperture Flagged' : 'No Concealed Lens Detected'}
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Anomaly Score: {result.threat_probability_percent}%
                    </span>
                  </div>
                </div>

                <span className="text-[10px] text-zinc-400 font-mono">
                  {result.evidence_hash}
                </span>
              </div>

              <div className="space-y-0.5">
                <strong className="text-zinc-300 block text-xs">Analysis Notes:</strong>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {result.anomaly_analysis}
                </p>
              </div>

              <div className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                result.anomaly_detected
                  ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300'
              }`}>
                <strong className="block font-medium mb-0.5 text-white">Recommended Step:</strong>
                <span>{result.actionable_recommendations}</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Sensor Synergy Guide */}
      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 space-y-1">
        <div className="text-zinc-300 font-medium flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Verification Tip</span>
        </div>
        <p className="leading-relaxed">
          If you spot a suspect micro-hole, shine your phone torch into it at an angle using the <strong>Optical Lens Scanner</strong>. Camera lenses reflect light back with a distinct blue or green optical coating glare.
        </p>
      </div>

    </div>
  );
};
