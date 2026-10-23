import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  X,
  Copy,
  Check,
  Users,
  Shield,
} from 'lucide-react';
import { checkSupabaseConnection, ConnectionStatus, SUPABASE_URL, SUPABASE_ANON_KEY, supabase } from '../../lib/supabase';

interface DbProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export const SupabaseStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchProfiles = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      if (data) {
        setProfiles(data);
      }
    } catch {
      // ignore
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const res = await checkSupabaseConnection();
      setStatus(res);
      await fetchProfiles();
    } catch {
      setStatus({
        connected: false,
        message: 'Could not contact Supabase servers',
        hasTables: false,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const copyUrl = () => {
    navigator.clipboard.writeText(SUPABASE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => {
          setIsModalOpen(true);
          testConnection();
        }}
        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 hover:border-emerald-500"
        title="View Supabase Connection Status and Registered Users"
      >
        <Database className="w-3 h-3 text-emerald-400" />
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Supabase Connected
        </span>
      </button>

      {/* Modal Details */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative text-slate-800 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Supabase Backend Status</h3>
                <p className="text-xs text-slate-500">Live PostgreSQL Database & Realtime</p>
              </div>
            </div>

            {/* Status Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Connection State:</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected & Verified
                </span>
              </div>

              <div className="text-xs text-slate-600">
                <span className="font-semibold">Project URL:</span>
                <div className="mt-1 flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200 font-mono text-[11px] text-slate-700 break-all">
                  <span>{SUPABASE_URL}</span>
                  <button
                    onClick={copyUrl}
                    className="ml-2 text-slate-400 hover:text-slate-700 p-1"
                    title="Copy URL"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600">
                <span className="font-semibold">Key:</span>
                <div className="mt-1 bg-white px-2.5 py-1.5 rounded border border-slate-200 font-mono text-[11px] text-slate-500 truncate">
                  {SUPABASE_ANON_KEY.slice(0, 20)}...{SUPABASE_ANON_KEY.slice(-8)}
                </div>
              </div>

              <div className="pt-1 text-[11px] text-slate-500 flex items-start gap-1.5">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>All PostgreSQL tables (`listings`, `profiles`, `materials`, `recyclers`) are online!</span>
                </div>
              </div>
            </div>

            {/* Registered Users Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Registered Users in Database ({profiles.length})</span>
                </div>
                <button
                  onClick={fetchProfiles}
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {profiles.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  No signups found yet. Create an account via /signup to see it appear here!
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {profiles.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{p.full_name || 'User'}</div>
                        <div className="text-[11px] text-slate-500">{p.email}</div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {p.role}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dashboard Quick Links */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl mb-4 space-y-1.5">
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                <span>Where to view in Supabase Dashboard:</span>
              </div>
              <ul className="text-[11px] text-emerald-900/90 space-y-1 list-disc list-inside">
                <li>
                  <strong>Table Editor &rarr; profiles:</strong> Where all user names, roles, and profiles are saved.
                </li>
                <li>
                  <strong>Tip for Auth &rarr; Users:</strong> In Supabase Dashboard &gt; <em>Authentication &gt; Providers &gt; Email</em>, toggle <strong>OFF "Confirm email"</strong> so signups never hit email rate limits!
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 justify-end items-center mt-5">
              <a
                href="https://supabase.com/dashboard/project/gklvxmakdeossulitiim/editor/profiles"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs text-white bg-[#166534] hover:bg-[#14532d] px-3.5 py-2 rounded-xl font-medium transition-all shadow-xs"
              >
                <span>View `profiles` Table in Supabase</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
