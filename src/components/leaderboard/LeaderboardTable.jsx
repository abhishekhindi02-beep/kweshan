import React from 'react';
import { Flame, Swords, Award, TrendingUp } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

export default function LeaderboardTable({ users = [], currentUserId, onChallenge }) {
  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="bg-[#111927] border border-[#22334d] p-8 rounded-2xl text-center text-xs text-slate-400">
        No scholars ranked in this category yet.
      </div>
    );
  }

  return (
    <div className="bg-[#111927] border border-[#22334d] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#22334d] bg-[#0b101b]/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4 sm:px-6 w-16 text-center">Rank</th>
              <th className="py-3.5 px-4">Scholar</th>
              <th className="py-3.5 px-4">Tier / Level</th>
              <th className="py-3.5 px-4 text-center">Daily Streak</th>
              <th className="py-3.5 px-4 text-right">Distinction (DP)</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b273a] text-sm">
            {users.map((u, idx) => {
              const rank = u.rank || idx + 1;
              const isCurrentUser = u.id === currentUserId || u.isCurrentUser;

              return (
                <tr
                  key={u.id || idx}
                  className={`hover:bg-[#182334]/50 transition-colors ${
                    isCurrentUser ? 'bg-[#0df2c9]/5 border-l-2 border-[#0df2c9]' : ''
                  }`}
                >
                  {/* Rank Column */}
                  <td className="py-4 px-4 sm:px-6 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold font-mono ${
                        rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {rank}
                    </span>
                  </td>

                  {/* Scholar Profile */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={u.avatar}
                        name={u.name}
                        size="md"
                      />
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {u.name}
                          {isCurrentUser && (
                            <span className="text-[10px] uppercase font-extrabold bg-[#0df2c9]/20 text-[#0df2c9] px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">@{u.username || u.handle?.replace('@', '') || 'scholar'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Tier */}
                  <td className="py-4 px-4">
                    <Badge
                      variant={
                        u.tier?.toLowerCase().includes('grandmaster') || u.rank?.toString().toLowerCase().includes('grandmaster')
                          ? 'mint'
                          : u.tier?.toLowerCase().includes('master')
                          ? 'purple'
                          : 'neutral'
                      }
                    >
                      {u.tier || u.rank || `Lvl ${u.level || 1}`}
                    </Badge>
                  </td>

                  {/* Streak */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-1 font-mono font-bold text-amber-400 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      {u.streak || 3}d
                    </div>
                  </td>

                  {/* DP Points */}
                  <td className="py-4 px-4 text-right">
                    <div className="font-mono font-extrabold text-white">
                      {u.dp?.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">DP</div>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    {!isCurrentUser ? (
                      <button
                        onClick={() => onChallenge(u)}
                        className="px-3 py-1.5 bg-[#1b273a] hover:bg-[#0df2c9] text-slate-200 hover:text-slate-950 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 border border-[#2e4363] hover:border-transparent cursor-pointer"
                      >
                        <Swords className="w-3 h-3" />
                        Challenge
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
