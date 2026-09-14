import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Swords, Trophy, Flame, TrendingUp, BookOpen, 
  ArrowRight, Play, Award, CheckCircle2, Clock, Sparkles,
  FileEdit, Users, Shield, Check, X
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import ProgressBar from '../components/common/ProgressBar';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';

export default function HomePage({ onOpenBattle, onOpenLightning, onStartPractice, autoOpenLightning }) {
  const { user, currentUser, updateUser } = useAuth();
  const effectiveUser = currentUser || user || { 
    name: 'Scholar', 
    dp: 0, 
    streak: 0, 
    rank: 'Scholar Tier',
    level: 1,
    wins: 0,
    losses: 0,
    totalBattles: 0,
    selectedSubjects: ['Physics', 'Mathematics'],
    onboardingCompleted: true
  };
  const { decks, battles, activities, startPracticeDeck } = useGame();
  const navigate = useNavigate();

  // Onboarding state: show if newly registered or onboardingCompleted is false
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return effectiveUser?.onboardingCompleted === false;
  });

  const activeBattles = battles.filter(
    (b) => (b.status === 'in_progress' || b.status === 'your_turn') && 
           (b.challengerId === effectiveUser?.id || b.opponentId === effectiveUser?.id)
  );
  
  const userDecks = decks.slice(0, 4);

  const handlePractice = (deckId) => {
    if (onStartPractice) {
      onStartPractice(deckId);
    } else {
      startPracticeDeck(deckId);
    }
  };

  const handleCompleteOnboarding = () => {
    updateUser({ onboardingCompleted: true });
    setShowOnboarding(false);
  };

  const winRateFormatted = effectiveUser?.totalBattles > 0
    ? `${Math.round(((effectiveUser?.wins || 0) / effectiveUser.totalBattles) * 100)}%`
    : '0%';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#111927] via-[#142238] to-[#0f172a] border border-[#22334d] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#0df2c9]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-[#8b5cf6]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <Avatar
                src={effectiveUser?.avatar}
                name={effectiveUser?.name}
                size="xl"
                className="border-2 border-[#0df2c9]/60 shadow-lg shadow-[#0df2c9]/20"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-slate-950" />
                {effectiveUser?.streak ?? 0}d
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="mint">{effectiveUser?.rank || effectiveUser?.tier || 'Scholar Tier'}</Badge>
                <span className="text-xs text-slate-400 font-mono">
                  {effectiveUser?.handle || `@${effectiveUser?.username || 'scholar'}`}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#0df2c9]">{effectiveUser?.name}</span>!
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg">
                Ready for today's academic face-offs? Solve peer-reviewed items and defend your Distinction Rank.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={onOpenLightning}
              className="flex-1 md:flex-initial px-5 py-3 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs sm:text-sm hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer shadow-md"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              Daily Lightning
            </button>
            <button
              onClick={() => onOpenBattle ? onOpenBattle() : navigate('/battles')}
              className="flex-1 md:flex-initial px-5 py-3 rounded-xl bg-[#1b273a] hover:bg-[#25354e] text-white font-bold text-xs sm:text-sm border border-[#2e4363] hover:border-[#0df2c9]/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Swords className="w-4 h-4 text-[#0df2c9]" />
              Quick Match
            </button>
          </div>
        </div>
      </div>

      {/* 4 Data-Driven Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Award}
          title="Distinction Points"
          value={typeof effectiveUser?.dp === 'number' ? effectiveUser.dp.toLocaleString() : '0'}
          change={effectiveUser?.dp > 0 ? `+${effectiveUser.weeklyChange || 30} DP this week` : "Earn +30 DP per live question"}
          color="mint"
        />
        <StatCard
          icon={Trophy}
          title="Leaderboard Rank"
          value={`#${effectiveUser?.monthlyRank || 1}`}
          change={effectiveUser?.tier || "Scholar Tier"}
          color="gold"
        />
        <StatCard
          icon={TrendingUp}
          title="Battle Win Rate"
          value={winRateFormatted}
          change={`${effectiveUser?.wins || 0} Wins / ${effectiveUser?.losses || 0} Losses`}
          color="purple"
        />
        <StatCard
          icon={Flame}
          title="Active Daily Streak"
          value={`${effectiveUser?.streak ?? 0} Days`}
          change={effectiveUser?.streak > 0 ? "Flame burning strong!" : "Start today's streak"}
          color="rose"
        />
      </div>

      {/* Daily Lightning Arena Spotlight Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d3b42] via-[#0e2738] to-[#121927] border border-[#0df2c9]/30 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0df2c9]/20 border border-[#0df2c9]/40 flex items-center justify-center text-[#0df2c9] flex-shrink-0">
            <Zap className="w-6 h-6 fill-[#0df2c9]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0df2c9] bg-[#0df2c9]/20 px-2 py-0.5 rounded">
                Daily Sprint
              </span>
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                10 Rapid-Fire Prompts
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">10-Question Lightning Arena</h3>
            <p className="text-xs text-slate-400">
              Answer fast within 15 seconds per question to multiply your Distinction multiplier up to 3.0x.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenLightning}
          className="px-6 py-2.5 bg-[#0df2c9] hover:bg-[#00e1ba] text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-[#0df2c9]/20 whitespace-nowrap cursor-pointer"
        >
          Enter Arena
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Active Decks & Side Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Continue Learning Active Decks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0df2c9]" />
              <h2 className="text-base font-bold text-white tracking-tight">Active Academic Decks</h2>
            </div>
            <button
              onClick={() => navigate('/decks')}
              className="text-xs font-semibold text-[#0df2c9] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Browse all {decks.length} decks
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userDecks.map((deck) => (
              <div
                key={deck.id}
                className="bg-[#111927] border border-[#22334d] hover:border-[#0df2c9]/40 p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{deck.icon || '📚'}</span>
                    <Badge variant={deck.mastery >= 80 ? 'mint' : deck.mastery >= 40 ? 'purple' : 'neutral'}>
                      {deck.mastery || deck.progress || 0}% Mastery
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-[#0df2c9] transition-colors">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {deck.description}
                  </p>
                </div>

                <div className="mt-5 space-y-3 pt-3 border-t border-[#1b273a]">
                  <ProgressBar
                    value={deck.mastery || deck.progress || 0}
                    label="Deck Completion"
                    size="sm"
                    color={deck.mastery >= 80 ? 'mint' : 'purple'}
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 font-mono">
                      {deck.questionCount || 14} questions
                    </span>
                    <button
                      onClick={() => handlePractice(deck.id)}
                      className="px-3 py-1.5 bg-[#1b273a] group-hover:bg-[#0df2c9] text-slate-300 group-hover:text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Practice
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live Battles & Recent Ledger Activity */}
        <div className="space-y-6">
          {/* Active Battles Widget */}
          <div className="bg-[#111927] border border-[#22334d] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-[#0df2c9]" />
                <h3 className="text-sm font-bold text-white">Live Challenges</h3>
              </div>
              <Badge variant={activeBattles.length > 0 ? 'mint' : 'neutral'}>
                {activeBattles.length} Active
              </Badge>
            </div>

            <div className="space-y-3">
              {activeBattles.length > 0 ? (
                activeBattles.slice(0, 2).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => onOpenBattle ? onOpenBattle(b.deckId, b) : navigate('/battles')}
                    className="p-3 bg-[#0b101b] border border-[#22334d] hover:border-[#0df2c9]/50 rounded-xl cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate group-hover:text-[#0df2c9]">
                        {b.opponentName}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        Round {b.currentRound || 1}/5
                      </span>
                    </div>
                    <ProgressBar
                      value={((b.currentRound || 1) / 5) * 100}
                      color="mint"
                      size="sm"
                      showPercentage={false}
                    />
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-[#0b101b] rounded-xl border border-[#1b273a]">
                  No active challenges right now. Jump into Quick Match or Daily Lightning!
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/battles')}
              className="w-full py-2 bg-[#1b273a] hover:bg-[#25354e] text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              View Battle Arena →
            </button>
          </div>

          {/* Activity Ledger Feed */}
          <div className="bg-[#111927] border border-[#22334d] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Recent Activity</h3>
              <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
            </div>

            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.slice(0, 4).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#0df2c9] mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-slate-300 font-medium leading-tight">{act.text || act.title}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{act.time || 'Today'}</span>
                    </div>
                    {act.dp > 0 && (
                      <span className="font-mono font-bold text-[#0df2c9] text-xs">
                        +{act.dp} DP
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-[#0b101b] rounded-xl border border-[#1b273a]">
                  No activity yet. Start your first practice session or challenge an AI opponent!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* First-Time User Welcome Onboarding Modal */}
      {showOnboarding && (
        <Modal
          isOpen={showOnboarding}
          onClose={handleCompleteOnboarding}
          title={`Welcome to Kweshun, ${effectiveUser.name}!`}
          subtitle="Your academic competition dashboard is initialized. Here is how you can excel:"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 animate-fadeIn">
            {/* Selected Interests Pill Box */}
            <div className="p-4 bg-[#111927] border border-[#22334d] rounded-2xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Your Enrolled Disciplines:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(effectiveUser.selectedSubjects || ['Physics', 'Mathematics']).map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-xl bg-[#0df2c9]/15 border border-[#0df2c9]/40 text-[#0df2c9] text-xs font-mono font-bold"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* 5 Core Capabilities Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-3.5 bg-[#0b101b] border border-[#1c273e] rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0df2c9]">
                  <BookOpen className="w-4 h-4" />
                  <span>1. Practice Decks</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Study academic topic flashcards and increase your mastery rating.
                </p>
              </div>

              <div className="p-3.5 bg-[#0b101b] border border-[#1c273e] rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8b5cf6]">
                  <FileEdit className="w-4 h-4" />
                  <span>2. Author Questions</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Write long-form questions with attached images, freehand drawings & formulas (+30 DP).
                </p>
              </div>

              <div className="p-3.5 bg-[#0b101b] border border-[#1c273e] rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Swords className="w-4 h-4" />
                  <span>3. Challenge AI Opponents</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Duel in 5-round face-offs or rapid Daily Lightning arena for Double DP.
                </p>
              </div>

              <div className="p-3.5 bg-[#0b101b] border border-[#1c273e] rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>4. Track Progress</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Earn Distinction Points (DP), build your daily streak, and climb the Leaderboard.
                </p>
              </div>

              <div className="p-3.5 bg-[#0b101b] border border-[#1c273e] rounded-xl space-y-1 sm:col-span-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#38bdf8]">
                  <Users className="w-4 h-4" />
                  <span>5. Connect with Peers</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Form study circles and exchange direct academic challenges.
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCompleteOnboarding}
                className="w-full py-3.5 bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-[#0df2c9]/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Start Learning & Practice</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
