import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, Swords, BookOpen, Zap, Trophy, Flame, 
  ArrowRight, CheckCircle2, UserCheck, Shield, ChevronRight,
  Brain, Award, Users, PlusCircle, BarChart3, Sun, Moon,
  Menu, X, Compass, Check, Layers
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const decksPreview = [
    {
      title: 'AP Physics 1: Mechanics',
      category: 'Science',
      icon: '⚛️',
      questions: 14,
      mastery: 75,
      description: 'Kinematics, Newton’s laws, work, energy, rotational dynamics, and momentum.'
    },
    {
      title: 'AP Calculus AB & BC',
      category: 'Mathematics',
      icon: '📐',
      questions: 16,
      mastery: 60,
      description: 'Limits, derivatives, Taylor series expansions, integral calculus, and ODEs.'
    },
    {
      title: 'AP Chemistry & Molecular Laws',
      category: 'Science',
      icon: '🧪',
      questions: 12,
      mastery: 85,
      description: 'Stoichiometry, thermodynamics, kinetics, chemical equilibrium, and redox.'
    },
    {
      title: 'Computer Science & Algorithms',
      category: 'Computer Science',
      icon: '💻',
      questions: 15,
      mastery: 90,
      description: 'Data structures, Big-O complexity, graphs, sorting, and discrete logic.'
    },
    {
      title: 'Cellular & Molecular Biology',
      category: 'Biology',
      icon: '🧬',
      questions: 14,
      mastery: 65,
      description: 'DNA replication, transcription, mitosis, cellular respiration, and genetics.'
    },
    {
      title: 'History & Geopolitics',
      category: 'History',
      icon: '🏛️',
      questions: 12,
      mastery: 50,
      description: 'Constitutional frameworks, geopolitical treaties, and global history.'
    }
  ];

  const features = [
    {
      icon: Swords,
      color: 'mint',
      title: 'Academic Battles',
      description: 'Compete in real-time, 5-round head-to-head academic face-offs against intelligent AI and peers.'
    },
    {
      icon: BookOpen,
      color: 'purple',
      title: 'Practice Decks',
      description: 'Master rigorous subject curricula with instant answer derivations and adaptive reattempts.'
    },
    {
      icon: Zap,
      color: 'gold',
      title: 'Daily Lightning',
      description: 'Fast-paced 10-question sprint tests designed to build reaction speed and intellectual agility.'
    },
    {
      icon: PlusCircle,
      color: 'mint',
      title: 'Question Authoring',
      description: 'Author high-distinction items, publish directly (+30 DP), and inspect real-time student analytics.'
    },
    {
      icon: Brain,
      color: 'purple',
      title: 'AI Opponents',
      description: 'Duel specialized AI scholars spanning varying difficulty tiers and response patterns.'
    },
    {
      icon: Trophy,
      color: 'gold',
      title: 'Global Leaderboards',
      description: 'Climb the Scholar Distinction ladder, maintain daily streaks, and secure top rankings.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'CREATE YOUR PROFILE',
      desc: 'Sign up in seconds and establish your personalized Kweshun academic identity.'
    },
    {
      num: '02',
      title: 'CHOOSE YOUR SUBJECTS',
      desc: 'Select academic disciplines across Physics, Calculus, Chemistry, CS, and Biology.'
    },
    {
      num: '03',
      title: 'PRACTICE & BATTLE',
      desc: 'Solve rigorous peer-reviewed questions or duel AI scholars in 5-round sudden death.'
    },
    {
      num: '04',
      title: 'EARN & CLIMB',
      desc: 'Gain Distinction Points (DP), unlock elite Scholar tiers, and conquer the leaderboard.'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans antialiased selection:bg-[#0df2c9]/30 selection:text-[#0df2c9]">
      {/* -------------------------------------------------------------------------- */}
      {/* PUBLIC NAVBAR                                                              */}
      {/* -------------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg-header)] border-b border-[var(--border-subtle)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0df2c9] to-[#8b5cf6] p-[2px] shadow-lg shadow-[#0df2c9]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <span className="font-black text-xl text-[#0df2c9] tracking-tighter">K</span>
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                KWESHUN
                <span className="w-1.5 h-1.5 rounded-full bg-[#0df2c9] inline-block"></span>
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#0df2c9] block -mt-1 font-bold">
                ACADEMIC ARENA
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#0df2c9] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="hover:text-[#0df2c9] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('subjects')}
              className="hover:text-[#0df2c9] transition-colors cursor-pointer"
            >
              Subjects
            </button>
            <button 
              onClick={() => scrollToSection('progression')}
              className="hover:text-[#0df2c9] transition-colors cursor-pointer"
            >
              Progression
            </button>
          </nav>

          {/* Right Action Buttons & Theme Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[#0df2c9] hover:border-[#0df2c9]/50 transition-all cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] hover:text-[#0df2c9] transition-colors cursor-pointer"
            >
              Log In
            </button>

            <button
              onClick={() => navigate('/signup')}
              className="px-5 py-2.5 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-5 py-4 space-y-3 animate-fadeIn">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[#0df2c9]"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[#0df2c9]"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('subjects')}
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[#0df2c9]"
            >
              Subjects
            </button>
            <button
              onClick={() => scrollToSection('progression')}
              className="block w-full text-left py-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[#0df2c9]"
            >
              Progression
            </button>
            <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 text-center text-sm font-bold text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-2.5 text-center text-sm font-black bg-[#0df2c9] text-slate-950 rounded-xl shadow-md"
              >
                Sign Up / Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* -------------------------------------------------------------------------- */}
      {/* HERO SECTION                                                               */}
      {/* -------------------------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Background Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0df2c9]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#8b5cf6]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0df2c9]/10 border border-[#0df2c9]/30 text-[#0df2c9] text-xs font-mono font-bold uppercase tracking-wider animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5" />
              Next-Generation Academic Gaming
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-white">
              TURN KNOWLEDGE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0df2c9] via-[#22d3ee] to-[#a855f7]">
                INTO COMPETITION.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Kweshun is a gamified academic competition platform where students can practice, battle AI opponents, create questions, earn Distinction Points (DP), and climb the global leaderboard.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl hover:shadow-xl hover:shadow-[#0df2c9]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
              >
                Start Learning
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={() => scrollToSection('how-it-works')}
                className="w-full sm:w-auto px-8 py-4 bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] font-bold text-sm uppercase tracking-wider rounded-2xl border border-[var(--border-subtle)] hover:border-[#0df2c9]/50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#0df2c9]" />
                Explore Kweshun
              </button>
            </div>
          </div>

          {/* Interactive Visual Platform Preview */}
          <div className="mt-14 max-w-4xl mx-auto relative group">
            {/* Glow border backdrop */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#0df2c9]/40 via-[#8b5cf6]/40 to-[#0df2c9]/40 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-1000 -z-10" />

            <div className="bg-[#111927] border border-[#22334d] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Battle Arena Header Strip */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1b273a]">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-[#0df2c9]/20 border border-[#0df2c9]/40 text-[#0df2c9] font-mono text-xs font-bold flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5" />
                    LIVE DUEL • ROUND 3/5
                  </span>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">AP Physics 1: Mechanics</span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    7-Day Streak
                  </span>
                  <span className="text-[#0df2c9] bg-[#0df2c9]/10 border border-[#0df2c9]/30 px-2.5 py-1 rounded-lg font-bold">
                    +120 DP Stake
                  </span>
                </div>
              </div>

              {/* Head to Head Duel Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 py-2">
                <div className="flex items-center gap-3 bg-[#0b101b] p-3 rounded-2xl border border-[#1b273a]">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                    alt="You"
                    className="w-10 h-10 rounded-xl object-cover border border-[#0df2c9]"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">You (Scholar)</div>
                    <div className="text-sm font-mono font-black text-[#0df2c9]">2 PTS</div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-[#0df2c9] flex items-center justify-center text-xs font-mono font-bold text-[#0df2c9] shadow-sm shadow-[#0df2c9]/20">
                    12s
                  </div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 mt-1">BEST OF 5</span>
                </div>

                <div className="flex items-center justify-end gap-3 bg-[#0b101b] p-3 rounded-2xl border border-[#1b273a] text-right">
                  <div>
                    <div className="text-xs font-bold text-white">Abram Mango (AI)</div>
                    <div className="text-sm font-mono font-black text-[#8b5cf6]">1 PTS</div>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                    alt="AI Opponent"
                    className="w-10 h-10 rounded-xl object-cover border border-[#8b5cf6]"
                  />
                </div>
              </div>

              {/* Question Sample Box */}
              <div className="bg-[#0b101b] border border-[#22334d] p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-[#0df2c9] font-bold">CONCEPT: ROTATIONAL MOMENTUM</span>
                  <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Hard</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                  A skater spins with arms outstretched and suddenly pulls them in. What happens to their rotational kinetic energy and why?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                    <span className="w-5 h-5 rounded-md bg-emerald-400 text-slate-950 font-bold flex items-center justify-center text-[10px]">A</span>
                    Increases because work is done pulling arms inward
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#111927] border border-[#22334d] text-slate-400 text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#1b273a] text-slate-300 font-bold flex items-center justify-center text-[10px]">B</span>
                    Remains constant because angular momentum is conserved
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------- */}
      {/* HOW KWESHUN WORKS (4 STEPS)                                                */}
      {/* -------------------------------------------------------------------------- */}
      <section id="how-it-works" className="py-20 bg-[var(--bg-surface)] border-y border-[var(--border-subtle)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0df2c9]">
              STEP-BY-STEP MASTERY
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              HOW KWESHUN WORKS
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Transform your daily study into an exhilarating competitive experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[#0df2c9]/50 rounded-2xl p-6 relative flex flex-col justify-between group transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-black text-[#0df2c9] opacity-70 group-hover:opacity-100 transition-opacity">
                      {step.num}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-[#0df2c9]/10 text-[#0df2c9] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-black text-[var(--text-primary)] group-hover:text-[#0df2c9] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[#0df2c9] flex items-center gap-1">
                  <span>Phase {idx + 1}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------- */}
      {/* KEY FEATURES                                                               */}
      {/* -------------------------------------------------------------------------- */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0df2c9]">
              PLATFORM ARSENAL
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              DESIGNED FOR ACADEMIC TRIUMPH
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Everything you need to practice, compete, author, and track mastery in one cohesive arena.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[#0df2c9]/50 rounded-2xl p-6 space-y-4 group transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      feat.color === 'mint'
                        ? 'bg-[#0df2c9]/10 text-[#0df2c9]'
                        : feat.color === 'purple'
                        ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]'
                        : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                    }`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#0df2c9] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-2 text-xs font-bold text-[#0df2c9] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------- */}
      {/* SUBJECTS & DECKS PREVIEW                                                   */}
      {/* -------------------------------------------------------------------------- */}
      <section id="subjects" className="py-20 bg-[var(--bg-surface)] border-y border-[var(--border-subtle)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0df2c9]">
                CURRICULUM REPOSITORY
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                EXPLORE ACADEMIC TOPICS
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Peer-reviewed question decks covering foundational principles and complex problem-solving.
              </p>
            </div>

            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-3 bg-[#0df2c9] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              Explore All Decks
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decksPreview.map((deck, idx) => (
              <div
                key={idx}
                className="bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[#0df2c9]/50 rounded-2xl p-6 flex flex-col justify-between group transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{deck.icon}</span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#0df2c9]/10 text-[#0df2c9] font-bold border border-[#0df2c9]/30">
                      {deck.mastery}% Avg Mastery
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[#0df2c9] transition-colors">
                    {deck.title}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {deck.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-mono">{deck.questions} Questions</span>
                  <button
                    onClick={() => navigate('/signup')}
                    className="text-[#0df2c9] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Start Practice <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------- */}
      {/* GAMIFICATION & PROGRESSION DEMO SECTION                                    */}
      {/* -------------------------------------------------------------------------- */}
      <section id="progression" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0df2c9]">
              SCHOLAR DISTINCTION METRICS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              BUILT-IN PROGRESSION & REWARDS
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Every battle won, question authored, and streak maintained builds your academic reputation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-5 rounded-2xl text-center space-y-1">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#0df2c9]/10 text-[#0df2c9] flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black font-mono text-[#0df2c9]">2,966</div>
              <div className="text-[11px] font-bold uppercase text-[var(--text-muted)]">DP Earned</div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-5 rounded-2xl text-center space-y-1">
              <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-400">7 Days</div>
              <div className="text-[11px] font-bold uppercase text-[var(--text-muted)]">Active Streak</div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-5 rounded-2xl text-center space-y-1">
              <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black font-mono text-purple-400">68%</div>
              <div className="text-[11px] font-bold uppercase text-[var(--text-muted)]">Deck Mastery</div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-5 rounded-2xl text-center space-y-1">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400">66%</div>
              <div className="text-[11px] font-bold uppercase text-[var(--text-muted)]">Duel Accuracy</div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-5 rounded-2xl text-center space-y-1 col-span-2 md:col-span-1">
              <div className="w-10 h-10 mx-auto rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black font-mono text-rose-400">#1 Rank</div>
              <div className="text-[11px] font-bold uppercase text-[var(--text-muted)]">Scholar Tier</div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------- */}
      {/* FINAL CALL TO ACTION                                                       */}
      {/* -------------------------------------------------------------------------- */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-tr from-[#111927] to-[#1a253a] border border-[#22334d] rounded-3xl p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0df2c9]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8b5cf6]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0df2c9]/10 text-[#0df2c9] text-xs font-mono font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Join the Academic Arena
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              READY TO CHALLENGE YOURSELF?
            </h2>

            <p className="text-xs sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              Sign up today, choose your focus subjects, and jump straight into head-to-head academic duels against AI scholars.
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl hover:shadow-xl hover:shadow-[#0df2c9]/30 hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg"
              >
                Create Your Kweshun Account
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------- */}
      {/* FOOTER                                                                     */}
      {/* -------------------------------------------------------------------------- */}
      <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0df2c9] to-[#8b5cf6] flex items-center justify-center text-slate-950 font-black text-sm">
              K
            </div>
            <div>
              <span className="font-black text-sm text-[var(--text-primary)]">KWESHUN</span>
              <p className="text-[11px] text-[var(--text-muted)]">Gamified Academic Competition Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--text-secondary)] font-medium">
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#0df2c9] cursor-pointer">
              How It Works
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[#0df2c9] cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollToSection('subjects')} className="hover:text-[#0df2c9] cursor-pointer">
              Subjects
            </button>
            <Link to="/signup" className="hover:text-[#0df2c9]">
              Sign Up
            </Link>
            <Link to="/login" className="hover:text-[#0df2c9]">
              Log In
            </Link>
          </div>

          <div className="text-[11px] text-[var(--text-muted)] font-mono">
            © {new Date().getFullYear()} Kweshun. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
