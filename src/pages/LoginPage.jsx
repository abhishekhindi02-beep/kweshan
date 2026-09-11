import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('alex@kweshun.edu');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }
    const res = login(email, password);
    if (res?.success) {
      showToast(`Welcome back, ${res.user?.name || 'Scholar'}!`, 'success');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#111927] border border-[#22334d] rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#0df2c9]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-2xl shadow-lg shadow-[#0df2c9]/30">
            K
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Scholar Sign In</h2>
          <p className="text-xs text-slate-400">
            Access your academic decks, active battles, and Distinction ledger.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Academic Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scholar@university.edu"
                className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-[#0b101b] border-[#22334d] text-[#0df2c9] focus:ring-0" />
              Remember device
            </label>
            <button type="button" className="text-[#0df2c9] hover:underline">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-sm rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            Sign In to Kweshun
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#1b273a] text-xs text-slate-400">
          Don't have an academic profile yet?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-[#0df2c9] font-bold hover:underline"
          >
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
}
