import React, { useState, useMemo } from 'react';
import { Trophy, Globe, Users, BookOpen, Flame, Sparkles, Filter, Calendar } from 'lucide-react';
import Podium from '../components/leaderboard/Podium';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import ChallengeModal from '../components/battles/ChallengeModal';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardPage() {
  const { leaderboard, getLeaderboard, friends, decks } = useGame();
  const { user, currentUser } = useAuth();
  const effectiveUser = currentUser || user;

  const [scope, setScope] = useState('global'); // 'global', 'friends'
  const [timeframe, setTimeframe] = useState('monthly'); // 'monthly', 'all'
  const [challengeTarget, setChallengeTarget] = useState(null);

  // Compute ranked list
  const rankedUsers = useMemo(() => {
    let list = typeof getLeaderboard === 'function'
      ? getLeaderboard(timeframe)
      : Array.isArray(leaderboard)
      ? [...leaderboard]
      : [];

    if (scope === 'friends' && Array.isArray(friends)) {
      const friendIds = new Set(friends.map((f) => f.id));
      if (effectiveUser?.id) {
        friendIds.add(effectiveUser.id);
      }
      list = list.filter((u) => friendIds.has(u.id));
    }

    return list;
  }, [leaderboard, getLeaderboard, scope, timeframe, friends, effectiveUser?.id]);

  const topThree = rankedUsers.slice(0, 3);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            Distinction Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time competitive academic rankings based on peer battle performance and question quality.
          </p>
        </div>

        {/* Scope and Timeframe Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Monthly / All Time Toggle */}
          <div className="flex items-center bg-[#111927] border border-[#22334d] p-1 rounded-2xl">
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                timeframe === 'monthly' ? 'bg-[#8b5cf6] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Monthly
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                timeframe === 'all' ? 'bg-[#8b5cf6] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              All Time
            </button>
          </div>

          {/* Global / Friends Toggle */}
          <div className="flex items-center bg-[#111927] border border-[#22334d] p-1 rounded-2xl">
            <button
              onClick={() => setScope('global')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                scope === 'global' ? 'bg-[#0df2c9] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Global
            </button>
            <button
              onClick={() => setScope('friends')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                scope === 'friends' ? 'bg-[#0df2c9] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Friends Only
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <Podium
          topThree={topThree}
          onChallenge={(target) => setChallengeTarget(target)}
        />
      )}

      {/* Leaderboard Table List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">
            {scope === 'global' ? 'All Ranked Scholars' : 'Class & Friends Rankings'}
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {rankedUsers.length} Competitors
          </span>
        </div>

        <LeaderboardTable
          users={rankedUsers}
          currentUserId={effectiveUser?.id}
          onChallenge={(target) => setChallengeTarget(target)}
        />
      </div>

      {/* Challenge Modal */}
      <ChallengeModal
        isOpen={Boolean(challengeTarget)}
        onClose={() => setChallengeTarget(null)}
        targetUser={challengeTarget}
      />
    </div>
  );
}
