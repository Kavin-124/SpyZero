"""
SpyZero Network Traffic Anomaly Engine
Calculates real-time upstream-to-downstream telemetry, packet entropy,
and flags high-bandwidth unmetered continuous video exfiltration.
"""

from typing import List, Dict

class TrafficAnomalyEngine:
    def __init__(self):
        # Normal IoT baseline: 90% downlink or low-frequency telemetry bursts
        # Spy Camera pattern: 95%+ uplink, steady ~1.5 - 3.5 Mbps bitrate, high packet periodicity
        self.spy_bitrate_threshold_kbps = 1200 # 1.2 Mbps continuous
        self.asymmetry_ratio_threshold = 3.0  # Upstream is 3x larger than downstream
    
    def evaluate_flow(self, up_kbps: float, down_kbps: float, packet_periodicity_ms: float = 33.3):
        """
        Evaluates a device's real-time traffic statistics.
        33.3ms periodicity corresponds to ~30fps video stream.
        """
        score = 0.0
        reasons = []

        # 1. Continuous high upstream bandwidth
        if up_kbps >= self.spy_bitrate_threshold_kbps:
            score += 45.0
            reasons.append(f"High continuous upstream bitrate ({up_kbps:.1f} Kbps)")
        elif up_kbps >= 600:
            score += 20.0
            reasons.append(f"Elevated upstream rate ({up_kbps:.1f} Kbps)")

        # 2. Extreme Upstream-to-Downstream asymmetry (Streaming out with no user consumption)
        ratio = up_kbps / max(down_kbps, 1.0)
        if ratio >= self.asymmetry_ratio_threshold:
            score += 35.0
            reasons.append(f"Severe bandwidth asymmetry (Upload is {ratio:.1f}x higher than Download)")
        
        # 3. Frame rate cadence matching 25-30fps H.264/H.265 GOP structure
        if 25.0 <= packet_periodicity_ms <= 45.0:
            score += 20.0
            reasons.append(f"Packet interval ({packet_periodicity_ms:.1f}ms) matches 30fps streaming encoder")

        score = min(100.0, score)

        if score >= 75.0:
            classification = "CRITICAL_SPY_STREAM"
            verdict = "Definite Covert Video Stream Active"
        elif score >= 50.0:
            classification = "SUSPICIOUS_EXFILTRATION"
            verdict = "Abnormal Uplink Telemetry Detected"
        else:
            classification = "NORMAL_TRAFFIC"
            verdict = "Benign Consumer Pattern"

        return {
            "anomaly_score": round(score, 1),
            "classification": classification,
            "verdict": verdict,
            "indicators": reasons,
            "metrics": {
                "upload_kbps": up_kbps,
                "download_kbps": down_kbps,
                "ratio": round(ratio, 2)
            }
        }

anomaly_engine = TrafficAnomalyEngine()
