import { registerPlugin, Capacitor } from '@capacitor/core';
import type { DeviceInfo } from '../types';

export interface RogueHotspot {
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

export interface BleDevice {
  id: string;
  name: string;
  type: string;
  rssi: number;
  distance: string;
  threat_level: 'SAFE' | 'WARNING' | 'CRITICAL';
  manufacturer: string;
  status: string;
}

export interface HardwareScannerPluginInterface {
  scanWifi(): Promise<{ status: string; networks: RogueHotspot[]; count: number; real_hardware?: boolean }>;
  scanBle(): Promise<{ status: string; devices: BleDevice[]; count: number; real_hardware?: boolean }>;
  scanSubnet(): Promise<{ status: string; devices: DeviceInfo[]; count: number; real_hardware?: boolean }>;
}

export const NativeHardwareScanner = registerPlugin<HardwareScannerPluginInterface>('HardwareScanner');

export const isNativeAndroid = () => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};
