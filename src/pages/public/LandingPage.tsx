import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scan,
  ArrowRight,
  ShieldCheck,
  Truck,
  Recycle,
  Sparkles,
  BarChart3,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DemoBanner } from '../../components/layout/DemoBanner';
import { RoleSwitcher } from '../../components/layout/RoleSwitcher';
import { storageService } from '../../services/storageService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'customer' | 'recycler' | 'admin') => {
    storageService.setCurrentRole(role);
    if (role === 'customer') navigate('/customer');
    if (role === 'recycler') navigate('/recycler');
    if (role === 'admin') navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#172018] flex flex-col">
      <DemoBanner />

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#166534] to-[#22c55e] flex items-center justify-center text-white shadow-sm">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-lg block leading-tight">
                Waste to Resource
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold tracking-wider uppercase block">
                Track: Sustainability &amp; Climate Tech (ST-01)
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <RoleSwitcher />
            <Link to="/customer/scan">
              <Button size="sm" leftIcon={<Scan className="w-4 h-4" />}>
                Scan Waste
              </Button>
            </Link>
          </div>

          <div className="md:hidden">
            <Link to="/customer">
              <Button size="sm">Launch App</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-xs font-semibold text-[#166534]">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI-Assisted Waste Segregation &amp; Material Recovery</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Your waste has value.{' '}
                <span className="text-[#166534] block sm:inline">We make recovery effortless.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Identify recyclable materials, find the right recovery route, and connect with
                collection partners — without the hassle. Designed for busy people who want
                responsible circular disposal without complex segregation hurdles.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link to="/customer/scan">
                  <Button size="lg" leftIcon={<Scan className="w-5 h-5 text-emerald-300" />}>
                    Scan Your Waste
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg">
                    Explore How It Works
                  </Button>
                </a>
              </div>

              {/* Hackathon Judge Fast Track Card */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl max-w-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#166534] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Hackathon Judge Role Switcher
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">No login required</span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Jump directly into any role to evaluate the end-to-end circular workflow:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleRoleSelect('customer')}
                    className="p-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-[#166534]">
                      1. Customer
                    </span>
                    <span className="block text-[10px] text-slate-500">Scan &amp; List</span>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('recycler')}
                    className="p-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      2. Recycler
                    </span>
                    <span className="block text-[10px] text-slate-500">Verify &amp; Weigh</span>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('admin')}
                    className="p-2.5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-purple-700">
                      3. Admin
                    </span>
                    <span className="block text-[10px] text-slate-500">AI Evaluation</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Graphic */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xl bg-white p-2">
                <img
                  src="/hero.jpg"
                  alt="Waste to Resource circular economy smart recovery ecosystem"
                  className="w-full h-auto rounded-2xl object-cover hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="p-4 bg-white/95 rounded-xl border border-slate-100 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Circular Material Routing
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Closed-loop tracking from scan to certified pelletizer
                    </span>
                  </div>
                  <div className="px-2.5 py-1 bg-emerald-100 text-[#166534] rounded-lg text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Traceable
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Illustrative Demo Impact Statistics Banner */}
      <section className="bg-white border-y border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Platform Demo Telemetry
            </span>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              *Illustrative prototype data for evaluation
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-[#F7F9F7] border border-slate-200/60">
              <div className="text-3xl font-extrabold text-[#166534]">1,280 kg</div>
              <div className="text-xs font-semibold text-slate-700 mt-1">Verified Recovered Material</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Scale certified across 4 partners</div>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F9F7] border border-slate-200/60">
              <div className="text-3xl font-extrabold text-[#166534]">91.4%</div>
              <div className="text-xs font-semibold text-slate-700 mt-1">Classification Accuracy</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Based on 25 benchmark test samples</div>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F9F7] border border-slate-200/60">
              <div className="text-3xl font-extrabold text-[#166534]">2.4x</div>
              <div className="text-xs font-semibold text-slate-700 mt-1">Segregation Compliance</div>
              <div className="text-[10px] text-slate-400 mt-0.5">34.2% baseline &rarr; 78.6% prototype</div>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F9F7] border border-slate-200/60">
              <div className="text-3xl font-extrabold text-[#166534]">3,420</div>
              <div className="text-xs font-semibold text-slate-700 mt-1">Resource Points Distributed</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Non-cash community incentives</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Explanation: Identify, Connect, Recover */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-2">
            The Circular Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Three simple steps to close the loop
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            No guessing resin numbers or searching municipal schedules. The platform classifies,
            evaluates value, and pairs you with the ideal collector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1: Identify */}
          <Card className="p-6 relative group border-t-4 border-t-emerald-600">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#166534] flex items-center justify-center font-bold text-lg mb-4">
              01
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Identify &amp; Classify</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Upload a photo or choose a sample. Our classification engine detects polymers, metals,
              cardboard, and organics, warning against contamination before collection.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confidence scores
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Contamination checks
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Indicative value estimate
              </li>
            </ul>
          </Card>

          {/* Step 2: Connect */}
          <Card className="p-6 relative group border-t-4 border-t-blue-600">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg mb-4">
              02
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Connect &amp; Coordinate</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Get matched with nearby verified recyclers or community smart bins based on accepted
              materials and scheduled clustered pickup windows.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Verified collection partners
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> On-demand pickup windows
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Nearby drop-off smart bins
              </li>
            </ul>
          </Card>

          {/* Step 3: Recover */}
          <Card className="p-6 relative group border-t-4 border-t-teal-600">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg mb-4">
              03
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Recover &amp; Earn</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Recyclers weigh the material at certified facilities. Once verified, you earn non-cash
              Resource Points, unlock badges, and track actual CO2e avoided.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Verified scale weights
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Transparent CO2e calculations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Non-cash sponsor rewards
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Stakeholder Benefits Section */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Built for every link in the recovery chain
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#166534] flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">For Households</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero friction segregation. Instantly understand what can be recovered, discover its
                indicative value, and arrange doorstep pickup without sorting fatigue.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">For Recyclers</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive pre-qualified, low-contamination materials matched directly to your accepted
                processing streams. Clustered pickup routes cut fuel costs by 40%.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">For Municipalities</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent landfill diversion telemetry and verified circular metrics. Eliminate
                unsubstantiated claims with transparent EPA/DEFRA emission conversion factors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Transparency & Methodology Callout */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-900 to-[#166534] text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="px-3 py-1 bg-emerald-800/80 text-emerald-200 rounded-full text-xs font-semibold uppercase tracking-wider inline-block">
              Open &amp; Transparent Metrics
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              No greenwashing. Verified weights and documented formulas.
            </h3>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              We separate measured physical scale data from initial user estimates. Every kilogram of
              CO2e avoided links directly to documented factors from EPA WARM and DEFRA standards.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/admin/methodology">
                <Button variant="secondary" size="md">
                  Inspect Methodology Formulas
                </Button>
              </Link>
              <Link to="/admin/evaluation">
                <Button variant="outline" size="md" className="bg-transparent text-white border-emerald-400 hover:bg-white/10">
                  View AI Benchmark Test Suite
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
                  <Recycle className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-base">Waste to Resource</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                A hackathon prototype for Track ST-01 (Sustainability &amp; Climate Tech).
                Empowering circular recovery through AI classification, transparent routing, and verified metrics.
              </p>
              <div className="text-[11px] text-emerald-400 font-mono">
                Prototype v1.0 &bull; Offline LocalStorage Persistence &bull; Zero External API Keys Required
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Experience Portals
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/customer" className="hover:text-emerald-400 transition-colors">
                    Customer Experience
                  </Link>
                </li>
                <li>
                  <Link to="/customer/scan" className="hover:text-emerald-400 transition-colors">
                    Scan Waste AI Simulator
                  </Link>
                </li>
                <li>
                  <Link to="/recycler" className="hover:text-emerald-400 transition-colors">
                    Recycler Partner Portal
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-emerald-400 transition-colors">
                    Admin &amp; AI Evaluation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Hackathon Disclaimer
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All data, prices, recyclers, and AI detections on this demonstration website are simulated.
                Indicative rates do not represent financial quotes and points cannot be redeemed for real currency.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>&copy; 2026 Waste to Resource Team. MIT Licensed Hackathon Submission.</div>
            <div className="flex items-center gap-4">
              <span>Track ST-01</span>
              <span>&bull;</span>
              <span>Vite + React + TypeScript + Tailwind</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
