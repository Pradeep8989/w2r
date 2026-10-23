import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  Scale,
  ShieldCheck,
  TrendingUp,
  TestTube2,
  DollarSign,
  Users,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { storageService } from '../../services/storageService';
import { evaluationService } from '../../services/evaluationService';
import { impactService } from '../../services/impactService';
import { WasteListing, RecyclerPartner } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AdminOverviewPage: React.FC = () => {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [recyclers, setRecyclers] = useState<RecyclerPartner[]>([]);

  const loadData = () => {
    setListings(storageService.getListings());
    setRecyclers(storageService.getRecyclers());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('wtr_data_changed', handleUpdate);
    return () => window.removeEventListener('wtr_data_changed', handleUpdate);
  }, []);

  const evalSummary = evaluationService.getSummary();
  const impact = impactService.calculateImpact();

  const activePickups = listings.filter((l) =>
    ['awaiting_recycler', 'recycler_accepted', 'pickup_scheduled', 'collected'].includes(l.status)
  );

  // Status distribution
  const statusCounts: Record<string, number> = {};
  listings.forEach((l) => {
    statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
  });

  const statusChartData = Object.entries(statusCounts).map(([k, v]) => ({
    name: k.replace(/_/g, ' '),
    count: v,
  }));

  const COLORS = ['#166534', '#0284c7', '#b45309', '#7c3aed', '#f59e0b', '#059669', '#dc2626'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            System Administration &amp; Telemetry
          </h1>
          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full uppercase">
            Admin Console
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time oversight of network listings, collection partner throughput, and machine learning classification benchmarks.
        </p>
      </div>

      {/* Honest Demo Disclaimer */}
      <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Simulated Demo Environment:</strong> Metrics and records reflect local in-browser storage transactions. No external servers or API keys are utilized.
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (window.confirm('Reset demo state to initial seed dataset?')) {
              storageService.resetDemoData();
              window.location.reload();
            }
          }}
        >
          Reset Demo State
        </Button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Listings</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{listings.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Logged across all customer sessions</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Verified Recovered</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-[#166534]">
            {impact.totalVerifiedRecoveredKg} <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Certified through physical scale weighment</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Active Pickups</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-700">{activePickups.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Currently in collection pipeline</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>AI Benchmark Accuracy</span>
            <TestTube2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-700">
            {evalSummary.overallAccuracyPercent}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {evalSummary.correctCount}/{evalSummary.totalSamples} test samples labeled
          </p>
        </Card>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Listing Status Distribution */}
        <div className="lg:col-span-6">
          <Card className="p-5 h-full flex flex-col justify-between">
            <CardHeader
              title="Pipeline Stage Distribution"
              subtitle="Count of listings per operational lifecycle state"
            />
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Listings" fill="#166534" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              State machine ensures verified weights prior to reward distribution.
            </div>
          </Card>
        </div>

        {/* Material Share */}
        <div className="lg:col-span-6">
          <Card className="p-5 h-full flex flex-col justify-between">
            <CardHeader
              title="Recovered Materials Mix"
              subtitle="Verified mass breakdown by stream category"
            />
            <div className="h-64 w-full">
              {impact.materialBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={impact.materialBreakdown}
                      dataKey="verifiedKg"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry: any) =>
                        `${((entry.percent || 0) * 100).toFixed(0)}%`
                      }
                    >
                      {impact.materialBreakdown.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v} kg`, 'Weight']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No verified materials recorded.
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Clear PET bottles and corrugated cardboard comprise top recovered volume.
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Navigation to Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          to="/admin/materials"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-emerald-700" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Material &amp; Pricing Index</h4>
          <p className="text-xs text-slate-500 mt-1">Configure indicative rates per kg &amp; rules</p>
        </Link>

        <Link
          to="/admin/recyclers"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-700" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Recycler Partners</h4>
          <p className="text-xs text-slate-500 mt-1">Manage partner facilities &amp; streams</p>
        </Link>

        <Link
          to="/admin/evaluation"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-purple-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <TestTube2 className="w-5 h-5 text-purple-700" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">AI Model Evaluation</h4>
          <p className="text-xs text-slate-500 mt-1">Confusion matrix &amp; labeled test suite</p>
        </Link>

        <Link
          to="/admin/methodology"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-teal-700" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Methodology &amp; Standards</h4>
          <p className="text-xs text-slate-500 mt-1">EPA WARM &amp; DEFRA factor verification</p>
        </Link>
      </div>
    </div>
  );
};
