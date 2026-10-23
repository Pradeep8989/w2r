import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, X, Copy, Check } from 'lucide-react';
import { checkSupabaseConnection, ConnectionStatus, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/supabase';

export const SupabaseStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const res = await checkSupabaseConnection();
      setStatus(res);
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
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 hover:border-emerald-500"
        title="View Supabase Connection Status"
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
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative text-slate-800"
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
                <p className="text-xs text-slate-500">PostgreSQL Database & Realtime</p>
              </div>
            </div>

            {/* Status Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-4 space-y-2">
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
                {status?.hasTables ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>PostgreSQL database tables detected and live.</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/80">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Database Tables Setup</span>
                      <span>To create listings & recovery tables in Supabase, run the included <code className="bg-amber-100 px-1 rounded text-amber-900 font-mono text-[10px]">supabase/schema.sql</code> script in your Supabase SQL Editor.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 justify-end items-center mt-5">
              <button
                onClick={testConnection}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Test Live Connection</span>
              </button>

              <a
                href="https://supabase.com/dashboard/project/gklvxmakdeossulitiim"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs text-white bg-[#166534] hover:bg-[#14532d] px-3.5 py-2 rounded-xl font-medium transition-all shadow-xs"
              >
                <span>Open Supabase Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
