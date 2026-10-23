import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  Calendar,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MaterialTag } from '../../components/waste/MaterialTag';
import { EmptyState } from '../../components/ui/EmptyState';
import { storageService } from '../../services/storageService';
import { WasteListing, WasteListingStatus } from '../../types';

export const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'draft'>('all');

  const loadListings = () => {
    setListings(storageService.getListings());
  };

  useEffect(() => {
    loadListings();
    const handleUpdate = () => loadListings();
    window.addEventListener('wtr_data_changed', handleUpdate);
    return () => window.removeEventListener('wtr_data_changed', handleUpdate);
  }, []);

  const filteredListings = listings.filter((item) => {
    // Search
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.materials.some((m) => m.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Filter
    if (statusFilter === 'active') {
      return ['awaiting_recycler', 'recycler_accepted', 'pickup_scheduled', 'collected', 'weight_verified'].includes(item.status);
    }
    if (statusFilter === 'completed') {
      return item.status === 'recovery_confirmed';
    }
    if (statusFilter === 'draft') {
      return item.status === 'draft';
    }
    return true;
  });

  const getNextActionText = (status: WasteListingStatus) => {
    switch (status) {
      case 'draft':
        return 'Review & Submit';
      case 'awaiting_recycler':
        return 'Awaiting Partner Match';
      case 'recycler_accepted':
        return 'Confirm Window';
      case 'pickup_scheduled':
        return 'Prepare Batch for Driver';
      case 'collected':
        return 'Facility Weighment in Progress';
      case 'weight_verified':
        return 'Inspect Final Certificate';
      case 'recovery_confirmed':
        return 'View Points & Impact';
      case 'cancelled':
        return 'Archived';
      default:
        return 'View Details';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Waste Recovery Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track materials from doorstep pickup through certified weight verification and circular recovery.
          </p>
        </div>

        <Link to="/customer/scan">
          <Button size="md" leftIcon={<Plus className="w-4 h-4" />}>
            New Waste Scan
          </Button>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by ID, material, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              statusFilter === 'all'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Listings ({listings.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              statusFilter === 'active'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            In-Progress
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              statusFilter === 'completed'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Recovered &amp; Certified
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              statusFilter === 'draft'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Drafts
          </button>
        </div>
      </div>

      {/* Listings Table / Cards */}
      {filteredListings.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No listings found"
          description="You do not have any waste listings matching your search or active filter."
          actionText="Start New Waste Scan"
          onAction={() => navigate('/customer/scan')}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Listing ID &amp; Title</th>
                  <th className="px-5 py-3.5">Material Stream</th>
                  <th className="px-5 py-3.5">Quantity (kg)</th>
                  <th className="px-5 py-3.5">Indicative Value</th>
                  <th className="px-5 py-3.5">Current Status</th>
                  <th className="px-5 py-3.5">Next Step</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/customer/listings/${listing.id}`)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={listing.photoUrl || '/samples/plastic_bottles.jpg'}
                          alt={listing.title}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block group-hover:text-[#166534] transition-colors">
                            {listing.title}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {listing.id} &bull; {new Date(listing.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {listing.materials.map((m, i) => (
                          <MaterialTag
                            key={i}
                            categoryId={m.categoryId}
                            categoryName={m.categoryName}
                            size="sm"
                          />
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {listing.verifiedWeightKg ? (
                        <span className="text-emerald-700 font-bold">
                          {listing.verifiedWeightKg} kg
                          <span className="text-[10px] text-emerald-600 font-normal block">
                            (certified)
                          </span>
                        </span>
                      ) : (
                        <span>
                          ~{listing.materials.reduce((a, b) => a + b.estimatedQuantity, 0)} kg
                          <span className="text-[10px] text-slate-400 font-normal block">
                            (estimated)
                          </span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {listing.finalIndicativeValue ? (
                        <span className="text-emerald-700 font-bold">
                          ${listing.finalIndicativeValue.toFixed(2)}
                        </span>
                      ) : (
                        <span>
                          ${listing.estimatedValueMin.toFixed(2)} - ${listing.estimatedValueMax.toFixed(2)}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <Badge status={listing.status}>
                        {listing.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <span className="text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                        {getNextActionText(listing.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/listings/${listing.id}`);
                        }}
                      >
                        Track
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
