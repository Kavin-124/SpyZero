import React, { useState, useContext } from 'react';
import { Flashlight } from 'lucide-react';
import { DeviceFrame, ViewModeContext } from './components/DeviceFrame';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { GlintScanner } from './components/GlintScanner';
import { NetworkRadar } from './components/NetworkRadar';
import { EMFGeiger } from './components/EMFGeiger';
import { GenAIInspector } from './components/GenAIInspector';
import { HotelHeatmap } from './components/HotelHeatmap';
import { GuidedAuditModal } from './components/GuidedAuditModal';
import { EmergencyShieldModal } from './components/EmergencyShieldModal';

const AppContent: React.FC = () => {
  const { viewMode } = useContext(ViewModeContext);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [threatCount, setThreatCount] = useState<number>(0);
  const [lastDetectedThreat, setLastDetectedThreat] = useState<string>('');
  const [isAuditWizardOpen, setIsAuditWizardOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [torchActive, setTorchActive] = useState<boolean>(false);

  const handleThreatFound = (threat: string) => {
    setThreatCount((prev) => prev + 1);
    setLastDetectedThreat(threat);
  };

  const handleToggleTorch = () => {
    setTorchActive((prev) => !prev);
  };

  const isWide = viewMode === 'wide';

  return (
    <div className={`flex flex-col ${isWide ? 'min-h-screen' : 'h-full min-h-0'} w-full relative`}>
      {/* If Wide mode (Laptop/PC), show Desktop Navbar at top. If Mobile, show MobileHeader */}
      {isWide ? (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          threatCount={threatCount}
          onOpenAuditWizard={() => setIsAuditWizardOpen(true)}
          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        />
      ) : (
        <div className="shrink-0">
          <MobileHeader
            threatCount={threatCount}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            onToggleTorch={handleToggleTorch}
            torchActive={torchActive}
          />
        </div>
      )}

      {/* Screen Torch Overlay */}
      {torchActive && (
        <div 
          onClick={handleToggleTorch}
          className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-black cursor-pointer animate-fade-in"
          title="Tap anywhere to turn off flashlight"
        >
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4 shadow border border-zinc-200">
            <Flashlight className="w-8 h-8 text-zinc-900" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
            Screen Flashlight Active
          </h2>
          <p className="text-xs text-zinc-600 mt-1 text-center max-w-xs">
            Screen is at peak white illumination to catch reflection from hidden pinhole camera lenses in dark rooms.
          </p>
          <span className="mt-8 px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-medium">
            Tap anywhere to dismiss
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className={isWide ? "w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1" : "p-3 flex-1 overflow-y-auto min-h-0"}>
        {activeTab === 'overview' && (
          <DashboardOverview
            setActiveTab={setActiveTab}
            onOpenAuditWizard={() => setIsAuditWizardOpen(true)}
            threatCount={threatCount}
          />
        )}

        {activeTab === 'optical' && (
          <GlintScanner onThreatFound={handleThreatFound} />
        )}

        {activeTab === 'network' && (
          <NetworkRadar onThreatFound={handleThreatFound} />
        )}

        {activeTab === 'emf' && (
          <EMFGeiger />
        )}

        {activeTab === 'genai' && (
          <GenAIInspector />
        )}

        {activeTab === 'heatmap' && (
          <HotelHeatmap onBack={() => setActiveTab('overview')} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (ONLY in mobile phone view) */}
      {!isWide && (
        <div className="shrink-0 w-full">
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            threatCount={threatCount}
          />
        </div>
      )}

      {/* Modals */}
      <GuidedAuditModal
        isOpen={isAuditWizardOpen}
        onClose={() => setIsAuditWizardOpen(false)}
        hotelName="Grand Bay Marina"
        roomNumber="302"
      />

      <EmergencyShieldModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        detectedThreat={lastDetectedThreat || "Covert IP Pinhole Streamer (Port 554 RTSP)"}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <DeviceFrame>
      <AppContent />
    </DeviceFrame>
  );
};

export default App;
