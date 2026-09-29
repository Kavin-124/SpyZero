export type SecurityStatus = 'SAFE' | 'CAUTION' | 'COMPROMISED';

export interface DeviceInfo {
  ip: string;
  mac: string;
  hostname: string;
  vendor: string;
  threat_level: 'SAFE' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  open_ports: number[];
  upload_kbps: number;
  download_kbps: number;
  status: string;
  notes?: string;
}

export interface GlintDetection {
  x: number;
  y: number;
  radius: number;
  circularity: number;
  confidence: number;
  threatType: 'Pinhole Camera Lens' | 'IR Emitter Array' | 'Benign Reflection';
}

export interface HardwareInspectionResult {
  source: string;
  device_class: string;
  oem_standard_baseline: string;
  anomaly_detected: boolean;
  threat_probability_percent: number;
  anomaly_analysis: string;
  forensic_indicators: string[];
  actionable_recommendations: string;
  evidence_hash: string;
}

export interface HotelData {
  id: string;
  name: string;
  city: string;
  area: string;
  safety_score: number;
  certified: boolean;
  total_audits: number;
  threats_found: number;
  last_sweep: string;
  status: 'VERIFIED_SAFE' | 'AUDIT_FLAGGED' | 'UNDER_REVIEW';
  verified_by: string;
}

export interface PrivacyCertificate {
  certificate_id: string;
  hotel_name: string;
  room_id: string;
  verified_at: string;
  overall_status: string;
  vectors_verified: string;
  cryptographic_fingerprint: string;
  issuer: string;
}
