import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, User, Mail, Lock, AlertCircle, CheckCircle2, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const { isDarkMode, toggleTheme } = useTheme();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Field-level validations
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!username.trim()) {
      setErrorMessage('Please choose an academic username.');
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (!confirmPassword) {
      setErrorMessage('Please confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_').replace('@', '');

    const res = register({
      name: name.trim(),
      username: cleanUsername,
      email: email.trim().toLowerCase(),
      password,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`
    });

    setIsSubmitting(false);

    if (res?.success) {
      if (showToast) {
        showToast('Scholar profile initialized! Please choose your focus topics.', 'success');
      }
      navigate('/onboarding');
    } else {
      setErrorMessage(res?.error || 'Failed to create profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Background glow orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0df2c9]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-4">
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

      {/* Main Signup Form Card */}
      <div className="w-full max-w-md mx-auto bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0df2c9]/10 text-[#0df2c9] text-xs font-mono font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Scholar Enrollment
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Create Your Profile
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Organize subjects, create long-form questions, and store equations and diagrams.
          </p>
        </div>

        {/* Validation Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Full Name <span className="text-[#0df2c9]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abhishek Hindi"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#0df2c9] transition-colors"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Username <span className="text-[#0df2c9]">*</span>
            </label>
            <div className="relative">
              <span className="text-xs font-mono text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="abhishek"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#0df2c9] transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Academic Email <span className="text-[#0df2c9]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abhishek@kweshun.edu"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#0df2c9] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Password <span className="text-[#0df2c9]">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#0df2c9] transition-colors"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Confirm Password <span className="text-[#0df2c9]">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-[#0df2c9] transition-colors"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Profile...' : 'Create Account'}
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0df2c9] font-bold hover:underline">
            Log In
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
