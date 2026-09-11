import React from 'react';
import { Award, Zap, BarChart2, BookOpen, CheckCircle, Sparkles } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';

export default function QualityDashboard() {
  const { userQuestions } = useGame();
  const { currentUser } = useAuth();

  // Calculate composite stats
  let totalOrig = 0, totalFact = 0, totalDiff = 0, totalDist = 0, totalCite = 0, totalComp = 0;
  const count = userQuestions.length || 1;

  userQuestions.forEach(q => {
    const s = q.qualityScores || {};
    totalOrig += s.originality || 92;
    totalFact += s.factualVerification || 88;
    totalDiff += s.difficultyBalance || 79;
    totalDist += s.answerDistinction || 85;
    totalCite += s.sourceCitations || 84;
    totalComp += s.composite || 86;
  });

  const scores = {
    originality: Math.round(totalOrig / count),
    factualVerification: Math.round(totalFact / count),
    difficultyBalance: Math.round(totalDiff / count),
    answerDistinction: Math.round(totalDist / count),
    sourceCitations: Math.round(totalCite / count),
    composite: Math.round(totalComp / count)
  };

  let grade = 'A-';
  if (scores.composite >= 95) grade = 'A+';
  else if (scores.composite >= 90) grade = 'A';
  else if (scores.composite >= 85) grade = 'A-';
  else if (scores.composite >= 80) grade = 'B+';
  else grade = 'B';

  const dimensions = [
    { label: 'Originality', value: scores.originality, weight: '20%', variant: 'mint' },
    { label: 'Factual Verification', value: scores.factualVerification, weight: '25%', variant: 'purple' },
    { label: 'Difficulty Balance', value: scores.difficultyBalance, weight: '20%', variant: 'gold' },
    { label: 'Answer Distinction', value: scores.answerDistinction, weight: '20%', variant: 'cyan' },
    { label: 'Source Citations', value: scores.sourceCitations, weight: '15%', variant: 'mint' }
  ];

  return (
    <div className="bg-gradient-to-br from-[#101726] to-[#0c1220] border border-[#1f2d47] rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Top Banner with Overall Score */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#1c273e]">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#00f59b]/15 border border-[#00f59b]/30 flex items-center justify-center text-[#00f59b] font-black text-2xl font-mono mint-glow flex-shrink-0">
            {grade}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#00f59b] font-bold">
                Quality Index
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#8b5cf6]/20 text-[#c4b5fd] border border-[#8b5cf6]/30">
                Verified System
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Question Quality Score
            </h2>
            <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
              Evaluated across 5 deterministic academic dimensions. High quality questions earn royalties on every match play.
            </p>
          </div>
        </div>

        {/* Big Numerical Score */}
        <div className="flex items-baseline gap-2 bg-[#090d16] border border-[#1f2d47] px-6 py-4 rounded-2xl">
          <span className="text-4xl sm:text-5xl font-black text-white font-mono">{scores.composite}</span>
          <span className="text-lg font-bold text-[#64748b] font-mono">/ 100</span>
        </div>
      </div>

      {/* 5 Quality Dimensions with Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {dimensions.map((dim) => (
          <div key={dim.label} className="p-4 rounded-2xl bg-[#090d16] border border-[#182238] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#94a3b8] font-medium mb-1.5">
                <span className="truncate">{dim.label}</span>
                <span className="text-[10px] font-mono text-[#64748b]">{dim.weight}</span>
              </div>
              <div className="text-xl font-extrabold text-white font-mono mb-3">
                {dim.value}%
              </div>
            </div>
            <ProgressBar value={dim.value} max={100} variant={dim.variant} height="h-2" />
          </div>
        ))}
      </div>

      {/* Supporting Academic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-[#090d16] border border-[#182238] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#00f59b]/15 text-[#00f59b]">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-[#64748b]">Global Accuracy</div>
            <div className="text-lg font-bold text-white mt-0.5">{currentUser.globalAccuracy || 61}%</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090d16] border border-[#182238] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#8b5cf6]/15 text-[#c4b5fd]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-[#64748b]">Authoring Royalties</div>
            <div className="text-lg font-bold text-[#00f59b] font-mono mt-0.5">{currentUser.royaltiesEarned || 128} DP</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090d16] border border-[#182238] flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#f59e0b]/15 text-[#fbbf24]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-[#64748b]">Most Played Deck</div>
            <div className="text-lg font-bold text-white mt-0.5">{currentUser.mostPlayedDeck || 'Science'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
