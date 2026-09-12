import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2, XCircle, ArrowRight, Swords, Sparkles, BookOpen, Trophy, RotateCcw, User, Flame } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import dataStore from '../../services/dataStore';
import confetti from 'canvas-confetti';

export default function BattlePlayModal({ isOpen, onClose, battle, onComplete, battleId }) {
  const { questions, battles, submitAnswer } = useGame();
  const { currentUser, user } = useAuth();
  const effectiveUser = currentUser || user || dataStore.getCurrentUser();

  // Resolve battle object from prop or ID
  const activeBattle = battle || battles.find((b) => b.id === battleId);

  const [currentRound, setCurrentRound] = useState(1);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isRoundFinished, setIsRoundFinished] = useState(false);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [opponentCorrect, setOpponentCorrect] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [battleResult, setBattleResult] = useState(null);

  const timerRef = useRef(null);
  const opponentTimerRef = useRef(null);

  // Extract or build the 5 questions for this battle
  const [battleQuestions, setBattleQuestions] = useState([]);

  const initializedBattleIdRef = useRef(null);

  useEffect(() => {
    if (isOpen && activeBattle) {
      const battleKey = activeBattle.id || `${activeBattle.deckId}_${activeBattle.opponentName}`;
      // Prevent resetting ongoing/completed battle if it's already initialized
      if (initializedBattleIdRef.current === battleKey) {
        return;
      }
      initializedBattleIdRef.current = battleKey;

      let qList = [];
      if (activeBattle.questions && activeBattle.questions.length >= 5) {
        qList = activeBattle.questions;
      } else if (activeBattle.questionIds && activeBattle.questionIds.length > 0) {
        qList = activeBattle.questionIds.map((id) => questions.find((q) => q.id === id)).filter(Boolean);
      }

      if (qList.length < 5) {
        const matching = questions.filter((q) => q.deckId === activeBattle.deckId);
        if (matching.length >= 5) {
          qList = matching.slice(0, 5);
        } else {
          qList = questions.slice(0, 5);
        }
      }

      setBattleQuestions(qList.slice(0, 5));
      setCurrentRound(1);
      setUserScore(0);
      setOpponentScore(0);
      setSelectedOption(null);
      setIsRoundFinished(false);
      setOpponentAnswered(false);
      setOpponentCorrect(false);
      setIsGameOver(false);
      setBattleResult(null);
      const roundTime = activeBattle.timeRemainingSeconds || (activeBattle.format === 'sudden_death' ? 10 : 15);
      setTimeLeft(roundTime);
    } else if (!isOpen) {
      initializedBattleIdRef.current = null;
      clearInterval(timerRef.current);
      clearTimeout(opponentTimerRef.current);
    }
  }, [isOpen, activeBattle?.id]);

  // Round Timer
  useEffect(() => {
    if (!isOpen || isRoundFinished || isGameOver) {
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
  }, [isOpen, isRoundFinished, isGameOver, currentRound]);

  // Simulated AI opponent response
  useEffect(() => {
    if (!isOpen || isRoundFinished || isGameOver) {
      clearTimeout(opponentTimerRef.current);
      return;
    }

    setOpponentAnswered(false);
    // Opponent takes between 1.5s and 3.5s to answer
    const delay = 1500 + Math.random() * 2000;
    opponentTimerRef.current = setTimeout(() => {
      setOpponentAnswered(true);
      // AI opponent accuracy based on difficulty
      const aiAcc = activeBattle?.accuracy
        ? (activeBattle.accuracy > 1 ? activeBattle.accuracy / 100 : activeBattle.accuracy)
        : 0.72;
      setOpponentCorrect(Math.random() < aiAcc);
    }, delay);

    return () => clearTimeout(opponentTimerRef.current);
  }, [isOpen, currentRound, isRoundFinished, isGameOver]);

  if (!isOpen || !activeBattle || battleQuestions.length === 0) return null;

  const currentQ = battleQuestions[currentRound - 1] || battleQuestions[0];
  const maxRounds = 5;

  const correctIdx = typeof currentQ.correctAnswerIndex === 'number'
    ? currentQ.correctAnswerIndex
    : (typeof currentQ.correctIndex === 'number'
      ? currentQ.correctIndex
      : (currentQ.options?.findIndex((o) => o.isCorrect) ?? 0));

  const handleSelectOption = (idx) => {
    if (isRoundFinished || isGameOver) return;

    clearInterval(timerRef.current);
    setSelectedOption(idx);
    setIsRoundFinished(true);

    const isUserCorrect = idx === correctIdx;
    let newOpponentCorrect = opponentCorrect;
    
    // If opponent hasn't answered yet, simulate now
    if (!opponentAnswered) {
      const aiAcc = activeBattle?.accuracy
        ? (activeBattle.accuracy > 1 ? activeBattle.accuracy / 100 : activeBattle.accuracy)
        : 0.72;
      newOpponentCorrect = Math.random() < aiAcc;
      setOpponentAnswered(true);
      setOpponentCorrect(newOpponentCorrect);
    }

    const nextUserScore = userScore + (isUserCorrect ? 1 : 0);
    const nextOpponentScore = opponentScore + (newOpponentCorrect ? 1 : 0);

    setUserScore(nextUserScore);
    setOpponentScore(nextOpponentScore);
  };

  const handleTimeExpired = () => {
    if (isRoundFinished || isGameOver) return;

    setSelectedOption(-1);
    setIsRoundFinished(true);

    const aiAcc = activeBattle?.accuracy
      ? (activeBattle.accuracy > 1 ? activeBattle.accuracy / 100 : activeBattle.accuracy)
      : 0.65;
    const newOpponentCorrect = Math.random() < aiAcc;
    setOpponentAnswered(true);
    setOpponentCorrect(newOpponentCorrect);

    if (newOpponentCorrect) {
      setOpponentScore((prev) => prev + 1);
    }
  };

  const handleNextRound = () => {
    if (currentRound < maxRounds) {
      const roundTime = activeBattle.timeRemainingSeconds || (activeBattle.format === 'sudden_death' ? 10 : 15);
      setCurrentRound((prev) => prev + 1);
      setSelectedOption(null);
      setIsRoundFinished(false);
      setOpponentAnswered(false);
      setOpponentCorrect(false);
      setTimeLeft(roundTime);
    } else {
      finalizeBattle();
    }
  };

  const finalizeBattle = () => {
    clearInterval(timerRef.current);
    clearTimeout(opponentTimerRef.current);

    const isVictory = userScore > opponentScore;
    const isDraw = userScore === opponentScore;
    const resultType = isVictory ? 'victory' : isDraw ? 'draw' : 'defeat';
    const dpChange = isVictory ? (activeBattle.dpReward || 120) : isDraw ? 30 : -(activeBattle.dpLoss || 40);

    const result = {
      result: resultType,
      userScore,
      opponentScore,
      dpChange,
      battle: {
        ...activeBattle,
        userScore,
        opponentScore
      }
    };

    setIsGameOver(true);
    setBattleResult(result);

    if (isVictory) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }

    // Save result to DataStore
    if (effectiveUser) {
      effectiveUser.wins = isVictory ? (effectiveUser.wins || 0) + 1 : effectiveUser.wins;
      effectiveUser.losses = !isVictory && !isDraw ? (effectiveUser.losses || 0) + 1 : effectiveUser.losses;
      effectiveUser.totalBattles = (effectiveUser.wins || 0) + (effectiveUser.losses || 0);
      if (isVictory) effectiveUser.streak = (effectiveUser.streak || 0) + 1;

      dataStore.addDPTransaction(
        effectiveUser.id,
        dpChange,
        `Battle ${isVictory ? 'Victory' : isDraw ? 'Draw' : 'Defeat'} vs ${activeBattle.opponentName} (${userScore} - ${opponentScore})`,
        'battle',
        activeBattle.id
      );

      dataStore.addActivity(
        effectiveUser.id,
        isVictory ? 'battle_victory' : 'battle_defeat',
        isVictory ? `Won match vs ${activeBattle.opponentName}` : isDraw ? `Draw vs ${activeBattle.opponentName}` : `Match Defeat vs ${activeBattle.opponentName}`,
        `${dpChange >= 0 ? '+' : ''}${dpChange} DP in ${activeBattle.subject} (${userScore} - ${opponentScore}).`,
        isVictory ? '#00f59b' : isDraw ? '#f59e0b' : '#ef4444',
        'Swords'
      );
    }

    if (onComplete) {
      onComplete(result);
    }
  };

  const handleRematch = () => {
    // Pick fresh shuffled questions for rematch
    const matching = questions.filter((q) => q.deckId === activeBattle?.deckId);
    const pool = matching.length >= 5 ? matching : questions;
    const freshQuestions = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);
    setBattleQuestions(freshQuestions);

    setCurrentRound(1);
    setUserScore(0);
    setOpponentScore(0);
    setSelectedOption(null);
    setIsRoundFinished(false);
    setOpponentAnswered(false);
    setOpponentCorrect(false);
    setIsGameOver(false);
    setBattleResult(null);
    setTimeLeft(15);
  };

  const timerColor = timeLeft <= 4 ? 'text-rose-400 border-rose-500' : timeLeft <= 8 ? 'text-amber-400 border-amber-500' : 'text-[#0df2c9] border-[#0df2c9]';

  const isUserWinner = userScore > opponentScore;
  const isOpponentWinner = opponentScore > userScore;
  const isMatchDraw = userScore === opponentScore;
  const winnerName = isUserWinner ? (effectiveUser?.name || 'You') : isOpponentWinner ? activeBattle.opponentName : 'Draw (Tied)';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      title={
        isGameOver
          ? 'Match Concluded • Final Battle Results'
          : `Round ${currentRound} of ${maxRounds} • ${activeBattle.subject || 'Academic Duel'}`
      }
      subtitle={
        isGameOver
          ? `Winner: ${winnerName} (${userScore} - ${opponentScore})`
          : `Duel vs ${activeBattle.opponentName} (${activeBattle.opponentRank || 'Master Duelist'})`
      }
    >
      {!isGameOver ? (
        <div className="space-y-6">
          {/* Top Header Match Bar: User vs AI Opponent */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0b101b] border border-[#22334d] shadow-md">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <img
                src={effectiveUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={effectiveUser?.name}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-[#0df2c9] shadow-sm"
              />
              <div>
                <div className="text-xs font-bold text-white max-w-[110px] truncate">{effectiveUser?.name}</div>
                <div className="text-base font-black text-[#0df2c9] font-mono">{userScore} PTS</div>
              </div>
            </div>

            {/* Central Round & Timer */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono font-black text-lg ${timerColor} transition-colors`}>
                {timeLeft}s
              </div>
              <span className="text-[10px] font-mono uppercase text-slate-400 mt-1">
                Round {currentRound}/{maxRounds}
              </span>
            </div>

            {/* Opponent Info */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-xs font-bold text-white max-w-[110px] truncate">{activeBattle.opponentName}</div>
                <div className="text-base font-black text-[#8b5cf6] font-mono">{opponentScore} PTS</div>
              </div>
              <img
                src={activeBattle.opponentAvatar}
                alt={activeBattle.opponentName}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-[#8b5cf6] shadow-sm"
              />
            </div>
          </div>

          {/* AI Status Indicator */}
          <div className="flex items-center justify-between text-xs px-2">
            <span className="text-slate-400">
              {opponentAnswered ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {activeBattle.opponentName} locked in answer!
                </span>
              ) : (
                <span className="text-amber-400 font-medium flex items-center gap-1 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  {activeBattle.opponentName} is thinking...
                </span>
              )}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              Stake: +{activeBattle.dpReward || 120} DP / -{activeBattle.dpLoss || 40} DP
            </span>
          </div>

          {/* Question Card */}
          <div className="p-6 rounded-2xl bg-[#111927] border border-[#22334d] shadow-inner space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wider text-[#0df2c9] font-bold">
                {currentQ.topic || 'Subject Problem'}
              </span>
              <Badge variant="purple">{currentQ.difficulty || 'Medium'}</Badge>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.prompt || currentQ.text}
            </h3>
          </div>

          {/* 4 Multiple Choice Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQ.options?.map((option, idx) => {
              const optionText = typeof option === 'string' ? option : option.text;
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === idx;
              const isOptionCorrect = idx === correctIdx;

              let btnStyle = 'bg-[#111927] border-[#22334d] hover:border-[#0df2c9]/50 text-slate-200';
              if (isRoundFinished) {
                if (isOptionCorrect) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-sm shadow-emerald-500/20';
                } else if (isSelected && !isOptionCorrect) {
                  btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold shadow-sm shadow-rose-500/20';
                } else {
                  btnStyle = 'bg-[#111927]/60 border-[#22334d] text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isRoundFinished}
                  onClick={() => handleSelectOption(idx)}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${btnStyle}`}
                >
                  <div className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isRoundFinished && isOptionCorrect
                      ? 'bg-emerald-400 text-slate-950 font-black'
                      : isRoundFinished && isSelected && !isOptionCorrect
                      ? 'bg-rose-400 text-slate-950 font-black'
                      : isSelected
                      ? 'bg-[#0df2c9] text-slate-950 font-black'
                      : 'bg-[#1b273a] text-slate-400'
                  }`}>
                    {letter}
                  </div>
                  <div className="flex-1 leading-snug">{optionText}</div>
                  {isRoundFinished && isOptionCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                  {isRoundFinished && isSelected && !isOptionCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Round Feedback & Explanation */}
          {isRoundFinished && (
            <div className="p-5 rounded-2xl bg-[#0b101b] border border-[#22334d] space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1b273a]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-300">Your Answer:</span>
                  {selectedOption === correctIdx ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1 pt)
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect (+0 pt)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-300">{activeBattle.opponentName}:</span>
                  {opponentCorrect ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+1 pt)
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect (+0 pt)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-[#0df2c9] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#0df2c9] font-bold">
                    Canonical Proof & Derivation
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                  {(currentQ.citation || currentQ.citations) && (
                    <div className="text-[11px] font-mono text-slate-500">
                      Reference: {currentQ.citation || currentQ.citations}
                    </div>
                  )}
                </div>
              </div>

              {/* Advance CTA */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextRound}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs sm:text-sm hover:shadow-lg hover:shadow-[#0df2c9]/30 active:scale-95 transition-all cursor-pointer"
                >
                  <span>{currentRound < maxRounds ? `Continue to Round ${currentRound + 1}` : 'View Match Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Enhanced Battle Result Screen showing both players and winner */
        <div className="space-y-6 text-center py-2 animate-fadeIn">
          {battleResult && (
            <>
              {/* Winner Header Banner */}
              <div className="space-y-2">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-md ${
                    isUserWinner
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : isMatchDraw
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  }`}
                >
                  {isUserWinner ? (
                    <>
                      <Trophy className="w-4 h-4" />
                      <span>VICTORY ACHIEVED • WINNER: {effectiveUser?.name || 'YOU'}</span>
                    </>
                  ) : isMatchDraw ? (
                    <>
                      <Swords className="w-4 h-4" />
                      <span>HONORABLE DRAW • TIED CONTEST</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4" />
                      <span>MATCH CONCLUDED • WINNER: {activeBattle.opponentName}</span>
                    </>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {isUserWinner
                    ? 'Outstanding Academic Victory!'
                    : isMatchDraw
                    ? 'Evenly Matched Scholarly Duel!'
                    : `${activeBattle.opponentName} Takes the Win!`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  {isUserWinner
                    ? `You scored ${userScore} out of ${maxRounds} correct and triumphed over ${activeBattle.opponentName} in ${activeBattle.subject}.`
                    : isMatchDraw
                    ? `Both scholars scored ${userScore} points after 5 rigorous rounds in ${activeBattle.subject}.`
                    : `${activeBattle.opponentName} answered ${opponentScore} questions correctly in ${activeBattle.subject}. Practice more to claim the next duel!`}
                </p>
              </div>

              {/* Head-to-Head Competitor Comparison Card */}
              <div className="p-5 rounded-2xl bg-[#0b101b] border border-[#22334d] shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                  {/* Left: You */}
                  <div className={`flex flex-col items-center p-4 rounded-xl border ${
                    isUserWinner
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                      : isMatchDraw
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-[#111927] border-[#1f2d47]'
                  }`}>
                    <div className="relative">
                      <img
                        src={effectiveUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={effectiveUser?.name}
                        className={`w-16 h-16 rounded-2xl object-cover border-2 ${
                          isUserWinner ? 'border-emerald-400' : 'border-[#0df2c9]'
                        }`}
                      />
                      {isUserWinner && (
                        <div className="absolute -top-2 -right-2 bg-emerald-400 text-slate-950 p-1 rounded-full shadow">
                          <Trophy className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-white mt-2 max-w-[130px] truncate">
                      {effectiveUser?.name || 'You'}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">You (Challenger)</div>
                    <div className="text-2xl font-black text-[#0df2c9] font-mono mt-1">
                      {userScore} <span className="text-xs font-normal text-slate-400">/ 5 pts</span>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isUserWinner
                          ? 'bg-emerald-400 text-slate-950'
                          : isMatchDraw
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {isUserWinner ? '🏆 WINNER' : isMatchDraw ? '🤝 TIED' : 'RUNNER UP'}
                      </span>
                    </div>
                  </div>

                  {/* Middle: VS & Score Indicator */}
                  <div className="flex flex-col items-center justify-center space-y-1 py-2">
                    <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Final Score
                    </div>
                    <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-wider">
                      <span className={isUserWinner ? 'text-emerald-400' : 'text-white'}>{userScore}</span>
                      <span className="text-slate-600 mx-2">-</span>
                      <span className={isOpponentWinner ? 'text-emerald-400' : 'text-white'}>{opponentScore}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#0df2c9] bg-[#0df2c9]/10 px-2 py-0.5 rounded-md border border-[#0df2c9]/30">
                      5 Rounds Completed
                    </span>
                  </div>

                  {/* Right: Opponent */}
                  <div className={`flex flex-col items-center p-4 rounded-xl border ${
                    isOpponentWinner
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                      : isMatchDraw
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-[#111927] border-[#1f2d47]'
                  }`}>
                    <div className="relative">
                      <img
                        src={activeBattle.opponentAvatar}
                        alt={activeBattle.opponentName}
                        className={`w-16 h-16 rounded-2xl object-cover border-2 ${
                          isOpponentWinner ? 'border-emerald-400' : 'border-[#8b5cf6]'
                        }`}
                      />
                      {isOpponentWinner && (
                        <div className="absolute -top-2 -right-2 bg-emerald-400 text-slate-950 p-1 rounded-full shadow">
                          <Trophy className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-white mt-2 max-w-[130px] truncate">
                      {activeBattle.opponentName}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{activeBattle.opponentRank || 'Master Duelist'}</div>
                    <div className="text-2xl font-black text-[#8b5cf6] font-mono mt-1">
                      {opponentScore} <span className="text-xs font-normal text-slate-400">/ 5 pts</span>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isOpponentWinner
                          ? 'bg-emerald-400 text-slate-950'
                          : isMatchDraw
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {isOpponentWinner ? '🏆 WINNER' : isMatchDraw ? '🤝 TIED' : 'RUNNER UP'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics & Rewards Breakdown */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#0b101b] border border-[#22334d]">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">Distinction Points</div>
                  <div
                    className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
                      battleResult.dpChange >= 0 ? 'text-[#0df2c9]' : 'text-rose-400'
                    }`}
                  >
                    {battleResult.dpChange >= 0 ? `+${battleResult.dpChange}` : battleResult.dpChange} DP
                  </div>
                </div>

                <div className="border-x border-[#1b273a]">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Your Accuracy</div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
                    {Math.round((userScore / maxRounds) * 100)}%
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">Current Streak</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center justify-center gap-1 mt-1">
                    <Flame className="w-5 h-5 fill-amber-400" />
                    <span>{effectiveUser?.streak || 7}</span>
                  </div>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRematch}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#22334d] hover:bg-[#1b273a] text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-[#0df2c9]" />
                  <span>Instant Rematch</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs sm:text-sm rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 active:scale-95 transition-all cursor-pointer"
                >
                  Return to Campus
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
