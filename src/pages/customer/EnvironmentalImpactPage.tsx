import React from 'react';
import {
  Leaf,
  TrendingUp,
  ShieldCheck,
  Scale,
  Info,
  BookOpen,
  PieChart as PieIcon,
  BarChart as BarIcon,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { impactService } from '../../services/impactService';
import { storageService } from '../../services/storageService';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const EnvironmentalImpactPage: React.FC = () => {
  const impact = impactService.calculateImpact();
  const factors = storageService.getEnvironmentalFactors();

  const COLORS = ['#166534', '#0284c7', '#b45309', '#475569', '#7c3aed', '#059669'];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Verified Environmental Impact &amp; Life Cycle Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Rigorous circular economy telemetry calculated strictly from physical scale weighments and certified lifecycle emission models.
        </p>
      </div>

      {/* Honest Data Category Badge Legend */}
      <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
        <div className="font-bold flex items-center gap-1.5 text-slate-900">
          <Info className="w-4 h-4 text-emerald-700" />
          Data Integrity &amp; Provenance Protocol
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <strong>Measured Scale Values:</strong> Certified weighmaster physical scale records
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <strong>Documented Factors:</strong> EPA WARM v15 &amp; DEFRA 2024 emission factors
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <strong>Simulated Prototype Data:</strong> Prototype testbed listings
          </span>
        </div>
      </div>

      {/* Core Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Measured Recovery</span>
            <span className="text-[10px] bg-emerald-100 text-[#166534] font-bold px-1.5 py-0.5 rounded">
              Scale Measured
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#166534]">
            {impact.totalVerifiedRecoveredKg} <span className="text-sm font-semibold text-slate-500">kg</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Certified physical material weight diverted
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Avoided GHG Emissions</span>
            <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">
              EPA Sourced
            </span>
          </div>
          <div className="text-3xl font-extrabold text-sky-700">
            {impact.totalCo2eAvoidedKg} <span className="text-sm font-semibold text-slate-500">kg CO2e</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Avoided via virgin material displacement
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Landfill Diversion</span>
            <span className="text-[10px] bg-emerald-100 text-[#166534] font-bold px-1.5 py-0.5 rounded">
              Calculated
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">
            {impact.totalLandfillDivertedKg} <span className="text-sm font-semibold text-slate-500">kg</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Solid municipal waste prevented
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Equivalent Trees</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
              Model Estimate
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">
            ~{Math.max(1, Math.round(impact.totalCo2eAvoidedKg / 21))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Urban tree-years of CO2 sequestration (21.7 kg/yr)
          </p>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Material Category Distribution */}
        <div className="lg:col-span-6">
          <Card className="p-5 h-full flex flex-col justify-between">
            <CardHeader
              title="Recovered Stream Composition"
              subtitle="Breakdown of physical scale weighments by material class"
            />
            <div className="h-64 w-full">
              {impact.materialBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={impact.materialBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="verifiedKg"
                      nameKey="categoryName"
                    >
                      {impact.materialBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} kg recovered`, 'Weight']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No verified weights recorded yet.
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Only verified listings contribute to official recovery statistics.
            </div>
          </Card>
        </div>

        {/* Monthly Recovery Trend */}
        <div className="lg:col-span-6">
          <Card className="p-5 h-full flex flex-col justify-between">
            <CardHeader
              title="Recovery &amp; Emissions Trend"
              subtitle="Monthly progress across participating households"
            />
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impact.monthlyTrend}>
                  <XAxis dataKey="month" textAnchor="end" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="verifiedKg"
                    name="Recovered (kg)"
                    fill="#166534"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="co2eKg"
                    name="CO2e Avoided (kg)"
                    fill="#0284c7"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Historical baseline modeled from municipal baseline pilot data.
            </div>
          </Card>
        </div>
      </div>

      {/* Assumptions & Methodology Transparency Panel */}
      <Card className="p-6">
        <CardHeader
          title="Methodology, Standards &amp; Emission Assumptions"
          subtitle="Full public disclosure of calculation formulas and lifecycle citations"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Material Stream</th>
                <th className="px-4 py-3">Conversion Factor</th>
                <th className="px-4 py-3">Verified Formula</th>
                <th className="px-4 py-3">Source Citation</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {factors.map((factor) => (
                <tr key={factor.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {factor.materialName}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-emerald-800">
                    {factor.factorValue} {factor.unit}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                    {factor.formula}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    {factor.source}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-[#166534]">
                      {factor.verificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
