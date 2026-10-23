import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  Zap,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { supabase } from '../../lib/supabase';
import { Role } from '../../types';

type AuthMode = 'login' | 'signup';

const ROLE_OPTIONS: {
  role: Role;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  activeBorder: string;
  activeBg: string;
}[] = [
  {
    role: 'customer',
    label: 'Resident',
    subtitle: 'Scan, list & recover materials',
    icon: <User className="w-5 h-5" />,
    color: 'text-emerald-400',
    activeBorder: 'border-emerald-500 bg-emerald-500/15 text-emerald-300',
    activeBg: 'bg-emerald-500/10',
  },
  {
    role: 'recycler',
    label: 'Recycler',
    subtitle: 'Manage streams & pickups',
    icon: <Truck className="w-5 h-5" />,
    color: 'text-blue-400',
    activeBorder: 'border-blue-500 bg-blue-500/15 text-blue-300',
    activeBg: 'bg-blue-500/10',
  },
  {
    role: 'admin',
    label: 'Admin',
    subtitle: 'Rates, metrics & oversight',
    icon: <ShieldCheck className="w-5 h-5" />,
    color: 'text-purple-400',
    activeBorder: 'border-purple-500 bg-purple-500/15 text-purple-300',
    activeBg: 'bg-purple-500/10',
  },
];

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect mode from route path (/login vs /signup)
  const isInitialSignup = location.pathname.includes('signup');
  const [mode, setMode] = useState<AuthMode>(isInitialSignup ? 'signup' : 'login');
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const formatNameFromEmail = (emailStr: string): string => {
    const localPart = emailStr.split('@')[0] || 'User';
    const clean = localPart.replace(/[0-9._-]+/g, ' ').trim();
    if (!clean) return 'User';
    return clean
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleQuickDemoFill = (role: Role, demoEmail: string, demoName: string) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword('demo1234');
    if (mode === 'signup') {
      setName(demoName);
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide your email address and password.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      let resolvedUserId = `usr_${Date.now()}`;
      let resolvedName = name.trim();

      // 1. Attempt Supabase Auth
      if (mode === 'signup') {
        const { data: supaData, error: supaError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: resolvedName,
              role: selectedRole,
            },
          },
        });

        if (supaError) {
          // If Supabase user already exists or needs confirmation
          if (supaError.message.includes('already registered')) {
            setError('An account with this email already exists. Try signing in instead.');
            setIsLoading(false);
            return;
          }
          console.info('Supabase sign-up notice (proceeding with local session):', supaError.message);
        } else if (supaData.user) {
          resolvedUserId = supaData.user.id;
        }
      } else {
        // Mode === 'login'
        const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (!supaError && supaData.user) {
          resolvedUserId = supaData.user.id;
          resolvedName = supaData.user.user_metadata?.full_name || formatNameFromEmail(email.trim());
        } else if (supaError) {
          console.info('Supabase sign-in note (proceeding with session):', supaError.message);
        }
      }

      // 2. Persist user session in storage service
      if (!resolvedName) {
        resolvedName = formatNameFromEmail(email.trim());
      }

      const userSession = storageService.registerUser({
        id: resolvedUserId,
        name: resolvedName,
        email: email.trim().toLowerCase(),
        role: selectedRole,
      });

      storageService.setCurrentUser(userSession);
      storageService.setCurrentRole(selectedRole);

      // Redirect strictly to the selected role's portal
      if (selectedRole === 'customer') {
        navigate('/customer');
      } else if (selectedRole === 'recycler') {
        navigate('/recycler');
      } else {
        navigate('/admin');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setInfoMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#062013] to-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#166534] to-[#22c55e] flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 group-hover:scale-105 transition-transform">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-lg block leading-tight">
                Waste to Resource
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block">
                Circular Recovery Tech
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
          >
            &larr; Back to Home
          </Link>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Outer Card */}
          <div className="bg-white/[0.05] backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-9 shadow-2xl relative overflow-hidden">
            {/* Top Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{mode === 'login' ? 'Welcome Back' : 'Get Started'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {mode === 'login' ? 'Sign in to your portal' : 'Create your account'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xs mx-auto">
                {mode === 'login'
                  ? 'Access your listings, analytics, and material transactions.'
                  : 'Start recovering recyclable materials and turn waste into resource.'}
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded-xl border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const isSelected = selectedRole === opt.role;
                  return (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => setSelectedRole(opt.role)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all cursor-pointer text-center ${
                        isSelected
                          ? opt.activeBorder
                          : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      <div className={isSelected ? opt.color : 'text-slate-500'}>{opt.icon}</div>
                      <span className="text-[11px] font-bold leading-tight">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 text-center">
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
                      placeholder="e.g. John Doe"
                      required
                      className="w-full bg-white/[0.06] border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
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
                    placeholder="you@domain.com"
                    required
                    className="w-full bg-white/[0.06] border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                    required
                    className="w-full bg-white/[0.06] border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium animate-in fade-in">
                  {error}
                </div>
              )}

              {/* Info Message */}
              {infoMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-in fade-in">
                  {infoMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing {mode === 'login' ? 'Sign In' : 'Registration'}...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Portal' : 'Create My Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials for Fast Testing */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick One-Click Demo Logins:</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('customer', 'resident@w2r.eco', 'Alex Green')}
                  className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-[10px] text-slate-300 font-semibold transition-all cursor-pointer truncate"
                  title="Fill Resident demo user"
                >
                  🏡 Resident
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('recycler', 'partner@ecoloop.com', 'EcoLoop Facility')}
                  className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/40 text-[10px] text-slate-300 font-semibold transition-all cursor-pointer truncate"
                  title="Fill Recycler demo user"
                >
                  🚚 Recycler
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('admin', 'admin@cleanpulse.gov', 'Admin Officer')}
                  className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 text-[10px] text-slate-300 font-semibold transition-all cursor-pointer truncate"
                  title="Fill Admin demo user"
                >
                  🛡️ Admin
                </button>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 font-medium">Verified Partners</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <Building2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 font-medium">Certified Facilities</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <Recycle className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 font-medium">Circular Traceability</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
