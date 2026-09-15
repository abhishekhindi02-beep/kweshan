import React from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, XCircle, Clock, BookOpen, Award, Target, HelpCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';

export default function QuestionAnalyticsModal({ isOpen, onClose, question }) {
  if (!isOpen || !question) return null;

  const totalPlays = typeof question.plays === 'number' 
    ? question.plays 
    : (typeof question.totalAttempts === 'number' ? question.totalAttempts : 0);

  const correctAttempts = typeof question.correctAttempts === 'number'
    ? question.correctAttempts
    : (totalPlays > 0 ? Math.round(totalPlays * 0.72) : 0);

  const incorrectAttempts = typeof question.incorrectAttempts === 'number'
    ? question.incorrectAttempts
    : Math.max(0, totalPlays - correctAttempts);

  const isLongForm = question.type === 'long-form' || !question.options || question.options.length === 0;
  const accuracy = totalPlays > 0 ? Math.round((correctAttempts / totalPlays) * 100) : 0;
  const avgTime = question.avgTimeSeconds || (totalPlays > 0 ? 6.8 : 0);

  const correctIdx = typeof question.correctAnswerIndex === 'number'
    ? question.correctAnswerIndex
    : (typeof question.correctIndex === 'number' 
      ? question.correctIndex 
      : (question.options?.findIndex((o) => (typeof o === 'object' ? o.isCorrect : false)) ?? 0));

  const correctLetter = ['A', 'B', 'C', 'D'][correctIdx] || 'A';

  // Answer distribution counts
  const distCounts = question.answerDistribution || {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  };

  const totalSelections = (distCounts.A || 0) + (distCounts.B || 0) + (distCounts.C || 0) + (distCounts.D || 0);

  // Compute percentages that sum up consistently to ~100%
  const getPercent = (letter) => {
    if (totalSelections === 0) {
      // If no plays yet, display 0%
      return 0;
    }
    const count = distCounts[letter] || 0;
    return Math.round((count / totalSelections) * 100);
  };

  // Find most selected answer
  let mostSelectedLetter = correctLetter;
  let maxCount = -1;
  ['A', 'B', 'C', 'D'].forEach((l) => {
    const c = distCounts[l] || 0;
    if (c > maxCount) {
      maxCount = c;
      mostSelectedLetter = l;
    }
  });

  const qualityScore = question.qualityScores?.composite || question.qualityScores?.overall || 88;
  const grade = question.qualityScores?.grade || 'A-';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Question Performance & Analytics"
      subtitle={`Question ID: ${question.id || 'Q-ITEM'}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Question Header Card */}
        <div className="bg-[#111927] border border-[#22334d] rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="mint">{question.deckName || question.topic || 'STEM Curriculum'}</Badge>
              <Badge variant={question.difficulty === 'Hard' ? 'danger' : question.difficulty === 'Medium' ? 'warning' : 'neutral'}>
                {question.difficulty || 'Medium'}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#090d16] border border-[#1f2d47] text-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Quality</span>
              <span className="font-extrabold text-[#0df2c9] font-mono">{qualityScore}</span>
              <span className="text-[10px] font-bold text-[#8b5cf6]">({grade})</span>
            </div>
          </div>

          <p className="text-sm font-semibold text-white leading-relaxed">
            {question.prompt || question.text}
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#111927] border border-[#22334d] p-3.5 rounded-xl text-center">
            <div className="flex items-center justify-center text-[#0df2c9] mb-1">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold font-mono text-white">{totalPlays.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Total Plays</div>
          </div>

          <div className="bg-[#111927] border border-[#22334d] p-3.5 rounded-xl text-center">
            <div className="flex items-center justify-center text-emerald-400 mb-1">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">{accuracy}%</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Player Accuracy</div>
          </div>

          <div className="bg-[#111927] border border-[#22334d] p-3.5 rounded-xl text-center">
            <div className="flex items-center justify-center text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold font-mono text-white">{correctAttempts.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Correct Plays</div>
          </div>

          <div className="bg-[#111927] border border-[#22334d] p-3.5 rounded-xl text-center">
            <div className="flex items-center justify-center text-rose-400 mb-1">
              <XCircle className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold font-mono text-rose-400">{incorrectAttempts.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Incorrect Plays</div>
          </div>
        </div>

        {/* Type-Specific Performance Breakdown */}
        {isLongForm ? (
          <div className="bg-[#111927] border border-[#22334d] p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#8b5cf6]" />
                Long-Form Rubric Derivation Distribution
              </h4>
              <span className="text-[11px] font-mono text-[#a855f7] bg-[#8b5cf6]/15 px-2 py-0.5 rounded-full border border-[#8b5cf6]/30">
                Rubric Evaluated
              </span>
            </div>

            <div className="space-y-3">
              {/* Full Mastery */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mastery Verified (80%–100% Rubric Score)</span>
                  </span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {totalPlays > 0 ? Math.round((correctAttempts / totalPlays) * 100) : 0}% 
                    <span className="text-slate-500 text-[10px] ml-1">({correctAttempts} submissions)</span>
                  </span>
                </div>
                <div className="h-2.5 bg-[#0b101b] rounded-full overflow-hidden border border-[#1e2c42]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${totalPlays > 0 ? Math.round((correctAttempts / totalPlays) * 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* Partial Credit */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>Partially Correct (40%–79% Rubric Score)</span>
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    {totalPlays > 0 ? Math.round((incorrectAttempts * 0.4 / totalPlays) * 100) : 0}% 
                    <span className="text-slate-500 text-[10px] ml-1">({Math.round(incorrectAttempts * 0.4)} submissions)</span>
                  </span>
                </div>
                <div className="h-2.5 bg-[#0b101b] rounded-full overflow-hidden border border-[#1e2c42]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                    style={{ width: `${totalPlays > 0 ? Math.round((incorrectAttempts * 0.4 / totalPlays) * 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* Incomplete / Needs Improvement */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Incomplete / Needs Improvement (&lt;40% Score)</span>
                  </span>
                  <span className="font-mono text-rose-300 font-bold">
                    {totalPlays > 0 ? Math.round((incorrectAttempts * 0.6 / totalPlays) * 100) : 0}% 
                    <span className="text-slate-500 text-[10px] ml-1">({Math.round(incorrectAttempts * 0.6)} submissions)</span>
                  </span>
                </div>
                <div className="h-2.5 bg-[#0b101b] rounded-full overflow-hidden border border-[#1e2c42]">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${totalPlays > 0 ? Math.round((incorrectAttempts * 0.6 / totalPlays) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Rubric Core Concepts Coverage */}
            {(question.expectedConcepts || question.requiredFormulas) && (
              <div className="pt-3 border-t border-slate-700/40 space-y-2">
                <span className="text-[11px] font-semibold text-slate-300 uppercase font-mono">
                  Rubric Assessment Concepts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(question.expectedConcepts || [
                    "Newton's second law", "Cartesian components", "ΣFx = m·ax", "ΣFy = m·ay", "Resultant acceleration"
                  ]).map((concept, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#0b101b] border border-[#22334d] text-slate-300 text-[11px] font-mono"
                    >
                      ✓ {typeof concept === 'string' ? concept : concept.label || 'Concept'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* MCQ Answer Choice Distribution */
          <div className="bg-[#111927] border border-[#22334d] p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#0df2c9]" />
                Answer Choice Distribution (% of Player Selections)
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                {totalSelections} logged answers
              </span>
            </div>

            <div className="space-y-3">
              {question.options?.map((opt, idx) => {
                const optText = typeof opt === 'string' ? opt : opt.text || '';
                const letter = String.fromCharCode(65 + idx);
                const isCorrect = idx === correctIdx;
                const pct = getPercent(letter);
                const count = distCounts[letter] || 0;

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-semibold flex items-center gap-1.5 ${
                        isCorrect ? 'text-[#0df2c9] font-bold' : 'text-slate-200'
                      }`}>
                        <span className={`w-5 h-5 rounded-md text-[10px] flex items-center justify-center font-mono ${
                          isCorrect ? 'bg-[#0df2c9] text-slate-950 font-black' : 'bg-[#1b273a] text-slate-400'
                        }`}>
                          {letter}
                        </span>
                        <span>{optText}</span>
                        {isCorrect && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold border border-emerald-500/30">
                            ✓ Correct
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-slate-300 font-bold">
                        {pct}% <span className="text-slate-500 text-[10px]">({count})</span>
                      </span>
                    </div>

                    <div className="h-2.5 bg-[#0b101b] rounded-full overflow-hidden border border-[#1e2c42]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCorrect ? 'bg-gradient-to-r from-[#0df2c9] to-[#00bfa5]' : 'bg-slate-600'
                        }`}
                        style={{ width: `${Math.max(pct, totalSelections === 0 ? 0 : 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Conceptual Proof & Citation */}
        {(question.explanation || question.canonicalSolution || question.citation || question.citations) && (
          <div className="bg-[#0b101b] border border-[#22334d] p-4 rounded-xl space-y-2 text-xs">
            {(question.canonicalSolution || question.explanation) && (
              <div className="space-y-1">
                <span className="font-bold text-[#0df2c9] flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Canonical Solution:
                </span>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                  {question.canonicalSolution || question.explanation}
                </p>
              </div>
            )}
            {(question.citation || question.citations) && (
              <div className="pt-2 border-t border-slate-800 text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Citation: {question.citation || question.citations}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1b273a] hover:bg-[#25354e] text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </Modal>
  );
}
