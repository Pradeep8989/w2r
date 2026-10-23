import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Clock,
  Navigation,
  Info,
  CheckCircle2,
  Building2,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { storageService } from '../../services/storageService';
import { CollectionPoint } from '../../types';

export const CollectionPointsPage: React.FC = () => {
  const collectionPoints = storageService.getCollectionPoints();
  const materials = storageService.getMaterials();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterialFilter, setSelectedMaterialFilter] = useState<string>('all');
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint>(collectionPoints[0]);

  const filteredPoints = collectionPoints.filter((cp) => {
    const matchesSearch =
      cp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cp.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cp.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMaterial =
      selectedMaterialFilter === 'all' ||
      cp.acceptedMaterialIds.includes(selectedMaterialFilter);

    return matchesSearch && matchesMaterial;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Community Drop-off Depots &amp; Smart Chutes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Locate neighborhood automated recycling chutes and certified community collection hubs.
        </p>
      </div>

      {/* Honest Demo Disclaimer */}
      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-xs flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          <strong>Simulated Map &amp; Directory:</strong> Sample drop-off depots for demonstration.
          No external map API key is required.
        </span>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by locality, street address, or depot name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedMaterialFilter}
            onChange={(e) => setSelectedMaterialFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700"
          >
            <option value="all">All Material Types</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Depot Cards List */}
        <div className="lg:col-span-7 space-y-4">
          {filteredPoints.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
              No drop-off depots match your search criteria.
            </div>
          ) : (
            filteredPoints.map((cp) => {
              const isSelected = selectedPoint?.id === cp.id;
              return (
                <div
                  key={cp.id}
                  onClick={() => setSelectedPoint(cp)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/60 border-[#166534] ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {cp.name}
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                          {cp.locality}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{cp.address}</span>
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      ~{cp.distanceKm} km
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 block mb-0.5">
                      Drop-off Instructions:
                    </span>
                    {cp.dropoffInstructions}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cp.openingHours}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {cp.acceptedMaterialIds.map((matId) => (
                        <MaterialTag key={matId} categoryId={matId} categoryName={matId.replace('_', ' ')} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Schematic Interactive Map Placeholder */}
        <div className="lg:col-span-5">
          <Card className="sticky top-24 overflow-hidden">
            <CardHeader
              title="Locality Depot Radar"
              subtitle="Schematic overview of neighborhood drop-off points"
            />
            {/* Interactive Schematic Radar Map */}
            <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-emerald-950 p-6 min-h-[340px] flex flex-col justify-between text-white">
              {/* Radar Grid Circles */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-64 h-64 border border-emerald-400 rounded-full" />
                <div className="w-48 h-48 border border-emerald-400 rounded-full" />
                <div className="w-32 h-32 border border-emerald-400 rounded-full" />
                <div className="w-16 h-16 border border-emerald-400 rounded-full" />
              </div>

              {/* User Location Center Node */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>You: 42 Pine Crest Ave</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-300">
                  <Compass className="w-3.5 h-3.5 animate-spin" /> Radius: 5 km
                </div>
              </div>

              {/* Interactive Station Nodes */}
              <div className="relative z-10 grid grid-cols-2 gap-4 py-8">
                {collectionPoints.map((cp, idx) => {
                  const isSelected = selectedPoint?.id === cp.id;
                  return (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => setSelectedPoint(cp)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer backdrop-blur-md ${
                        isSelected
                          ? 'bg-emerald-500/30 border-emerald-400 ring-2 ring-emerald-400/50 scale-105'
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-white truncate">{cp.name}</span>
                        <span className="text-emerald-400 text-[10px]">{cp.distanceKm}km</span>
                      </div>
                      <span className="text-[10px] text-slate-300 block truncate">{cp.locality}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Point Summary Card */}
              {selectedPoint && (
                <div className="relative z-10 bg-white text-slate-900 p-4 rounded-xl shadow-lg border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#166534]">{selectedPoint.name}</span>
                    <span className="text-[10px] text-slate-400">~{selectedPoint.distanceKm} km away</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-2">{selectedPoint.address}</p>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{selectedPoint.openingHours}</span>
                    <span className="text-emerald-700 font-semibold">Open Now</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
