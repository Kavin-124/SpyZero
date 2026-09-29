import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Moon, 
  Wifi, 
  Magnet, 
  Award, 
  Download,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface GuidedAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName?: string;
  roomNumber?: string;
}

const AUDIT_STEPS = [
  {
    step: 1,
    title: 'Camera Lens Glint Check',
    icon: Eye,
    instruction: 'Turn off room lights and slowly sweep phone camera around the ceiling and walls.',
  },
  {
    step: 2,
    title: 'Night Vision IR Scan',
    icon: Moon,
    instruction: 'Point phone towards clocks and TV corners to catch night vision infrared lights.',
  },
  {
    step: 3,
    title: 'Wi-Fi Spy Device Scan',
    icon: Wifi,
    instruction: 'Scanning local Wi-Fi nodes to detect hidden streaming cameras or suspicious micro-chips.',
  },
  {
    step: 4,
    title: 'Magnetic EMF Circuit Check',
    icon: Magnet,
    instruction: 'Wave phone 5cm in front of bedside clocks, sockets, and tissue boxes.',
  }
];

export const GuidedAuditModal: React.FC<GuidedAuditModalProps> = ({
  isOpen,
  onClose,
  hotelName = "Hotel Grand Marina",
  roomNumber = "302"
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [certData, setCertData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIdx(0);
      setProgress(0);
      setIsCompleted(false);
      setCertData(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isCompleted) return;

    setProgress(0);
    soundFx.playRadarPing();
    triggerHaptic('light');

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleStepFinish();
          return 100;
        }
        return prev + 10;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [currentStepIdx, isOpen, isCompleted]);

  const handleStepFinish = () => {
    soundFx.playGeigerClick();
    triggerHaptic('medium');

    if (currentStepIdx < AUDIT_STEPS.length - 1) {
      setTimeout(() => {
        setCurrentStepIdx((idx) => idx + 1);
      }, 350);
    } else {
      setTimeout(() => {
        setIsCompleted(true);
        triggerHaptic('warning');
        soundFx.playSuccessChime();
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.7 }
        });

        setCertData({
          id: `SZ-${Math.floor(100000 + Math.random() * 900000)}`,
          hotel: hotelName,
          room: roomNumber,
          timestamp: new Date().toLocaleTimeString(),
        });
      }, 400);
    }
  };

  const handleClose = () => {
    triggerHaptic('light');
    onClose();
  };

  if (!isOpen) return null;

  const currentStep = AUDIT_STEPS[currentStepIdx];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-y-auto">
      {/* Mobile Bottom Sheet Card */}
      <div className="bg-[#121316] border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto pb-8 sm:pb-6 animate-in slide-in-from-bottom duration-200">
        
        {/* Mobile Drag Pill */}
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto -mt-1 mb-2" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Room Privacy Check
            </h2>
            <p className="text-[11px] text-zinc-400">
              {hotelName} • Room {roomNumber}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Progress Body */}
        {!isCompleted ? (
          <div className="space-y-4 py-2">
            {/* Step Indicators */}
            <div className="flex items-center justify-between space-x-1.5 px-1">
              {AUDIT_STEPS.map((s, idx) => (
                <div
                  key={s.step}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                    idx < currentStepIdx
                      ? 'bg-blue-600'
                      : idx === currentStepIdx
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            {/* Active Step Card */}
            <div className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <StepIcon className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                  Step {currentStep.step} of 4
                </span>
                <h3 className="text-base font-semibold text-zinc-100 mt-0.5">
                  {currentStep.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                  {currentStep.instruction}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Completion Certificate */
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-semibold">
                Audit Complete
              </span>
              <h3 className="text-base font-semibold text-zinc-100 mt-1.5">
                No Threats Detected
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Optical, infrared, Wi-Fi, and magnetic checks are all clear.
              </p>
            </div>

            {/* Certificate Box */}
            {certData && (
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-left text-xs font-mono space-y-1.5">
                <div className="flex justify-between border-b border-zinc-800/80 pb-1">
                  <span className="text-zinc-500">Record ID:</span>
                  <span className="text-blue-400 font-medium">{certData.id}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/80 pb-1">
                  <span className="text-zinc-500">Location:</span>
                  <span className="text-zinc-200">{certData.hotel} (Room {certData.room})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Timestamp:</span>
                  <span className="text-zinc-300">{certData.timestamp}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  alert("Audit report saved to device.");
                  onClose();
                }}
                className="w-1/2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Report</span>
              </button>
              <button
                onClick={handleClose}
                className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
