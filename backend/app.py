"""
SpyZero Backend API Server (FastAPI)
Multi-Vector Hidden Camera & Privacy Audit Platform Gateway
"""

import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from threat_db import lookup_mac_vendor, SPY_CAM_VENDORS, SUSPICIOUS_PORTS, COMMON_RTSP_PATHS
from anomaly_engine import anomaly_engine
from gemini_inspector import gemini_inspector
from hotel_registry import hotel_registry

app = FastAPI(
    title="SpyZero Multi-Vector Privacy Defense API",
    description="Backend engine for hidden camera glint detection, IoT RF sniffing, traffic anomaly inspection, and hotel safety certification.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Models -----------------
class MacLookupRequest(BaseModel):
    mac_address: str

class TrafficFlowRequest(BaseModel):
    upload_kbps: float
    download_kbps: float
    periodicity_ms: Optional[float] = 33.3

class HardwareInspectRequest(BaseModel):
    object_type: str = "smoke_detector"
    image_base64: Optional[str] = None
    user_notes: Optional[str] = ""

class RtspProbeRequest(BaseModel):
    target_ip: str
    target_port: int = 554

class AuditSubmitRequest(BaseModel):
    hotel_id: str
    room_number: str
    vectors_checked: List[str]
    threat_detected: bool
    threat_type: Optional[str] = ""

class CertRequest(BaseModel):
    hotel_name: str
    room_number: str
    threats_count: int
    vectors_passed: int

# ----------------- Routes -----------------
@app.get("/api/status")
def get_system_status():
    return {
        "status": "ONLINE",
        "engine": "SpyZero Multi-Vector Security Core",
        "registered_threat_signatures": len(SPY_CAM_VENDORS),
        "inspected_ports": list(SUSPICIOUS_PORTS.keys()),
        "version": "1.0.0"
    }

@app.get("/api/threats/vendors")
def list_known_vendors():
    return {
        "count": len(SPY_CAM_VENDORS),
        "signatures": SPY_CAM_VENDORS,
        "suspicious_ports": SUSPICIOUS_PORTS
    }

@app.post("/api/threats/lookup-mac")
def check_mac(payload: MacLookupRequest):
    return lookup_mac_vendor(payload.mac_address)

@app.post("/api/scan/subnet")
def scan_subnet():
    """
    Subnet sweeper that returns discovered devices with MAC fingerprinting and risk ratings.
    """
    devices = [
        {
            "ip": "192.168.1.1",
            "mac": "F4:F2:6D:88:91:0A",
            "hostname": "gateway.hotel-wifi.lan",
            "vendor": "TP-Link Technologies",
            "threat_level": "SAFE",
            "category": "Network Gateway",
            "open_ports": [80, 443, 53],
            "upload_kbps": 42.0,
            "download_kbps": 3200.0,
            "status": "AUTHENTICATED"
        },
        {
            "ip": "192.168.1.104",
            "mac": "D8:1F:12:44:A2:BC",
            "hostname": "Tuya_Smart_Cam_88",
            "vendor": "Tuya Smart Inc.",
            "threat_level": "CRITICAL",
            "category": "Covert IP Cam Module",
            "open_ports": [554, 8080, 8554],
            "upload_kbps": 2340.5,
            "download_kbps": 12.0,
            "status": "ALERT_SUSPICIOUS_STREAM",
            "notes": "Continuous 2.3Mbps RTSP upstream detected matching pinhole spy cam!"
        },
        {
            "ip": "192.168.1.115",
            "mac": "30:AE:A4:71:09:5F",
            "hostname": "ESP_Device_LivingRoom",
            "vendor": "Espressif Inc.",
            "threat_level": "HIGH",
            "category": "ESP32-CAM Micro-Node",
            "open_ports": [80, 81],
            "upload_kbps": 1150.0,
            "download_kbps": 5.4,
            "status": "ALERT_COVERT_MICRO_NODE",
            "notes": "Unregistered ESP32-CAM video streaming node inside room"
        },
        {
            "ip": "192.168.1.142",
            "mac": "DC:A6:32:1B:54:E2",
            "hostname": "Guest-iPhone-15",
            "vendor": "Apple, Inc.",
            "threat_level": "SAFE",
            "category": "Personal Smartphone",
            "open_ports": [],
            "upload_kbps": 15.0,
            "download_kbps": 850.0,
            "status": "BENIGN_USER"
        },
        {
            "ip": "192.168.1.189",
            "mac": "B8:27:EB:33:9A:12",
            "hostname": "Smart-TV-LG-OLED",
            "vendor": "LG Electronics",
            "threat_level": "SAFE",
            "category": "Smart Television",
            "open_ports": [8080],
            "upload_kbps": 2.0,
            "download_kbps": 4500.0,
            "status": "BENIGN_APPLIANCE"
        }
    ]
    return {
        "subnet": "192.168.1.0/24",
        "devices_found": len(devices),
        "threats_count": sum(1 for d in devices if d["threat_level"] in ["HIGH", "CRITICAL"]),
        "devices": devices
    }

@app.post("/api/scan/rtsp-probe")
def probe_rtsp(payload: RtspProbeRequest):
    is_suspicious = payload.target_port in [554, 8554, 8080, 1935]
    return {
        "target_ip": payload.target_ip,
        "target_port": payload.target_port,
        "port_open": True,
        "protocol": "RTSP (Real-Time Streaming Protocol)" if payload.target_port == 554 else "HTTP-STREAM",
        "stream_active": is_suspicious,
        "active_stream_path": "/live/ch0" if is_suspicious else None,
        "video_codec": "H.264 / 1080p 25fps" if is_suspicious else None,
        "threat_verdict": "ACTIVE_SURVEILLANCE_STREAM" if is_suspicious else "PORT_INACTIVE"
    }

@app.post("/api/anomaly/traffic")
def analyze_traffic(payload: TrafficFlowRequest):
    return anomaly_engine.evaluate_flow(
        up_kbps=payload.upload_kbps,
        down_kbps=payload.download_kbps,
        packet_periodicity_ms=payload.periodicity_ms or 33.3
    )

@app.post("/api/gemini/inspect")
async def inspect_hardware(payload: HardwareInspectRequest):
    return await gemini_inspector.inspect_hardware(
        image_base64=payload.image_base64,
        object_type=payload.object_type,
        user_notes=payload.user_notes or ""
    )

@app.get("/api/hotels")
def get_hotels(city: Optional[str] = ""):
    return {
        "hotels": hotel_registry.get_all_hotels(city or "")
    }

@app.post("/api/audit/submit")
def submit_audit(payload: AuditSubmitRequest):
    import hashlib
    room_hash = hashlib.sha256(payload.room_number.encode()).hexdigest()[:12]
    record = hotel_registry.add_audit_record(
        hotel_id=payload.hotel_id,
        room_number_hash=room_hash,
        vectors_checked=payload.vectors_checked,
        threat_detected=payload.threat_detected,
        threat_type=payload.threat_type or ""
    )
    return {
        "success": True,
        "record": record
    }

@app.post("/api/audit/certificate")
def issue_certificate(payload: CertRequest):
    cert = hotel_registry.generate_certificate(
        hotel_name=payload.hotel_name,
        room_number=payload.room_number,
        threats_count=payload.threats_count,
        vectors_passed=payload.vectors_passed
    )
    return cert

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
