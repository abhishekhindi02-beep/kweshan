import React from 'react';
import { Swords, Trophy, Flame, CheckCircle, ShieldAlert, UserMinus } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import { useGame } from '../../context/GameContext';

export default function FriendCard({ friend, onChallenge, onRemove }) {
  const isOnline = friend.onlineStatus === 'online' || friend.status === 'online' || friend.online !== false;
  const handle = friend.handle || (friend.username ? `@${friend.username}` : `@${(friend.name || 'peer').toLowerCase().replace(/\s+/g, '_')}`);
  const level = friend.level || 12;
  const rank = friend.tier || friend.rank || 'Scholar';
  const dp = friend.dp || 2700;
  const streak = friend.streak || 4;
  const winRate = friend.winRate || '75%';

  return (
    <div className="bg-[#111927] border border-[#22334d] hover:border-[#0df2c9]/40 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <Avatar
              src={friend.avatar}
              name={friend.name}
              size="lg"
              showStatus={true}
              status={isOnline ? 'online' : 'offline'}
              className="group-hover:border-[#0df2c9] transition-colors"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white group-hover:text-[#0df2c9] transition-colors truncate max-w-[130px]">
                {friend.name}
              </h4>
              <span className="text-[10px] font-mono text-slate-400">Lvl {level}</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{handle}</p>
            <div className="mt-1">
              <Badge variant={rank.toLowerCase().includes('grandmaster') || rank.toLowerCase().includes('apex') ? 'mint' : 'purple'}>
                {rank}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#1b273a] my-2 text-center text-xs">
        <div>
          <div className="text-slate-400 text-[10px] uppercase font-bold font-mono">DP</div>
          <div className="text-white font-bold font-mono mt-0.5">{dp.toLocaleString()}</div>
        </div>
        <div className="border-x border-[#1b273a]">
          <div className="text-slate-400 text-[10px] uppercase font-bold font-mono">Streak</div>
          <div className="text-amber-400 font-bold font-mono mt-0.5 flex items-center justify-center gap-0.5">
            <Flame className="w-3 h-3 fill-amber-400" />
            {streak}d
          </div>
        </div>
        <div>
          <div className="text-slate-400 text-[10px] uppercase font-bold font-mono">Win Rate</div>
          <div className="text-emerald-400 font-bold font-mono mt-0.5">{winRate}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-1">
        <button
          onClick={() => onChallenge(friend)}
          className="flex-1 py-2 px-3 bg-[#0df2c9]/15 hover:bg-[#0df2c9] text-[#0df2c9] hover:text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-[#0df2c9]/30 hover:border-transparent active:scale-95 cursor-pointer"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Challenge</span>
        </button>
        {onRemove && (
          <button
            onClick={() => onRemove(friend.id)}
            title="Remove from Connections"
            className="p-2 text-slate-500 hover:text-rose-400 bg-[#1b273a] hover:bg-rose-500/10 border border-[#22334d] rounded-xl transition-colors cursor-pointer"
          >
            <UserMinus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
