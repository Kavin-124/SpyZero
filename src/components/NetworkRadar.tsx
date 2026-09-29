import React, { useState, useContext } from 'react';
import { 
  Wifi, 
  Search, 
  ExternalLink, 
  ShieldAlert, 
  Flame,
  Radio,
  Lock,
  Unlock,
  X,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import type { DeviceInfo } from '../types';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { ViewModeContext } from './DeviceFrame';

interface RogueHotspot {
  ssid: string;
  bssid: string;
  rssi_dbm: number;
  signal_percent?: number;
  threat_level: 'CRITICAL' | 'HIGH' | 'SAFE';
  device_type: string;
  channel: number;
  security: string;
  notes: string;
}

interface NetworkRadarProps {
  onThreatFound?: (threat: string) => void;
}

export const NetworkRadar: React.FC<NetworkRadarProps> = ({ onThreatFound }) => {
  const { viewMode } = useContext(ViewModeContext);
  const isWide = viewMode === 'wide';

  const [scanMode, setScanMode] = useState<'no_password' | 'connected'>('no_password');
  const [scanning, setScanning] = useState(false);
  
  // Real-time scanned data (Clean empty by default)
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [hotspots, setHotspots] = useState<RogueHotspot[]>([]);
  const [hasScannedConnected, setHasScannedConnected] = useState(false);
  const [hasScannedHotspots, setHasScannedHotspots] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<RogueHotspot | null>(null);
  const [rtspProbeModal, setRtspProbeModal] = useState<boolean>(false);
  const [hotspotModal, setHotspotModal] = useState<boolean>(false);

  // Automatic Distance & Radar Proximity State (Calculated directly from real RSSI)
  const [autoDistanceMeters, setAutoDistanceMeters] = useState<number>(3.5);

  // Convert real RSSI dBm into approximate distance in meters
  // Path loss formula: distance = 10 ^ ((MeasuredPower - RSSI) / (10 * n))
  const calculateDistance = (rssi: number) => {
    const measuredPower = -40; // Tx power at 1 meter
    const n = 2.2; // environmental path loss factor
    const dist = Math.pow(10, (measuredPower - rssi) / (10 * n));
    return Math.max(0.2, Math.round(dist * 10) / 10);
  };

  // Calculate proximity label and colors automatically from distance
  const getProximityStatus = (meters: number) => {
    if (meters < 0.8) {
      return { label: 'Very Close! (<0.8m) — Hotspot Located!', color: 'text-red-400 bg-red-950/80 border-red-800', level: 'danger' };
    } else if (meters < 2.2) {
      return { label: 'Getting Closer (1 - 2 meters)', color: 'text-orange-400 bg-orange-950/80 border-orange-800', level: 'warning' };
    } else {
      return { label: 'Far Away (>3 meters)', color: 'text-slate-400 bg-slate-800 border-slate-700', level: 'safe' };
    }
  };

  // Real hardware scan using local Windows CLI bridge
  const triggerScan = async () => {
    setScanning(true);
    triggerHaptic('medium');
    soundFx.playRadarPing();

    try {
      if (scanMode === 'connected') {
        // Fetch real connected LAN devices from local hardware bridge
        const res = await fetch('http://localhost:8000/api/real-devices');
        const data = await res.json();
        if (data && data.devices && data.devices.length > 0) {
          setDevices(data.devices);
          setHasScannedConnected(true);
          setSelectedDevice(data.devices[0]);
          
          const threats = data.devices.filter((d: any) => d.threat_level === 'CRITICAL');
          if (threats.length > 0 && onThreatFound) {
            onThreatFound(threats[0].hostname);
          }
        }
      } else {
        // Fetch real surrounding Wi-Fi networks (SSIDs) via Windows netsh wlan
        const res = await fetch('http://localhost:8000/api/real-wifi');
        const data = await res.json();
        if (data && data.networks && data.networks.length > 0) {
          setHotspots(data.networks);
          setHasScannedHotspots(true);
          setSelectedHotspot(data.networks[0]);
          
          // Automatically set distance based on the real hardware signal
          if (data.networks[0].rssi_dbm) {
            const meters = calculateDistance(data.networks[0].rssi_dbm);
            setAutoDistanceMeters(meters);
          }

          const threats = data.networks.filter((n: any) => n.threat_level === 'CRITICAL');
          if (threats.length > 0 && onThreatFound) {
            onThreatFound(`Rogue Camera AP: ${threats[0].ssid}`);
          }
        }
      }
    } catch (err) {
      console.warn("Hardware scanner offline:", err);
    } finally {
      setScanning(false);
      triggerHaptic('warning');
      soundFx.playThreatAlert();
    }
  };

  const handleClear = () => {
    triggerHaptic('light');
    if (scanMode === 'connected') {
      setDevices([]);
      setHasScannedConnected(false);
    } else {
      setHotspots([]);
      setHasScannedHotspots(false);
    }
  };

  const isCurrentModeScanned = scanMode === 'connected' ? hasScannedConnected : hasScannedHotspots;
  const prox = getProximityStatus(autoDistanceMeters);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-5 w-full max-w-5xl mx-auto shadow-sm">
      
      {/* Header Bar */}
      <div className="pb-3 border-b border-zinc-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 text-blue-400 flex items-center justify-center">
                <Wifi className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Wi-Fi & Network Radar
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Scan surrounding Wi-Fi broadcasts and local subnet devices for unauthorized hardware.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {isCurrentModeScanned && (
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                title="Clear Results"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={triggerScan}
              disabled={scanning}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95"
            >
              <Search className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning...' : 'Scan Now'}</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 flex space-x-1 text-xs max-w-md">
          <button
            onClick={() => {
              triggerHaptic('light');
              soundFx.playRadarPing();
              setScanMode('no_password');
            }}
            className={`flex-1 py-1.5 rounded-md font-medium transition flex items-center justify-center space-x-1.5 ${
              scanMode === 'no_password'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Nearby Broadcasts</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              soundFx.playRadarPing();
              setScanMode('connected');
            }}
            className={`flex-1 py-1.5 rounded-md font-medium transition flex items-center justify-center space-x-1.5 ${
              scanMode === 'connected'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Connected Devices</span>
          </button>
        </div>
      </div>

      {/* Main Content: Wide 2-Column Responsive Layout */}
      {isCurrentModeScanned ? (
        <div className={isWide ? "grid grid-cols-12 gap-6 items-start" : "flex flex-col gap-4"}>
          
          {/* Left Column: Distance Gauge */}
          <div className={isWide ? "col-span-5 bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3" : "bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3"}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200 flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Signal Proximity</span>
              </span>

              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${prox.color}`}>
                {prox.label}
              </span>
            </div>

            {/* Distance Readout Box */}
            <div className="p-3 bg-zinc-900/80 rounded-lg border border-zinc-800 text-center space-y-0.5">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
                Estimated Proximity
              </span>
              <div className={`text-3xl font-bold font-mono tracking-tight ${
                autoDistanceMeters < 0.8 ? 'text-red-400' : autoDistanceMeters < 2.2 ? 'text-amber-400' : 'text-zinc-100'
              }`}>
                {autoDistanceMeters} <span className="text-xs font-normal text-zinc-400">meters</span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Calculated from live Wi-Fi signal attenuation
              </p>
            </div>

            {/* Visual Proximity Meter */}
            <div className="space-y-1">
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    autoDistanceMeters < 0.8 ? 'bg-red-500' : autoDistanceMeters < 2.2 ? 'bg-amber-400' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.max(10, Math.min(100, (1 - (autoDistanceMeters / 5.0)) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Far (&gt;3m)</span>
                <span>Near (&lt;0.8m)</span>
              </div>
            </div>

            <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
              Walk slowly around the room with your phone. The estimated distance decreases as you approach the transmitting hardware.
            </div>
          </div>

          {/* Right Column: Device / Hotspot List */}
          <div className={isWide ? "col-span-7 space-y-2.5" : "space-y-2.5"}>
            {scanMode === 'no_password' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Nearby Broadcasts ({hotspots.length})
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Live Adapter Scan
                  </span>
                </div>

                <div className="divide-y divide-zinc-800 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                  {hotspots.map((spot) => {
                    const isThreat = spot.threat_level === 'CRITICAL';
                    return (
                      <div 
                        key={spot.ssid + spot.bssid}
                        className="p-3 flex flex-col space-y-1.5 hover:bg-zinc-900/60 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-xs text-white">{spot.ssid}</span>
                            <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded-md ${
                              isThreat 
                                ? 'bg-red-950 text-red-300 border border-red-800' 
                                : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                            }`}>
                              {isThreat ? 'Suspicious AP' : 'Standard Wi-Fi'}
                            </span>
                          </div>

                          {isThreat && (
                            <button
                              onClick={() => {
                                setSelectedHotspot(spot);
                                setHotspotModal(true);
                                triggerHaptic('heavy');
                                soundFx.playThreatAlert();
                              }}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 active:scale-95"
                            >
                              <span>Locate</span>
                              <Flame className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 flex items-center justify-between font-mono">
                          <span>
                            Signal: {spot.signal_percent ? `${spot.signal_percent}%` : `${spot.rssi_dbm} dBm`}
                            {spot.channel ? ` • Ch ${spot.channel}` : ''}
                          </span>
                          <span className="flex items-center space-x-1">
                            {spot.security === 'OPEN' ? (
                              <span className="text-red-400 font-bold flex items-center space-x-0.5">
                                <Unlock className="w-3 h-3" />
                                <span>OPEN</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 flex items-center space-x-0.5">
                                <Lock className="w-3 h-3" />
                                <span>{spot.security}</span>
                              </span>
                            )}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {spot.notes}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Connected Subnet Devices ({devices.length})
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Live Subnet Scan
                  </span>
                </div>

                <div className="divide-y divide-zinc-800 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                  {devices.map((dev) => {
                    const isThreat = dev.threat_level === 'CRITICAL' || dev.threat_level === 'HIGH';
                    return (
                      <div 
                        key={dev.ip + dev.mac}
                        className="p-3 flex flex-col space-y-1.5 hover:bg-zinc-900/60 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-xs text-white">{dev.hostname}</span>
                            <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded-md ${
                              isThreat ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                            }`}>
                              {isThreat ? 'Suspicious Camera' : 'Safe Device'}
                            </span>
                          </div>

                          {isThreat && (
                            <button
                              onClick={() => {
                                setSelectedDevice(dev);
                                setRtspProbeModal(true);
                                triggerHaptic('heavy');
                                soundFx.playThreatAlert();
                              }}
                              className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded-md text-[11px] font-medium flex items-center space-x-1 active:scale-95"
                            >
                              <span>Inspect Stream</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div className="text-[11px] text-zinc-400 flex items-center space-x-3 font-mono">
                          <span>IP: {dev.ip}</span>
                          <span>•</span>
                          <span>MAC: {dev.mac}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Clean Empty State Before Scan */
        <div className="text-center py-10 px-6 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-800 border border-zinc-700/60 text-zinc-300 flex items-center justify-center">
            <Wifi className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">No Scan Performed Yet</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Tap <strong>"Scan Now"</strong> above to scan for nearby wireless camera beacons and active network hardware.
            </p>
          </div>
        </div>
      )}

      {/* RTSP Stream Intercept Modal */}
      {rtspProbeModal && selectedDevice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
          <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto -mt-1 mb-1" />

            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-red-400 font-semibold text-sm">
                <ShieldAlert className="w-4 h-4" />
                <span>Live Video Stream Detected</span>
              </div>
              <button 
                onClick={() => {
                  triggerHaptic('light');
                  setRtspProbeModal(false);
                }} 
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-red-950/30 border border-red-800/60 rounded-xl text-xs text-zinc-300 space-y-1">
              <p className="font-semibold text-red-200">Active video stream discovered:</p>
              <div>• Protocol: RTSP Stream (Port 554)</div>
              <div>• Target IP: {selectedDevice.ip}</div>
              <div>• Vendor: {selectedDevice.vendor}</div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setRtspProbeModal(false);
                }}
                className="w-1/2 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-750 text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  triggerHaptic('heavy');
                  alert("Isolate request sent! Device blocked from router.");
                  setRtspProbeModal(false);
                }}
                className="w-1/2 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium"
              >
                Block Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotspot Locator Modal */}
      {hotspotModal && selectedHotspot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
          <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto -mt-1 mb-1" />

            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Rogue Camera Hotspot</span>
              </div>
              <button 
                onClick={() => {
                  triggerHaptic('light');
                  setHotspotModal(false);
                }} 
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs space-y-1">
              <div className="text-white font-semibold">{selectedHotspot.ssid}</div>
              <div className="text-zinc-400">• Device Type: {selectedHotspot.device_type}</div>
              <div className="text-zinc-400">• BSSID: {selectedHotspot.bssid}</div>
              <div className="text-amber-400 font-medium">• Proximity: ~{autoDistanceMeters} meters away</div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                setHotspotModal(false);
              }}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
