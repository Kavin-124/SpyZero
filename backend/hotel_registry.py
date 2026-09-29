"""
SpyZero Crowdsourced Hotel Privacy Registry & Audit Heatmap
Stores anonymous room safety reports and computes trust ratings for hotels.
"""

from typing import List, Dict
import datetime
import hashlib

# Verified hotel registry seed data
INITIAL_HOTELS = [
    {
        "id": "htl-001",
        "name": "Grand Bay Marina Hotel",
        "city": "Chennai",
        "area": "ECR Beach Road",
        "safety_score": 98.5,
        "certified": True,
        "total_audits": 142,
        "threats_found": 0,
        "last_sweep": "2026-09-25",
        "status": "VERIFIED_SAFE",
        "verified_by": "SpyZero Community Mesh"
    },
    {
        "id": "htl-002",
        "name": "Silicon Skyline Suites",
        "city": "Bangalore",
        "area": "Indiranagar",
        "safety_score": 96.0,
        "certified": True,
        "total_audits": 218,
        "threats_found": 0,
        "last_sweep": "2026-09-27",
        "status": "VERIFIED_SAFE",
        "verified_by": "Independent Audit"
    },
    {
        "id": "htl-003",
        "name": "Cozy Palms Coastal Homestay",
        "city": "Goa",
        "area": "Calangute",
        "safety_score": 54.2,
        "certified": False,
        "total_audits": 39,
        "threats_found": 3,
        "last_sweep": "2026-09-22",
        "status": "AUDIT_FLAGGED",
        "verified_by": "Anonymous Guest Alert"
    },
    {
        "id": "htl-004",
        "name": "Heritage Palace Residency",
        "city": "Jaipur",
        "area": "Civil Lines",
        "safety_score": 99.1,
        "certified": True,
        "total_audits": 87,
        "threats_found": 0,
        "last_sweep": "2026-09-28",
        "status": "VERIFIED_SAFE",
        "verified_by": "SpyZero Certified Shield"
    },
    {
        "id": "htl-005",
        "name": "Metro Central Budget Inn",
        "city": "Mumbai",
        "area": "Andheri East",
        "safety_score": 72.8,
        "certified": False,
        "total_audits": 64,
        "threats_found": 1,
        "last_sweep": "2026-09-26",
        "status": "UNDER_REVIEW",
        "verified_by": "Community Report"
    }
]

class HotelRegistry:
    def __init__(self):
        self.hotels = {h["id"]: h for h in INITIAL_HOTELS}
        self.audit_records: List[Dict] = []

    def get_all_hotels(self, city: str = ""):
        results = list(self.hotels.values())
        if city:
            results = [h for h in results if h["city"].lower() == city.lower()]
        return results

    def add_audit_record(self, hotel_id: str, room_number_hash: str, vectors_checked: list, threat_detected: bool, threat_type: str = ""):
        audit_id = f"AUD-{hashlib.sha256(f'{hotel_id}-{datetime.datetime.utcnow()}'.encode()).hexdigest()[:10].upper()}"
        
        record = {
            "audit_id": audit_id,
            "hotel_id": hotel_id,
            "room_hash": room_number_hash,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "vectors_checked": vectors_checked,
            "threat_detected": threat_detected,
            "threat_type": threat_type,
            "status": "CLEARED" if not threat_detected else "THREAT_FOUND"
        }
        self.audit_records.append(record)

        # Update hotel aggregate score if hotel exists
        if hotel_id in self.hotels:
            htl = self.hotels[hotel_id]
            htl["total_audits"] += 1
            if threat_detected:
                htl["threats_found"] += 1
                htl["safety_score"] = max(20.0, htl["safety_score"] - 15.0)
                htl["certified"] = False
                htl["status"] = "AUDIT_FLAGGED"
            else:
                htl["safety_score"] = min(99.9, htl["safety_score"] + 0.5)
            htl["last_sweep"] = datetime.date.today().isoformat()

        return record

    def generate_certificate(self, hotel_name: str, room_number: str, threats_count: int, vectors_passed: int):
        timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%SZ")
        raw_seed = f"{hotel_name}-{room_number}-{timestamp}-{threats_count}"
        cert_hash = hashlib.sha256(raw_seed.encode()).hexdigest().upper()
        
        return {
            "certificate_id": f"SZ-CERT-{cert_hash[:12]}",
            "hotel_name": hotel_name,
            "room_id": f"Room #{room_number}",
            "verified_at": timestamp,
            "overall_status": "CERTIFIED PRIVACY SAFE" if threats_count == 0 else "SECURITY AUDIT FAILED",
            "vectors_verified": f"{vectors_passed}/6 Multi-Vector Checks Cleared",
            "cryptographic_fingerprint": cert_hash[:32],
            "issuer": "SpyZero Distributed Privacy Network"
        }

hotel_registry = HotelRegistry()
