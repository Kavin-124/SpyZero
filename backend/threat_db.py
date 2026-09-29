"""
SpyZero IoT Threat Signature Registry & Hardware OUI Database
Maintains known spy-cam chip manufacturers, RTSP endpoints, and threat severity models.
"""

# Known OUI prefixes and chipset vendors commonly used in covert IP cameras
SPY_CAM_VENDORS = {
    # Tuya Smart & OEM white-label covert cameras (LookCam, CamHi, HDMiniCam)
    "D8:1F:12": {"vendor": "Tuya Smart Inc.", "threat_level": "CRITICAL", "category": "Covert IP Cam Module", "notes": "Widely used in wall clock & smoke detector spy cams"},
    "10:D5:61": {"vendor": "Tuya Smart Inc.", "threat_level": "CRITICAL", "category": "Smart IoT Micro-Camera", "notes": "Hidden module with cloud P2P stream"},
    "70:89:76": {"vendor": "Tuya Smart Inc.", "threat_level": "HIGH", "category": "Pinhole Streamer", "notes": "Continuous UDP stream to Tuya P2P servers"},
    
    # Anyka Microelectronics (Used in 40%+ cheap e-commerce spy cameras)
    "00:12:12": {"vendor": "Anyka (Guangzhou) Microelectronics", "threat_level": "CRITICAL", "category": "Anyka Hidden Cam Core", "notes": "Ultra-low power covert H.264 encoder"},
    "38:01:46": {"vendor": "Anyka Technologies", "threat_level": "CRITICAL", "category": "Mini Wi-Fi Spy Module", "notes": "Found in USB charger & night-light spy cams"},
    
    # Novatek Microelectronics (Hidden dashcams, pen cams, spy glasses)
    "00:0B:2F": {"vendor": "Novatek Microelectronics", "threat_level": "HIGH", "category": "Novatek DSP Camera", "notes": "High definition miniature covert encoder"},
    
    # Hangzhou Xiongmai Technology (XM / Xiongmai - notorious for vulnerable backdoor cameras)
    "00:12:15": {"vendor": "Xiongmai Technology (XM)", "threat_level": "CRITICAL", "category": "XM Pinhole Streamer", "notes": "Runs backdoor RTSP on port 554 & 34567"},
    "00:12:16": {"vendor": "Xiongmai Technology (XM)", "threat_level": "CRITICAL", "category": "XM Pinhole Streamer", "notes": "Known surveillance streaming firmware"},
    
    # Espressif Systems (ESP32-CAM DIY covert bugs)
    "24:6F:28": {"vendor": "Espressif Inc.", "threat_level": "HIGH", "category": "ESP32-CAM Micro-Node", "notes": "DIY miniature video/audio transmitter"},
    "30:AE:A4": {"vendor": "Espressif Inc.", "threat_level": "HIGH", "category": "ESP32-CAM Micro-Node", "notes": "Commonly hidden in power outlets and toys"},
    "A4:CF:12": {"vendor": "Espressif Inc.", "threat_level": "HIGH", "category": "ESP8266/32 Audio Bug", "notes": "Covert Wi-Fi microphone or burst logger"},
    
    # Ingenic Semiconductor (Ultra-compact spy modules)
    "9C:A5:25": {"vendor": "Ingenic Semiconductor", "threat_level": "HIGH", "category": "T31 Mini Camera SoC", "notes": "Runs low-power covert video daemon"},
    
    # Allwinner Technology (Mini hidden DVRs)
    "B0:F1:EC": {"vendor": "Allwinner Technology", "threat_level": "HIGH", "category": "V3S Spy Cam Board", "notes": "Miniature Linux DVR inside clocks and frames"},
    
    # Hikvision / Dahua OEM white-labels (Unmarked surveillance bugs)
    "44:19:B6": {"vendor": "Hangzhou Hikvision Digital", "threat_level": "MEDIUM", "category": "Commercial Surveillance", "notes": "Possible hidden ceiling pinhole or dome"},
    "3C:EF:8C": {"vendor": "Dahua Technology", "threat_level": "MEDIUM", "category": "Commercial Surveillance", "notes": "Hidden CCTV endpoint"},
}

# Standard streaming ports inspected for covert audio/video exfiltration
SUSPICIOUS_PORTS = {
    554: {"protocol": "RTSP", "risk": "CRITICAL", "desc": "Real-Time Streaming Protocol (Raw Video Stream)"},
    8554: {"protocol": "RTSP-ALT", "risk": "HIGH", "desc": "Alternative RTSP Port for Mini Hidden Cameras"},
    8080: {"protocol": "HTTP-MJPEG", "risk": "MEDIUM", "desc": "Browser-accessible live camera web stream"},
    1935: {"protocol": "RTMP", "risk": "HIGH", "desc": "Real-Time Messaging Protocol (Continuous Live Broadcast)"},
    34567: {"protocol": "XM-NET", "risk": "CRITICAL", "desc": "Xiongmai proprietary DVR surveillance media port"},
    37777: {"protocol": "DAHUA-MEDIA", "risk": "HIGH", "desc": "Dahua surveillance private protocol"},
    5000: {"protocol": "UPNP/SSDP", "risk": "LOW", "desc": "Discovery beacon port"},
}

# Common default RTSP URI paths tested during probe
COMMON_RTSP_PATHS = [
    "/live/ch0",
    "/onvif1",
    "/ch0_0.h264",
    "/11",
    "/mjpeg/1",
    "/video1",
    "/stream1",
    "/h264Preview_01_main"
]

def lookup_mac_vendor(mac_address: str):
    """
    Normalizes MAC and looks up vendor intelligence against the spy threat database.
    """
    clean_mac = mac_address.upper().replace("-", ":")
    prefix = ":".join(clean_mac.split(":")[:3]) if len(clean_mac.split(":")) >= 3 else ""
    
    if prefix in SPY_CAM_VENDORS:
        info = SPY_CAM_VENDORS[prefix]
        return {
            "matched": True,
            "mac_prefix": prefix,
            "vendor": info["vendor"],
            "category": info["category"],
            "threat_level": info["threat_level"],
            "notes": info["notes"]
        }
    
    # Generic benign check
    return {
        "matched": False,
        "mac_prefix": prefix,
        "vendor": "Generic / Standard Device",
        "category": "Unknown Consumer Electronic",
        "threat_level": "SAFE",
        "notes": "No known covert spy chip signatures in registry"
    }
