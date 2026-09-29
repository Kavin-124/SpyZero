import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Search, 
  Award, 
  Clock, 
  FileCheck,
  ChevronLeft,
  X
} from 'lucide-react';
import type { HotelData } from '../types';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

const INITIAL_HOTELS: HotelData[] = [
  {
    id: "htl-001",
    name: "Grand Bay Marina Hotel",
    city: "Chennai",
    area: "ECR Beach Road",
    safety_score: 98.5,
    certified: true,
    total_audits: 142,
    threats_found: 0,
    last_sweep: "2026-09-25",
    status: "VERIFIED_SAFE",
    verified_by: "SpyZero Community Mesh"
  },
  {
    id: "htl-002",
    name: "Silicon Skyline Suites",
    city: "Bangalore",
    area: "Indiranagar",
    safety_score: 96.0,
    certified: true,
    total_audits: 218,
    threats_found: 0,
    last_sweep: "2026-09-27",
    status: "VERIFIED_SAFE",
    verified_by: "Independent Audit"
  },
  {
    id: "htl-003",
    name: "Cozy Palms Coastal Homestay",
    city: "Goa",
    area: "Calangute",
    safety_score: 54.2,
    certified: false,
    total_audits: 39,
    threats_found: 3,
    last_sweep: "2026-09-22",
    status: "AUDIT_FLAGGED",
    verified_by: "Anonymous Guest Alert"
  },
  {
    id: "htl-004",
    name: "Heritage Palace Residency",
    city: "Jaipur",
    area: "Civil Lines",
    safety_score: 99.1,
    certified: true,
    total_audits: 87,
    threats_found: 0,
    last_sweep: "2026-09-28",
    status: "VERIFIED_SAFE",
    verified_by: "SpyZero Certified Shield"
  },
  {
    id: "htl-005",
    name: "Metro Central Budget Inn",
    city: "Mumbai",
    area: "Andheri East",
    safety_score: 72.8,
    certified: false,
    total_audits: 64,
    threats_found: 1,
    last_sweep: "2026-09-26",
    status: "UNDER_REVIEW",
    verified_by: "Community Report"
  }
];

interface HotelHeatmapProps {
  onBack?: () => void;
}

export const HotelHeatmap: React.FC<HotelHeatmapProps> = ({ onBack }) => {
  const [hotels] = useState<HotelData[]>(INITIAL_HOTELS);
  const [searchCity, setSearchCity] = useState<string>('');
  const [filterCertified, setFilterCertified] = useState<boolean>(false);
  const [selectedCertHotel, setSelectedCertHotel] = useState<HotelData | null>(null);

  const filtered = hotels.filter((h) => {
    const matchCity = searchCity === '' || h.city.toLowerCase().includes(searchCity.toLowerCase()) || h.name.toLowerCase().includes(searchCity.toLowerCase());
    const matchCert = !filterCertified || h.certified;
    return matchCity && matchCert;
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 max-w-md mx-auto text-zinc-100">
      
      {/* Header */}
      <div className="pb-3 border-b border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {onBack && (
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onBack();
                }}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white mr-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 text-blue-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Hotel Privacy Directory
              </h2>
              <span className="text-[10px] text-zinc-400 block -mt-0.5">
                Verified room audit logs and safety ratings
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex space-x-1.5 pt-1">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search city or hotel..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl pl-8 pr-2.5 py-1.5 outline-none focus:border-zinc-600"
            />
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              setFilterCertified(!filterCertified);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center space-x-1 transition active:scale-95 ${
              filterCertified 
                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-400'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Certified</span>
          </button>
        </div>
      </div>

      {/* Hotel Cards List */}
      <div className="space-y-2">
        {filtered.map((hotel) => {
          const isSafe = hotel.safety_score > 90;
          const isFlagged = hotel.threats_found > 0;

          return (
            <div
              key={hotel.id}
              className={`p-3 bg-zinc-950 border rounded-xl space-y-2 transition ${
                isFlagged 
                  ? 'border-red-800/80 bg-red-950/20' 
                  : isSafe 
                  ? 'border-zinc-800' 
                  : 'border-amber-800/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-xs text-white leading-tight">{hotel.name}</h3>
                  <div className="flex items-center space-x-1 text-[10px] text-zinc-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    <span>{hotel.area}, {hotel.city}</span>
                  </div>
                </div>

                <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                  isFlagged 
                    ? 'bg-red-950 text-red-300 border border-red-800' 
                    : isSafe 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {hotel.safety_score}% Safe
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-[10px] text-zinc-400">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Swept: {hotel.last_sweep}</span>
                </div>

                <button
                  onClick={() => {
                    triggerHaptic('light');
                    soundFx.playRadarPing();
                    setSelectedCertHotel(hotel);
                  }}
                  className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
                >
                  <FileCheck className="w-3 h-3" />
                  <span>View Log</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificate Modal */}
      {selectedCertHotel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
          <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 space-y-3 shadow-xl animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto -mt-1 mb-1" />

            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Verified Audit Certificate</span>
              </div>
              <button 
                onClick={() => setSelectedCertHotel(null)} 
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Property:</span>
                <span className="text-white font-medium">{selectedCertHotel.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Location:</span>
                <span className="text-zinc-200">{selectedCertHotel.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Audits:</span>
                <span className="text-emerald-400 font-medium">{selectedCertHotel.total_audits} Sweeps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Issuer:</span>
                <span className="text-zinc-300">{selectedCertHotel.verified_by}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedCertHotel(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
