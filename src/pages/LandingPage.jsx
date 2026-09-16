import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, BookOpen, Layers, FileText, ArrowRight, 
  CheckCircle2, Shield, Search, PenTool, Sigma, Sun, Moon,
  Menu, X, Check, FolderPlus
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pillars = [
    {
      icon: Layers,
      title: 'Subject-Based Organization',
      description: 'Create custom academic subjects and curriculum domains. Group questions logically by chapter, course, or field.'
    },
    {
      icon: FileText,
      title: 'Long-Form Question Authoring',
      description: 'Draft comprehensive problem statements, conceptual proofs, derivations, and solutions with notes and citations.'
    },
    {
      icon: PenTool,
      title: 'Hand-Drawn Figures & Images',
      description: 'Draw freehand physics diagrams, free-body sketches, or attach textbook diagrams directly to your questions.'
    },
    {
      icon: Sigma,
      title: 'LaTeX & Equation Support',
      description: 'Incorporate formatted mathematical formulas, Cartesian component breakdowns, and symbolic expressions.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f8fafc] font-sans antialiased selection:bg-[#0df2c9]/30 selection:text-[#0df2c9]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-[#090d16]/85 backdrop-blur-md border-b border-[#162035] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0df2c9] to-[#00bfa5] flex items-center justify-center text-slate-950 font-black shadow-md shadow-[#0df2c9]/20 group-hover:scale-105 transition-transform">
              K
            </div>
            <div>
              <span className="text-lg font-extrabold text-white tracking-tight group-hover:text-[#0df2c9] transition-colors block leading-none">
                Kweshun
              </span>
              <span className="text-[10px] font-semibold text-[#64748b] tracking-wider uppercase block mt-0.5">
                Question Repository
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#cbd5e1] hover:text-white hover:bg-[#131b2e] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-[#0df2c9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#94a3b8] hover:text-white hover:bg-[#131b2e]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 px-2 border-t border-[#1a253c] mt-3 space-y-2">
            <Link
              to="/login"
              className="block w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-center text-[#cbd5e1] bg-[#111827]"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="block w-full py-2.5 px-4 rounded-xl text-sm font-bold text-center text-slate-950 bg-[#0df2c9]"
            >
              Get Started Free
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-8 pt-16 sm:pt-24 pb-20 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16233b] border border-[#223559] text-[#0df2c9] text-xs font-bold uppercase tracking-wider shadow-sm">
          <Layers className="w-3.5 h-3.5" />
          <span>Academic Knowledge Repository</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Your Personal Academic <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0df2c9] via-[#38bdf8] to-[#a855f7]">
            Question Library
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
          Create subjects, organize questions, attach handwritten diagrams and mathematical proofs, and build your searchable knowledge vault.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-[#0df2c9]/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Create Free Repository</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#152037] hover:bg-[#1c2a47] text-white font-semibold text-sm sm:text-base border border-[#223252] transition-colors"
          >
            <span>Sign In / Demo Access</span>
          </Link>
        </div>
      </section>

      {/* Pillars Grid */}
      <section className="px-4 sm:px-8 py-16 max-w-6xl mx-auto border-t border-[#162035]">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Designed for Rigorous Academic Study
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-2">
            Everything students and researchers need to store and categorize complex questions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-[#0f172a] border border-[#1e2d4d] rounded-2xl p-6 sm:p-8 space-y-3 shadow-md hover:border-[#0df2c9]/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#16233b] border border-[#223559] flex items-center justify-center text-[#0df2c9]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">{p.title}</h3>
                <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-10 border-t border-[#162035] text-center text-xs text-[#64748b]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Kweshun</span>
            <span>•</span>
            <span>Subject-Based Academic Question Repository</span>
          </div>
          <div>
            <span>Local Storage & User Sandbox Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
