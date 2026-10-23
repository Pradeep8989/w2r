import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scan,
  ArrowRight,
  Truck,
  Recycle,
  Sparkles,
  BarChart3,
  Award,
  Users,
  CheckCircle2,
  Building2,
  ChevronRight,
  Leaf,
  Globe,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F9F7] text-[#172018] flex flex-col">

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
                Circular Recovery Platform
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link to="/signup">
              <Button size="sm" leftIcon={<Scan className="w-4 h-4" />}>
                Get Started
              </Button>
            </Link>
          </div>

          <div className="md:hidden">
            <Link to="/login">
              <Button size="sm">Sign In</Button>
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
                <Link to="/signup">
                  <Button size="lg" leftIcon={<Scan className="w-5 h-5 text-emerald-300" />}>
                    Start Recycling Free
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    How It Works
                  </Button>
                </a>
              </div>

              {/* Role entry points */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl max-w-xl shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Choose your portal
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    to="/login"
                    className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group"
                  >
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-[#166534]">
                      Residents
                    </span>
                    <span className="block text-[10px] text-slate-500">Scan &amp; Earn</span>
                  </Link>
                  <Link
                    to="/login"
                    className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group"
                  >
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      Recyclers
                    </span>
                    <span className="block text-[10px] text-slate-500">Collect &amp; Verify</span>
                  </Link>
                  <Link
                    to="/login"
                    className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition-all group"
                  >
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-purple-700">
                      Municipalities
                    </span>
                    <span className="block text-[10px] text-slate-500">Monitor &amp; Report</span>
                  </Link>
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
                      Closed-loop tracking from scan to certified recovery
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

      {/* Impact Statistics Banner */}
      <section className="bg-white border-y border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '12,400+', label: 'Kg Material Recovered', sub: 'Verified across certified facilities' },
              { value: '91.4%', label: 'AI Classification Accuracy', sub: 'Tested across 8 material categories' },
              { value: '2.4×', label: 'Segregation Improvement', sub: 'Compared to unassisted sorting' },
              { value: '340+', label: 'Active Collection Partners', sub: 'Verified recyclers nationwide' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#F7F9F7] border border-slate-200/60">
                <div className="text-3xl font-extrabold text-[#166534]">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-700 mt-1">{stat.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{stat.sub}</div>
              </div>
            ))}
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
              Upload a photo or choose a sample. Our AI detects polymers, metals,
              cardboard, and organics — warning against contamination before collection.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> AI confidence scores
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Contamination detection
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
              Recyclers weigh material at certified facilities. Once verified, you earn non-cash
              Resource Points, unlock badges, and track actual CO₂e avoided.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Verified scale weights
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Transparent CO₂e calculations
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
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">For Recyclers</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive pre-qualified, low-contamination materials matched directly to your accepted
                processing streams. Clustered pickup routes cut operational costs significantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">For Municipalities</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent landfill diversion telemetry and verified circular metrics. Eliminate
                unsubstantiated claims with documented EPA/DEFRA emission conversion factors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Everything you need in one platform
          </h2>
          <p className="text-slate-600 mt-2 text-sm">
            From initial scan to verified recovery — the complete circular workflow.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: <Scan className="w-5 h-5" />,
              title: 'AI Waste Scanner',
              desc: 'Photo-based classification with confidence scoring and contamination warnings.',
              color: 'emerald',
            },
            {
              icon: <TrendingUp className="w-5 h-5" />,
              title: 'Live Market Rates',
              desc: 'Up-to-date indicative pricing for every material category from verified partners.',
              color: 'blue',
            },
            {
              icon: <Truck className="w-5 h-5" />,
              title: 'Pickup Coordination',
              desc: 'Match with local recyclers, book a pickup window, and track collection in real time.',
              color: 'teal',
            },
            {
              icon: <Award className="w-5 h-5" />,
              title: 'Rewards & Badges',
              desc: 'Earn Resource Points on verified recoveries. Unlock milestone badges.',
              color: 'amber',
            },
            {
              icon: <Leaf className="w-5 h-5" />,
              title: 'Environmental Impact',
              desc: 'See exact CO₂e avoided, water saved, and landfill diverted per submission.',
              color: 'green',
            },
            {
              icon: <Globe className="w-5 h-5" />,
              title: 'Community Challenges',
              desc: 'Join city-wide recycling drives with leaderboards and sponsor rewards.',
              color: 'purple',
            },
          ].map((feat, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl bg-white border border-slate-200/70 hover:shadow-md hover:-translate-y-0.5 transition-all`}
            >
              <div className={`w-10 h-10 rounded-xl bg-${feat.color}-100 text-${feat.color}-700 flex items-center justify-center mb-3`}>
                {feat.icon}
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{feat.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-900 to-[#166534] text-white shadow-xl relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-emerald-800/30 rounded-full blur-2xl pointer-events-none" />
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="px-3 py-1 bg-emerald-800/80 text-emerald-200 rounded-full text-xs font-semibold uppercase tracking-wider inline-block">
              Ready to start?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Join thousands of households already recovering more.
            </h3>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Sign up in under a minute. No sorting expertise needed — just a photo of your waste
              and we'll guide you through the rest.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Create Free Account
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="md"
                  className="bg-transparent text-white border-emerald-400 hover:bg-white/10"
                >
                  Sign In
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
                Empowering circular recovery through AI classification, transparent routing, and
                verified environmental metrics. Making recycling effortless for everyone.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] text-emerald-400">ST-01 Sustainability &amp; Climate Tech</span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Platform
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/signup" className="hover:text-emerald-400 transition-colors">
                    For Residents
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-emerald-400 transition-colors">
                    For Recycler Partners
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-emerald-400 transition-colors">
                    For Municipalities
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Account
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/login" className="hover:text-emerald-400 transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-emerald-400 transition-colors">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>&copy; 2026 Waste to Resource. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Sustainability &amp; Climate Tech</span>
              <span>&bull;</span>
              <span>Vite + React + TypeScript</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
