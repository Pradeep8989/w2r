import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Recycle,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Role } from '../../types';

type AuthMode = 'login' | 'signup';

const ROLE_OPTIONS: { role: Role; label: string; subtitle: string; icon: React.ReactNode; color: string; borderColor: string; bgColor: string }[] = [
  {
    role: 'customer',
    label: 'Resident / Household',
    subtitle: 'Scan, list & track your recyclables',
    icon: <User className="w-5 h-5" />,
    color: 'text-emerald-700',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    role: 'recycler',
    label: 'Recycler Partner',
    subtitle: 'Manage pickups & material streams',
    icon: <Truck className="w-5 h-5" />,
    color: 'text-blue-700',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    role: 'admin',
    label: 'Admin / Municipality',
    subtitle: 'Oversee platform metrics & pricing',
    icon: <ShieldCheck className="w-5 h-5" />,
    color: 'text-purple-700',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-50',
  },
];

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    storageService.setCurrentRole(selectedRole);

    // Navigate to the appropriate portal
    if (selectedRole === 'customer') navigate('/customer');
    else if (selectedRole === 'recycler') navigate('/recycler');
    else navigate('/admin');
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex flex-col">
      {/* Subtle background grid */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
            <Recycle className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white tracking-tight text-lg block leading-tight">
              Waste to Resource
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block">
              Circular Recovery Platform
            </span>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{mode === 'login' ? 'Welcome back' : 'Create your account'}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {mode === 'login' ? 'Sign in to your portal' : 'Join the platform'}
              </h1>
              <p className="text-sm text-slate-400 mt-1.5">
                {mode === 'login'
                  ? 'Track your recycling journey and environmental impact.'
                  : 'Start turning waste into valuable resources today.'}
              </p>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setSelectedRole(opt.role)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${
                      selectedRole === opt.role
                        ? `${opt.borderColor} ${opt.bgColor} ${opt.color}`
                        : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className={selectedRole === opt.role ? opt.color : ''}>{opt.icon}</div>
                    <span className="text-[11px] font-semibold leading-tight">{opt.label.split(' / ')[0]}</span>
                  </button>
                ))}
              </div>
              {/* Selected role subtitle */}
              <p className="text-xs text-slate-500 mt-2 text-center">
                {ROLE_OPTIONS.find((r) => r.role === selectedRole)?.subtitle}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Smith"
                      className="w-full bg-white/8 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/60 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/8 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/60 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                    className="w-full bg-white/8 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:border-emerald-500/60 focus:bg-white/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing {mode === 'login' ? 'in' : 'up'}...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch Mode */}
            <p className="text-center text-xs text-slate-500 mt-6">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={switchMode}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />, text: 'Verified Partners' },
              { icon: <Building2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />, text: 'Certified Facilities' },
              { icon: <Recycle className="w-4 h-4 text-emerald-500 mx-auto mb-1" />, text: 'Transparent Tracking' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/8">
                {item.icon}
                <p className="text-[11px] text-slate-400 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
