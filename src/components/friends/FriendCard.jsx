import React from 'react';
import { Swords, Trophy, Flame, CheckCircle, ShieldAlert, UserMinus } from 'lucide-react';
import Badge from '../common/Badge';
import { useGame } from '../../context/GameContext';

export default function FriendCard({ friend, onChallenge, onRemove }) {
  const isOnline = friend.status === 'online' || friend.online;

  return (
    <div className="bg-[#111927] border border-[#22334d] hover:border-[#0df2c9]/40 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={friend.avatar}
              alt={friend.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#1b273a] group-hover:border-[#0df2c9] transition-colors"
            />
            <div
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#111927] ${
                isOnline ? 'bg-[#0df2c9]' : 'bg-slate-500'
              }`}
            />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-[#0df2c9] transition-colors">
              {friend.name}
            </h4>
            <p className="text-xs text-slate-400 font-mono">{friend.handle}</p>
            <div className="mt-1">
              <Badge variant={friend.rank?.toLowerCase().includes('grandmaster') ? 'mint' : 'purple'}>
                {friend.rank || 'Scholar'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#1b273a] my-2 text-center text-xs">
        <div>
          <div className="text-slate-400 text-[10px] uppercase font-bold">DP</div>
          <div className="text-white font-bold font-mono mt-0.5">{friend.dp?.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-slate-400 text-[10px] uppercase font-bold">Streak</div>
          <div className="text-amber-400 font-bold font-mono mt-0.5 flex items-center justify-center gap-0.5">
            <Flame className="w-3 h-3 fill-amber-400" />
            {friend.streak || 3}d
          </div>
        </div>
        <div>
          <div className="text-slate-400 text-[10px] uppercase font-bold">Win Rate</div>
          <div className="text-emerald-400 font-bold font-mono mt-0.5">{friend.winRate || '75%'}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-1">
        <button
          onClick={() => onChallenge(friend)}
          className="flex-1 py-2 px-3 bg-[#0df2c9]/15 hover:bg-[#0df2c9] text-[#0df2c9] hover:text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-[#0df2c9]/30 hover:border-transparent"
        >
          <Swords className="w-3.5 h-3.5" />
          Challenge
        </button>
        {onRemove && (
          <button
            onClick={() => onRemove(friend.id)}
            title="Remove Friend"
            className="p-2 text-slate-500 hover:text-rose-400 bg-[#1b273a] hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <UserMinus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
