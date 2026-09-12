import React from 'react';
import { Crown, Trophy, Medal, Flame } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

export default function Podium({ topThree = [], onChallenge }) {
  if (!Array.isArray(topThree) || topThree.length < 3) return null;

  const [first, second, third] = [topThree[0], topThree[1], topThree[2]];
  if (!first || !second || !third) return null;

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-8 pb-4 max-w-3xl mx-auto">
      {/* 2nd Place - Left */}
      <div className="flex flex-col items-center">
        <div className="relative mb-3 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-slate-400/20 text-slate-300 font-bold flex items-center justify-center border border-slate-400/40 text-xs mb-2">
            #2
          </div>
          <Avatar
            src={second.avatar}
            name={second.name}
            size="xl"
            className="border-2 border-slate-400 shadow-lg shadow-slate-400/10"
          />
        </div>
        <div className="text-center w-full">
          <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px] mx-auto">{second.name}</h4>
          <p className="text-[11px] text-slate-400 font-mono">@{second.username || second.handle?.replace('@', '') || 'scholar'}</p>
          <div className="mt-1 font-mono font-bold text-slate-300 text-xs sm:text-sm">
            {second.dp?.toLocaleString()} DP
          </div>
          <Badge variant="purple" className="mt-1.5 text-[10px]">
            {second.rank || second.tier || 'Master Tier'}
          </Badge>
        </div>
        {/* Podium Base */}
        <div className="w-full bg-gradient-to-t from-[#111927] to-[#182334] border-t-2 border-slate-400 rounded-t-2xl h-24 sm:h-32 mt-4 flex items-center justify-center">
          <Medal className="w-8 h-8 text-slate-400 opacity-60" />
        </div>
      </div>

      {/* 1st Place - Center (Tallest) */}
      <div className="flex flex-col items-center">
        <div className="relative mb-3 flex flex-col items-center">
          <Crown className="w-8 h-8 text-amber-400 animate-bounce mb-1 drop-shadow-md" />
          <div className="relative">
            <Avatar
              src={first.avatar}
              name={first.name}
              size="2xl"
              className="border-4 border-amber-400 shadow-xl shadow-amber-400/20"
            />
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-md">
              #1
            </div>
          </div>
        </div>
        <div className="text-center w-full mt-2">
          <h4 className="text-sm sm:text-base font-extrabold text-white truncate max-w-[140px] mx-auto">{first.name}</h4>
          <p className="text-xs text-slate-400 font-mono">@{first.username || first.handle?.replace('@', '') || 'scholar'}</p>
          <div className="mt-1 font-mono font-black text-[#0df2c9] text-sm sm:text-base">
            {first.dp?.toLocaleString()} DP
          </div>
          <Badge variant="mint" className="mt-1.5 text-[10px]">
            {first.rank || first.tier || 'Grandmaster'}
          </Badge>
        </div>
        {/* Podium Base */}
        <div className="w-full bg-gradient-to-t from-[#111927] to-[#1e2e46] border-t-4 border-amber-400 rounded-t-2xl h-36 sm:h-44 mt-4 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-amber-400 opacity-80" />
        </div>
      </div>

      {/* 3rd Place - Right */}
      <div className="flex flex-col items-center">
        <div className="relative mb-3 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-amber-700/30 text-amber-600 font-bold flex items-center justify-center border border-amber-600/40 text-xs mb-2">
            #3
          </div>
          <Avatar
            src={third.avatar}
            name={third.name}
            size="xl"
            className="border-2 border-amber-600 shadow-lg shadow-amber-700/10"
          />
        </div>
        <div className="text-center w-full">
          <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px] mx-auto">{third.name}</h4>
          <p className="text-[11px] text-slate-400 font-mono">@{third.username || third.handle?.replace('@', '') || 'scholar'}</p>
          <div className="mt-1 font-mono font-bold text-amber-600/90 text-xs sm:text-sm">
            {third.dp?.toLocaleString()} DP
          </div>
          <Badge variant="neutral" className="mt-1.5 text-[10px]">
            {third.rank || third.tier || 'Scholar Tier'}
          </Badge>
        </div>
        {/* Podium Base */}
        <div className="w-full bg-gradient-to-t from-[#111927] to-[#182334] border-t-2 border-amber-700 rounded-t-2xl h-20 sm:h-28 mt-4 flex items-center justify-center">
          <Medal className="w-7 h-7 text-amber-700 opacity-60" />
        </div>
      </div>
    </div>
  );
}
