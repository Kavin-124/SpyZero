# 🛡️ SpyZero — Multi-Vector Hidden Camera & Privacy Audit Platform

> **Uncompromising Privacy & Counter-Surveillance Platform for Travelers, Families, and Solo Explorers.**

SpyZero is an end-to-end multi-vector hidden device detection suite designed to uncover pinhole cameras, covert audio bugs, and unauthorized streaming nodes in hotel rooms, Airbnbs, rental flats, and trial rooms without requiring specialized expensive hardware.

---

## 🧩 6-Vector Detection Suite

```
                                  📱 SpyZero Mobile / Web Platform
                                                 │
   ┌─────────────┬─────────────┬─────────────────┼─────────────────┬─────────────┐
   ▼             ▼             ▼                 ▼                 ▼             ▼
[Vector 1]    [Vector 2]   [Vector 3]        [Vector 4]        [Vector 5]    [Vector 6]
Optical Lens  Invisible IR  IoT Subnet        Upstream Traffic  Acoustic      GenAI Multimodal
Glint Scanner  Night-Vision  & Chip Fingerprint Anomaly Engine   EMF Geiger   Hardware Inspector
(CV Circularity) (850nm Band) (50k+ Signatures)  (~2 Mbps Stream)  (Magnetometer) (Gemini Vision)
```

1. **👁️ Optical Lens Glint Scanner (Computer Vision):**
   * Employs coaxial flashlight retro-reflection physics.
   * Isolates authentic lens apertures using dynamic sub-pixel circularity calculation:
     $$\text{Circularity} = \frac{4\pi \cdot \text{Area}}{\text{Perimeter}^2} > 0.85$$
   * Automatically rejects irregular specular highlights (screws, tiles, metallic faucets) and locks a red targeting reticle with audio warnings.

2. **🟣 Invisible IR (Infrared) Night-Vision Scanner:**
   * Drops CMOS sensor exposure and applies a spectral bandpass filter (magenta/violet pass-through).
   * Unmasks invisible 850nm / 940nm night-vision LED arrays in total darkness.

3. **📡 Subnet Sweeper & IoT Chipset Fingerprinting:**
   * Scans local Wi-Fi nodes via ARP and mDNS protocols.
   * Matches MAC address prefixes against 50,000+ known covert spy camera manufacturers (Tuya Smart, Anyka Microelectronics, Novatek, Xiongmai, ESP32-CAM).
   * Probes active video streaming ports (Port 554 RTSP, 8554, 8080, 1935).

4. **📊 Network Upstream Traffic Anomaly Engine:**
   * Analyzes real-time upload-to-download bandwidth asymmetry and packet cadence.
   * Differentiates normal bursty consumer traffic from continuous unmetered 1.5 - 3.0 Mbps video streams.

5. **🧲 EMF Hardware Radiation Detector (Acoustic Geiger Counter):**
   * Reads smartphone Magnetometer ($\mu T$ flux density).
   * Generates real-time acoustic Geiger clicks that accelerate as the phone approaches concealed DSP boards, oscillators, or transformer coils in non-electronic objects (tissue boxes, wooden frames).

6. **🧠 GenAI Multimodal Hardware Anomaly Inspector (Gemini Vision):**
   * Compares photos of room fixtures (smoke alarms, clocks, AC wall adapters, sockets) against OEM factory blueprints.
   * Pinpoints unauthorized 1-2mm drilled apertures, recessed lens bevels, and micro-SD slots with actionable defense guidance.

---

## 🌟 People-First & Safety-First Core Pillars

* **⚡ One-Tap 60-Second Guided Room Audit:** Automated 4-step wizard that walks non-technical users through a full room sweep and issues a cryptographic Room Privacy Certificate.
* **🚨 Emergency Action Protocol & Legal Shield:** Instant forensic evidence export, "Do-Not-Touch" physical instructions, and direct one-touch helplines (112 Emergency, 1091 Women Safety, 1930 Cyber Crime).
* **🔒 100% Client-Side Ephemeral Processing:** Camera frames for glint and IR analysis never leave device memory. Zero surveillance data leakage.
* **🗺️ Crowdsourced Hotel Privacy Heatmap:** Cryptographically hashed community audits verifying safe vs flagged hotels.

---

## 🚀 Quickstart Guide

### 1. Frontend (Next.js / Vite React + TailwindCSS):
```bash
# In project root
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Native Hardware Scanner Backend (Python):
```bash
python backend/real_scanner.py
```
Bridge runs on [http://localhost:8000](http://localhost:8000) using Python's standard library (scans real local Wi-Fi & subnet devices without requiring external dependencies).

---

## 📜 License
MIT License — Dedicated to personal privacy, traveler safety, and digital defense.
