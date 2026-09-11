import React, { useState, useEffect, useRef } from 'react';
import { Zap, Clock, Trophy, Flame, Play, X, ArrowRight, RotateCcw, CheckCircle2, XCircle, Sparkles, Award } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import dataStore from '../../services/dataStore';

export default function LightningArenaModal({ isOpen, onClose }) {
  const { questions } = useGame();
  const { currentUser, user } = useAuth();
  const effectiveUser = currentUser || user || dataStore.getCurrentUser();

  // Arena States: 'intro' | 'playing' | 'results'
  const [arenaState, setArenaState] = useState('intro');
  const [arenaQuestions, setArenaQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(12);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalDPEarned, setTotalDPEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [answersHistory, setAnswersHistory] = useState([]);

  const timerRef = useRef(null);
  const autoAdvanceRef = useRef(null);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setArenaState('intro');
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(12);
      setCorrectCount(0);
      setTotalDPEarned(0);
      setStreak(0);
      setHighestStreak(0);
      setAnswersHistory([]);
    } else {
      clearInterval(timerRef.current);
      clearTimeout(autoAdvanceRef.current);
    }
  }, [isOpen]);

  // Timer countdown during 'playing' state
  useEffect(() => {
    if (arenaState !== 'playing' || isAnswered) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [arenaState, isAnswered, currentIndex]);

  const handleStartArena = () => {
    // Select 10 random STEM questions
    let pool = questions.filter((q) => q.category === 'Science' || q.deckId?.startsWith('deck_'));
    if (pool.length < 10) pool = questions;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    setArenaQuestions(selected);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(12);
    setCorrectCount(0);
    setTotalDPEarned(0);
    setStreak(0);
    setHighestStreak(0);
    setAnswersHistory([]);
    setQuestionStartTime(Date.now());
    setArenaState('playing');
  };

  const currentQ = arenaQuestions[currentIndex] || arenaQuestions[0];
  const total = arenaQuestions.length || 10;

  const correctIdx = currentQ ? (
    typeof currentQ.correctAnswerIndex === 'number'
      ? currentQ.correctAnswerIndex
      : (typeof currentQ.correctIndex === 'number'
        ? currentQ.correctIndex
        : (currentQ.options?.findIndex((o) => o.isCorrect) ?? 0))
  ) : 0;

  const handleSelectOption = (idx) => {
    if (isAnswered || arenaState !== 'playing') return;

    clearInterval(timerRef.current);
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === correctIdx;
    const responseTimeSec = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
    
    // Speed scoring with Double DP Event: Base 15 + Speed Bonus (up to 9) * 2 = 24 to 48 DP per correct question!
    const speedBonus = Math.max(0, 12 - responseTimeSec);
    const questionDP = isCorrect ? (15 + speedBonus) * 2 : 0;

    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > highestStreak) setHighestStreak(newStreak);

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setTotalDPEarned((prev) => prev + questionDP);
    }

    if (currentQ?.id) {
      dataStore.recordQuestionAttempt(currentQ.id, idx, isCorrect, responseTimeSec * 1000);
    }

    setAnswersHistory((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        isCorrect,
        timeSec: responseTimeSec,
        dp: questionDP
      }
    ]);

    // Auto advance after 1.4s
    autoAdvanceRef.current = setTimeout(() => {
      handleNextPrompt();
    }, 1400);
  };

  const handleTimeExpired = () => {
    if (isAnswered || arenaState !== 'playing') return;

    setSelectedOption(-1); // Timed out
    setIsAnswered(true);
    setStreak(0);

    setAnswersHistory((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        isCorrect: false,
        timeSec: 12,
        dp: 0
      }
    ]);

    autoAdvanceRef.current = setTimeout(() => {
      handleNextPrompt();
    }, 1400);
  };

  const handleNextPrompt = () => {
    clearTimeout(autoAdvanceRef.current);
    if (currentIndex + 1 < total) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(12);
      setQuestionStartTime(Date.now());
    } else {
      finishArena();
    }
  };

  const finishArena = () => {
    clearInterval(timerRef.current);
    clearTimeout(autoAdvanceRef.current);
    setArenaState('results');

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Confetti fallback
    }

    // Award DP in DataStore
    if (totalDPEarned > 0 && effectiveUser) {
      dataStore.addDPTransaction(
        effectiveUser.id,
        totalDPEarned,
        `Daily Lightning Arena: ${correctCount}/${total} Prompts Solved (Double DP)`,
        'lightning',
        `lightning_${Date.now()}`
      );

      dataStore.addActivity(
        effectiveUser.id,
        'lightning_completed',
        'Daily Lightning Completed',
        `Harvested +${totalDPEarned} DP in Lightning Arena (${correctCount}/${total} correct).`,
        '#8b5cf6',
        'Zap'
      );
    }
  };

  if (!isOpen) return null;

  const timerPercent = (timeLeft / 12) * 100;
  const timerColor = timeLeft <= 3 ? 'text-rose-400 border-rose-500' : timeLeft <= 6 ? 'text-amber-400 border-amber-500' : 'text-[#0df2c9] border-[#0df2c9]';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        arenaState === 'intro'
          ? 'Daily Lightning Arena'
          : arenaState === 'playing'
          ? `Lightning Arena • Prompt ${currentIndex + 1} of ${total}`
          : 'Lightning Arena Summary'
      }
      subtitle={
        arenaState === 'intro'
          ? 'Timed Speed Duel — Double DP Event'
          : arenaState === 'playing'
          ? '12s Countdown • 2.0x Double DP Multiplier Active'
          : 'Event Rewards & Accuracy Report'
      }
    >
      {/* 1. INTRO SCREEN */}
      {arenaState === 'intro' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1b123d] via-[#120d2c] to-[#090717] border border-[#4c3596] relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Zap className="w-56 h-56 text-[#8b5cf6]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8b5cf6]/25 border border-[#8b5cf6]/50 text-[#c4b5fd] text-xs font-mono font-bold tracking-wide uppercase mb-3">
              <Flame className="w-3.5 h-3.5 text-[#fbbf24] fill-[#fbbf24]" />
              Double Points Active
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              10 Rapid-Fire STEM Prompts
            </h3>
            <p className="text-xs sm:text-sm text-[#c4b5fd]/90 mt-2 leading-relaxed">
              Test your split-second reflexes across AP Physics, AP Calculus, and AP Chemistry. Answer fast within 12 seconds per turn to maximize your Distinction harvest!
            </p>

            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-[#332367] text-center">
              <div className="bg-[#0b0818]/60 p-3 rounded-xl border border-[#2b1e56]">
                <div className="text-[10px] font-mono uppercase text-[#94a3b8]">Format</div>
                <div className="text-base font-extrabold text-white mt-0.5">10 Prompts</div>
              </div>
              <div className="bg-[#0b0818]/60 p-3 rounded-xl border border-[#2b1e56]">
                <div className="text-[10px] font-mono uppercase text-[#94a3b8]">Time Limit</div>
                <div className="text-base font-extrabold text-amber-400 mt-0.5">12s / prompt</div>
              </div>
              <div className="bg-[#0b0818]/60 p-3 rounded-xl border border-[#2b1e56]">
                <div className="text-[10px] font-mono uppercase text-[#94a3b8]">Max Reward</div>
                <div className="text-base font-extrabold text-[#0df2c9] mt-0.5">+240 DP</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#1f2d47] text-[#94a3b8] hover:text-white hover:bg-[#131b2e] text-xs font-semibold transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
            <button
              onClick={handleStartArena}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#0df2c9] text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-[#8b5cf6]/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Enter Lightning Arena Now</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. PLAYABLE RAPID-FIRE GAMEPLAY */}
      {arenaState === 'playing' && currentQ && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Status Bar: Progress, Timer, Live DP */}
          <div className="flex items-center justify-between bg-[#111927] border border-[#22334d] p-3.5 rounded-2xl">
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Prompt <span className="text-white font-bold">{currentIndex + 1}</span> of {total}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">{correctCount} Correct</span>
                {streak > 1 && (
                  <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    {streak}x Combo
                  </span>
                )}
              </div>
            </div>

            {/* Circular Timer Display */}
            <div className="flex flex-col items-center">
              <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-mono font-black text-base transition-colors ${timerColor}`}>
                {timeLeft}s
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Pot Gained</div>
              <div className="text-base font-extrabold font-mono text-[#0df2c9] flex items-center justify-end gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#0df2c9]" />
                +{totalDPEarned} DP
              </div>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="w-full bg-[#1b273a] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeLeft <= 3 ? 'bg-rose-500' : timeLeft <= 6 ? 'bg-amber-400' : 'bg-[#0df2c9]'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>

          {/* Prompt Question */}
          <div className="bg-[#0b101b] border border-[#22334d] p-5 rounded-2xl space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <Badge variant="purple">{currentQ.deckName || currentQ.topic || 'STEM Focus'}</Badge>
              <span className="text-[10px] font-mono text-[#0df2c9] bg-[#0df2c9]/15 px-2 py-0.5 rounded font-bold">
                2.0x Double DP
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
              {currentQ.prompt || currentQ.text}
            </p>
          </div>

          {/* 4 Quick Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options?.map((opt, idx) => {
              const optionText = typeof opt === 'string' ? opt : opt.text;
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === idx;
              const isOptionCorrect = idx === correctIdx;

              let btnClass = 'bg-[#111927] border-[#22334d] hover:border-[#0df2c9]/50 text-slate-200';
              if (isAnswered) {
                if (isOptionCorrect) {
                  btnClass = 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold';
                } else if (isSelected && !isOptionCorrect) {
                  btnClass = 'bg-rose-500/25 border-rose-400 text-rose-300 font-bold';
                } else {
                  btnClass = 'bg-[#111927]/60 border-[#22334d] text-slate-500 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${btnClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                        isAnswered && isOptionCorrect
                          ? 'bg-emerald-400 text-slate-950 font-black'
                          : isAnswered && isSelected && !isOptionCorrect
                          ? 'bg-rose-400 text-slate-950 font-black'
                          : isSelected
                          ? 'bg-[#0df2c9] text-slate-950 font-black'
                          : 'bg-[#1b273a] text-slate-400'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1 leading-snug">{optionText}</span>
                  </div>

                  {isAnswered && isOptionCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                  {isAnswered && isSelected && !isOptionCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Concept note once answered */}
          {isAnswered && (
            <div className="bg-[#0b101b] border border-[#22334d] p-3.5 rounded-xl text-xs text-slate-300 animate-fadeIn">
              <span className="font-bold text-[#0df2c9]">Key Concept: </span>
              {currentQ.explanation || 'Accurately derived from foundational STEM principles.'}
            </div>
          )}

          {/* Skip / Next CTA if user doesn't want to wait for auto-advance */}
          {isAnswered && (
            <div className="flex justify-end pt-1">
              <button
                onClick={handleNextPrompt}
                className="px-5 py-2 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {currentIndex + 1 < total ? 'Next Prompt' : 'View Arena Summary'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. ARENA RESULTS SUMMARY */}
      {arenaState === 'results' && (
        <div className="space-y-6 text-center py-4 animate-fadeIn">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#8b5cf6]/30 to-[#0df2c9]/30 border border-[#0df2c9]/50 flex items-center justify-center text-[#0df2c9] shadow-xl">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white tracking-tight">
              Lightning Arena Concluded!
            </h3>
            <p className="text-xs text-slate-400">
              10 rapid-fire prompts completed with 2.0x Double Points multiplier.
            </p>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#111927] border border-[#22334d] p-4 rounded-xl">
              <div className="text-[10px] font-mono uppercase text-slate-400">Solved</div>
              <div className="text-2xl font-extrabold font-mono text-white mt-1">
                {correctCount} / {total}
              </div>
            </div>
            <div className="bg-[#111927] border border-[#22334d] p-4 rounded-xl">
              <div className="text-[10px] font-mono uppercase text-slate-400">Accuracy</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                {Math.round((correctCount / total) * 100)}%
              </div>
            </div>
            <div className="bg-[#111927] border border-[#22334d] p-4 rounded-xl">
              <div className="text-[10px] font-mono uppercase text-slate-400">DP Harvest</div>
              <div className="text-2xl font-extrabold font-mono text-[#0df2c9] mt-1">
                +{totalDPEarned} DP
              </div>
            </div>
          </div>

          {/* Streak & Speed Summary */}
          <div className="p-4 bg-[#0b101b] border border-[#22334d] rounded-2xl flex items-center justify-around text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Highest Streak: <strong>{highestStreak}x Combo</strong></span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#8b5cf6]" />
              <span>Double DP Event: <strong>2.0x Applied</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#1b273a]">
            <button
              onClick={handleStartArena}
              className="px-5 py-2.5 bg-[#1b273a] hover:bg-[#25354e] text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Play Another Arena
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all cursor-pointer"
            >
              Return to Campus
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
