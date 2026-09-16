import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Sun, Moon, UserPlus, Users, Check } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { isDarkMode, toggleTheme } = useTheme();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [noProfileFound, setNoProfileFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setNoProfileFound(false);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or username.');
      return;
    }

    setIsSubmitting(true);
    const res = login(identifier.trim(), password);
    setIsSubmitting(false);

    if (res?.success) {
      if (showToast) {
        showToast(`Welcome back, ${res.user?.name || 'Scholar'}!`, 'success');
      }
      navigate('/home');
    } else {
      setNoProfileFound(Boolean(res?.notFound));
      setErrorMessage(res?.error || 'No Kweshun profile found. Please check your credentials or create a free account.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Background glow orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0df2c9]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between mb-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0df2c9] to-[#8b5cf6] flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
            K
          </div>
          <span className="font-black text-base text-[var(--text-primary)] tracking-tight group-hover:text-[#0df2c9] transition-colors">
            KWESHUN
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[#0df2c9] transition-colors cursor-pointer"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-xl mx-auto bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0df2c9]/10 text-[#0df2c9] text-xs font-mono font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Scholar Authentication
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Sign In to Kweshun
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Access your subjects, curated questions, formulas, and diagrams.
          </p>
        </div>

        {/* Error / No Profile Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs space-y-2.5 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            {noProfileFound && (
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="w-full py-2 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs rounded-xl hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create Free Account
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Username or Academic Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. abhishek or abhishek@kweshun.edu"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#0df2c9] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#0df2c9] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Signing In...' : 'Continue to Dashboard'}
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
          Don't have an academic profile yet?{' '}
          <Link to="/signup" className="text-[#0df2c9] font-bold hover:underline">
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-[var(--text-muted)] font-mono py-4">
        © {new Date().getFullYear()} Kweshun • Academic Arena Prototype
      </div>
    </div>
  );
}
