import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Check, ArrowRight, BookOpen, Atom, 
  Binary, Dna, Landmark, TrendingUp, Trophy, Flame,
  Shield, CheckCircle2, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { currentUser, user, updateUserSubjects } = useAuth();
  const effectiveUser = currentUser || user || { name: 'Scholar' };
  const { isDarkMode } = useTheme();

  const [step, setStep] = useState(1); // 1: Subject Selection, 2: Welcome Screen
  const [selectedSubjects, setSelectedSubjects] = useState(['Physics', 'Mathematics']);

  const subjectsList = [
    { id: 'Physics', name: 'Physics', icon: '⚛️', desc: 'Mechanics, electromagnetism, and thermodynamics' },
    { id: 'Chemistry', name: 'Chemistry', icon: '🧪', desc: 'Molecular bonds, equilibrium, and stoichiometry' },
    { id: 'Mathematics', name: 'Mathematics', icon: '📐', desc: 'Calculus, algebra, discrete math, and geometry' },
    { id: 'Biology', name: 'Biology', icon: '🧬', desc: 'Cellular biology, genetics, and ecology' },
    { id: 'Computer Science', name: 'Computer Science', icon: '💻', desc: 'Algorithms, data structures, and computing logic' },
    { id: 'History', name: 'History', icon: '🏛️', desc: 'World civilizations, constitutional systems, and geopolitics' },
    { id: 'Economics', name: 'Economics', icon: '📈', desc: 'Macroeconomics, market mechanisms, and trade theory' }
  ];

  const handleToggleSubject = (subjectId) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((s) => s !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleContinueToWelcome = () => {
    updateUserSubjects(selectedSubjects);
    setStep(2);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleEnterKweshun = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0df2c9]/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0df2c9] to-[#8b5cf6] flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-[#0df2c9]/20">
          K
        </div>
        <span className="font-black text-xl tracking-tight text-white">
          KWESHUN
        </span>
      </div>

      {step === 1 ? (
        /* STEP 1: SUBJECT SETUP */
        <div className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0df2c9]/10 text-[#0df2c9] text-xs font-mono font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Step 1 of 2 • Curriculum Setup
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              What would you like to study?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Select the initial subjects to add to your repository. You can add or create custom subjects anytime.
            </p>
          </div>

          {/* Subject Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {subjectsList.map((subj) => {
              const isSelected = selectedSubjects.includes(subj.id);
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => handleToggleSubject(subj.id)}
                  className={`p-4 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0df2c9]/15 border-[#0df2c9] shadow-sm shadow-[#0df2c9]/20 scale-[1.01]'
                      : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[#0df2c9]/40 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{subj.icon}</span>
                    <div>
                      <div className={`text-sm font-bold ${isSelected ? 'text-[#0df2c9]' : 'text-[var(--text-primary)]'}`}>
                        {subj.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                        {subj.desc}
                      </div>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-[#0df2c9] text-slate-950 font-black' : 'border border-[var(--border-subtle)] bg-[var(--bg-input)]'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleContinueToWelcome}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              Continue
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: WELCOME SCREEN */
        <div className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-10 text-center space-y-8 shadow-2xl relative animate-fadeIn">
          <div className="w-18 h-18 mx-auto rounded-3xl bg-gradient-to-tr from-[#0df2c9] to-[#8b5cf6] p-[2px] shadow-xl shadow-[#0df2c9]/25 flex items-center justify-center">
            <div className="w-full h-full bg-[#090d16] rounded-[22px] flex items-center justify-center">
              <BookOpen className="w-9 h-9 text-[#0df2c9]" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0df2c9]">
              REPOSITORY INITIALIZED
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              WELCOME TO KWESHUN, {effectiveUser.name.toUpperCase()}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Your academic question repository is ready. Create custom subjects, author long-form questions, and attach equations and figures.
            </p>
          </div>

          {/* User Starting Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-3.5 rounded-2xl">
              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Status</div>
              <div className="text-base font-black text-[#0df2c9] mt-0.5">Active</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-3.5 rounded-2xl">
              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Repository</div>
              <div className="text-base font-black text-[var(--text-primary)] font-mono mt-0.5">Isolated</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-3.5 rounded-2xl">
              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Subjects</div>
              <div className="text-base font-black text-amber-400 font-mono mt-0.5">{selectedSubjects.length} Ready</div>
            </div>
          </div>

          {/* Selected Subjects Pill Box */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-4 rounded-2xl text-left space-y-2">
            <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Enrolled Disciplines ({selectedSubjects.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedSubjects.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg bg-[#0df2c9]/15 border border-[#0df2c9]/40 text-[#0df2c9] text-xs font-bold font-mono"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>

          {/* Enter Kweshun CTA */}
          <div className="pt-2">
            <button
              onClick={handleEnterKweshun}
              className="w-full py-4 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl hover:shadow-xl hover:shadow-[#0df2c9]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              Enter Kweshun
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
