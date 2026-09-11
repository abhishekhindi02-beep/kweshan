import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, Mail, Lock, School } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) {
      showToast('Please provide your name and email', 'error');
      return;
    }

    register({
      name,
      handle: handle.startsWith('@') ? handle : `@${handle || name.toLowerCase().replace(/\s+/g, '')}`,
      email,
      institution: institution || 'Academic Scholar',
      dp: 1500,
      streak: 1,
      rank: 'Scholar Tier'
    });

    showToast('Scholar account created successfully! +100 welcome DP added!', 'success');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#111927] border border-[#22334d] rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#8b5cf6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0df2c9] to-[#8b5cf6] text-slate-950 font-black text-2xl shadow-lg shadow-[#0df2c9]/20">
            K
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Create Scholar Profile</h2>
          <p className="text-xs text-slate-400">
            Join 10,000+ competitive scholars worldwide and build your academic distinction.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jordan Vance"
                className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Academic Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@jordanvance"
              className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Institution / Department
            </label>
            <div className="relative">
              <School className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="MIT • Dept of Physics"
                className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Academic Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@mit.edu"
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0b101b] border border-[#22334d] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df2c9]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-sm rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all flex items-center justify-center gap-2 mt-4"
          >
            Create Free Scholar Account
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#1b273a] text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#0df2c9] font-bold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
